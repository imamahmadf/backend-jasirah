const { suratPesanan } = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postNomor: async (req, res) => {
    const { indukUnitKerjaId, nomor } = req.body;
    try {
      const result = await suratPesanan.create({ indukUnitKerjaId, nomor });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getNomor: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    console.log(req.params);
    try {
      const result = await suratPesanan.findAll({
        where: { indukUnitKerjaId },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
