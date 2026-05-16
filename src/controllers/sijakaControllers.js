const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
  indukUnitKerja,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getSeed: async (req, res) => {
    try {
      const result = await indukUnitKerja.findAll({
        attributes: ["id", "indukUnitKerja"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getPegawaiUnitKerja: async (req, res) => {
    const unitKerjaId = req.params.id;

    const whereCondition = {};

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    try {
      const result = await pegawai.findAll({
        where: whereCondition,

        order: [
          // ["updatedAt", `${time}`],
          ["nama", `ASC`],
        ],
        attributes: ["id", "nama", "nip", "jabatan", "pendidikan"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
