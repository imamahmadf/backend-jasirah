const { sumurMinyak, mitra } = require("../models");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

module.exports = {
  getSumurMinyak: async (req, res) => {
    try {
      const result = await sumurMinyak.findAll({
        order: [["nama", "ASC"]],
        include: [{ model: mitra }],
      });
      return res.status(200).json({ result });
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
