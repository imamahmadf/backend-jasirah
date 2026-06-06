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
  presensi,
} = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  renderSlipGajiFromTemplatePath,
  renderSlipGajiBulananFromTemplatePath,
} = require("../utils/slipGajiDocx");
const { mergeDocxBuffers } = require("../utils/mergeDocx");
const {
  buildPayrollSlip,
  buildSlipBulananDocxPayload,
  createEmptySlipBulananPayload,
  formatPeriodeLabel,
  formatLemburHarianForSlip,
  isPegawaiMingguan,
  hitungTotalGajiPresensi,
  hitungGajiPresensiPerUnitKerja,
} = require("../utils/buildPayrollSlip");

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

const SLIPS_PER_PAGE = 4;

function sortByPegawaiIdsOrder(items, pegawaiIds, getId = (item) => item.id) {
  const orderMap = new Map(pegawaiIds.map((id, index) => [Number(id), index]));

  return [...items].sort(
    (a, b) =>
      (orderMap.get(Number(getId(a))) ?? Number.MAX_SAFE_INTEGER) -
      (orderMap.get(Number(getId(b))) ?? Number.MAX_SAFE_INTEGER),
  );
}

function createSlipPages(data, emptySlipFn, normalizeSlipFn) {
  const pages = [];
  const pickSlip = (item) => (item ? normalizeSlipFn(item) : emptySlipFn());

  // Satu halaman template = 4 slip (kiri atas, kanan atas, kiri bawah, kanan bawah).
  for (let i = 0; i < data.length; i += SLIPS_PER_PAGE) {
    pages.push({
      kiriAtas: pickSlip(data[i]),
      kananAtas: pickSlip(data[i + 1]),
      kiriBawah: pickSlip(data[i + 2]),
      kananBawah: pickSlip(data[i + 3]),
    });
  }

  return pages.length > 0
    ? pages
    : [
        {
          kiriAtas: emptySlipFn(),
          kananAtas: emptySlipFn(),
          kiriBawah: emptySlipFn(),
          kananBawah: emptySlipFn(),
        },
      ];
}

function createPages(data) {
  return createSlipPages(data, emptySlip, normalizeSlip);
}

const emptySlipBulanan = () => createEmptySlipBulananPayload();

const normalizeSlipBulanan = (slip) => {
  if (!slip?.filled) {
    return createEmptySlipBulananPayload();
  }

  return {
    filled: true,
    nama: slip?.nama || "",
    jabatan: slip?.jabatan || "",
    periode: slip?.periode || "",
    gajiTetap: Array.isArray(slip?.gajiTetap) ? slip.gajiTetap : [],
    totalGajiTetap: slip?.totalGajiTetap || "0",
    gajiTidakTetap: Array.isArray(slip?.gajiTidakTetap)
      ? slip.gajiTidakTetap
      : [],
    totalGajiTidakTetap: slip?.totalGajiTidakTetap || "0",
    potongan: Array.isArray(slip?.potongan) ? slip.potongan : [],
    totalPotongan: slip?.totalPotongan || "0",
    gajiDiterima: slip?.gajiDiterima || "0",
    takeHomePay: slip?.takeHomePay || "0",
  };
};

function createPagesBulanan(data) {
  return createSlipPages(data, emptySlipBulanan, normalizeSlipBulanan);
}

function buildPayrollPeriodWhere(tanggalAwal, tanggalAkhir) {
  return {
    periode: tanggalAwal,
    [Op.or]: [
      { periodeAkhir: tanggalAkhir },
      { periodeAkhir: null },
      { periodeAkhir: "" },
    ],
  };
}

function pickLatestPayrollPerPegawai(payrollRecords, pegawaiIds) {
  const latestByPegawaiId = new Map();

  for (const record of payrollRecords) {
    const pegawaiId = Number(record.pegawaiId);
    const current = latestByPegawaiId.get(pegawaiId);

    if (!current || Number(record.id) > Number(current.id)) {
      latestByPegawaiId.set(pegawaiId, record);
    }
  }

  return pegawaiIds
    .map((id) => latestByPegawaiId.get(Number(id)))
    .filter(Boolean);
}

function hitungNominalByTipe(nilai, tipe, gajiPokok) {
  const nominalNilai = Number(nilai) || 0;
  const tipeLower = String(tipe || "").toLowerCase();
  if (tipeLower === "presentase" || tipeLower === "persentase") {
    return Math.round((gajiPokok * nominalNilai) / 100);
  }
  return nominalNilai;
}

