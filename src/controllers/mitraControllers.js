const {
  mitra,
  transportir,
  supir,
  daftarUnitKerja,
  pegawai,
  jenisTransportir,
  jenisMitra,
  satuanVolume,
  suratJalan,
  userKPBPN,
} = require("../models");

const { Op } = require("sequelize");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

module.exports = {
  getMitra: async (req, res) => {
    try {
      const resultMitra = await mitra.findAll({
        include: [{ model: supir }, { model: jenisMitra }],
      });
      const resultTransportir = await transportir.findAll({
        include: [{ model: jenisTransportir }, { model: satuanVolume }],
      });
      const resultJenisTransportir = await jenisTransportir.findAll({});
      const resultJenisMitra = await jenisMitra.findAll({});
      const resultSatuanVolume = await satuanVolume.findAll({});
      return res.status(200).json({
        resultMitra,
        resultTransportir,
        resultJenisTransportir,
        resultJenisMitra,
        resultSatuanVolume,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addMitra: async (req, res) => {
    try {
      const {
        nama,
        alamat,
        npwp,
        kontak,
        penanggungJawab,
        kode,
        jenisMitraId,
      } = req.body;
      const result = await mitra.create({
        nama,
        alamat,
        npwp,
        kontak,
        penanggungJawab,
        kode,
        jenisMitraId: jenisMitraId ? parseInt(jenisMitraId) : null,
        nomorUrut: 0,
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "mitra:created",
        title: "Mitra Baru",
        description: `Mitra ${nama} ditambahkan`,
        entity: "mitra",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addTransportir: async (req, res) => {
    try {
      const { plat, kapasitas, jenisTransportirId, satuanVolumeId } = req.body;
      const filePath = "transportir";
      let foto = null;
      if (req.file) {
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }

      const result = await transportir.create({
        plat,
        foto,
        jenisTransportirId,
        satuanVolumeId: satuanVolumeId ? parseInt(satuanVolumeId) : null,
        kapasitas: parseInt(kapasitas),
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "transportir:created",
        title: "Transportir Baru",
        description: `Kendaraan ${plat} ditambahkan`,
        entity: "transportir",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addSupir: async (req, res) => {
    try {
      const { nama, nik, mitraId } = req.body;
      const filePath = "supir";
      const { ktp: ktpFile, foto: fotoFile } = req.files || {};

      let ktp = null;
      let foto = null;

      if (ktpFile?.[0]) {
        ktp = `/${filePath}/${ktpFile[0].filename}`;
      }
      if (fotoFile?.[0]) {
        foto = `/${filePath}/${fotoFile[0].filename}`;
      }

      const result = await supir.create({
        nama,
        nik,
        ktp,
        foto,
        mitraId: parseInt(mitraId),
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "supir:created",
        title: "Supir Baru",
        description: `Supir ${nama} ditambahkan`,
        entity: "supir",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editMitra: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nama,
        alamat,
        npwp,
        kontak,
        penanggungJawab,
        kode,
        jenisMitraId,
      } = req.body;

      const existing = await mitra.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Mitra tidak ditemukan" });
      }

      await mitra.update(
        {
          nama,
          alamat,
          npwp,
          kontak,
          penanggungJawab,
          kode,
          jenisMitraId: jenisMitraId ? parseInt(jenisMitraId) : null,
        },
        { where: { id } },
      );

      const result = await mitra.findByPk(id, {
        include: [{ model: supir }, { model: jenisMitra }],
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "mitra:updated",
        title: "Mitra Diperbarui",
        description: `Data mitra ${nama} diperbarui`,
        entity: "mitra",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteMitra: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await mitra.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Mitra tidak ditemukan" });
      }

      const [supirCount, suratCount, userCount] = await Promise.all([
        supir.count({ where: { mitraId: id } }),
        suratJalan.count({ where: { mitraId: id } }),
        userKPBPN.count({ where: { mitraId: id } }),
      ]);

      if (supirCount > 0) {
        return res.status(400).json({
          error: "Mitra masih memiliki supir. Hapus supir terlebih dahulu.",
        });
      }
      if (suratCount > 0) {
        return res.status(400).json({
          error: "Mitra masih digunakan pada surat jalan dan tidak dapat dihapus.",
        });
      }
      if (userCount > 0) {
        return res.status(400).json({
          error: "Mitra masih terhubung ke akun pengguna dan tidak dapat dihapus.",
        });
      }

      await mitra.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "mitra:deleted",
        title: "Mitra Dihapus",
        description: `Mitra ${existing.nama} dihapus`,
        entity: "mitra",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Mitra berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editTransportir: async (req, res) => {
    try {
      const { id } = req.params;
      const { plat, kapasitas, jenisTransportirId, satuanVolumeId } = req.body;

      const existing = await transportir.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Transportir tidak ditemukan" });
      }

      const filePath = "transportir";
      let foto = existing.foto;
      if (req.file) {
        foto = `/${filePath}/${req.file.filename}`;
      }

      await transportir.update(
        {
          plat,
          foto,
          jenisTransportirId,
          satuanVolumeId: satuanVolumeId ? parseInt(satuanVolumeId) : null,
          kapasitas: parseInt(kapasitas),
        },
        { where: { id } },
      );

      const result = await transportir.findByPk(id, {
        include: [{ model: jenisTransportir }, { model: satuanVolume }],
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "transportir:updated",
        title: "Transportir Diperbarui",
        description: `Kendaraan ${plat} diperbarui`,
        entity: "transportir",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteTransportir: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await transportir.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Transportir tidak ditemukan" });
      }

      const suratCount = await suratJalan.count({ where: { transportirId: id } });
      if (suratCount > 0) {
        return res.status(400).json({
          error:
            "Transportir masih digunakan pada surat jalan dan tidak dapat dihapus.",
        });
      }

      await transportir.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "transportir:deleted",
        title: "Transportir Dihapus",
        description: `Kendaraan ${existing.plat} dihapus`,
        entity: "transportir",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Transportir berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editSupir: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama, nik, mitraId } = req.body;

      const existing = await supir.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Supir tidak ditemukan" });
      }

      const filePath = "supir";
      const { ktp: ktpFile, foto: fotoFile } = req.files || {};

      let ktp = existing.ktp;
      let foto = existing.foto;

      if (ktpFile?.[0]) {
        ktp = `/${filePath}/${ktpFile[0].filename}`;
      }
      if (fotoFile?.[0]) {
        foto = `/${filePath}/${fotoFile[0].filename}`;
      }

      await supir.update(
        {
          nama,
          nik,
          ktp,
          foto,
          mitraId: parseInt(mitraId),
        },
        { where: { id } },
      );

      const result = await supir.findByPk(id, {
        include: [{ model: mitra }],
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "supir:updated",
        title: "Supir Diperbarui",
        description: `Data supir ${nama} diperbarui`,
        entity: "supir",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteSupir: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await supir.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Supir tidak ditemukan" });
      }

      const suratCount = await suratJalan.count({ where: { supirId: id } });
      if (suratCount > 0) {
        return res.status(400).json({
          error: "Supir masih digunakan pada surat jalan dan tidak dapat dihapus.",
        });
      }

      await supir.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "supir:deleted",
        title: "Supir Dihapus",
        description: `Supir ${existing.nama} dihapus`,
        entity: "supir",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Supir berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
