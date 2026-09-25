const path = require("path");
const { Op } = require("sequelize");
const {
  sumurMinyak,
  mitra,
  produksiSumur,
  produksiSumurK3S,
  suratJalan,
  satuanVolume,
  BAK3S,
  BABongkar,
  userKPBPN,
} = require("../models");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");
const { generateQrWithLogo } = require("../lib/qrcodeWithLogo");
const { buildFrontendPathUrl } = require("../lib/frontendBaseUrl");

const ROLE_SUPER_ADMIN = 1;
const ROLE_ADMIN = 2;

const resolveMitraScope = async (req) => {
  const roleIds = req.user?.roleIds || [];
  const isAdmin =
    roleIds.includes(ROLE_SUPER_ADMIN) || roleIds.includes(ROLE_ADMIN);

  if (isAdmin) {
    return { isAdmin: true, mitraId: null };
  }

  if (!req.user?.id) {
    return { isAdmin: false, mitraId: null };
  }

  const currentUser = await userKPBPN.findByPk(req.user.id, {
    attributes: ["id", "mitraId"],
  });

  return { isAdmin: false, mitraId: currentUser?.mitraId || null };
};

const LITER_PER_BARREL = 158.987;
const LITER_PER_DRUM = 200;

const convertVolumeToBarrel = (volume, satuanName) => {
  const value = Number(volume);
  if (Number.isNaN(value)) return 0;
  const satuan = String(satuanName || "barrel").trim().toLowerCase();
  if (satuan === "liter") return value / LITER_PER_BARREL;
  if (satuan === "drum") return (value * LITER_PER_DRUM) / LITER_PER_BARREL;
  return value;
};

const roundVolumeNumber = (value, maxDecimals = 3) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  const factor = 10 ** maxDecimals;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

const toPlain = (row) => (row?.toJSON ? row.toJSON() : row);

const mapProduksiSuratJalan = (row) => {
  const data = toPlain(row);
  return {
    ...data,
    rowKey: `suratJalan-${data.id}`,
    sumber: "suratJalan",
    sumberLabel: "Surat Jalan",
    referensi: data.suratJalan?.nomor || "-",
    tanggalReferensi: data.suratJalan?.tanggal || null,
    volumeReferensi: data.suratJalan?.volume ?? null,
    satuanReferensi: data.suratJalan?.satuanVolume?.satuan || "",
  };
};

const mapProduksiK3S = (row) => {
  const data = toPlain(row);
  return {
    ...data,
    rowKey: `k3s-${data.id}`,
    sumber: "BAK3S",
    sumberLabel: "BAK3S",
    referensi: data.BAK3SId ? `BAK3S #${data.BAK3SId}` : "-",
    tanggalReferensi: data.BAK3S?.BABongkar?.tanggal || null,
    volumeReferensi: data.BAK3S?.produksi ?? null,
    satuanReferensi: "Barrel",
  };
};

const canAccessSumur = (sumur, scope) => {
  if (scope.isAdmin) return true;
  if (!scope.mitraId || !sumur) return false;
  return Number(sumur.mitraId) === Number(scope.mitraId);
};

const sanitizeDownloadFileName = (name) =>
  String(name || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const createKodeQr = () =>
  (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  ).toUpperCase();

const ensureKodeQr = async (sumur) => {
  if (sumur.kodeQr) return sumur.kodeQr;

  let kodeQr = createKodeQr();
  let exists = await sumurMinyak.findOne({ where: { kodeQr } });
  while (exists) {
    kodeQr = createKodeQr();
    exists = await sumurMinyak.findOne({ where: { kodeQr } });
  }

  await sumurMinyak.update({ kodeQr }, { where: { id: sumur.id } });
  return kodeQr;
};

const PUBLIC_SUMUR_ATTRIBUTES = [
  "nama",
  "nomor",
  "foto",
  "statusVerifikasi",
  "tanggalVerifikasi",
  "longitude",
  "latitude",
  "alamat",
  "produksiHarian",
  "area",
  "operasional",
  "lingkungan",
  "penyaluran",
  "statusKepemilikan",
  "tingkatProduksi",
  "namaPemilikLahan",
  "namaPemilikSumur",
  "kontakPemilikLahan",
  "kontakPemilikSumur",
];

const parseOptionalInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : null;
};

const parseOptionalString = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
};

