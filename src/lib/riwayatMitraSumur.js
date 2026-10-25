const { Op } = require("sequelize");
const { riwayatMitraSumur, mitra, sumurMinyak } = require("../models");

const AWAL_RIWAYAT = new Date("1970-01-01T00:00:00.000Z");
const OFFSET_WITA_MS = 8 * 60 * 60 * 1000;
const SATU_HARI_MS = 24 * 60 * 60 * 1000;

const normalizeIds = (value) =>
  [
    ...new Set(
      []
        .concat(value || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0),
    ),
  ];

const toDate = (value) => {
  if (!value) return new Date();
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const mulaiHariWita = (value) => {
  const shifted = new Date(toDate(value).getTime() + OFFSET_WITA_MS);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) -
      OFFSET_WITA_MS,
  );
};

const akhirHariWita = (value) =>
  new Date(mulaiHariWita(value).getTime() + SATU_HARI_MS - 1);

const periodeAktif = (mulai, selesai, saat) =>
  mulai.getTime() <= saat.getTime() &&
  (!selesai || selesai.getTime() > saat.getTime());

const periodeMencakup = (row, tanggal, { termasukHariMulai = false } = {}) => {
  const at = toDate(tanggal);
  const mulai = new Date(row.mulai);
  const selesai = row.selesai ? new Date(row.selesai) : null;

  if (periodeAktif(mulai, selesai, at)) return true;

  // Tanggal surat jalan dari input date terbaca jam 08:00 WITA.
  // Sumur yang dipindahkan nanti di hari yang sama, misalnya jam 10:00, tetap dipakai.
  return termasukHariMulai && periodeAktif(mulai, selesai, akhirHariWita(at));
};

const catatMitraAwal = async (sumurMinyakId, mitraId, transaction) => {
  if (!sumurMinyakId || !mitraId) return null;

  return riwayatMitraSumur.create(
    {
      sumurMinyakId,
      mitraId,
      mulai: new Date(),
      selesai: null,
    },
    { transaction },
  );
};

const pindahMitraSumur = async ({
  sumurMinyakId,
  mitraIdLama,
  mitraIdBaru,
  transaction,
}) => {
  const lama = mitraIdLama ? Number(mitraIdLama) : null;
  const baru = mitraIdBaru ? Number(mitraIdBaru) : null;
  if (!sumurMinyakId || lama === baru) return;

  const sekarang = new Date();
  const terbuka = await riwayatMitraSumur.findOne({
    where: { sumurMinyakId, selesai: null },
    order: [["mulai", "DESC"]],
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });

  if (terbuka) {
    await terbuka.update({ selesai: sekarang }, { transaction });
  } else if (lama) {
    await riwayatMitraSumur.create(
      {
        sumurMinyakId,
        mitraId: lama,
        mulai: AWAL_RIWAYAT,
        selesai: sekarang,
      },
      { transaction },
    );
  }

  if (!baru) return;

  await riwayatMitraSumur.create(
    {
      sumurMinyakId,
      mitraId: baru,
      mulai: sekarang,
      selesai: null,
    },
    { transaction },
  );
};

const sumurIdsMilikMitra = async (mitraIds, tanggal, options = {}) => {
  const ids = normalizeIds(mitraIds);
  if (!ids.length) return [];

  const at = toDate(tanggal);
  const awal = mulaiHariWita(at);
  const akhir = new Date(awal.getTime() + SATU_HARI_MS);

  const rows = await riwayatMitraSumur.findAll({
    attributes: ["sumurMinyakId", "mulai", "selesai"],
    where: {
      mitraId: ids,
      mulai: { [Op.lt]: akhir },
      [Op.or]: [{ selesai: null }, { selesai: { [Op.gt]: awal } }],
    },
  });

  return [
    ...new Set(
      rows
        .filter((row) => periodeMencakup(row, at, options))
        .map((row) => row.sumurMinyakId),
    ),
  ];
};

const sumurIdsUntukPeriodeMitra = async (entri, options = {}) => {
  const sumurIds = new Set();

  for (const item of entri || []) {
    const ids = await sumurIdsMilikMitra(item.mitraId, item.tanggal, options);
    ids.forEach((id) => sumurIds.add(id));
  }

  return [...sumurIds];
};

const muatRiwayatSumur = async (sumurIds) => {
  const ids = normalizeIds(sumurIds);
  const map = new Map();
  if (!ids.length) return map;

  const rows = await riwayatMitraSumur.findAll({
    where: { sumurMinyakId: ids },
    include: [{ model: mitra, attributes: ["id", "nama"] }],
    order: [["mulai", "ASC"]],
  });

  rows.forEach((row) => {
    const list = map.get(row.sumurMinyakId) || [];
    list.push(row);
    map.set(row.sumurMinyakId, list);
  });

  return map;
};

const mitraPadaTanggal = (riwayatList, tanggal, options = {}) => {
  if (!riwayatList?.length) return null;

  const cocok = riwayatList.filter((row) => periodeMencakup(row, tanggal, options));
  if (!cocok.length) return null;

  cocok.sort((a, b) => new Date(b.mulai).getTime() - new Date(a.mulai).getTime());
  return cocok[0].mitra || null;
};

const tempelMitraHistoris = (sumurPlain, tanggal, riwayatMap, options = {}) => {
  if (!sumurPlain?.id) return sumurPlain;

  const historis = mitraPadaTanggal(
    riwayatMap.get(sumurPlain.id),
    tanggal,
    options,
  );
  if (!historis) return sumurPlain;

  return {
    ...sumurPlain,
    mitraId: historis.id,
    mitra: { id: historis.id, nama: historis.nama },
  };
};

const tempelMitraDariEntri = (sumurPlain, entri, riwayatMap) => {
  const riwayat = riwayatMap.get(sumurPlain?.id) || [];

  for (const item of entri || []) {
    const historis = mitraPadaTanggal(riwayat, item.tanggal, {
      termasukHariMulai: true,
    });
    if (historis && Number(historis.id) === Number(item.mitraId)) {
      return {
        ...sumurPlain,
        mitraId: historis.id,
        mitra: { id: historis.id, nama: historis.nama },
      };
    }
  }

  return sumurPlain;
};

const muatSumurDenganMitraHistoris = async (sumurIds, tanggal, options = {}) => {
  const ids = normalizeIds(sumurIds);
  if (!ids.length) return [];

  const [sumurRows, riwayatMap] = await Promise.all([
    sumurMinyak.findAll({
      where: { id: ids },
      include: [{ model: mitra, attributes: ["id", "nama"] }],
      order: [["nama", "ASC"]],
    }),
    muatRiwayatSumur(ids),
  ]);

  return sumurRows.map((row) =>
    tempelMitraHistoris(row.get({ plain: true }), tanggal, riwayatMap, options),
  );
};

module.exports = {
  catatMitraAwal,
  pindahMitraSumur,
  sumurIdsMilikMitra,
  sumurIdsUntukPeriodeMitra,
  muatRiwayatSumur,
  mitraPadaTanggal,
  tempelMitraHistoris,
  tempelMitraDariEntri,
  muatSumurDenganMitraHistoris,
};
