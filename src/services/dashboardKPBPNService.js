const {
  mitra,
  transportir,
  supir,
  suratJalan,
  statusSuratJalan,
  tanki,
  pengisianTanki,
  konfirmasiPenerimaan,
  daftarUnitKerja,
  satuanVolume,
  icp,
  BAK3S,
  BABongkar,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

const MONTH_LABELS = [
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

const formatYearMonth = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const addMonths = (yearMonth, count) => {
  const [year, month] = yearMonth.split("-").map(Number);
  return formatYearMonth(new Date(year, month - 1 + count, 1));
};

const formatMonthLabel = (yearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]} ${year}`;
};

const getSuratJalanPerBulan = async () => {
  const monthExpr = sequelize.literal(
    "DATE_FORMAT(COALESCE(`suratJalan`.`tanggal`, `suratJalan`.`createdAt`), '%Y-%m')",
  );

  const rows = await suratJalan.findAll({
    attributes: [
      [monthExpr, "bulan"],
      [sequelize.fn("COUNT", sequelize.col("suratJalan.id")), "jumlah"],
    ],
    group: [monthExpr],
    order: [[monthExpr, "ASC"]],
    raw: true,
  });

  const countByMonth = new Map(
    rows.map((row) => [row.bulan, parseInt(row.jumlah, 10) || 0]),
  );

  const currentMonth = formatYearMonth(new Date());
  const firstMonth = rows[0]?.bulan || currentMonth;
  const series = [];
  let cursor = firstMonth;
  let kumulatif = 0;

  while (cursor <= currentMonth) {
    const jumlah = countByMonth.get(cursor) || 0;
    kumulatif += jumlah;
    series.push({
      bulan: cursor,
      label: formatMonthLabel(cursor),
      jumlah,
      kumulatif,
    });
    cursor = addMonths(cursor, 1);
    if (series.length > 120) break;
  }

  return series;
};

const TARIF_FAKTOR = 0.625;

const toMonthKeyFromValue = (value) => {
  if (!value) return null;
  const str = String(value);
  if (/^\d{4}-\d{2}/.test(str)) return str.slice(0, 7);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return formatYearMonth(d);
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getTarifPerBulan = async () => {
  const rows = await icp.findAll({
    attributes: ["harga", "kursTengah", "bulan"],
    order: [["bulan", "ASC"]],
    raw: true,
  });

  const byMonth = new Map();
  rows.forEach((row) => {
    const key = toMonthKeyFromValue(row.bulan);
    if (!key) return;
    const harga = toNumber(row.harga);
    const kursTengah = toNumber(row.kursTengah);
    const tarif =
      harga !== null && kursTengah !== null
        ? harga * kursTengah * TARIF_FAKTOR
        : null;
    byMonth.set(key, { icp: harga, kursTengah, tarif });
  });

  if (!byMonth.size) return [];

  const keys = Array.from(byMonth.keys()).sort();
  const currentMonth = formatYearMonth(new Date());
  const series = [];
  let cursor = keys[0];

  while (cursor <= currentMonth) {
    const data = byMonth.get(cursor);
    series.push({
      bulan: cursor,
      label: formatMonthLabel(cursor),
      icp: data?.icp ?? null,
      kursTengah: data?.kursTengah ?? null,
      tarif: data?.tarif ?? null,
    });
    cursor = addMonths(cursor, 1);
    if (series.length > 120) break;
  }

  return series;
};

const LITER_PER_BARREL = 158.987;
const LITER_PER_DRUM = 200;

const convertVolumeToBarrel = (volume, satuanName) => {
  const value = Number(volume);
  if (!Number.isFinite(value)) return 0;
  const satuan = String(satuanName || "barrel")
    .trim()
    .toLowerCase();
  if (satuan === "liter") return value / LITER_PER_BARREL;
  if (satuan === "drum") return (value * LITER_PER_DRUM) / LITER_PER_BARREL;
  return value;
};

const getPenerimaanPerBulan = async () => {
  const rows = await pengisianTanki.findAll({
    attributes: ["gross", "net", "tanggal", "createdAt"],
    include: [{ model: satuanVolume, attributes: ["satuan"] }],
    raw: true,
    nest: true,
  });

  const byMonth = new Map();
  rows.forEach((row) => {
    const key = toMonthKeyFromValue(row.tanggal || row.createdAt);
    if (!key) return;
    const satuan = row.satuanVolume?.satuan || "barrel";
    const gross = convertVolumeToBarrel(row.gross, satuan);
    const net = convertVolumeToBarrel(row.net, satuan);
    const air = gross - net;
    const current = byMonth.get(key) || { gross: 0, net: 0, air: 0 };
    current.gross += gross;
    current.net += net;
    current.air += air;
    byMonth.set(key, current);
  });

  if (!byMonth.size) return [];

  const keys = Array.from(byMonth.keys()).sort();
  const currentMonth = formatYearMonth(new Date());
  const series = [];
  let cursor = keys[0];
  let kumulatifGross = 0;

  while (cursor <= currentMonth) {
    const data = byMonth.get(cursor) || { gross: 0, net: 0, air: 0 };
    kumulatifGross += data.gross;
    series.push({
      bulan: cursor,
      label: formatMonthLabel(cursor),
      gross: data.gross,
      net: data.net,
      air: data.air,
      kumulatifGross,
    });
    cursor = addMonths(cursor, 1);
    if (series.length > 120) break;
  }

  return series;
};

const getProduksiBak3sPerBulan = async () => {
  const rows = await BAK3S.findAll({
    attributes: ["produksi", "createdAt"],
    include: [{ model: BABongkar, attributes: ["tanggal"] }],
    raw: true,
    nest: true,
  });

  const byMonth = new Map();
  rows.forEach((row) => {
    const key = toMonthKeyFromValue(
      row.BABongkar?.tanggal || row.createdAt,
    );
    if (!key) return;
    const produksi = toNumber(row.produksi) || 0;
    byMonth.set(key, (byMonth.get(key) || 0) + produksi);
  });

  if (!byMonth.size) return [];

  const keys = Array.from(byMonth.keys()).sort();
  const currentMonth = formatYearMonth(new Date());
  const series = [];
  let cursor = keys[0];
  let kumulatif = 0;

  while (cursor <= currentMonth) {
    const produksi = byMonth.get(cursor) || 0;
    kumulatif += produksi;
    series.push({
      bulan: cursor,
      label: formatMonthLabel(cursor),
      produksi,
      kumulatif,
    });
    cursor = addMonths(cursor, 1);
    if (series.length > 120) break;
  }

  return series;
};

const suratJalanInclude = [
  { model: mitra },
  { model: transportir },
  { model: supir },
  { model: statusSuratJalan },
  { model: satuanVolume },
  { model: daftarUnitKerja },
];

const pengisianInclude = [
  {
    model: tanki,
    include: [{ model: daftarUnitKerja }, { model: satuanVolume }],
  },
  { model: satuanVolume },
  {
    model: konfirmasiPenerimaan,
    through: { attributes: [] },
    include: [
      {
        model: suratJalan,
        include: [{ model: mitra }, { model: transportir }, { model: supir }],
      },
    ],
  },
];

const getDashboardData = async () => {
  const [
    totalMitra,
    totalTransportir,
    totalSupir,
    totalSuratJalan,
    totalTanki,
    totalPengisianTanki,
    konfirmasiPending,
    suratJalanByStatus,
    recentSuratJalan,
    recentPengisianTanki,
    recentMitra,
    tankiMonitoring,
    suratJalanPerBulan,
    tarifPerBulan,
    penerimaanPerBulan,
    produksiBak3sPerBulan,
  ] = await Promise.all([
    mitra.count(),
    transportir.count(),
    supir.count(),
    suratJalan.count(),
    tanki.count(),
    pengisianTanki.count(),
    konfirmasiPenerimaan.count({
      where: {
        id: {
          [Op.notIn]: sequelize.literal(
            "(SELECT konfirmasiPenerimaanId FROM pengisianTankiKonfirmasis)",
          ),
        },
      },
    }),
    suratJalan.findAll({
      attributes: [
        "statusSuratJalanId",
        [
          suratJalan.sequelize.fn(
            "COUNT",
            suratJalan.sequelize.col("suratJalan.id"),
          ),
          "count",
        ],
      ],
      include: [{ model: statusSuratJalan, attributes: ["id", "status"] }],
      group: [
        "suratJalan.statusSuratJalanId",
        "statusSuratJalan.id",
        "statusSuratJalan.status",
      ],
      raw: false,
    }),
    suratJalan.findAll({
      limit: 8,
      order: [["createdAt", "DESC"]],
      include: suratJalanInclude,
    }),
    pengisianTanki.findAll({
      limit: 8,
      order: [
        ["tanggal", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: pengisianInclude,
    }),
    mitra.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: supir }],
    }),
    tanki.findAll({
      include: [
        { model: daftarUnitKerja },
        {
          model: pengisianTanki,
          where: { BABongkarId: null },
          required: true,
        },
      ],
    }),
    getSuratJalanPerBulan(),
    getTarifPerBulan(),
    getPenerimaanPerBulan(),
    getProduksiBak3sPerBulan(),
  ]);

  const statusMap = { draft: 0, kirim: 0, terima: 0, lainnya: 0 };
  suratJalanByStatus.forEach((row) => {
    const statusName = (row.statusSuratJalan?.status || "").toUpperCase();
    const count = parseInt(row.get("count"), 10) || 0;
    if (statusName === "DRAFT") statusMap.draft = count;
    else if (statusName === "KIRIM") statusMap.kirim = count;
    else if (statusName === "TERIMA" || statusName === "DITERIMA") {
      statusMap.terima = count;
    } else statusMap.lainnya += count;
  });

  return {
    summary: {
      mitra: totalMitra,
      transportir: totalTransportir,
      supir: totalSupir,
      suratJalan: totalSuratJalan,
      suratJalanDraft: statusMap.draft,
      suratJalanKirim: statusMap.kirim,
      suratJalanTerima: statusMap.terima,
      tanki: totalTanki,
      pengisianTanki: totalPengisianTanki,
      konfirmasiPending,
      tankiMonitoring: tankiMonitoring.length,
    },
    statusSuratJalan: suratJalanByStatus.map((row) => ({
      statusId: row.statusSuratJalanId,
      status: row.statusSuratJalan?.status || "-",
      count: parseInt(row.get("count"), 10) || 0,
    })),
    recentSuratJalan,
    recentPengisianTanki,
    recentMitra,
    tankiMonitoring,
    suratJalanPerBulan,
    tarifPerBulan,
    penerimaanPerBulan,
    produksiBak3sPerBulan,
    timestamp: new Date().toISOString(),
  };
};

const emitDashboardKPBPN = async (io) => {
  if (!io) return null;

  try {
    const data = await getDashboardData();
    io.to("dashboard:admin").emit("dashboard:kpbpn:update", data);
    return data;
  } catch (err) {
    console.error("Error emit dashboard KPBPN:", err);
    return null;
  }
};

const emitDashboardAktivitas = (io, aktivitas) => {
  if (!io || !aktivitas) return;

  io.to("dashboard:admin").emit("dashboard:aktivitas", {
    ...aktivitas,
    timestamp: new Date().toISOString(),
  });
};

const notifyDashboardChange = async (io, aktivitas) => {
  if (aktivitas) {
    emitDashboardAktivitas(io, aktivitas);
  }
  await emitDashboardKPBPN(io);
};

module.exports = {
  getDashboardData,
  emitDashboardKPBPN,
  emitDashboardAktivitas,
  notifyDashboardChange,
};
