const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { icp, BAK3S, BABongkar } = require("../models");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

const FILE_PATH = "icp";

const normalizeBulan = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{4}-\d{2}$/.test(str)) return `${str}-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  return null;
};

const parseHarga = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
};

const deleteDokumenIfExists = (filePath) => {
  if (!filePath) return;
  const normalized = String(filePath).replace(/^[/\\]+/, "");
  if (!normalized.startsWith(`${FILE_PATH}/`)) return;
  const fullPath = path.resolve(__dirname, "../public", normalized);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error(err);
    });
  }
};

const formatBulanLabel = (bulan) => {
  if (!bulan) return "-";
  const d = new Date(`${bulan}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(bulan);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const toMonthKey = (value) => {
  if (!value) return null;
  const str = String(value);
  if (/^\d{4}-\d{2}/.test(str)) return str.slice(0, 7);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const previousMonthKey = (value) => {
  const key = toMonthKey(value);
  if (!key) return null;
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return null;
  const prev = new Date(year, month - 2, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

module.exports = {
  getIcp: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const offset = limit * page;
    const search = req.query.search?.trim();

    const whereCondition = {};
    if (search) {
      const bulan = normalizeBulan(search);
      whereCondition[Op.or] = [
        { harga: { [Op.like]: `%${search}%` } },
        { kursTengah: { [Op.like]: `%${search}%` } },
      ];
      if (bulan) {
        whereCondition[Op.or].push({ bulan });
      }
    }

    try {
      const result = await icp.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [["bulan", "DESC"]],
      });

      const totalRows = await icp.count({ where: whereCondition });
      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  addIcp: async (req, res) => {
    try {
      const harga = parseHarga(req.body.harga);
      const kursTengah = parseHarga(req.body.kursTengah);
      const bulan = normalizeBulan(req.body.bulan);

      if (harga === null || harga < 0) {
        return res.status(400).json({ error: "Harga wajib diisi dan harus angka valid" });
      }
      if (kursTengah === null || kursTengah < 0) {
        return res
          .status(400)
          .json({ error: "Kurs tengah wajib diisi dan harus angka valid" });
      }
      if (!bulan) {
        return res.status(400).json({ error: "Bulan wajib diisi" });
      }

      const bulanDipakai = await icp.findOne({ where: { bulan } });
      if (bulanDipakai) {
        return res.status(400).json({ error: "Data ICP untuk bulan tersebut sudah ada" });
      }

      let dokumen = null;
      if (req.file) {
        dokumen = `/${FILE_PATH}/${req.file.filename}`;
      }

      const result = await icp.create({ harga, kursTengah, bulan, dokumen });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "icp:created",
        title: "ICP Baru",
        description: `ICP ${formatBulanLabel(bulan)} ditambahkan`,
        entity: "icp",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  editIcp: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await icp.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Data ICP tidak ditemukan" });
      }

      const harga = parseHarga(req.body.harga);
      const kursTengah = parseHarga(req.body.kursTengah);
      const bulan = normalizeBulan(req.body.bulan);

      if (harga === null || harga < 0) {
        return res.status(400).json({ error: "Harga wajib diisi dan harus angka valid" });
      }
      if (kursTengah === null || kursTengah < 0) {
        return res
          .status(400)
          .json({ error: "Kurs tengah wajib diisi dan harus angka valid" });
      }
      if (!bulan) {
        return res.status(400).json({ error: "Bulan wajib diisi" });
      }

      const bulanDipakai = await icp.findOne({
        where: { bulan, id: { [Op.ne]: id } },
      });
      if (bulanDipakai) {
        return res.status(400).json({ error: "Data ICP untuk bulan tersebut sudah ada" });
      }

      let dokumen = existing.dokumen;
      if (req.file) {
        deleteDokumenIfExists(existing.dokumen);
        dokumen = `/${FILE_PATH}/${req.file.filename}`;
      }

      await icp.update({ harga, kursTengah, bulan, dokumen }, { where: { id } });
      const result = await icp.findByPk(id);

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "icp:updated",
        title: "ICP Diperbarui",
        description: `ICP ${formatBulanLabel(bulan)} diperbarui`,
        entity: "icp",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteIcp: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await icp.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Data ICP tidak ditemukan" });
      }

      deleteDokumenIfExists(existing.dokumen);
      await icp.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "icp:deleted",
        title: "ICP Dihapus",
        description: `ICP ${formatBulanLabel(existing.bulan)} dihapus`,
        entity: "icp",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Data ICP berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getRekapitulasi: async (req, res) => {
    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = limit * page;
    const bulan = normalizeBulan(req.query.bulan);

    const baWhere = {};
    if (bulan) {
      const start = new Date(`${bulan.slice(0, 7)}-01T00:00:00`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      baWhere.tanggal = { [Op.gte]: start, [Op.lt]: end };
    }

    const include = [
      {
        model: BABongkar,
        attributes: ["id", "tanggal"],
        required: true,
        where: Object.keys(baWhere).length ? baWhere : undefined,
      },
    ];

    try {
      const resultRows = await BAK3S.findAll({
        include,
        limit,
        offset,
        order: [
          [BABongkar, "tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await BAK3S.count({
        include,
        distinct: true,
      });

      const icps = await icp.findAll({
        attributes: ["harga", "kursTengah", "bulan"],
      });
      const icpByMonth = {};
      icps.forEach((row) => {
        const key = toMonthKey(row.bulan);
        if (key) icpByMonth[key] = row;
      });

      const result = resultRows.map((row) => {
        const plain = row.get({ plain: true });
        const tanggal = plain.BABongkar?.tanggal || null;
        const bulanTarif = previousMonthKey(tanggal);
        const icpRow = icpByMonth[bulanTarif] || null;
        const hargaIcp = toNumber(icpRow?.harga);
        const kursTengah = toNumber(icpRow?.kursTengah);
        const tarif =
          hargaIcp !== null && kursTengah !== null
            ? hargaIcp * kursTengah
            : null;

        return {
          id: plain.id,
          tanggal,
          api: toNumber(plain.api),
          BSNW: toNumber(plain.BSNW),
          sg: toNumber(plain.sg),
          produksi: toNumber(plain.produksi),
          icp: hargaIcp,
          kursTengah,
          bulanTarif,
          tarif,
        };
      });

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage: Math.ceil(totalRows / limit),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
