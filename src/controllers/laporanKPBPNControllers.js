const { Op } = require("sequelize");
const {
  suratJalan,
  mitra,
  transportir,
  supir,
  stasiunPengumpulMinyak,
  asalMinyak,
  statusSuratJalan,
  konfirmasiPenerimaan,
  satuanVolume,
  pengisianTanki,
  tanki,
  BABongkar,
  BABongkarTanki,
  BAK3S,
  userKPBPN,
  icp,
} = require("../models");
const { ROLE_KPBPN, getKpbpnRoleIds } = require("../lib/auth");

const userAttrs = ["id", "nama", "namaPengguna"];

const includeUser = (as) => ({
  model: userKPBPN,
  ...(as ? { as } : {}),
  attributes: userAttrs,
});

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toMonthKey = (value) => {
  if (!value) return null;
  const str = String(value);
  if (/^\d{4}-\d{2}/.test(str)) return str.slice(0, 7);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const previousMonthKey = (value) => {
  const key = toMonthKey(value);
  if (!key) return null;
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return null;
  const prev = new Date(year, month - 2, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
};

const paginateQuery = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 10000);
  return { page, limit, offset: limit * page };
};

const dateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return null;
  const cond = {};
  if (startDate) cond[Op.gte] = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    cond[Op.lte] = end;
  }
  return cond;
};

const applyTanggalFilter = (where, startDate, endDate, field = "tanggal") => {
  const range = dateRange(startDate, endDate);
  if (range) where[field] = range;
};

const like = (value) => ({ [Op.like]: `%${String(value).trim()}%` });

const resolveScope = async (req) => {
  const roleIds = getKpbpnRoleIds(req);
  const isAdmin =
    roleIds.includes(ROLE_KPBPN.SUPER_ADMIN) ||
    roleIds.includes(ROLE_KPBPN.ADMIN);
  const isKeuangan = roleIds.includes(ROLE_KPBPN.KEUANGAN);
  const isMitra = roleIds.includes(ROLE_KPBPN.MITRA) && !isAdmin;
  const isPetugasKeamanan =
    roleIds.includes(ROLE_KPBPN.PETUGAS_KEAMANAN) && !isAdmin;
  const userId = req.user?.id ? Number(req.user.id) : null;

  let mitraId = null;
  if (isMitra && userId) {
    const currentUser = await userKPBPN.findByPk(userId, {
      attributes: ["id", "mitraId"],
    });
    mitraId = currentUser?.mitraId || null;
  }

  return {
    userId,
    mitraId,
    isAdmin,
    isKeuangan,
    isMitra,
    isPetugasKeamanan,
    roleIds,
    scoped: !isAdmin,
  };
};

const jsonList = (res, { result, page, limit, totalRows, scoped }) =>
  res.status(200).json({
    success: true,
    result,
    page,
    limit,
    totalRows,
    totalPage: Math.ceil(totalRows / limit),
    scoped: Boolean(scoped),
  });

const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: err.message });
};

const uniqueJoin = (values) =>
  [...new Set((values || []).filter(Boolean))].join(", ") || null;

