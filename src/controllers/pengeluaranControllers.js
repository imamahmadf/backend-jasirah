const {
  pengeluaran,
  pegawai,
  metodePembayaran,
  jenisPengeluaran,
  statusPembayaran,
  daftarUnitKerja,
  rekanan,
  indukUnitKerja,
  satuanPersediaan,
  stokMasuk,
} = require("../models");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const buildFilterPengeluaran = (query) => {
  const {
    tahun,
    startDate,
    endDate,
    unitKerjaId,
    indukUnitKerjaId,
    pegawaiId,
    metodePembayaranId,
    jenisPengeluaranId,
    statusPembayaranId,
  } = query;

  const whereCondition = {};
  const unitKerjaWhere = {};

  if (unitKerjaId) whereCondition.unitKerjaId = parseInt(unitKerjaId, 10);
  if (pegawaiId) whereCondition.pegawaiId = parseInt(pegawaiId, 10);
  if (metodePembayaranId) {
    whereCondition.metodePembayaranId = parseInt(metodePembayaranId, 10);
  }
  if (jenisPengeluaranId) {
    whereCondition.jenisPengeluaranId = parseInt(jenisPengeluaranId, 10);
  }
  if (statusPembayaranId) {
    whereCondition.statusPembayaranId = parseInt(statusPembayaranId, 10);
  }
  if (indukUnitKerjaId) {
    unitKerjaWhere.indukUnitKerjaId = parseInt(indukUnitKerjaId, 10);
  }

  let periodeAwal;
  let periodeAkhir;

  if (tahun) {
    const y = parseInt(tahun, 10);
    periodeAwal = new Date(`${y}-01-01T00:00:00`);
    periodeAkhir = new Date(`${y}-12-31T23:59:59`);
  } else if (startDate || endDate) {
    if (startDate) periodeAwal = new Date(startDate);
    if (endDate) {
      periodeAkhir = new Date(endDate);
      periodeAkhir.setHours(23, 59, 59, 999);
    }
  } else {
    const y = new Date().getFullYear();
    periodeAwal = new Date(`${y}-01-01T00:00:00`);
    periodeAkhir = new Date(`${y}-12-31T23:59:59`);
  }

  if (periodeAwal || periodeAkhir) {
    whereCondition.tanggal = {};
    if (periodeAwal) whereCondition.tanggal[Op.gte] = periodeAwal;
    if (periodeAkhir) whereCondition.tanggal[Op.lte] = periodeAkhir;
  }

  return {
    whereCondition,
    unitKerjaWhere,
    periodeAwal,
    periodeAkhir,
    filter: {
      tahun: tahun ? parseInt(tahun, 10) : null,
      startDate: periodeAwal ? periodeAwal.toISOString().slice(0, 10) : null,
      endDate: periodeAkhir ? periodeAkhir.toISOString().slice(0, 10) : null,
      unitKerjaId: unitKerjaId ? parseInt(unitKerjaId, 10) : null,
      indukUnitKerjaId: indukUnitKerjaId
        ? parseInt(indukUnitKerjaId, 10)
        : null,
      pegawaiId: pegawaiId ? parseInt(pegawaiId, 10) : null,
      metodePembayaranId: metodePembayaranId
        ? parseInt(metodePembayaranId, 10)
        : null,
      jenisPengeluaranId: jenisPengeluaranId
        ? parseInt(jenisPengeluaranId, 10)
        : null,
      statusPembayaranId: statusPembayaranId
        ? parseInt(statusPembayaranId, 10)
        : null,
    },
  };
};

const getIncludePengeluaran = (unitKerjaWhere) => {
  const unitKerjaInclude = {
    model: daftarUnitKerja,
    attributes: ["id", "unitKerja", "kode", "asal", "indukUnitKerjaId"],
  };
  if (Object.keys(unitKerjaWhere).length > 0) {
    unitKerjaInclude.where = unitKerjaWhere;
    unitKerjaInclude.required = true;
  }
  return [
    { model: pegawai, attributes: ["id", "nama", "nip"] },
    { model: metodePembayaran, attributes: ["id", "nama"] },
    { model: jenisPengeluaran, attributes: ["id", "nama"] },
    { model: statusPembayaran, attributes: ["id", "nama"] },
    unitKerjaInclude,
  ];
};