module.exports = {
  getSumurMinyak: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const statusVerifikasi = req.query.statusVerifikasi;
    const search = req.query.search?.trim();
    const allowedSortBy = [
      "nama",
      "nomor",
      "produksiHarian",
      "tanggalVerifikasi",
      "statusVerifikasi",
    ];
    const sortBy = allowedSortBy.includes(req.query.sortBy)
      ? req.query.sortBy
      : "nama";
    const sortOrder =
      String(req.query.sortOrder || "ASC").toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    const whereCondition = {};

    try {
      const scope = await resolveMitraScope(req);
      if (!scope.isAdmin && !scope.mitraId) {
        return res.status(200).json({
          success: true,
          result: [],
          page,
          limit,
          totalRows: 0,
          totalPage: 0,
        });
      }

      const mitraId = scope.isAdmin
        ? parseInt(req.query.mitraId)
        : scope.mitraId;

      if (mitraId) {
        whereCondition.mitraId = mitraId;
      }
    if (
      statusVerifikasi &&
      ["sudah", "belum", "tidak"].includes(statusVerifikasi)
    ) {
      whereCondition.statusVerifikasi = statusVerifikasi;
    }
    if (search) {
      whereCondition[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { nomor: { [Op.like]: `%${search}%` } },
        { alamat: { [Op.like]: `%${search}%` } },
      ];
    }

      const result = await sumurMinyak.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [{ model: mitra }],
      });

      const totalRows = await sumurMinyak.count({
        where: whereCondition,
      });
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

  getSumurMinyakById: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await sumurMinyak.findByPk(id, {
        include: [{ model: mitra }],
      });

      if (!result) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(result, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getProduksiSumurBySumurMinyak: async (req, res) => {
    const sumurMinyakId = parseInt(req.params.sumurMinyakId, 10);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const offset = limit * page;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const allowedSortBy = ["tanggal", "produksi", "createdAt"];
    const sortBy = allowedSortBy.includes(req.query.sortBy)
      ? req.query.sortBy
      : "tanggal";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    if (!sumurMinyakId) {
      return res.status(400).json({ error: "ID sumur minyak tidak valid" });
    }

    const whereCondition = { sumurMinyakId };

    if (startDate || endDate) {
      whereCondition.tanggal = {};
      if (startDate) {
        whereCondition.tanggal[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereCondition.tanggal[Op.lte] = end;
      }
    }

    try {
      const sumurData = await sumurMinyak.findByPk(sumurMinyakId, {
        include: [{ model: mitra }],
      });

      if (!sumurData) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(sumurData, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      const pageK3s = parseInt(req.query.pageK3s) || 0;

      const [resultSuratJalanRaw, resultK3SRaw] = await Promise.all([
        produksiSumur.findAll({
          where: whereCondition,
          order: [[sortBy, sortOrder]],
          include: [
            { model: satuanVolume },
            {
              model: suratJalan,
              include: [{ model: satuanVolume }],
            },
          ],
        }),
        produksiSumurK3S.findAll({
          where: whereCondition,
          order: [[sortBy, sortOrder]],
          include: [
            { model: satuanVolume },
            {
              model: BAK3S,
              include: [{ model: BABongkar }],
            },
          ],
        }),
      ]);

      const listSuratJalan = resultSuratJalanRaw.map(mapProduksiSuratJalan);
      const listK3S = resultK3SRaw.map(mapProduksiK3S);

      const paginate = (items, currentPage) => {
        const totalRows = items.length;
        const totalPage = Math.ceil(totalRows / limit) || 0;
        const safePage = Math.min(
          Math.max(currentPage, 0),
          Math.max(totalPage - 1, 0),
        );
        const start = limit * safePage;
        return {
          result: items.slice(start, start + limit),
          totalRows,
          totalPage,
          page: safePage,
        };
      };

      const sumBarrel = (items) =>
        roundVolumeNumber(
          items.reduce(
            (sum, item) =>
              sum +
              convertVolumeToBarrel(item.produksi, item.satuanVolume?.satuan),
            0,
          ),
        );

      const suratJalanPage = paginate(listSuratJalan, page);
      const k3sPage = paginate(listK3S, pageK3s);
      const totalProduksiSuratJalan = sumBarrel(listSuratJalan);
      const totalProduksiK3S = sumBarrel(listK3S);

      return res.status(200).json({
        success: true,
        sumurMinyak: sumurData,
        limit,
        resultSuratJalan: suratJalanPage.result,
        page: suratJalanPage.page,
        totalRows: suratJalanPage.totalRows,
        totalPage: suratJalanPage.totalPage,
        totalProduksiSuratJalan,
        resultK3S: k3sPage.result,
        pageK3s: k3sPage.page,
        totalRowsK3S: k3sPage.totalRows,
        totalPageK3S: k3sPage.totalPage,
        totalProduksiK3S,
        totalProduksi: roundVolumeNumber(
          totalProduksiSuratJalan + totalProduksiK3S,
        ),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  addSumurMinyak: async (req, res) => {
    try {
      const {
        nama,
        mitraId,
        nomor,
        statusVerifikasi,
        tanggalVerifikasi,
        longitude,
        latitude,
        alamat,
        produksiHarian,
        area,
        operasional,
        lingkungan,
        penyaluran,
        statusKepemilikan,
        tingkatProduksi,
        namaPemilikLahan,
        namaPemilikSumur,
        kontakPemilikLahan,
        kontakPemilikSumur,
      } = req.body;

      const scope = await resolveMitraScope(req);
      const assignedMitraId = scope.isAdmin
        ? mitraId
          ? parseInt(mitraId)
          : null
        : scope.mitraId;

      if (!scope.isAdmin && !assignedMitraId) {
        return res
          .status(403)
          .json({ error: "Akun mitra belum terhubung ke data mitra" });
      }

      const filePath = "sumur-minyak";
      let foto = null;
      if (req.file) {
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }

      const result = await sumurMinyak.create({
        nama,
        mitraId: assignedMitraId,
        foto,
        nomor,
        statusVerifikasi: statusVerifikasi || "belum",
        tanggalVerifikasi: tanggalVerifikasi || null,
        longitude: longitude ? parseFloat(longitude) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        alamat,
        produksiHarian: produksiHarian ? parseFloat(produksiHarian) : null,
        area: parseOptionalInt(area),
        operasional: parseOptionalInt(operasional),
        lingkungan: parseOptionalInt(lingkungan),
        penyaluran: parseOptionalInt(penyaluran),
        statusKepemilikan: parseOptionalInt(statusKepemilikan),
        tingkatProduksi: parseOptionalInt(tingkatProduksi),
        namaPemilikLahan: parseOptionalString(namaPemilikLahan),
        namaPemilikSumur: parseOptionalString(namaPemilikSumur),
        kontakPemilikLahan: parseOptionalString(kontakPemilikLahan),
        kontakPemilikSumur: parseOptionalString(kontakPemilikSumur),
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "sumurMinyak:created",
        title: "Sumur Minyak Baru",
        description: `Sumur minyak ${nama} ditambahkan`,
        entity: "sumurMinyak",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  editSumurMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nama,
        mitraId,
        nomor,
        statusVerifikasi,
        tanggalVerifikasi,
        longitude,
        latitude,
        alamat,
        produksiHarian,
        area,
        operasional,
        lingkungan,
        penyaluran,
        statusKepemilikan,
        tingkatProduksi,
        namaPemilikLahan,
        namaPemilikSumur,
        kontakPemilikLahan,
        kontakPemilikSumur,
      } = req.body;

      const existing = await sumurMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(existing, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      const assignedMitraId = scope.isAdmin
        ? mitraId
          ? parseInt(mitraId)
          : null
        : scope.mitraId;

      const filePath = "sumur-minyak";
      let foto = existing.foto;
      if (req.file) {
        foto = `/${filePath}/${req.file.filename}`;
      }

      await sumurMinyak.update(
        {
          nama,
          mitraId: assignedMitraId,
          foto,
          nomor,
          statusVerifikasi,
          tanggalVerifikasi: tanggalVerifikasi || null,
          longitude: longitude ? parseFloat(longitude) : null,
          latitude: latitude ? parseFloat(latitude) : null,
          alamat,
          produksiHarian: produksiHarian ? parseFloat(produksiHarian) : null,
          area: parseOptionalInt(area),
          operasional: parseOptionalInt(operasional),
          lingkungan: parseOptionalInt(lingkungan),
          penyaluran: parseOptionalInt(penyaluran),
          statusKepemilikan: parseOptionalInt(statusKepemilikan),
          tingkatProduksi: parseOptionalInt(tingkatProduksi),
          namaPemilikLahan: parseOptionalString(namaPemilikLahan),
          namaPemilikSumur: parseOptionalString(namaPemilikSumur),
          kontakPemilikLahan: parseOptionalString(kontakPemilikLahan),
          kontakPemilikSumur: parseOptionalString(kontakPemilikSumur),
        },
        { where: { id } },
      );

      const result = await sumurMinyak.findByPk(id, {
        include: [{ model: mitra }],
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "sumurMinyak:updated",
        title: "Sumur Minyak Diperbarui",
        description: `Sumur minyak ${nama} diperbarui`,
        entity: "sumurMinyak",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updateKlasifikasiSumurMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        area,
        operasional,
        lingkungan,
        penyaluran,
        statusKepemilikan,
        tingkatProduksi,
      } = req.body;

      const existing = await sumurMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(existing, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      await sumurMinyak.update(
        {
          area: parseOptionalInt(area),
          operasional: parseOptionalInt(operasional),
          lingkungan: parseOptionalInt(lingkungan),
          penyaluran: parseOptionalInt(penyaluran),
          statusKepemilikan: parseOptionalInt(statusKepemilikan),
          tingkatProduksi: parseOptionalInt(tingkatProduksi),
        },
        { where: { id } },
      );

      const result = await sumurMinyak.findByPk(id, {
        include: [{ model: mitra }],
      });

      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updatePemilikSumurMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        namaPemilikLahan,
        namaPemilikSumur,
        kontakPemilikLahan,
        kontakPemilikSumur,
      } = req.body;

      const existing = await sumurMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(existing, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      await sumurMinyak.update(
        {
          namaPemilikLahan: parseOptionalString(namaPemilikLahan),
          namaPemilikSumur: parseOptionalString(namaPemilikSumur),
          kontakPemilikLahan: parseOptionalString(kontakPemilikLahan),
          kontakPemilikSumur: parseOptionalString(kontakPemilikSumur),
        },
        { where: { id } },
      );

      const result = await sumurMinyak.findByPk(id, {
        include: [{ model: mitra }],
      });

      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  generateQrCodeSumur: async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ error: "ID sumur minyak tidak valid" });
    }

    try {
      const result = await sumurMinyak.findByPk(id, {
        include: [{ model: mitra }],
      });

      if (!result) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(result, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      const kodeQr = await ensureKodeQr(result);
      const qrPath = `/qr-sumur/${kodeQr}`;
      const qrUrl = buildFrontendPathUrl(req, qrPath);
      const logoPath = path.join(
        __dirname,
        "../public/surat-jalan/logoKPBPN.png",
      );
      const qrDataUrl = await generateQrWithLogo(qrUrl, {
        sizePx: 400,
        logoPath,
        logoScale: 0.3,
      });

      const label = [result.nama, result.nomor].filter(Boolean).join("_");
      const fileName = sanitizeDownloadFileName(
        `QR_Sumur_${label || kodeQr}.png`,
      );

      return res.status(200).json({
        success: true,
        kode: kodeQr,
        path: qrPath,
        url: qrUrl,
        qrCode: qrDataUrl,
        fileName,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getSumurByKodeQr: async (req, res) => {
    const kode = String(req.params.kode || "").trim();

    if (!kode) {
      return res.status(400).json({ error: "Kode QR tidak valid" });
    }

    try {
      const result = await sumurMinyak.findOne({
        where: { kodeQr: kode },
        attributes: ["id", ...PUBLIC_SUMUR_ATTRIBUTES],
        include: [{ model: mitra, attributes: ["nama"] }],
      });

      if (!result) {
        return res.status(404).json({ error: "Data sumur tidak ditemukan" });
      }

      const produksi = await produksiSumur.findAll({
        where: { sumurMinyakId: result.id },
        limit: 10,
        order: [["tanggal", "DESC"]],
        attributes: ["produksi", "tanggal"],
        include: [{ model: satuanVolume, attributes: ["satuan"] }],
      });

      const publicSumur = result.toJSON();
      delete publicSumur.id;

      return res.status(200).json({
        success: true,
        result: publicSumur,
        produksi,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteSumurMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await sumurMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const scope = await resolveMitraScope(req);
      if (!canAccessSumur(existing, scope)) {
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke sumur ini" });
      }

      await sumurMinyak.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "sumurMinyak:deleted",
        title: "Sumur Minyak Dihapus",
        description: `Sumur minyak ${existing.nama} dihapus`,
        entity: "sumurMinyak",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Sumur minyak berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
