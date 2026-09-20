const {
  stockOpnameTanki,
  tanki,
  pengisianTanki,
  BABongkar,
  BABongkarTanki,
  satuanVolume,
  stasiunPengumpulMinyak,
  konfirmasiPenerimaan,
  suratJalan,
  mitra,
  ujiLabK3S,
  BAK3S,
} = require("../models");

const { Op } = require("sequelize");

const LITER_PER_BARREL = 158.987;
const LITER_PER_DRUM = 200;
const SATUAN = "barrel";

const parseDecimalInput = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const pickFirstBsnw = (...groups) => {
  for (const group of groups) {
    const items = Array.isArray(group) ? group : [];
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const value = toNumberOrNull(items[i]?.BSNW);
      if (value !== null) return value;
    }
  }
  return null;
};

const roundBsnwPercent = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

const calcBsnwGabungan = (sedimen, volume) => {
  const totalVolume = Number(volume) || 0;
  const totalSedimen = Number(sedimen) || 0;
  if (totalVolume <= 0) return null;
  return roundBsnwPercent((totalSedimen / totalVolume) * 100);
};

const parseFactorTank = (factorTank) =>
  factorTank !== null && factorTank !== undefined && factorTank !== ""
    ? parseFloat(factorTank)
    : null;

const roundBarrelVolume = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

const convertVolumeToBarrel = (volume, satuanName) => {
  const value = Number(volume);
  if (Number.isNaN(value)) return 0;

  const satuan = String(satuanName || "barrel")
    .trim()
    .toLowerCase();

  if (satuan === "barrel") return value;
  if (satuan === "liter") return value / LITER_PER_BARREL;
  if (satuan === "drum") return (value * LITER_PER_DRUM) / LITER_PER_BARREL;

  return value;
};

const toDateKey = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildDateRange = (startDate, endDate) => {
  const range = {};
  if (startDate) {
    const startKey = toDateKey(startDate);
    if (startKey) {
      range[Op.gte] = new Date(`${startKey}T00:00:00.000`);
    }
  }
  if (endDate) {
    const endKey = toDateKey(endDate);
    if (endKey) {
      range[Op.lte] = new Date(`${endKey}T23:59:59.999`);
    }
  }
  return Object.keys(range).length ? range : null;
};

const getDayRange = (dateValue) => {
  const dateKey = toDateKey(dateValue);
  if (!dateKey) return null;
  const start = new Date(`${dateKey}T00:00:00.000`);
  const end = new Date(`${dateKey}T23:59:59.999`);
  return { dateKey, start, end };
};

const calcVolumeFromTinggi = (tinggi, panjang, lebar) => {
  const height = parseDecimalInput(tinggi);
  const length = parseDecimalInput(panjang);
  const width = parseDecimalInput(lebar);
  if (
    height === null ||
    length === null ||
    width === null ||
    length <= 0 ||
    width <= 0
  ) {
    return null;
  }
  const liter = (height * length * width) / 1000;
  return roundBarrelVolume(convertVolumeToBarrel(liter, "liter"));
};

const calcKeluarBarrel = (ukuranCairan, ukuranAir, factorTank) => {
  const cairan = parseDecimalInput(ukuranCairan);
  const air = parseDecimalInput(ukuranAir);
  const factor = parseFactorTank(factorTank);
  if (
    cairan === null ||
    air === null ||
    factor === null ||
    Number.isNaN(factor) ||
    factor <= 0
  ) {
    return 0;
  }
  return roundBarrelVolume((cairan - air) * factor);
};

const buildVolumeFields = (item) => {
  const factorTank = parseFactorTank(item.tanki?.factorTank);
  const panjang = parseDecimalInput(item.tanki?.panjang);
  const lebar = parseDecimalInput(item.tanki?.lebar);
  const tinggiMinyak = parseDecimalInput(item.tinggiMinyak);
  const tinggiAir = parseDecimalInput(item.tinggiAir);
  const volumeMinyak = calcVolumeFromTinggi(tinggiMinyak, panjang, lebar);
  const volumeAir = calcVolumeFromTinggi(tinggiAir, panjang, lebar);
  const tinggiBersih =
    tinggiMinyak !== null && tinggiAir !== null
      ? tinggiMinyak - tinggiAir
      : null;
  const volumeBersih = calcVolumeFromTinggi(tinggiBersih, panjang, lebar);

  return {
    tinggiMinyak,
    tinggiAir,
    suhu: parseDecimalInput(item.suhu),
    factorTank,
    panjang,
    lebar,
    volumeMinyak,
    volumeAir,
    volumeBersih,
    satuan: SATUAN,
  };
};

