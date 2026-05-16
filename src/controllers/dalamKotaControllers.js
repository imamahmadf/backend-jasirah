const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postSuratTugas: async (req, res) => {},
  getDalamKota: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await dalamKota.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "nama", "durasi", "status", "uangTransport"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  serachDalamKota: async (req, res) => {
    try {
      const { q } = req.query;
      const indukUnitKerjaId = req.query.id;

      const where = {
        nama: {
          [Op.like]: `%${q}%`,
        },
      };
      if (indukUnitKerjaId) {
        where.indukUnitKerjaId = indukUnitKerjaId;
      }

      const result = await dalamKota.findAll({
        where,
        attributes: ["id", "nama", "durasi"],
        limit: 10,
        order: [["nama", "ASC"]],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateStatus: async (req, res) => {
    const { id } = req.body;
    try {
      const [affectedCount] = await dalamKota.update(
        { status: "aktif" },
        { where: { id } }
      );
      return res.status(200).json({
        message: "Status berhasil diupdate",
        affectedCount,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
