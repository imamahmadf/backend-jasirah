const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  sumberDana,
  indukUKSumberDana,
  indukUnitKerja,
  pelayananKesehatan,
  jenisPerjalanan,
  personil,
  bendahara,
  uangHarian,
} = require("../models");

const { Op, where } = require("sequelize");

module.exports = {
  getBendahara: async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
      const result = await sumberDana.findAll({
        include: [
          {
            model: bendahara,
            include: [
              {
                model: pegawai,
                foreignKey: "pegawaiId",
                as: "pegawai_bendahara",
                require: true,
                attributes: ["id", "nama"],
              },
            ],
            attributes: ["id", "jabatan"],
            where: { indukUnitKerjaId: id },
            require: true,
          },
        ],
        attributes: ["id", "sumber"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postBendahara: async (req, res) => {
    const { pegawaiId, indukUnitKerjaId, sumberDanaId, jabatan } = req.body;
    try {
      const result = await bendahara.create({
        pegawaiId,
        indukUnitKerjaId,
        sumberDanaId,
        jabatan,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getSumberDana: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await sumberDana.findAll({
        include: [
          {
            model: indukUKSumberDana,
            attributes: ["id"],
            where: { indukUnitKerjaId },
          },
        ],
        attributes: ["id", "sumber"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  deleteBendahara: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await bendahara.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deletePersonil: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDDD");
    try {
      const result = await personil.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getAllSumberDana: async (req, res) => {
    try {
      const result = await sumberDana.findAll({});
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});
      const resultUangHarian = await uangHarian.findAll({});
      const resultPelayanan = await pelayananKesehatan.findAll({
        where: {
          id: {
            [Op.gt]: 1,
          },
        },
      });
      return res.status(200).json({
        result,
        resultJenisPerjalanan,
        resultPelayanan,
        resultUangHarian,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editSumberDana: async (req, res) => {
    const { id } = req.params;
    const { untukPembayaran, kalimat1, kalimat2 } = req.body;
    try {
      const result = await sumberDana.update(
        {
          untukPembayaran,
          kalimat1,
          kalimat2,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editJenisPerjalanan: async (req, res) => {
    const { id } = req.params;
    const { jenis, kodeRekening } = req.body;
    try {
      const result = await jenisPerjalanan.update(
        {
          jenis,
          kodeRekening,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editPelayananKesehatan: async (req, res) => {
    const { id } = req.params;
    const { jenis, kodeRekening } = req.body;
    try {
      const result = await jenisPerjalanan.update(
        {
          jenis,
          kodeRekening,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editUangHarian: async (req, res) => {
    const { id } = req.params;
    const { nilai } = req.body;
    try {
      const result = await uangHarian.update(
        {
          nilai,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