const tankiInclude = [
  {
    model: tanki,
    include: [
      { model: satuanVolume, attributes: ["id", "satuan"] },
      { model: stasiunPengumpulMinyak, attributes: ["id", "nama"] },
    ],
  },
];

const fetchRelatedMutasi = async ({ startDate, endDate, tankiIds }) => {
  const pengisianWhere = {};
  const baWhere = {};
  const baTankiWhere = {};
  const ujiWhere = {};
  const dateRange = buildDateRange(startDate, endDate);

  if (dateRange) {
    pengisianWhere.tanggal = dateRange;
    baWhere.tanggal = dateRange;
    ujiWhere.tanggal = dateRange;
  }

  if (tankiIds?.length) {
    pengisianWhere.tangkiId = { [Op.in]: tankiIds };
    baTankiWhere.tangkiId = { [Op.in]: tankiIds };
    ujiWhere.tangkiId = { [Op.in]: tankiIds };
  }

  const [pengisianList, baList, ujiList] = await Promise.all([
    pengisianTanki.findAll({
      where: pengisianWhere,
      include: [
        { model: tanki },
        { model: satuanVolume },
        {
          model: konfirmasiPenerimaan,
          through: { attributes: [] },
          include: [
            {
              model: suratJalan,
              include: [
                { model: mitra, attributes: ["id", "nama", "kode"] },
                { model: satuanVolume, attributes: ["id", "satuan"] },
              ],
            },
          ],
        },
      ],
      order: [
        ["tanggal", "ASC"],
        ["id", "ASC"],
      ],
    }),
    BABongkar.findAll({
      where: baWhere,
      include: [
        {
          model: BABongkarTanki,
          where: Object.keys(baTankiWhere).length ? baTankiWhere : undefined,
          required: Boolean(tankiIds?.length),
          include: [{ model: tanki }],
        },
        {
          model: ujiLabK3S,
          as: "ujiLabK3S",
          include: [{ model: tanki, attributes: ["id", "kode"] }],
        },
        {
          model: BAK3S,
          as: "BAK3S",
          attributes: ["id", "api", "BSNW", "produksi", "sg"],
        },
      ],
      order: [
        ["tanggal", "ASC"],
        ["id", "ASC"],
      ],
    }),
    ujiLabK3S.findAll({
      where: ujiWhere,
      include: [{ model: tanki, attributes: ["id", "kode"] }],
      order: [
        ["tanggal", "ASC"],
        ["id", "ASC"],
      ],
    }),
  ]);

  const mutasiMap = new Map();

  const getOrCreate = (dateKey, tangkiIdValue, tankInfo = {}) => {
    const key = `${dateKey}|${tangkiIdValue}`;
    if (!mutasiMap.has(key)) {
      mutasiMap.set(key, {
        masuk: 0,
        keluar: 0,
        jumlahMasuk: 0,
        jumlahKeluar: 0,
        detailMasuk: [],
        detailKeluar: [],
        detailBSNW: [],
        bsnwMasukVolume: 0,
        bsnwMasukSedimen: 0,
        seenKonfirmasiIds: new Set(),
        kode: tankInfo.kode || "-",
      });
    }

    const row = mutasiMap.get(key);
    if ((!row.kode || row.kode === "-") && tankInfo.kode) {
      row.kode = tankInfo.kode;
    }
    return row;
  };

  for (const item of pengisianList) {
    const dateKey = toDateKey(item.tanggal || item.createdAt);
    const tangkiIdValue = item.tangkiId ?? item.tanki?.id;
    if (!dateKey || !tangkiIdValue) continue;

    const row = getOrCreate(dateKey, tangkiIdValue, {
      kode: item.tanki?.kode,
    });

    const satuanAsli = item.satuanVolume?.satuan || "Barrel";
    const grossBarrel = roundBarrelVolume(
      convertVolumeToBarrel(item.gross, satuanAsli),
    );
    const netBarrel = roundBarrelVolume(
      convertVolumeToBarrel(item.net, satuanAsli),
    );
    const kandunganAirBarrel = roundBarrelVolume(
      convertVolumeToBarrel(item.kandunganAir, satuanAsli),
    );

    row.masuk += grossBarrel;
    row.jumlahMasuk += 1;
    const suratJalans = [];
    const seenSuratJalan = new Set();
    const seenPengisianKp = new Set();
    const konfirmasiBsnw = [];
    let pengisianBsnwVolume = 0;
    let pengisianBsnwSedimen = 0;

    for (const kp of item.konfirmasiPenerimaans || []) {
      const sj = kp.suratJalan;
      const satuanName = sj?.satuanVolume?.satuan || satuanAsli;
      const volumeRaw =
        toNumberOrNull(kp.volume) ?? toNumberOrNull(sj?.volume);
      const volumeBarrel =
        volumeRaw != null
          ? roundBarrelVolume(convertVolumeToBarrel(volumeRaw, satuanName))
          : 0;
      const bsnw = toNumberOrNull(kp.BSNW);
      const sedimenBarrel =
        volumeBarrel > 0 && bsnw !== null
          ? volumeBarrel * (bsnw / 100)
          : 0;

      konfirmasiBsnw.push({
        BSNW: bsnw,
        api: toNumberOrNull(kp.api),
        volume: volumeRaw,
        volumeBarrel,
        satuan: satuanName,
      });

      const alreadyCounted = kp.id && row.seenKonfirmasiIds.has(kp.id);
      if (kp.id) {
        row.seenKonfirmasiIds.add(kp.id);
      }
      const alreadyInPengisian = kp.id && seenPengisianKp.has(kp.id);
      if (kp.id) {
        seenPengisianKp.add(kp.id);
      }
      if (!alreadyCounted && volumeBarrel > 0 && bsnw !== null) {
        row.bsnwMasukVolume += volumeBarrel;
        row.bsnwMasukSedimen += sedimenBarrel;
      }
      if (!alreadyInPengisian && volumeBarrel > 0 && bsnw !== null) {
        pengisianBsnwVolume += volumeBarrel;
        pengisianBsnwSedimen += sedimenBarrel;
      }

      const displayId = sj?.id || kp.id;
      if (!displayId || seenSuratJalan.has(displayId)) continue;
      seenSuratJalan.add(displayId);
      suratJalans.push({
        id: displayId,
        konfirmasiId: kp.id || null,
        nomor: sj?.nomor || kp.nomor || null,
        tanggal: sj?.tanggal || kp.tanggal || null,
        mitraNama: sj?.mitra?.nama || null,
        mitraKode: sj?.mitra?.kode || null,
        api: toNumberOrNull(kp.api),
        BSNW: bsnw,
        volume: volumeRaw,
        volumeBarrel,
        satuan: satuanName,
        sedimenBarrel:
          volumeBarrel > 0 && bsnw !== null
            ? roundBarrelVolume(sedimenBarrel)
            : null,
      });
    }

    const bsnwGabunganPengisian = calcBsnwGabungan(
      pengisianBsnwSedimen,
      pengisianBsnwVolume,
    );

    row.detailMasuk.push({
      id: item.id,
      tankiId: tangkiIdValue,
      nomorSurat: item.nomorSurat || null,
      flowMeter: item.flowMeter ?? null,
      gross: item.gross,
      net: item.net,
      grossBarrel,
      netBarrel,
      kandunganAirBarrel,
      satuan: satuanAsli,
      tanggal: item.tanggal || item.createdAt,
      penampilanVisual: item.penampilanVisual || null,
      warna: item.warna || null,
      kandunganAir: item.kandunganAir ?? null,
      BSW: item.BSW ?? null,
      BSNW: bsnwGabunganPengisian ?? pickFirstBsnw(suratJalans, konfirmasiBsnw),
      BSNWGabungan: bsnwGabunganPengisian,
      bsnwVolumeBarrel: roundBarrelVolume(pengisianBsnwVolume),
      bsnwSedimenBarrel: roundBarrelVolume(pengisianBsnwSedimen),
      catatan: item.catatan || null,
      saksi: item.saksi || null,
      suratJalans,
    });
  }

  for (const ba of baList) {
    const dateKey = toDateKey(ba.tanggal);
    if (!dateKey) continue;

    for (const detail of ba.BABongkarTankis || []) {
      const tangkiIdValue = detail.tangkiId ?? detail.tanki?.id;
      if (!tangkiIdValue) continue;

      const row = getOrCreate(dateKey, tangkiIdValue, {
        kode: detail.tanki?.kode,
      });

      const ukuranCairan = detail.ukuranCairan ?? ba.ukuranCairan;
      const ukuranAir = detail.ukuranAir ?? ba.ukuranAir;
      const volumeKeluar = calcKeluarBarrel(
        ukuranCairan,
        ukuranAir,
        detail.tanki?.factorTank,
      );
      const ujiForTank = (ba.ujiLabK3S || []).find(
        (uji) => (uji.tangkiId ?? uji.tanki?.id) === tangkiIdValue,
      );
      const ujiBsnw = toNumberOrNull(ujiForTank?.BSNW);
      const bak3sBsnw = toNumberOrNull(ba.BAK3S?.BSNW);

      row.keluar += volumeKeluar;
      row.jumlahKeluar += 1;
      row.detailKeluar.push({
        id: detail.id,
        baId: ba.id,
        tankiId: tangkiIdValue,
        tanggal: ba.tanggal,
        ukuranCairan,
        ukuranAir,
        volume: volumeKeluar,
        BSNW: ujiBsnw ?? bak3sBsnw,
        api: toNumberOrNull(ujiForTank?.api) ?? toNumberOrNull(ba.BAK3S?.api),
        sg: toNumberOrNull(ujiForTank?.sg) ?? toNumberOrNull(ba.BAK3S?.sg),
        suhu: toNumberOrNull(ujiForTank?.suhu),
        kualitas: ujiForTank?.kualitas || null,
        sumberBSNW: ujiForTank ? "ujiLab" : ba.BAK3S ? "BAK3S" : null,
      });
    }
  }

  for (const uji of ujiList) {
    const dateKey = toDateKey(uji.tanggal);
    const tangkiIdValue = uji.tangkiId ?? uji.tanki?.id;
    if (!dateKey || !tangkiIdValue) continue;

    const row = getOrCreate(dateKey, tangkiIdValue, {
      kode: uji.tanki?.kode,
    });
    row.detailBSNW.push({
      id: uji.id,
      tanggal: uji.tanggal,
      BSNW: toNumberOrNull(uji.BSNW),
      api: toNumberOrNull(uji.api),
      sg: toNumberOrNull(uji.sg),
      suhu: toNumberOrNull(uji.suhu),
      kualitas: uji.kualitas || null,
      baId: uji.BABongkarId || null,
    });
  }

  for (const row of mutasiMap.values()) {
    row.masuk = roundBarrelVolume(row.masuk);
    row.keluar = roundBarrelVolume(row.keluar);
    row.bsnwMasukVolume = roundBarrelVolume(row.bsnwMasukVolume);
    row.bsnwMasukSedimen = roundBarrelVolume(row.bsnwMasukSedimen);
    row.BSNWGabunganMasuk = calcBsnwGabungan(
      row.bsnwMasukSedimen,
      row.bsnwMasukVolume,
    );
  }

  return mutasiMap;
};