const aggregatePengeluaran = (rows) => {
  const ringkasan = {
    totalTransaksi: rows.length,
    totalNominal: 0,
    rataRataNominal: 0,
    nominalTerbesar: 0,
    nominalTerkecil: rows.length > 0 ? Infinity : 0,
  };

  const mapGroup = () => ({
    totalTransaksi: 0,
    totalNominal: 0,
    persentase: 0,
  });

  const perStatusPembayaran = {};
  const perJenisPengeluaran = {};
  const perMetodePembayaran = {};
  const perUnitKerja = {};
  const trendBulanan = {};

  rows.forEach((row) => {
    const nominal = parseInt(row.nominal, 10) || 0;
    ringkasan.totalNominal += nominal;
    if (nominal > ringkasan.nominalTerbesar)
      ringkasan.nominalTerbesar = nominal;
    if (nominal < ringkasan.nominalTerkecil) {
      ringkasan.nominalTerkecil = nominal;
    }

    const statusKey = row.statusPembayaranId ?? "lainnya";
    if (!perStatusPembayaran[statusKey]) {
      perStatusPembayaran[statusKey] = {
        statusPembayaranId: row.statusPembayaranId,
        nama: row.statusPembayaran?.nama ?? "lainnya",
        ...mapGroup(),
      };
    }
    perStatusPembayaran[statusKey].totalTransaksi += 1;
    perStatusPembayaran[statusKey].totalNominal += nominal;

    const jenisKey = row.jenisPengeluaranId ?? "lainnya";
    if (!perJenisPengeluaran[jenisKey]) {
      perJenisPengeluaran[jenisKey] = {
        jenisPengeluaranId: row.jenisPengeluaranId,
        nama: row.jenisPengeluaran?.nama ?? "lainnya",
        ...mapGroup(),
      };
    }
    perJenisPengeluaran[jenisKey].totalTransaksi += 1;
    perJenisPengeluaran[jenisKey].totalNominal += nominal;

    const metodeKey = row.metodePembayaranId ?? "lainnya";
    if (!perMetodePembayaran[metodeKey]) {
      perMetodePembayaran[metodeKey] = {
        metodePembayaranId: row.metodePembayaranId,
        nama: row.metodePembayaran?.nama ?? "lainnya",
        ...mapGroup(),
      };
    }
    perMetodePembayaran[metodeKey].totalTransaksi += 1;
    perMetodePembayaran[metodeKey].totalNominal += nominal;

    const ukKey = row.unitKerjaId ?? "lainnya";
    if (!perUnitKerja[ukKey]) {
      perUnitKerja[ukKey] = {
        unitKerjaId: row.unitKerjaId,
        unitKerja: row.daftarUnitKerja?.unitKerja ?? "lainnya",
        kode: row.daftarUnitKerja?.kode ?? null,
        ...mapGroup(),
      };
    }
    perUnitKerja[ukKey].totalTransaksi += 1;
    perUnitKerja[ukKey].totalNominal += nominal;

    if (row.tanggal) {
      const d = new Date(row.tanggal);
      const bulan = d.getMonth() + 1;
      const tahunRow = d.getFullYear();
      const key = `${tahunRow}-${String(bulan).padStart(2, "0")}`;
      if (!trendBulanan[key]) {
        trendBulanan[key] = {
          tahun: tahunRow,
          bulan,
          namaBulan: NAMA_BULAN[bulan - 1],
          totalTransaksi: 0,
          totalNominal: 0,
        };
      }
      trendBulanan[key].totalTransaksi += 1;
      trendBulanan[key].totalNominal += nominal;
    }
  });

  if (ringkasan.totalTransaksi > 0) {
    ringkasan.rataRataNominal = Math.round(
      ringkasan.totalNominal / ringkasan.totalTransaksi,
    );
  }
  if (ringkasan.nominalTerkecil === Infinity) ringkasan.nominalTerkecil = 0;

  const totalNominalAll = ringkasan.totalNominal;
  const addPersentase = (arr) =>
    arr.map((item) => ({
      ...item,
      persentase:
        totalNominalAll > 0
          ? parseFloat(((item.totalNominal / totalNominalAll) * 100).toFixed(2))
          : 0,
    }));

  return {
    ringkasan,
    perStatusPembayaran: addPersentase(
      Object.values(perStatusPembayaran).sort(
        (a, b) => b.totalNominal - a.totalNominal,
      ),
    ),
    perJenisPengeluaran: addPersentase(
      Object.values(perJenisPengeluaran).sort(
        (a, b) => b.totalNominal - a.totalNominal,
      ),
    ),
    perMetodePembayaran: addPersentase(
      Object.values(perMetodePembayaran).sort(
        (a, b) => b.totalNominal - a.totalNominal,
      ),
    ),
    perUnitKerja: addPersentase(
      Object.values(perUnitKerja).sort(
        (a, b) => b.totalNominal - a.totalNominal,
      ),
    ),
    trendBulanan: Object.values(trendBulanan).sort((a, b) => {
      if (a.tahun !== b.tahun) return a.tahun - b.tahun;
      return a.bulan - b.bulan;
    }),
  };
};

