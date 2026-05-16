const {
  pegawai,
  daftarNomorSurat,
  jenisSurat,
  sumberDana,
} = require("../models");

module.exports = {
  getNomorSurat: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    console.log(indukUnitKerjaId);
    try {
      const result = await daftarNomorSurat.findAll({
        where: { indukUnitKerjaId },
        include: [{ model: jenisSurat, as: "jenisSurat" }],
      });
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getJenisSurat: async (req, res) => {
    try {
      const result = await jenisSurat.findAll({
        attributes: ["id", "jenis", "nomorSurat"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  editNomorLoket: async (req, res) => {
    console.log(req.body);
    const { nomorLoket, nomorSurat } = req.body;
    const id = req.params.id;
    console.log(id);
    try {
      const result = await daftarNomorSurat.update(
        {
          nomorLoket,
        },
        {
          where: { id },
        }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  editNomorSurat: async (req, res) => {
    const id = req.params.id;
    const { nomorSurat } = req.body;
    try {
      const result = await jenisSurat.update(
        {
          nomorSurat,
        },
        {
          where: { id },
        }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
