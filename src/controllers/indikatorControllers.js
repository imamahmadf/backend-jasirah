const {
  indikator,
  satuanIndikator,
  program,
  kegiatan,
  subKegPer,
  daftarUnitKerja,
  pegawai,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getAllIndikator: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const {
      indikator: indikatorQuery,
      satuanIndikatorId,
      programId,
      kegiatanId,
      subKegPerId,
      unitKerjaId,
      pegawaiId,
    } = req.query;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;

    const whereCondition = {};

    if (indikatorQuery) {
      whereCondition.indikator = { [Op.like]: "%" + indikatorQuery + "%" };
    }

    if (satuanIndikatorId) {
      whereCondition.satuanIndikatorId = satuanIndikatorId;
    }

    if (programId) {
      whereCondition.programId = programId;
    }

    if (kegiatanId) {
      whereCondition.kegiatanId = kegiatanId;
    }

    if (subKegPerId) {
      whereCondition.subKegPerId = subKegPerId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    if (pegawaiId) {
      whereCondition.pegawaiId = pegawaiId;
    }

    try {
      const result = await indikator.findAll({
        where: whereCondition,
        offset,
        limit,
        attributes: [
          "id",
          "indikator",
          "satuanIndikatorId",
          "subKegPerId",
          "kegiatanId",
          "programId",
          "unitKerjaId",
          "pegawaiId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: satuanIndikator,
            attributes: ["id", "satuan"],
            required: false,
          },
          {
            model: program,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: kegiatan,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: subKegPer,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            required: false,
          },
          {
            model: pegawai,
            attributes: ["id", "nama", "nip"],
            required: false,
          },
        ],
        order: [["createdAt", time]],
      });

      const totalRows = await indikator.count({
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

  getIndikatorById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await indikator.findByPk(id, {
        attributes: [
          "id",
          "indikator",
          "satuanIndikatorId",
          "subKegPerId",
          "kegiatanId",
          "programId",
          "unitKerjaId",
          "pegawaiId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: satuanIndikator,
            attributes: ["id", "satuan"],
            required: false,
          },
          {
            model: program,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: kegiatan,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: subKegPer,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            required: false,
          },
          {
            model: pegawai,
            attributes: ["id", "nama", "nip"],
            required: false,
          },
        ],
      });

      if (!result) {
        return res.status(404).json({
          message: "Indikator tidak ditemukan",
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

  createIndikator: async (req, res) => {
    const {
      indikator: indikatorValue,
      satuanIndikatorId,
      subKegPerId,
      kegiatanId,
      programId,
      unitKerjaId,
      pegawaiId,
    } = req.body;

    if (!indikatorValue) {
      return res.status(400).json({
        message: "Field indikator wajib diisi",
        code: 400,
      });
    }

    try {
      const result = await indikator.create({
        indikator: indikatorValue,
        satuanIndikatorId: satuanIndikatorId || null,
        subKegPerId: subKegPerId || null,
        kegiatanId: kegiatanId || null,
        programId: programId || null,
        unitKerjaId: unitKerjaId || null,
        pegawaiId: pegawaiId || null,
      });

      // Fetch created data with relations
      const createdIndikator = await indikator.findByPk(result.id, {
        attributes: [
          "id",
          "indikator",
          "satuanIndikatorId",
          "subKegPerId",
          "kegiatanId",
          "programId",
          "unitKerjaId",
          "pegawaiId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: satuanIndikator,
            attributes: ["id", "satuan"],
            required: false,
          },
          {
            model: program,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: kegiatan,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: subKegPer,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            required: false,
          },
          {
            model: pegawai,
            attributes: ["id", "nama", "nip"],
            required: false,
          },
        ],
      });

      return res.status(201).json({
        result: createdIndikator,
        message: "Indikator berhasil ditambahkan",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  updateIndikator: async (req, res) => {
    const { id } = req.params;
    const {
      indikator: indikatorValue,
      satuanIndikatorId,
      subKegPerId,
      kegiatanId,
      programId,
      unitKerjaId,
      pegawaiId,
    } = req.body;

    if (!indikatorValue) {
      return res.status(400).json({
        message: "Field indikator wajib diisi",
        code: 400,
      });
    }

    try {
      const existingIndikator = await indikator.findByPk(id);

      if (!existingIndikator) {
        return res.status(404).json({
          message: "Indikator tidak ditemukan",
          code: 404,
        });
      }

      const updateData = {
        indikator: indikatorValue,
      };

      if (satuanIndikatorId !== undefined) {
        updateData.satuanIndikatorId = satuanIndikatorId || null;
      }
      if (subKegPerId !== undefined) {
        updateData.subKegPerId = subKegPerId || null;
      }
      if (kegiatanId !== undefined) {
        updateData.kegiatanId = kegiatanId || null;
      }
      if (programId !== undefined) {
        updateData.programId = programId || null;
      }
      if (unitKerjaId !== undefined) {
        updateData.unitKerjaId = unitKerjaId || null;
      }
      if (pegawaiId !== undefined) {
        updateData.pegawaiId = pegawaiId || null;
      }

      await indikator.update(updateData, {
        where: { id },
      });

      const result = await indikator.findByPk(id, {
        attributes: [
          "id",
          "indikator",
          "satuanIndikatorId",
          "subKegPerId",
          "kegiatanId",
          "programId",
          "unitKerjaId",
          "pegawaiId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: satuanIndikator,
            attributes: ["id", "satuan"],
            required: false,
          },
          {
            model: program,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: kegiatan,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: subKegPer,
            attributes: ["id", "nama", "kode"],
            required: false,
            paranoid: true,
          },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            required: false,
          },
          {
            model: pegawai,
            attributes: ["id", "nama", "nip"],
            required: false,
          },
        ],
      });

      return res.status(200).json({
        result,
        message: "Indikator berhasil diupdate",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  deleteIndikator: async (req, res) => {
    const { id } = req.params;

    try {
      const existingIndikator = await indikator.findByPk(id);

      if (!existingIndikator) {
        return res.status(404).json({
          message: "Indikator tidak ditemukan",
          code: 404,
        });
      }

      await indikator.destroy({
        where: { id },
      });

      return res.status(200).json({
        message: "Indikator berhasil dihapus",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
        code: 500,
      });
    }
  },

  searchProgram: async (req, res) => {
    try {
      const { q, unitKerjaId } = req.query;

      const result = await program.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
          unitKerjaId,
        },
        attributes: ["id", "nama", "kode"],
        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  searchKegiatan: async (req, res) => {
    try {
      const { q, unitKerjaId } = req.query;

      const result = await kegiatan.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`,
          },
          unitKerjaId,
        },
        attributes: ["id", "nama", "kode"],
        limit: 10,
        order: [["nama", "ASC"]],
        paranoid: true,
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  searchSubKegPer: async (req, res) => {
    try {
      const { q, unitKerjaId } = req.query;

      const result = await subKegPer.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`,
          },
          unitKerjaId,
        },
        attributes: ["id", "nama", "kode"],
        limit: 10,
        order: [["nama", "ASC"]],
        paranoid: true,
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
};
