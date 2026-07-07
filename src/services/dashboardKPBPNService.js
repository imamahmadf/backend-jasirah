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
} = require("../models");

const suratJalanInclude = [
  { model: mitra },
  { model: transportir },
  { model: supir },
  { model: statusSuratJalan },
  { model: satuanVolume },
  { model: daftarUnitKerja },
];

const pengisianInclude = [
  { model: tanki, include: [{ model: daftarUnitKerja }] },
  { model: satuanVolume },
  {
    model: konfirmasiPenerimaan,
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
  ] = await Promise.all([
    mitra.count(),
    transportir.count(),
    supir.count(),
    suratJalan.count(),
    tanki.count(),
    pengisianTanki.count(),
    konfirmasiPenerimaan.count({ where: { pengisianTankiId: null } }),
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
          where: { BAPenerimaanId: null },
          required: true,
        },
      ],
    }),
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
