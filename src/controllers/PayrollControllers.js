const fs = require("fs");
const path = require("path");
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
  pengeluaran,
  metodePembayaran,
  jenisPengeluaran,
  statusPembayaran,
  Presensi,
} = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { renderSlipGajiFromTemplatePath } = require("../utils/slipGajiDocx");

function formatRupiah(angka) {
  return Number(angka || 0).toLocaleString("id-ID");
}

function formatTanggalIndonesia(date) {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const emptySlip = () => ({
  nama: "",
  jabatan: "",
  detail: [],
  total: "",
});

const normalizeSlip = (slip) => ({
  nama: slip?.nama || "",
  jabatan: slip?.jabatan || "",
  detail: Array.isArray(slip?.detail) ? slip.detail : [],
  total: slip?.total || "",
});

function createPages(data) {
  const pages = [];

  for (let i = 0; i < data.length; i += 4) {
    pages.push({
      kiriAtas: normalizeSlip(data[i]),
      kananAtas: normalizeSlip(data[i + 1]),
      kiriBawah: normalizeSlip(data[i + 2]),
      kananBawah: normalizeSlip(data[i + 3]),
    });
  }

  return pages.length > 0
    ? pages
    : [
        {
          kiriAtas: emptySlip(),
          kananAtas: emptySlip(),
          kiriBawah: emptySlip(),
          kananBawah: emptySlip(),
        },
      ];
}

function hitungNominalByTipe(nilai, tipe, gajiPokok) {
  const nominalNilai = Number(nilai) || 0;
  const tipeLower = String(tipe || "").toLowerCase();
  if (tipeLower === "presentase" || tipeLower === "persentase") {
    return Math.round((gajiPokok * nominalNilai) / 100);
  }
  return nominalNilai;
}

function hitungTotalGajiPresensi(presensis, gajiPokokHarian) {
  return (presensis || []).reduce((total, presensi) => {
    if (presensi.statusPresensiId === 1) {
      return total + (Number(gajiPokokHarian) || 0);
    }
    return total;
  }, 0);
}

async function createPayrollAndPengeluaran(
  pegawaiId,
  tanggalAwal,
  tanggalAkhir,
  transaction,
) {
  const [listTunjangan, listPotongan, listPegawai, listPresensi] =
    await Promise.all([
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
        attributes: ["id", "nama", "gajiPokok", "unitKerjaId"],
        transaction,
      }),
      Presensi.findAll({
        where: {
          pegawaiId: { [Op.in]: pegawaiId },
          tanggal: { [Op.between]: [tanggalAwal, tanggalAkhir] },
        },
        transaction,
      }),
    ]);

  const gajiPokokPegawaiMap = Object.fromEntries(
    listPegawai.map((p) => [p.id, Number(p.gajiPokok) || 0]),
  );

  const presensisByPegawaiId = listPresensi.reduce((acc, item) => {
    if (!acc[item.pegawaiId]) acc[item.pegawaiId] = [];
    acc[item.pegawaiId].push(item);
    return acc;
  }, {});

  const totalGajiByPegawaiId = Object.fromEntries(
    pegawaiId.map((id) => [
      id,
      hitungTotalGajiPresensi(
        presensisByPegawaiId[id],
        gajiPokokPegawaiMap[id],
      ),
    ]),
  );

  const payrollRecords = await payroll.bulkCreate(
    pegawaiId.map((id) => ({
      pegawaiId: id,
      periode: tanggalAwal,
      periodeAkhir: tanggalAkhir,
      gajiPokok: totalGajiByPegawaiId[id] ?? 0,
    })),
    { transaction },
  );

  const payrollByPegawaiId = Object.fromEntries(
    payrollRecords.map((p) => [p.pegawaiId, p.id]),
  );

  const dataTunjangan = listTunjangan.map((pt) => ({
    payrollId: payrollByPegawaiId[pt.pegawaiId],
    nama: pt.tunjangan?.nama ?? "",
    nominal: hitungNominalByTipe(
      pt.nominal,
      pt.tunjangan?.tipe,
      gajiPokokPegawaiMap[pt.pegawaiId] ?? 0,
    ),
  }));

  const dataPotongan = listPotongan.map((pp) => ({
    payrollId: payrollByPegawaiId[pp.pegawaiId],
    nama: pp.potongan?.nama ?? "",
    nominal: hitungNominalByTipe(
      pp.potongan?.nominal,
      pp.potongan?.tipe,
      gajiPokokPegawaiMap[pp.pegawaiId] ?? 0,
    ),
  }));

  const [resultTunjangan, resultPotongan] = await Promise.all([
    dataTunjangan.length > 0
      ? payrollTunjangan.bulkCreate(dataTunjangan, { transaction })
      : [],
    dataPotongan.length > 0
      ? payrollPotongan.bulkCreate(dataPotongan, { transaction })
      : [],
  ]);

  const [defaultMetode, defaultJenis, defaultStatus] = await Promise.all([
    metodePembayaran.findOne({
      where: { nama: { [Op.like]: "transfer" } },
      transaction,
    }),
    jenisPengeluaran.findOne({
      where: { nama: { [Op.like]: "gaji" } },
      transaction,
    }),
    statusPembayaran.findOne({
      where: { nama: { [Op.in]: ["payble", "paid"] } },
      order: [["id", "ASC"]],
      transaction,
    }),
  ]);

  if (!defaultMetode || !defaultJenis || !defaultStatus) {
    const err = new Error(
      "Master pengeluaran belum lengkap. Pastikan metodePembayaran, jenisPengeluaran, dan statusPembayaran sudah tersedia.",
    );
    err.statusCode = 400;
    throw err;
  }

  const pengeluaranPayload = listPegawai.map((item) => {
    const totalGaji = totalGajiByPegawaiId[item.id] ?? 0;

    return {
      tanggal: new Date(),
      deskripsi: `Pembayaran gaji ${item.nama} periode ${tanggalAwal}`,
      unitKerjaId: item.unitKerjaId,
      metodePembayaranId: defaultMetode.id,
      jenisPengeluaranId: defaultJenis.id,
      nominal: totalGaji,
      pegawaiId: item.id,
      statusPembayaranId: defaultStatus.id,
      foto: null,
    };
  });

  const resultPengeluaran =
    pengeluaranPayload.length > 0
      ? await pengeluaran.bulkCreate(pengeluaranPayload, { transaction })
      : [];

  return {
    payrollRecords,
    payrollTunjangan: resultTunjangan,
    payrollPotongan: resultPotongan,
    pengeluaran: resultPengeluaran,
  };
}

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
              "periodeAkhir",
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
  editPayrollTunjangan: async (req, res) => {
    const { id } = req.params;
    const { payrollId, nama, nominal } = req.body;
    try {
      const existing = await payrollTunjangan.findByPk(id);
      if (!existing) {
        return res.status(404).json({
          message: "Data payroll tunjangan tidak ditemukan",
          code: 404,
        });
      }

      const payload = {};
      if (payrollId !== undefined) payload.payrollId = Number(payrollId) || 0;
      if (nama !== undefined) payload.nama = nama;
      if (nominal !== undefined) payload.nominal = Number(nominal) || 0;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({
          message: "Tidak ada data yang dikirim untuk diupdate",
          code: 400,
        });
      }

      await payrollTunjangan.update(payload, { where: { id } });
      const result = await payrollTunjangan.findByPk(id);

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
    const { pegawaiId, tanggalAwal, tanggalAkhir } = req.body;
    const transaction = await sequelize.transaction();
    try {
      if (!Array.isArray(pegawaiId) || pegawaiId.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "pegawaiId harus berupa array dan tidak boleh kosong",
          code: 400,
        });
      }

      const payrollResult = await createPayrollAndPengeluaran(
        pegawaiId,
        tanggalAwal,
        tanggalAkhir,
        transaction,
      );

      await transaction.commit();

      return res.status(200).json({
        result: payrollResult.payrollRecords,
        payrollTunjangan: payrollResult.payrollTunjangan,
        payrollPotongan: payrollResult.payrollPotongan,
        pengeluaran: payrollResult.pengeluaran,
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      if (err.statusCode === 400) {
        return res.status(400).json({
          message: err.message,
          code: 400,
        });
      }
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  generateSlipGaji: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { pegawaiId, tanggalAwal, tanggalAkhir } = req.body;

      if (!pegawaiId || !tanggalAwal || !tanggalAkhir) {
        await transaction.rollback();
        return res.status(400).json({
          message: "pegawaiId, tanggalAwal, dan tanggalAkhir wajib diisi",
          code: 400,
        });
      }

      const pegawaiIds = Array.isArray(pegawaiId)
        ? pegawaiId.map(Number).filter(Boolean)
        : [Number(pegawaiId)].filter(Boolean);

      if (pegawaiIds.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "pegawaiId tidak valid",
          code: 400,
        });
      }

      const templatePath = path.join(
        __dirname,
        "../public/slip-gaji/template-slip-gaji.docx",
      );

      if (!fs.existsSync(templatePath)) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Template slip gaji tidak ditemukan",
          code: 404,
        });
      }

      await createPayrollAndPengeluaran(
        pegawaiIds,
        tanggalAwal,
        tanggalAkhir,
        transaction,
      );

      const dataPegawai = await pegawai.findAll({
        where: {
          id: { [Op.in]: pegawaiIds },
        },
        attributes: ["id", "nama", "jabatan", "gajiPokok"],
        include: [
          {
            model: Presensi,
            as: "presensis",
            where: {
              tanggal: {
                [Op.between]: [tanggalAwal, tanggalAkhir],
              },
            },
            required: false,
          },
        ],
        order: [
          ["nama", "ASC"],
          [{ model: Presensi, as: "presensis" }, "tanggal", "ASC"],
        ],
      });
      const hasilSlip = dataPegawai.map((item) => {
        const totalGaji = hitungTotalGajiPresensi(
          item.presensis,
          item.gajiPokok,
        );

        const detail = (item.presensis || []).map((presensi) => {
          const upah =
            presensi.statusPresensiId === 1 ? Number(item.gajiPokok) || 0 : 0;

          return {
            tanggal: formatTanggalIndonesia(presensi.tanggal),
            upah: upah > 0 ? formatRupiah(upah) : "-",
            lembur: "-",
          };
        });

        return {
          nama: item.nama,
          jabatan: item.jabatan,
          detail,
          total: formatRupiah(totalGaji),
        };
      });

      const pages = createPages(hasilSlip);

      const buffer = renderSlipGajiFromTemplatePath(templatePath, pages);

      const outputFileName = `slip-gaji_${Date.now()}.docx`;
      const outputPath = path.join(
        __dirname,
        "../public/output",
        outputFileName,
      );

      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      }

      fs.writeFileSync(outputPath, buffer);

      await transaction.commit();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${outputFileName}`,
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      res.send(buffer);
      fs.unlinkSync(outputPath);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (error.statusCode === 400) {
        return res.status(400).json({
          message: error.message,
          code: 400,
        });
      }
      return res.status(500).json({
        message: "Gagal generate slip gaji",
        error: error.message,
      });
    }
  },
};
