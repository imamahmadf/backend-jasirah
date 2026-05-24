const {
  pegawai,
  daftarUnitKerja,
  sequelize,
  profesi,
  statusPegawai,
  payroll,
  payrollTunjangan,
  payrollPotongan,
  pegawaiPotongan,
  pegawaiTunjangan,
  potongan,
  tunjangan,
} = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  getDaftarPayroll: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const statusPegawaiId = parseInt(req.query.statusPegawaiId);
    const profesiId = parseInt(req.query.profesiId);
    const search = req.query.search_query || "";
    const filterPendidikan = req.query.filterPendidikan || "";
    const filterNip = req.query.filterNip || "";
    const filterJabatan = req.query.filterJabatan || "";
    const alfabet = req.query.alfabet || "ASC";

    const offset = limit * page;
    console.log(req.query);
    const whereCondition = {
      nama: { [Op.like]: "%" + search + "%" },
      nip: { [Op.like]: "%" + filterNip + "%" },
      jabatan: { [Op.like]: "%" + filterJabatan + "%" },
      pendidikan: { [Op.like]: "%" + filterPendidikan + "%" },
    };

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    if (profesiId) {
      whereCondition.profesiId = profesiId;
    }

    if (statusPegawaiId) {
      whereCondition.statusPegawaiId = statusPegawaiId;
    }

    try {
      const result = await pegawai.findAll({
        where: whereCondition,
        offset,
        limit,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `${alfabet}`],
        ],
        attributes: ["id", "nama", "nip", "jabatan", "pendidikan", "nik"],
        include: [
          //   {
          //     model: daftarTingkatan,
          //     as: "daftarTingkatan",
          //   },
          //   { model: daftarGolongan, as: "daftarGolongan" },
          { model: statusPegawai, as: "statusPegawai" },
          //   { model: daftarPangkat, as: "daftarPangkat" },
          { model: profesi, as: "profesi" },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja"],
          },
          {
            model: payroll,
            limit: 1,
            separate: true,
            order: [["createdAt", "DESC"]],
          },
        ],
      });
      const totalRows = await pegawai.count({
        where: whereCondition,
        offset,
        limit,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `${alfabet}`],
        ],
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getDetailPayroll: async (req, res) => {
    const { id } = req.params;
    console.log("BERHASI MASUK");
    try {
      const result = await pegawai.findOne({
        where: { id },
        attributes: [
          "id",
          "nama",
          "nip",
          "nik",
          "jabatan",
          "pendidikan",
          "gajiPokok",
        ],
        include: [
          {
            model: profesi,
            as: "profesi",
            attributes: ["nama", "id"],
          },
          {
            model: statusPegawai,
            as: "statusPegawai",
            attributes: ["status", "id"],
          },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja"],
          },
          {
            model: payroll,
            attributes: [
              "id",
              "periode",
              "pegawaiId",
              "createdAt",
              "gajiPokok",
            ],
            include: [{ model: payrollPotongan }, { model: payrollTunjangan }],
          },
          {
            model: pegawaiPotongan,
            include: [{ model: potongan }],
          },
          {
            model: pegawaiTunjangan,
            include: [{ model: tunjangan }],
          },
        ],
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

  getPengaturanPayroll: async (req, res) => {
    console.log("BERHASI MASUK");
    try {
      const resultPotongan = await potongan.findAll({});
      const resultTunjangan = await tunjangan.findAll();

      return res.status(200).json({ resultPotongan, resultTunjangan });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  tambahTunjangan: async (req, res) => {
    console.log("BERHASI MASUK");
    const { pegawaiId, tunjanganId, nominal } = req.body;
    try {
      const result = await pegawaiTunjangan.create({
        pegawaiId,
        tunjanganId,
        nominal,
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

  editTunjangan: async (req, res) => {
    const { id } = req.params;
    const { tunjanganId, nominal } = req.body;
    try {
      await pegawaiTunjangan.update(
        { tunjanganId, nominal },
        { where: { id } },
      );
      const result = await pegawaiTunjangan.findOne({ where: { id } });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  hapusTunjangan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pegawaiTunjangan.destroy({ where: { id } });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  postTunjangan: async (req, res) => {
    console.log("BERHASI MASUK");
    const { nama, tipe } = req.body;
    try {
      const result = await tunjangan.create({ nama, tipe });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  postPotongan: async (req, res) => {
    console.log("BERHASI MASUK", req.body);
    const { nama, tipe, nominal } = req.body;
    try {
      const result = await potongan.create({ nama, tipe, nominal });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  tambahPotongan: async (req, res) => {
    console.log("BERHASI MASUK");
    const { pegawaiId, potonganId } = req.body;
    try {
      const result = await pegawaiPotongan.create({
        pegawaiId,
        potonganId,
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

  postPayroll: async (req, res) => {
    const { pegawaiId, periode } = req.body;
    const transaction = await sequelize.transaction();
    try {
      if (!Array.isArray(pegawaiId) || pegawaiId.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "pegawaiId harus berupa array dan tidak boleh kosong",
          code: 400,
        });
      }

      const [listTunjangan, listPotongan, listPegawai] = await Promise.all([
        pegawaiTunjangan.findAll({
          where: { pegawaiId: { [Op.in]: pegawaiId } },
          include: [{ model: tunjangan }],
          transaction,
        }),
        pegawaiPotongan.findAll({
          where: { pegawaiId: { [Op.in]: pegawaiId } },
          include: [{ model: potongan }],
          transaction,
        }),
        pegawai.findAll({
          where: { id: { [Op.in]: pegawaiId } },
          attributes: ["id", "gajiPokok"],
          transaction,
        }),
      ]);

      const gajiPokokByPegawaiId = Object.fromEntries(
        listPegawai.map((p) => [p.id, p.gajiPokok ?? 0]),
      );

      const payrollRecords = await payroll.bulkCreate(
        pegawaiId.map((id) => ({
          pegawaiId: id,
          periode,
          gajiPokok: gajiPokokByPegawaiId[id] ?? 0,
        })),
        { transaction },
      );

      const payrollByPegawaiId = Object.fromEntries(
        payrollRecords.map((p) => [p.pegawaiId, p.id]),
      );

      const dataTunjangan = listTunjangan.map((pt) => ({
        payrollId: payrollByPegawaiId[pt.pegawaiId],
        nama: pt.tunjangan?.nama ?? "",
        nominal: pt.nominal ?? 0,
      }));

      const dataPotongan = listPotongan.map((pp) => ({
        payrollId: payrollByPegawaiId[pp.pegawaiId],
        nama: pp.potongan?.nama ?? "",
        nominal: pp.potongan?.nominal ?? 0,
      }));

      const [resultTunjangan, resultPotongan] = await Promise.all([
        dataTunjangan.length > 0
          ? payrollTunjangan.bulkCreate(dataTunjangan, { transaction })
          : [],
        dataPotongan.length > 0
          ? payrollPotongan.bulkCreate(dataPotongan, { transaction })
          : [],
      ]);

      await transaction.commit();

      return res.status(200).json({
        result: payrollRecords,
        payrollTunjangan: resultTunjangan,
        payrollPotongan: resultPotongan,
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
