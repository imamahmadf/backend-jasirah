const { satuanIndikator } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  getAllSatuanIndikator: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const { satuan } = req.query;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;

    const whereCondition = {};

    if (satuan) {
      whereCondition.satuan = { [Op.like]: "%" + satuan + "%" };
    }

    try {
      const result = await satuanIndikator.findAll({
        where: whereCondition,
        offset,
        limit,
        attributes: ["id", "satuan", "createdAt", "updatedAt"],
        order: [["createdAt", time]],
      });

      const totalRows = await satuanIndikator.count({
        where: whereCondition,
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  getSatuanIndikatorById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await satuanIndikator.findByPk(id, {
        attributes: ["id", "satuan", "createdAt", "updatedAt"],
      });

      if (!result) {
        return res.status(404).json({
          message: "Satuan Indikator tidak ditemukan",
          code: 404,
        });
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  createSatuanIndikator: async (req, res) => {
    const { satuan } = req.body;

    if (!satuan) {
      return res.status(400).json({
        message: "Field satuan wajib diisi",
        code: 400,
      });
    }

    try {
      const result = await satuanIndikator.create({
        satuan,
      });

      return res.status(201).json({
        result,
        message: "Satuan Indikator berhasil ditambahkan",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  updateSatuanIndikator: async (req, res) => {
    const { id } = req.params;
    const { satuan } = req.body;

    if (!satuan) {
      return res.status(400).json({
        message: "Field satuan wajib diisi",
        code: 400,
      });
    }

    try {
      const existingSatuan = await satuanIndikator.findByPk(id);

      if (!existingSatuan) {
        return res.status(404).json({
          message: "Satuan Indikator tidak ditemukan",
          code: 404,
        });
      }

      await satuanIndikator.update(
        { satuan },
        {
          where: { id },
        }
      );

      const result = await satuanIndikator.findByPk(id, {
        attributes: ["id", "satuan", "createdAt", "updatedAt"],
      });

      return res.status(200).json({
        result,
        message: "Satuan Indikator berhasil diupdate",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  deleteSatuanIndikator: async (req, res) => {
    const { id } = req.params;

    try {
      const existingSatuan = await satuanIndikator.findByPk(id);

      if (!existingSatuan) {
        return res.status(404).json({
          message: "Satuan Indikator tidak ditemukan",
          code: 404,
        });
      }

      await satuanIndikator.destroy({
        where: { id },
      });

      return res.status(200).json({
        message: "Satuan Indikator berhasil dihapus",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  getAllSatuanIndikatorSimple: async (req, res) => {
    try {
      const result = await satuanIndikator.findAll({
        attributes: ["id", "satuan"],
        order: [["satuan", "ASC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },
};