function roundTakeHomePay(nominal) {
  return Math.floor((Number(nominal) || 0) / 100) * 100;
}

function buildPengeluaranPayload(
  listPegawai,
  {
    tanggalAwal,
    presensisByPegawaiId,
    gajiPokokPegawaiMap,
    gajiPokokPayrollByPegawaiId,
    payrollByPegawaiId,
    tunjanganTotalByPayrollId,
    potonganTotalByPayrollId,
    defaultMetode,
    defaultJenis,
    defaultStatus,
  },
) {
  const pengeluaranPayload = [];

  for (const item of listPegawai) {
    const payrollId = payrollByPegawaiId[item.id];
    const tunjanganTotal = tunjanganTotalByPayrollId[payrollId] || 0;
    const potonganTotal = potonganTotalByPayrollId[payrollId] || 0;
    const netTunjanganPotongan = tunjanganTotal - potonganTotal;

    const baseEntry = {
      tanggal: new Date(),
      metodePembayaranId: defaultMetode.id,
      jenisPengeluaranId: defaultJenis.id,
      statusPembayaranId: defaultStatus.id,
      foto: null,
      pegawaiId: item.id,
    };

    if (isPegawaiMingguan(item.statusPegawaiId)) {
      const gajiPerUnit = hitungGajiPresensiPerUnitKerja(
        presensisByPegawaiId[item.id],
        gajiPokokPegawaiMap[item.id],
        item.unitKerjaId,
      );
      const unitKerjaIds = Object.keys(gajiPerUnit);

      if (unitKerjaIds.length === 0) {
        const nominal = roundTakeHomePay(netTunjanganPotongan);
        if (nominal > 0 && item.unitKerjaId) {
          pengeluaranPayload.push({
            ...baseEntry,
            deskripsi: `Pembayaran gaji ${item.nama} periode ${tanggalAwal}`,
            unitKerjaId: item.unitKerjaId,
            nominal,
          });
        }
        continue;
      }

      let tunjanganPotonganAssigned = false;

      for (const unitKerjaIdStr of unitKerjaIds) {
        const unitKerjaId = Number(unitKerjaIdStr);
        let nominal = gajiPerUnit[unitKerjaId];

        if (
          !tunjanganPotonganAssigned &&
          unitKerjaId === Number(item.unitKerjaId)
        ) {
          nominal += netTunjanganPotongan;
          tunjanganPotonganAssigned = true;
        }

        nominal = roundTakeHomePay(nominal);
        if (nominal <= 0) continue;

        pengeluaranPayload.push({
          ...baseEntry,
          deskripsi: `Pembayaran gaji ${item.nama} periode ${tanggalAwal}`,
          unitKerjaId,
          nominal,
        });
      }

      if (!tunjanganPotonganAssigned && netTunjanganPotongan !== 0) {
        const nominal = roundTakeHomePay(netTunjanganPotongan);
        if (nominal !== 0 && item.unitKerjaId) {
          pengeluaranPayload.push({
            ...baseEntry,
            deskripsi: `Pembayaran gaji ${item.nama} periode ${tanggalAwal}`,
            unitKerjaId: item.unitKerjaId,
            nominal,
          });
        }
      }

      continue;
    }

    const gajiPokokPayroll = gajiPokokPayrollByPegawaiId[item.id] ?? 0;
    const takeHomePay = roundTakeHomePay(
      gajiPokokPayroll + netTunjanganPotongan,
    );

    pengeluaranPayload.push({
      ...baseEntry,
      deskripsi: `Pembayaran gaji ${item.nama} periode ${tanggalAwal}`,
      unitKerjaId: item.unitKerjaId,
      nominal: takeHomePay,
    });
  }

  return pengeluaranPayload;
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
        attributes: [
          "id",
          "nama",
          "gajiPokok",
          "unitKerjaId",
          "statusPegawaiId",
        ],
        transaction,
      }),
      presensi.findAll({
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

  const gajiPokokPayrollByPegawaiId = Object.fromEntries(
    listPegawai.map((item) => {
      if (isPegawaiMingguan(item.statusPegawaiId)) {
        return [
          item.id,
          hitungTotalGajiPresensi(
            presensisByPegawaiId[item.id],
            gajiPokokPegawaiMap[item.id],
          ),
        ];
      }
      return [item.id, gajiPokokPegawaiMap[item.id] ?? 0];
    }),
  );

  const payrollRecords = await payroll.bulkCreate(
    pegawaiId.map((id) => ({
      pegawaiId: id,
      periode: tanggalAwal,
      periodeAkhir: tanggalAkhir,
      gajiPokok: gajiPokokPayrollByPegawaiId[id] ?? 0,
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

  const tunjanganTotalByPayrollId = dataTunjangan.reduce((acc, item) => {
    acc[item.payrollId] =
      (acc[item.payrollId] || 0) + (Number(item.nominal) || 0);
    return acc;
  }, {});

  const potonganTotalByPayrollId = dataPotongan.reduce((acc, item) => {
    acc[item.payrollId] =
      (acc[item.payrollId] || 0) + (Number(item.nominal) || 0);
    return acc;
  }, {});

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

  const pengeluaranPayload = buildPengeluaranPayload(listPegawai, {
    tanggalAwal,
    presensisByPegawaiId,
    gajiPokokPegawaiMap,
    gajiPokokPayrollByPegawaiId,
    payrollByPegawaiId,
    tunjanganTotalByPayrollId,
    potonganTotalByPayrollId,
    defaultMetode,
    defaultJenis,
    defaultStatus,
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

async function ensurePayrollForSlip(pegawaiIds, tanggalAwal, tanggalAkhir) {
  const transaction = await sequelize.transaction();

  try {
    const existingPayrolls = await payroll.findAll({
      where: {
        pegawaiId: { [Op.in]: pegawaiIds },
        ...buildPayrollPeriodWhere(tanggalAwal, tanggalAkhir),
      },
      attributes: ["pegawaiId"],
      transaction,
    });

    const existingPegawaiIds = new Set(
      existingPayrolls.map((item) => item.pegawaiId),
    );
    const pegawaiIdsToCreate = pegawaiIds.filter(
      (id) => !existingPegawaiIds.has(id),
    );

    if (pegawaiIdsToCreate.length > 0) {
      await createPayrollAndPengeluaran(
        pegawaiIdsToCreate,
        tanggalAwal,
        tanggalAkhir,
        transaction,
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function buildSlipMingguanData(pegawaiIds, tanggalAwal, tanggalAkhir) {
  const dataPegawai = sortByPegawaiIdsOrder(
    await pegawai.findAll({
      where: {
        id: { [Op.in]: pegawaiIds },
      },
      attributes: ["id", "nama", "jabatan", "gajiPokok"],
      include: [
        {
          model: presensi,
          as: "presensis",
          attributes: [
            "id",
            "tanggal",
            "statusPresensiId",
            "lemburHarian",
            "jamMasuk",
            "jamPulang",
          ],
          where: {
            tanggal: {
              [Op.between]: [tanggalAwal, tanggalAkhir],
            },
          },
          required: false,
        },
      ],
      order: [[{ model: presensi, as: "presensis" }, "tanggal", "ASC"]],
    }),
    pegawaiIds,
  );

  return dataPegawai.map((item) => {
    const totalGaji = hitungTotalGajiPresensi(item.presensis, item.gajiPokok);

    const detail = (item.presensis || []).map((presensi) => {
      const upah =
        presensi.statusPresensiId === 1 ? Number(item.gajiPokok) || 0 : 0;

      return {
        tanggal: formatTanggalIndonesia(presensi.tanggal),
        upah: upah > 0 ? formatRupiah(upah) : "-",
        lembur: formatLemburHarianForSlip(presensi.lemburHarian),
      };
    });

    return {
      nama: item.nama,
      jabatan: item.jabatan,
      detail,
      total: formatRupiah(totalGaji),
    };
  });
}

async function buildSlipBulananData(pegawaiIds, tanggalAwal, tanggalAkhir) {
  const payrollRecords = pickLatestPayrollPerPegawai(
    await payroll.findAll({
      where: {
        pegawaiId: { [Op.in]: pegawaiIds },
        ...buildPayrollPeriodWhere(tanggalAwal, tanggalAkhir),
      },
      include: [
        { model: payrollTunjangan },
        { model: payrollPotongan },
        {
          model: pegawai,
          attributes: ["id", "nama", "jabatan", "gajiPokok"],
        },
      ],
      order: [["id", "DESC"]],
    }),
    pegawaiIds,
  );

  return payrollRecords.map((payrollRecord) => {
    const payrollData =
      typeof payrollRecord.toJSON === "function"
        ? payrollRecord.toJSON()
        : payrollRecord;

    const slip = buildPayrollSlip(
      payrollData,
      payrollData.pegawai?.gajiPokok,
      payrollData.pegawai?.nama,
    );

    return buildSlipBulananDocxPayload(slip, {
      jabatan: payrollData.pegawai?.jabatan,
      periodeLabel: formatPeriodeLabel(
        payrollData.periode,
        payrollData.periodeAkhir,
      ),
    });
  });
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

      const existingPayrolls = await payroll.findAll({
        where: {
          pegawaiId: { [Op.in]: pegawaiId },
          ...buildPayrollPeriodWhere(tanggalAwal, tanggalAkhir),
        },
        attributes: ["pegawaiId"],
        include: [{ model: pegawai, attributes: ["nama"] }],
        transaction,
      });

      if (existingPayrolls.length > 0) {
        const duplicateNames = [
          ...new Set(
            existingPayrolls.map(
              (item) => item.pegawai?.nama || `pegawai #${item.pegawaiId}`,
            ),
          ),
        ].join(", ");

        await transaction.rollback();
        return res.status(400).json({
          message: `Payroll periode ${tanggalAwal} s/d ${tanggalAkhir} sudah ada untuk: ${duplicateNames}`,
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
    try {
      const { pegawaiId, tanggalAwal, tanggalAkhir } = req.body;

      if (!pegawaiId || !tanggalAwal || !tanggalAkhir) {
        return res.status(400).json({
          message: "pegawaiId, tanggalAwal, dan tanggalAkhir wajib diisi",
          code: 400,
        });
      }

      const pegawaiIds = Array.isArray(pegawaiId)
        ? pegawaiId.map(Number).filter(Boolean)
        : [Number(pegawaiId)].filter(Boolean);

      if (pegawaiIds.length === 0) {
        return res.status(400).json({
          message: "pegawaiId tidak valid",
          code: 400,
        });
      }

      const templateMingguanPath = path.join(
        __dirname,
        "../public/slip-gaji/template-slip-gaji.docx",
      );
      const templateBulananPath = path.join(
        __dirname,
        "../public/slip-gaji/template-slip-gaji-bulanan.docx",
      );

      await ensurePayrollForSlip(pegawaiIds, tanggalAwal, tanggalAkhir);

      const pegawaiList = await pegawai.findAll({
        where: { id: { [Op.in]: pegawaiIds } },
        attributes: ["id", "statusPegawaiId"],
      });

      const mingguanIds = pegawaiIds.filter((id) =>
        pegawaiList.some(
          (item) => item.id === id && isPegawaiMingguan(item.statusPegawaiId),
        ),
      );
      const bulananIds = pegawaiIds.filter((id) =>
        pegawaiList.some(
          (item) => item.id === id && !isPegawaiMingguan(item.statusPegawaiId),
        ),
      );

      const docxBuffers = [];

      if (mingguanIds.length > 0) {
        if (!fs.existsSync(templateMingguanPath)) {
          return res.status(404).json({
            message: "Template slip gaji mingguan tidak ditemukan",
            code: 404,
          });
        }

        const hasilSlipMingguan = await buildSlipMingguanData(
          mingguanIds,
          tanggalAwal,
          tanggalAkhir,
        );

        if (hasilSlipMingguan.length === 0) {
          return res.status(400).json({
            message: "Data pegawai mingguan tidak ditemukan",
            code: 400,
          });
        }

        docxBuffers.push(
          renderSlipGajiFromTemplatePath(
            templateMingguanPath,
            createPages(hasilSlipMingguan),
          ),
        );
      }

      if (bulananIds.length > 0) {
        if (!fs.existsSync(templateBulananPath)) {
          return res.status(404).json({
            message: "Template slip gaji bulanan tidak ditemukan",
            code: 404,
          });
        }

        const hasilSlipBulanan = await buildSlipBulananData(
          bulananIds,
          tanggalAwal,
          tanggalAkhir,
        );

        if (hasilSlipBulanan.length === 0) {
          return res.status(400).json({
            message:
              "Data payroll bulanan tidak ditemukan untuk periode yang dipilih",
            code: 400,
          });
        }

        docxBuffers.push(
          renderSlipGajiBulananFromTemplatePath(
            templateBulananPath,
            createPagesBulanan(hasilSlipBulanan),
          ),
        );
      }

      if (docxBuffers.length === 0) {
        return res.status(400).json({
          message: "Tidak ada slip gaji yang dapat dibuat",
          code: 400,
        });
      }

      const buffer = mergeDocxBuffers(docxBuffers);

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