module.exports = {
  getLaporanPetugasKeamanan: async (req, res) => {
    const { page, limit, offset } = paginateQuery(req);
    const { startDate, endDate, search } = req.query;

    try {
      const scope = await resolveScope(req);
      if (!scope.userId) {
        return res.status(401).json({ error: "Pengguna tidak dikenali" });
      }

      const where = {};
      applyTanggalFilter(where, startDate, endDate);
      if (!scope.isAdmin) {
        where.userPKId = scope.userId;
      }

      const include = [
        includeUser("userPK"),
        includeUser("userLab"),
        {
          model: suratJalan,
          required: false,
          include: [
            { model: mitra, attributes: ["id", "nama"] },
            { model: supir, attributes: ["id", "nama"] },
            { model: transportir, attributes: ["id", "plat"] },
            { model: satuanVolume, attributes: ["id", "satuan"] },
            { model: statusSuratJalan, attributes: ["id", "status"] },
          ],
        },
      ];

      if (search?.trim()) {
        const term = like(search);
        where[Op.and] = [
          ...(where[Op.and] || []),
          {
            [Op.or]: [
              { nomor: term },
              { catatan: term },
              { "$suratJalan.nomor$": term },
              { "$suratJalan.mitra.nama$": term },
            ],
          },
        ];
      }

      const rows = await konfirmasiPenerimaan.findAll({
        where,
        include,
        limit,
        offset,
        subQuery: false,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await konfirmasiPenerimaan.count({
        where,
        include,
        distinct: true,
        col: "id",
      });

      const result = rows.map((row) => {
        const plain = row.get({ plain: true });
        const sj = plain.suratJalan || {};
        return {
          id: plain.id,
          tanggal: plain.tanggal,
          nomorKonfirmasi: plain.nomor,
          nomorSuratJalan: sj.nomor || null,
          suratJalanId: sj.id || null,
          mitra: sj.mitra?.nama || null,
          supir: sj.supir?.nama || null,
          transportir: sj.transportir?.plat || null,
          volumeSuratJalan: toNumber(sj.volume),
          volumeDiterima: toNumber(plain.volume),
          satuan: sj.satuanVolume?.satuan || "barrel",
          jamDatang: sj.jamDatang || null,
          jamPergi: sj.jamPergi || null,
          status: sj.statusSuratJalan?.status || null,
          petugasPK: plain.userPK?.nama || null,
          petugasLab: plain.userLab?.nama || null,
          catatan: plain.catatan || null,
          foto: plain.foto || null,
        };
      });

      return jsonList(res, { result, page, limit, totalRows, scoped: scope.scoped });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getLaporanBAST: async (req, res) => {
    const { page, limit, offset } = paginateQuery(req);
    const { startDate, endDate, search } = req.query;

    try {
      const scope = await resolveScope(req);
      if (!scope.userId) {
        return res.status(401).json({ error: "Pengguna tidak dikenali" });
      }

      const where = {};
      applyTanggalFilter(where, startDate, endDate);
      if (!scope.isAdmin) where.userKPBPNId = scope.userId;
      if (search?.trim()) {
        where[Op.or] = [
          { nomorSurat: like(search) },
          { catatan: like(search) },
          { saksi: like(search) },
        ];
      }

      const include = [
        { model: tanki, attributes: ["id", "kode"] },
        { model: satuanVolume, attributes: ["id", "satuan"] },
        includeUser(),
        {
          model: konfirmasiPenerimaan,
          through: { attributes: [] },
          include: [
            {
              model: suratJalan,
              include: [
                { model: mitra, attributes: ["id", "nama"] },
                { model: satuanVolume, attributes: ["id", "satuan"] },
              ],
            },
          ],
        },
      ];

      const rows = await pengisianTanki.findAll({
        where,
        include,
        limit,
        offset,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await pengisianTanki.count({ where });

      const result = rows.map((row) => {
        const plain = row.get({ plain: true });
        const konfirmasis = plain.konfirmasiPenerimaans || [];
        const mitraNama = uniqueJoin(
          konfirmasis.map((kp) => kp.suratJalan?.mitra?.nama),
        );
        const nomorSJ = uniqueJoin(
          konfirmasis.map((kp) => kp.suratJalan?.nomor),
        );
        const volumeDiterima = konfirmasis.reduce((sum, kp) => {
          const val = toNumber(kp.volume);
          return val === null ? sum : sum + val;
        }, 0);

        return {
          id: plain.id,
          tanggal: plain.tanggal,
          nomorSurat: plain.nomorSurat,
          tanki: plain.tanki?.kode || null,
          flowMeter: toNumber(plain.flowMeter),
          gross: toNumber(plain.gross),
          net: toNumber(plain.net),
          satuan: plain.satuanVolume?.satuan || "barrel",
          volumeKonfirmasi: volumeDiterima || null,
          nomorSuratJalan: nomorSJ,
          mitra: mitraNama,
          pembuat: plain.userKPBPN?.nama || null,
          baBongkarId: plain.BABongkarId || null,
          catatan: plain.catatan || null,
        };
      });

      return jsonList(res, { result, page, limit, totalRows, scoped: scope.scoped });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getLaporanSuratJalan: async (req, res) => {
    const { page, limit, offset } = paginateQuery(req);
    const { startDate, endDate, search } = req.query;

    try {
      const scope = await resolveScope(req);
      if (!scope.userId) {
        return res.status(401).json({ error: "Pengguna tidak dikenali" });
      }

      if (scope.isMitra && !scope.mitraId) {
        return jsonList(res, {
          result: [],
          page,
          limit,
          totalRows: 0,
          scoped: true,
        });
      }

      const where = {};
      applyTanggalFilter(where, startDate, endDate);
      if (scope.isMitra) where.mitraId = scope.mitraId;
      if (search?.trim()) {
        where.nomor = like(search);
      }

      const include = [
        { model: mitra, attributes: ["id", "nama"] },
        { model: transportir, attributes: ["id", "plat"] },
        { model: supir, attributes: ["id", "nama"] },
        { model: statusSuratJalan, attributes: ["id", "status"] },
        { model: satuanVolume, attributes: ["id", "satuan"] },
        { model: stasiunPengumpulMinyak, attributes: ["id", "nama"] },
        { model: asalMinyak, attributes: ["id", "asal", "nomor"] },
        {
          model: konfirmasiPenerimaan,
          attributes: ["id", "userPKId", "userLabId", "volume", "tanggal"],
          include: [includeUser("userPK")],
        },
      ];

      if (scope.isPetugasKeamanan) {
        include[include.length - 1].required = true;
        include[include.length - 1].where = { userPKId: scope.userId };
      }

      const rows = await suratJalan.findAll({
        where,
        include,
        limit,
        offset,
        distinct: true,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await suratJalan.count({
        where,
        include: scope.isPetugasKeamanan
          ? [
              {
                model: konfirmasiPenerimaan,
                required: true,
                where: { userPKId: scope.userId },
              },
            ]
          : undefined,
        distinct: true,
        col: "id",
      });

      const result = rows.map((row) => {
        const plain = row.get({ plain: true });
        const konfirmasis = plain.konfirmasiPenerimaans || [];
        return {
          id: plain.id,
          nomor: plain.nomor,
          tanggal: plain.tanggal,
          mitra: plain.mitra?.nama || null,
          transportir: plain.transportir?.plat || null,
          supir: plain.supir?.nama || null,
          volume: toNumber(plain.volume),
          satuan: plain.satuanVolume?.satuan || "barrel",
          status: plain.statusSuratJalan?.status || null,
          stasiun: plain.stasiunPengumpulMinyak?.nama || null,
          asalMinyak: plain.asalMinyak?.asal || null,
          jamDatang: plain.jamDatang || null,
          jamPergi: plain.jamPergi || null,
          petugasPK: uniqueJoin(konfirmasis.map((kp) => kp.userPK?.nama)),
          volumeDiterima: konfirmasis.reduce((sum, kp) => {
            const val = toNumber(kp.volume);
            return val === null ? sum : sum + val;
          }, 0) || null,
        };
      });

      return jsonList(res, {
        result,
        page,
        limit,
        totalRows,
        scoped: scope.scoped,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getLaporanBABongkar: async (req, res) => {
    const { page, limit, offset } = paginateQuery(req);
    const { startDate, endDate, search } = req.query;

    try {
      const scope = await resolveScope(req);
      if (!scope.userId) {
        return res.status(401).json({ error: "Pengguna tidak dikenali" });
      }

      const where = {};
      applyTanggalFilter(where, startDate, endDate);
      if (!scope.isAdmin) where.userKPBPNId = scope.userId;
      if (search?.trim()) {
        const idSearch = parseInt(search, 10);
        if (Number.isInteger(idSearch)) {
          where.id = idSearch;
        }
      }

      const include = [
        includeUser(),
        {
          model: BABongkarTanki,
          include: [{ model: tanki, attributes: ["id", "kode"] }],
        },
        {
          model: pengisianTanki,
          attributes: ["id", "nomorSurat", "tanggal", "net", "gross"],
          include: [
            { model: tanki, attributes: ["id", "kode"] },
            {
              model: konfirmasiPenerimaan,
              through: { attributes: [] },
              include: [
                {
                  model: suratJalan,
                  attributes: ["id", "nomor"],
                  include: [{ model: mitra, attributes: ["id", "nama"] }],
                },
              ],
            },
          ],
        },
        {
          model: BAK3S,
          as: "BAK3S",
          attributes: ["id", "produksi", "api", "BSNW", "sg"],
        },
      ];

      const rows = await BABongkar.findAll({
        where,
        include,
        limit,
        offset,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await BABongkar.count({ where });

      const result = rows.map((row) => {
        const plain = row.get({ plain: true });
        const details = plain.BABongkarTankis || [];
        const pengisian = plain.pengisianTankis || [];
        const mitraNama = uniqueJoin(
          pengisian.flatMap((item) =>
            (item.konfirmasiPenerimaans || []).map(
              (kp) => kp.suratJalan?.mitra?.nama,
            ),
          ),
        );
        const nomorBAST = uniqueJoin(pengisian.map((item) => item.nomorSurat));

        return {
          id: plain.id,
          tanggal: plain.tanggal,
          tanki: uniqueJoin([
            ...details.map((d) => d.tanki?.kode),
            ...pengisian.map((item) => item.tanki?.kode),
          ]),
          ukuranCairan: details.length
            ? uniqueJoin(
                details.map(
                  (d) =>
                    `${d.tanki?.kode || "Tanki"}: ${d.ukuranCairan ?? "-"}`,
                ),
              )
            : toNumber(plain.ukuranCairan),
          ukuranAir: details.length
            ? uniqueJoin(
                details.map(
                  (d) => `${d.tanki?.kode || "Tanki"}: ${d.ukuranAir ?? "-"}`,
                ),
              )
            : toNumber(plain.ukuranAir),
          nomorBAST,
          mitra: mitraNama,
          pembuat: plain.userKPBPN?.nama || null,
          produksiK3S: toNumber(plain.BAK3S?.produksi),
          api: toNumber(plain.BAK3S?.api),
          BSNW: toNumber(plain.BAK3S?.BSNW),
          punyaBAK3S: Boolean(plain.BAK3S),
        };
      });

      return jsonList(res, { result, page, limit, totalRows, scoped: scope.scoped });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getLaporanKonfirmasiPenerimaan: async (req, res) => {
    const { page, limit, offset } = paginateQuery(req);
    const { startDate, endDate, search } = req.query;

    try {
      const scope = await resolveScope(req);
      if (!scope.userId) {
        return res.status(401).json({ error: "Pengguna tidak dikenali" });
      }

      const where = {};
      applyTanggalFilter(where, startDate, endDate);
      if (!scope.isAdmin) {
        where[Op.or] = [{ userPKId: scope.userId }, { userLabId: scope.userId }];
      }
      if (search?.trim()) {
        const term = like(search);
        const searchOr = [{ nomor: term }, { catatan: term }];
        if (where[Op.or]) {
          where[Op.and] = [{ [Op.or]: where[Op.or] }, { [Op.or]: searchOr }];
          delete where[Op.or];
        } else {
          where[Op.or] = searchOr;
        }
      }

      const include = [
        includeUser("userPK"),
        includeUser("userLab"),
        {
          model: suratJalan,
          include: [
            { model: mitra, attributes: ["id", "nama"] },
            { model: supir, attributes: ["id", "nama"] },
            { model: transportir, attributes: ["id", "plat"] },
            { model: satuanVolume, attributes: ["id", "satuan"] },
            { model: statusSuratJalan, attributes: ["id", "status"] },
          ],
        },
        {
          model: pengisianTanki,
          through: { attributes: [] },
          attributes: ["id", "nomorSurat"],
          include: [{ model: tanki, attributes: ["id", "kode"] }],
        },
      ];

      const rows = await konfirmasiPenerimaan.findAll({
        where,
        include,
        limit,
        offset,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await konfirmasiPenerimaan.count({
        where,
        distinct: true,
        col: "id",
      });

      const result = rows.map((row) => {
        const plain = row.get({ plain: true });
        const sj = plain.suratJalan || {};
        const pengisian = plain.pengisianTankis || [];
        return {
          id: plain.id,
          nomor: plain.nomor,
          tanggal: plain.tanggal,
          nomorSuratJalan: sj.nomor || null,
          suratJalanId: sj.id || null,
          mitra: sj.mitra?.nama || null,
          supir: sj.supir?.nama || null,
          transportir: sj.transportir?.plat || null,
          volume: toNumber(plain.volume),
          satuan: sj.satuanVolume?.satuan || "barrel",
          api: toNumber(plain.api),
          BSNW: toNumber(plain.BSNW),
          status: sj.statusSuratJalan?.status || null,
          petugasPK: plain.userPK?.nama || null,
          petugasLab: plain.userLab?.nama || null,
          tanki: uniqueJoin(pengisian.map((item) => item.tanki?.kode)),
          nomorBAST: uniqueJoin(pengisian.map((item) => item.nomorSurat)),
          catatan: plain.catatan || null,
          foto: plain.foto || null,
          fotoLab: plain.fotoLab || null,
        };
      });

      return jsonList(res, { result, page, limit, totalRows, scoped: scope.scoped });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getLaporanKeuangan: async (req, res) => {
    const { page, limit, offset } = paginateQuery(req);
    const { startDate, endDate, search } = req.query;

    try {
      const scope = await resolveScope(req);
      if (!scope.userId) {
        return res.status(401).json({ error: "Pengguna tidak dikenali" });
      }

      const baWhere = {};
      applyTanggalFilter(baWhere, startDate, endDate);
      const bakWhere = {};
      if (!scope.isAdmin && !scope.isKeuangan) {
        bakWhere.userKPBPNId = scope.userId;
      }

      const include = [
        includeUser(),
        {
          model: BABongkar,
          attributes: ["id", "tanggal"],
          required: true,
          where: Object.keys(baWhere).length ? baWhere : undefined,
        },
      ];

      const rows = await BAK3S.findAll({
        where: bakWhere,
        include,
        limit,
        offset,
        order: [
          [BABongkar, "tanggal", "DESC"],
          ["id", "DESC"],
        ],
      });

      const totalRows = await BAK3S.count({
        where: bakWhere,
        include,
        distinct: true,
      });

      const icps = await icp.findAll({
        attributes: ["harga", "kursTengah", "bulan"],
      });
      const icpByMonth = {};
      icps.forEach((row) => {
        const key = toMonthKey(row.bulan);
        if (key) icpByMonth[key] = row;
      });

      let result = rows.map((row) => {
        const plain = row.get({ plain: true });
        const tanggal = plain.BABongkar?.tanggal || null;
        const bulanTarif = previousMonthKey(tanggal);
        const icpRow = icpByMonth[bulanTarif] || null;
        const hargaIcp = toNumber(icpRow?.harga);
        const kursTengah = toNumber(icpRow?.kursTengah);
        const produksi = toNumber(plain.produksi);
        const tarif =
          hargaIcp !== null && kursTengah !== null
            ? hargaIcp * kursTengah
            : null;
        const nilai =
          tarif !== null && produksi !== null ? tarif * produksi : null;

        return {
          id: plain.id,
          baBongkarId: plain.BABongkarId,
          tanggal,
          api: toNumber(plain.api),
          BSNW: toNumber(plain.BSNW),
          sg: toNumber(plain.sg),
          produksi,
          icp: hargaIcp,
          kursTengah,
          bulanTarif,
          tarif,
          nilai,
          pembuat: plain.userKPBPN?.nama || null,
        };
      });

      if (search?.trim()) {
        const term = String(search).trim().toLowerCase();
        result = result.filter((item) =>
          String(item.pembuat || "")
            .toLowerCase()
            .includes(term) ||
          String(item.baBongkarId || "").includes(term),
        );
      }

      return jsonList(res, {
        result,
        page,
        limit,
        totalRows,
        scoped: !scope.isAdmin && !scope.isKeuangan,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
};
