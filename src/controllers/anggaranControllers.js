const {
  rincianBPD,
  rill,
  daftarUnitKerja,
  sequelize,
  user,
  userRole,
  role,
  profile,
  program,
  kegiatan,
  subKegPer,
  tahunAnggaran,
  jenisAnggaran,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getAllAnggaran: async (req, res) => {
    try {
      const result = await tahunAnggaran.findAll({
        include: [
          {
            model: jenisAnggaran,
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
