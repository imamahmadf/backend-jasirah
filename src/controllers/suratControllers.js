const {
  daftarSubKegiatan,
  perjalanan,
  profile,
  personil,
  rincianBPD,
  tipePerjalanan,
  tempat,
  jenisPerjalanan,
  anggaran,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getNomorSuratTugas: async (req, res) => {
    const unitKerjaId = req.params.id;
    try {
      const result = await perjalanan.findAll({
        where: { unitKerjaId },
        attributes: ["id", "kodeRekening", "subKegiatan", "anggaran"],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postAnggaran: async (req, res) => {
    console.log(req.body);
    const { nilai, tahun, tipePerjalananId, subKegiatanId } = req.body;
    console.log("Tahun dikirim ke DB:", new Date(`${tahun}-01`));

    try {
      const result = await anggaran.create({
        nilai,
        tahun: new Date(`${tahun}-01`),
        tipePerjalananId,
        subKegiatanId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