const serializeStockOpname = (item, mutasi = {}) => {
  const volumes = buildVolumeFields(item);
  const masuk = roundBarrelVolume(mutasi.masuk || 0);
  const keluar = roundBarrelVolume(mutasi.keluar || 0);
  const detailMasuk = mutasi.detailMasuk || [];
  const detailKeluar = mutasi.detailKeluar || [];
  const detailBSNW = mutasi.detailBSNW || [];

  return {
    id: item.id,
    tanggal: toDateKey(item.tanggal) || item.tanggal,
    tankiId: item.tankiId,
    kode: item.tanki?.kode || "-",
    stasiunPengumpulMinyak: item.tanki?.stasiunPengumpulMinyak?.nama || null,
    suhu: volumes.suhu,
    tinggiMinyak: volumes.tinggiMinyak,
    tinggiAir: volumes.tinggiAir,
    factorTank: volumes.factorTank,
    panjang: volumes.panjang,
    lebar: volumes.lebar,
    volumeMinyak: volumes.volumeMinyak,
    volumeAir: volumes.volumeAir,
    volumeBersih: volumes.volumeBersih,
    satuan: SATUAN,
    masuk,
    keluar,
    BSNW: pickFirstBsnw(detailBSNW, detailKeluar, detailMasuk),
    BSNWGabunganMasuk: mutasi.BSNWGabunganMasuk ?? null,
    bsnwMasukVolume: roundBarrelVolume(mutasi.bsnwMasukVolume || 0),
    bsnwMasukSedimen: roundBarrelVolume(mutasi.bsnwMasukSedimen || 0),
    selisihMutasi: roundBarrelVolume(masuk - keluar),
    jumlahMasuk: mutasi.jumlahMasuk || 0,
    jumlahKeluar: mutasi.jumlahKeluar || 0,
    jumlahBSNW: detailBSNW.length,
    detailMasuk,
    detailKeluar,
    detailBSNW,
    tanki: item.tanki,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findExistingOnSameDay = async ({ tankiId, tanggal, excludeId }) => {
  const dayRange = getDayRange(tanggal);
  if (!dayRange) return null;

  const where = {
    tankiId,
    tanggal: {
      [Op.gte]: dayRange.start,
      [Op.lte]: dayRange.end,
    },
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  return stockOpnameTanki.findOne({ where });
};

const parsePayload = (body) => {
  const tankiId = parseInt(body.tankiId ?? body.tangkiId, 10);
  const tanggal = body.tanggal;
  const tinggiMinyak = parseDecimalInput(body.tinggiMinyak);
  const tinggiAir = parseDecimalInput(body.tinggiAir);
  const suhu = parseDecimalInput(body.suhu);

  if (!Number.isInteger(tankiId) || tankiId <= 0) {
    return { error: "Tanki wajib dipilih" };
  }
  if (!tanggal || !toDateKey(tanggal)) {
    return { error: "Tanggal wajib diisi" };
  }
  if (tinggiMinyak === null || tinggiMinyak < 0) {
    return { error: "Tinggi minyak wajib diisi dan tidak boleh negatif" };
  }
  if (tinggiAir === null || tinggiAir < 0) {
    return { error: "Tinggi air wajib diisi dan tidak boleh negatif" };
  }
  if (tinggiAir > tinggiMinyak) {
    return { error: "Tinggi air tidak boleh lebih besar dari tinggi minyak" };
  }

  return {
    tankiId,
    tanggal: toDateKey(tanggal),
    tinggiMinyak,
    tinggiAir,
    suhu,
  };
};

module.exports = {
  getAll: async (req, res) => {
    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = limit * page;
    const { startDate, endDate, tankiId, tangkiId } = req.query;

    try {
      const parsedTankiId = parseInt(tankiId || tangkiId, 10);
      const whereCondition = {};
      const dateRange = buildDateRange(startDate, endDate);

      if (dateRange) {
        whereCondition.tanggal = dateRange;
      }
      if (Number.isInteger(parsedTankiId) && parsedTankiId > 0) {
        whereCondition.tankiId = parsedTankiId;
      }

      const { rows, count } = await stockOpnameTanki.findAndCountAll({
        where: whereCondition,
        include: tankiInclude,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
        limit,
        offset,
        distinct: true,
      });

      const tankiIds = [
        ...new Set(rows.map((item) => item.tankiId).filter(Boolean)),
      ];
      const rowDates = rows.map((item) => toDateKey(item.tanggal)).filter(Boolean);
      const mutasiStart = startDate || (rowDates.length ? rowDates[rowDates.length - 1] : null);
      const mutasiEnd = endDate || (rowDates.length ? rowDates[0] : null);

      const mutasiMap = tankiIds.length
        ? await fetchRelatedMutasi({
            startDate: mutasiStart,
            endDate: mutasiEnd,
            tankiIds,
          })
        : new Map();

      const result = rows.map((item) => {
        const dateKey = toDateKey(item.tanggal);
        const mutasi = mutasiMap.get(`${dateKey}|${item.tankiId}`) || {};
        return serializeStockOpname(item, mutasi);
      });

      const totalMasuk = roundBarrelVolume(
        result.reduce((sum, row) => sum + (row.masuk || 0), 0),
      );
      const totalKeluar = roundBarrelVolume(
        result.reduce((sum, row) => sum + (row.keluar || 0), 0),
      );
      const totalStok = roundBarrelVolume(
        result.reduce((sum, row) => sum + (row.volumeBersih || 0), 0),
      );
      const totalBsnwMasukVolume = roundBarrelVolume(
        result.reduce((sum, row) => sum + (row.bsnwMasukVolume || 0), 0),
      );
      const totalBsnwMasukSedimen = roundBarrelVolume(
        result.reduce((sum, row) => sum + (row.bsnwMasukSedimen || 0), 0),
      );
      const totalBSNWGabunganMasuk = calcBsnwGabungan(
        totalBsnwMasukSedimen,
        totalBsnwMasukVolume,
      );

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows: count,
        totalPage: Math.ceil(count / limit),
        totalMasuk,
        totalKeluar,
        totalStok,
        totalBSNWGabunganMasuk,
        totalBsnwMasukVolume,
        totalBsnwMasukSedimen,
        satuan: SATUAN,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await stockOpnameTanki.findByPk(id, {
        include: tankiInclude,
      });

      if (!item) {
        return res.status(404).json({ error: "Data stok opname tidak ditemukan" });
      }

      const dateKey = toDateKey(item.tanggal);
      const mutasiMap = await fetchRelatedMutasi({
        startDate: dateKey,
        endDate: dateKey,
        tankiIds: [item.tankiId],
      });

      return res.status(200).json({
        success: true,
        result: serializeStockOpname(
          item,
          mutasiMap.get(`${dateKey}|${item.tankiId}`) || {},
        ),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  post: async (req, res) => {
    try {
      const payload = parsePayload(req.body);
      if (payload.error) {
        return res.status(400).json({ error: payload.error });
      }

      const existingTanki = await tanki.findByPk(payload.tankiId);
      if (!existingTanki) {
        return res.status(404).json({ error: "Tanki tidak ditemukan" });
      }

      const duplicate = await findExistingOnSameDay(payload);
      if (duplicate) {
        return res.status(400).json({
          error: `Stok opname untuk tanki ${existingTanki.kode || payload.tankiId} pada tanggal tersebut sudah ada`,
        });
      }

      const created = await stockOpnameTanki.create(payload);
      const item = await stockOpnameTanki.findByPk(created.id, {
        include: tankiInclude,
      });
      const dateKey = toDateKey(item.tanggal);
      const mutasiMap = await fetchRelatedMutasi({
        startDate: dateKey,
        endDate: dateKey,
        tankiIds: [item.tankiId],
      });

      return res.status(201).json({
        success: true,
        message: "Stok opname tanki berhasil disimpan",
        result: serializeStockOpname(
          item,
          mutasiMap.get(`${dateKey}|${item.tankiId}`) || {},
        ),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  edit: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await stockOpnameTanki.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Data stok opname tidak ditemukan" });
      }

      const payload = parsePayload(req.body);
      if (payload.error) {
        return res.status(400).json({ error: payload.error });
      }

      const existingTanki = await tanki.findByPk(payload.tankiId);
      if (!existingTanki) {
        return res.status(404).json({ error: "Tanki tidak ditemukan" });
      }

      const duplicate = await findExistingOnSameDay({
        ...payload,
        excludeId: id,
      });
      if (duplicate) {
        return res.status(400).json({
          error: `Stok opname untuk tanki ${existingTanki.kode || payload.tankiId} pada tanggal tersebut sudah ada`,
        });
      }

      await existing.update(payload);
      const item = await stockOpnameTanki.findByPk(id, {
        include: tankiInclude,
      });
      const dateKey = toDateKey(item.tanggal);
      const mutasiMap = await fetchRelatedMutasi({
        startDate: dateKey,
        endDate: dateKey,
        tankiIds: [item.tankiId],
      });

      return res.status(200).json({
        success: true,
        message: "Stok opname tanki berhasil diperbarui",
        result: serializeStockOpname(
          item,
          mutasiMap.get(`${dateKey}|${item.tankiId}`) || {},
        ),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  remove: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await stockOpnameTanki.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Data stok opname tidak ditemukan" });
      }

      await existing.destroy();
      return res.status(200).json({
        success: true,
        message: "Stok opname tanki berhasil dihapus",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