module.exports = {
  getAllPengeluaran: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const pegawaiId = parseInt(req.query.pegawaiId);
    const rekananId = parseInt(req.query.rekananId);
    const metodePembayaranId = parseInt(req.query.metodePembayaranId);
    const jenisPengeluaranId = parseInt(req.query.jenisPengeluaranId);
    const statusPembayaranId = parseInt(req.query.statusPembayaranId);
    const allowedSortBy = ["tanggal", "nominal"];
    const sortBy = allowedSortBy.includes(req.query.sortBy)
      ? req.query.sortBy
      : "tanggal";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";
    const whereCondition = {};
    const currentYear = new Date().getFullYear();

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    console.log(req.query, "rekananID");
    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (pegawaiId) {
      whereCondition.pegawaiId = pegawaiId;
    }
    if (rekananId) {
      whereCondition.rekananId = rekananId;
    }
    if (metodePembayaranId) {
      whereCondition.metodePembayaranId = metodePembayaranId;
    }

    if (jenisPengeluaranId) {
      whereCondition.jenisPengeluaranId = jenisPengeluaranId;
    }

    if (statusPembayaranId) {
      whereCondition.statusPembayaranId = statusPembayaranId;
    }
    try {
      const result = await pengeluaran.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
          { model: pegawai },
          { model: metodePembayaran },
          { model: jenisPengeluaran },
          { model: statusPembayaran },
          { model: rekanan },
          { model: indukUnitKerja, attributes: ["id", "indukUnitKerja"] },
          {
            model: daftarUnitKerja,
            attributes: [
              "id",
              "unitKerja",
              "kode",
              "asal",
              "indukUnitKerjaId",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });

      const totalRows = await pengeluaran.count({
        where: whereCondition,
      });
      const totalPage = Math.ceil(totalRows / limit);
      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postPengeluaran: async (req, res) => {
    const {
      tanggal,
      deskripsi,
      unitKerjaId,
      metodePembayaranId,
      jenisPengeluaranId,
      nominal,
      pegawaiId,
      statusPembayaranId,
      jatuhTempo,
      indukUnitKerjaId,
      rekananId,
    } = req.body;

    const toInt = (val) => {
      if (val === "" || val == null || val === undefined) return null;
      const n = parseInt(val, 10);
      return Number.isNaN(n) ? null : n;
    };

    if (
      !tanggal ||
      !deskripsi ||
      !unitKerjaId ||
      !indukUnitKerjaId ||
      !metodePembayaranId ||
      !jenisPengeluaranId ||
      !nominal ||
      !statusPembayaranId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tanggal, deskripsi, unit usaha, proyek, metode, jenis, status, dan nominal wajib diisi",
      });
    }

    try {
      let foto = null;
      if (req.file) {
        foto = `/pengeluaran/${req.file.filename}`;
      }

      const result = await pengeluaran.create({
        tanggal,
        jatuhTempo: jatuhTempo || null,
        deskripsi,
        unitKerjaId: toInt(unitKerjaId),
        metodePembayaranId: toInt(metodePembayaranId),
        jenisPengeluaranId: toInt(jenisPengeluaranId),
        nominal: toInt(nominal),
        pegawaiId: toInt(pegawaiId),
        statusPembayaranId: toInt(statusPembayaranId),
        indukUnitKerjaId: toInt(indukUnitKerjaId),
        rekananId: toInt(rekananId),
        foto,
      });

      return res.status(200).json({
        success: true,
        message: "Data pengeluaran berhasil ditambahkan",
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Gagal menambahkan data pengeluaran",
        error: err.message,
      });
    }
  },
  editPengeluaran: async (req, res) => {
    const { id } = req.params;
    const {
      tanggal,
      deskripsi,
      unitKerjaId,
      metodePembayaranId,
      jenisPengeluaranId,
      nominal,
      pegawaiId,
      statusPembayaranId,
      jatuhTempo,
      rekananId,
      indukUnitKerjaId,
    } = req.body;
    console.log(req.body, "cek dlu dtanya");
    const toInt = (val) => {
      if (val === "" || val == null || val === undefined) return null;
      const n = parseInt(val, 10);
      return Number.isNaN(n) ? null : n;
    };

    const toOptionalDate = (val) => {
      if (val === "" || val == null || val === undefined) return null;
      return val;
    };

    try {
      const existing = await pengeluaran.findByPk(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Data pengeluaran tidak ditemukan",
        });
      }

      const payload = {};

      if (tanggal !== undefined) payload.tanggal = tanggal;
      if (jatuhTempo !== undefined)
        payload.jatuhTempo = toOptionalDate(jatuhTempo);
      if (deskripsi !== undefined) payload.deskripsi = deskripsi;
      if (unitKerjaId !== undefined) payload.unitKerjaId = toInt(unitKerjaId);
      if (indukUnitKerjaId !== undefined) {
        payload.indukUnitKerjaId = toInt(indukUnitKerjaId);
      }
      if (metodePembayaranId !== undefined) {
        payload.metodePembayaranId = toInt(metodePembayaranId);
      }
      if (jenisPengeluaranId !== undefined) {
        payload.jenisPengeluaranId = toInt(jenisPengeluaranId);
      }
      if (nominal !== undefined) payload.nominal = toInt(nominal);
      if (pegawaiId !== undefined) payload.pegawaiId = toInt(pegawaiId);

      if (rekananId !== undefined) payload.rekananId = toInt(rekananId);
      if (statusPembayaranId !== undefined) {
        payload.statusPembayaranId = toInt(statusPembayaranId);
      }
      if (req.file) {
        payload.foto = `/pengeluaran/${req.file.filename}`;
      }

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada data yang dikirim untuk diupdate",
        });
      }

      await pengeluaran.update(payload, { where: { id } });
      const result = await pengeluaran.findByPk(id);

      return res.status(200).json({
        success: true,
        message: "Data pengeluaran berhasil diupdate",
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengupdate data pengeluaran",
        error: err.message,
      });
    }
  },
  getSeed: async (req, res) => {
    try {
      const resultMetodePembayaran = await metodePembayaran.findAll({});
      const reslutJenisPengeluaran = await jenisPengeluaran.findAll({});
      const resultStatusPembayaran = await statusPembayaran.findAll({});

      return res.status(200).json({
        reslutJenisPengeluaran,
        resultMetodePembayaran,
        resultStatusPembayaran,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDashboardPengeluaran: async (req, res) => {
    try {
      const {
        whereCondition,
        unitKerjaWhere,
        periodeAwal,
        periodeAkhir,
        filter,
      } = buildFilterPengeluaran(req.query);

      const include = getIncludePengeluaran(unitKerjaWhere);

      const rows = await pengeluaran.findAll({
        where: whereCondition,
        include,
        order: [["tanggal", "DESC"]],
      });

      const finalAgg = aggregatePengeluaran(rows);

      const sekarang = new Date();
      const batasJatuhTempo = new Date(sekarang);
      batasJatuhTempo.setDate(batasJatuhTempo.getDate() + 30);

      const hutangRows = rows.filter(
        (r) => r.statusPembayaran?.nama?.toLowerCase() === "payble",
      );

      const hutang = {
        totalTransaksi: hutangRows.length,
        totalNominal: hutangRows.reduce(
          (sum, r) => sum + (parseInt(r.nominal, 10) || 0),
          0,
        ),
        akanJatuhTempo: hutangRows
          .filter((r) => {
            if (!r.jatuhTempo) return false;
            const jt = new Date(r.jatuhTempo);
            return jt >= sekarang && jt <= batasJatuhTempo;
          })
          .map((r) => ({
            id: r.id,
            tanggal: r.tanggal,
            jatuhTempo: r.jatuhTempo,
            deskripsi: r.deskripsi,
            nominal: r.nominal,
            unitKerja: r.daftarUnitKerja?.unitKerja,
            pegawai: r.pegawai?.nama,
          }))
          .sort((a, b) => new Date(a.jatuhTempo) - new Date(b.jatuhTempo)),
        sudahJatuhTempo: hutangRows
          .filter((r) => r.jatuhTempo && new Date(r.jatuhTempo) < sekarang)
          .map((r) => ({
            id: r.id,
            tanggal: r.tanggal,
            jatuhTempo: r.jatuhTempo,
            deskripsi: r.deskripsi,
            nominal: r.nominal,
            unitKerja: r.daftarUnitKerja?.unitKerja,
            pegawai: r.pegawai?.nama,
          })),
      };

      const topPengeluaran = [...rows]
        .sort(
          (a, b) =>
            (parseInt(b.nominal, 10) || 0) - (parseInt(a.nominal, 10) || 0),
        )
        .slice(0, 10)
        .map((r) => ({
          id: r.id,
          tanggal: r.tanggal,
          deskripsi: r.deskripsi,
          nominal: r.nominal,
          foto: r.foto,
          jenisPengeluaran: r.jenisPengeluaran?.nama,
          statusPembayaran: r.statusPembayaran?.nama,
          metodePembayaran: r.metodePembayaran?.nama,
          unitKerja: r.daftarUnitKerja?.unitKerja,
          pegawai: r.pegawai?.nama,
        }));

      const pengeluaranTerbaru = rows.slice(0, 10).map((r) => ({
        id: r.id,
        tanggal: r.tanggal,
        deskripsi: r.deskripsi,
        nominal: r.nominal,
        jenisPengeluaran: r.jenisPengeluaran?.nama,
        statusPembayaran: r.statusPembayaran?.nama,
        unitKerja: r.daftarUnitKerja?.unitKerja,
      }));

      let perbandinganPeriode = null;
      if (periodeAwal && periodeAkhir) {
        const durasiMs = periodeAkhir.getTime() - periodeAwal.getTime();
        const prevAkhir = new Date(periodeAwal.getTime() - 1);
        const prevAwal = new Date(prevAkhir.getTime() - durasiMs);

        const prevWhere = {
          ...whereCondition,
          tanggal: { [Op.gte]: prevAwal, [Op.lte]: prevAkhir },
        };

        const prevRows = await pengeluaran.findAll({
          where: prevWhere,
          include,
          attributes: ["id", "nominal"],
        });

        const prevTotal = prevRows.reduce(
          (sum, r) => sum + (parseInt(r.nominal, 10) || 0),
          0,
        );
        const currTotal = finalAgg.ringkasan.totalNominal;
        const selisih = currTotal - prevTotal;
        const persentasePerubahan =
          prevTotal > 0
            ? parseFloat(((selisih / prevTotal) * 100).toFixed(2))
            : currTotal > 0
              ? 100
              : 0;

        perbandinganPeriode = {
          periodeSaatIni: {
            awal: filter.startDate,
            akhir: filter.endDate,
            totalTransaksi: finalAgg.ringkasan.totalTransaksi,
            totalNominal: currTotal,
          },
          periodeSebelumnya: {
            awal: prevAwal.toISOString().slice(0, 10),
            akhir: prevAkhir.toISOString().slice(0, 10),
            totalTransaksi: prevRows.length,
            totalNominal: prevTotal,
          },
          selisihNominal: selisih,
          persentasePerubahan,
        };
      }

      const [masterStatus, masterJenis, masterMetode] = await Promise.all([
        statusPembayaran.findAll({ attributes: ["id", "nama"] }),
        jenisPengeluaran.findAll({ attributes: ["id", "nama"] }),
        metodePembayaran.findAll({ attributes: ["id", "nama"] }),
      ]);

      return res.status(200).json({
        success: true,
        filter,
        ringkasan: finalAgg.ringkasan,
        perStatusPembayaran: finalAgg.perStatusPembayaran,
        perJenisPengeluaran: finalAgg.perJenisPengeluaran,
        perMetodePembayaran: finalAgg.perMetodePembayaran,
        perUnitKerja: finalAgg.perUnitKerja,
        trendBulanan: finalAgg.trendBulanan,
        hutang,
        topPengeluaran,
        pengeluaranTerbaru,
        perbandinganPeriode,
        master: {
          statusPembayaran: masterStatus,
          jenisPengeluaran: masterJenis,
          metodePembayaran: masterMetode,
        },
      });
    } catch (err) {
      console.error("Error getDashboardPengeluaran:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard pengeluaran",
        error: err.message,
      });
    }
  },

  getDownloadPengeluaran: async (req, res) => {
    console.log(req.query);
    const whereCondition = {};

    try {
      const result = await pengeluaran.findAll({
        where: whereCondition,

        include: [
          { model: pegawai },
          { model: metodePembayaran },
          { model: jenisPengeluaran },
          { model: statusPembayaran },
          { model: rekanan },
          { model: indukUnitKerja, attributes: ["id", "indukUnitKerja"] },
          {
            model: daftarUnitKerja,
            attributes: [
              "id",
              "unitKerja",
              "kode",
              "asal",
              "indukUnitKerjaId",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });

      // Generate Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Pengeluaran");

      // Header
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "tanggal", key: "tanggal", width: 30 },
        { header: "jatuh tempo", key: "jatuhTempo", width: 20 },
        { header: "deskripsi", key: "deskripsi", width: 25 },
        { header: "proyek", key: "proyek", width: 25 },
        { header: "pegawai", key: "pegawai", width: 25 },
        { header: "rekanan", key: "rekanan", width: 25 },
        { header: "metode", key: "metode", width: 20 },
        { header: "jenis", key: "jenis", width: 20 },
        { header: "status", key: "status", width: 25 },
        { header: "nominal", key: "nominal", width: 25 },
      ];

      // Data rows
      result.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          tanggal: item.tanggal,
          jatuhTempo: item.jatuhTempo,
          deskripsi: item.deskripsi,

          proyek: item.daftarUnitKerja?.unitKerja || "-",
          pegawai: item.pegawai?.nama || "-",
          rekanan: item?.rekanan?.nama,
          metode: item?.metodePembayaran?.nama || "-",
          jenis: item?.jenisPengeluaran?.nama || "-",
          status: item?.statusPembayaran?.nama || "-",
          nominal: item?.nominal || "-",
        });
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=data-pegawai.xlsx",
      );

      // Send Excel file
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  searchPengeluaran: async (req, res) => {
    try {
      const { q } = req.query;
      console.log(q);
      const result = await pengeluaran.findAll({
        where: {
          deskripsi: {
            [Op.like]: `%${q}%`,
          },
        },
        attributes: ["id", "tanggal", "deskripsi", "nominal", "unitKerjaId"],
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["unitKerja", "id"],
          },
        ],
        limit: 10,
        order: [["deskripsi", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  getDetailPengeluaran: async (req, res) => {
    try {
      const id = req.params.id;

      const result = await pengeluaran.findOne({
        where: {
          id,
        },

        include: [
          { model: pegawai },
          { model: stokMasuk, include: [{ model: satuanPersediaan }] },
          { model: metodePembayaran },
          { model: jenisPengeluaran },
          { model: statusPembayaran },
          { model: rekanan },
          { model: indukUnitKerja, attributes: ["id", "indukUnitKerja"] },
          {
            model: daftarUnitKerja,
            attributes: [
              "id",
              "unitKerja",
              "kode",
              "asal",
              "indukUnitKerjaId",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
};
