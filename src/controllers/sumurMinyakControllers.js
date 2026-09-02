const { Op } = require("sequelize");
const {
  sumurMinyak,
  mitra,
  produksiSumur,
  suratJalan,
  satuanVolume,
} = require("../models");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

module.exports = {
  getSumurMinyak: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const mitraId = parseInt(req.query.mitraId);
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

    try {
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

      const result = await produksiSumur.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
          { model: satuanVolume },
          {
            model: suratJalan,
            include: [{ model: satuanVolume }],
          },
        ],
      });

      const totalRows = await produksiSumur.count({
        where: whereCondition,
      });
      const totalPage = Math.ceil(totalRows / limit);

      const totalProduksi = await produksiSumur.sum("produksi", {
        where: whereCondition,
      });

      return res.status(200).json({
        success: true,
        sumurMinyak: sumurData,
        result,
        totalProduksi: totalProduksi || 0,
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
      } = req.body;

      const filePath = "sumur-minyak";
      let foto = null;
      if (req.file) {
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }

      const result = await sumurMinyak.create({
        nama,
        mitraId: mitraId ? parseInt(mitraId) : null,
        foto,
        nomor,
        statusVerifikasi: statusVerifikasi || "belum",
        tanggalVerifikasi: tanggalVerifikasi || null,
        longitude: longitude ? parseFloat(longitude) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        alamat,
        produksiHarian: produksiHarian ? parseFloat(produksiHarian) : null,
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
      } = req.body;

      const existing = await sumurMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
      }

      const filePath = "sumur-minyak";
      let foto = existing.foto;
      if (req.file) {
        foto = `/${filePath}/${req.file.filename}`;
      }

      await sumurMinyak.update(
        {
          nama,
          mitraId: mitraId ? parseInt(mitraId) : null,
          foto,
          nomor,
          statusVerifikasi,
          tanggalVerifikasi: tanggalVerifikasi || null,
          longitude: longitude ? parseFloat(longitude) : null,
          latitude: latitude ? parseFloat(latitude) : null,
          alamat,
          produksiHarian: produksiHarian ? parseFloat(produksiHarian) : null,
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

  deleteSumurMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await sumurMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Sumur minyak tidak ditemukan" });
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
