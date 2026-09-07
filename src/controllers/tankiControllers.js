const {
  pengisianTanki,
  suratJalan,
  mitra,
  supir,
  transportir,
  pegawai,
  tanki,
  konfirmasiPenerimaan,
  daftarUnitKerja,
  stasiunPengumpulMinyak,
  BABongkar,
  BABongkarTanki,
  ujiLabK3S,
  BAK3S,
  nomorSuratKPBPN,
  jenisMitra,
  satuanVolume,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const { formatTanggal, getRomanMonth } = require("../lib/perjalananHelpers");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

const pengisianIncludeForBA = [
  { model: tanki },
  {
    model: konfirmasiPenerimaan,
    through: { attributes: [] },
    include: [
      {
        model: suratJalan,
        include: [{ model: transportir }, { model: supir }],
      },
    ],
  },
];

const baBongkarPengisianInclude = [
  { model: tanki },
  { model: satuanVolume },
  {
    model: konfirmasiPenerimaan,
    through: { attributes: [] },
    include: [
      {
        model: suratJalan,
        include: [{ model: mitra }, { model: supir }, { model: transportir }],
      },
      { model: pegawai },
    ],
  },
];

const parseKonfirmasiIds = (ids) => [
  ...new Set(
    (Array.isArray(ids) ? ids : [])
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isInteger(id) && id > 0),
  ),
];

const parseDecimalInput = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
};

const deletePublicFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(
    __dirname,
    "../public",
    String(relativePath).replace(/^\//, ""),
  );
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const parseBak3sPayload = (body) => {
  const api = parseDecimalInput(body.api);
  const BSNW = parseDecimalInput(body.BSNW);
  const produksi = parseDecimalInput(body.produksi);
  const sg = parseDecimalInput(body.sg);

  if (api === null || BSNW === null || produksi === null || sg === null) {
    return {
      error: "API, BSNW, produksi, dan SG wajib diisi",
    };
  }

  return { api, BSNW, produksi, sg };
};

const getLatestUjiLabForTanki = async (tangkiId, transaction) => {
  return ujiLabK3S.findOne({
    where: { tangkiId },
    include: [{ model: tanki, attributes: ["id", "kode"] }],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    transaction,
  });
};

const assertTankiSiapBABongkar = async (tangkiIds, transaction) => {
  const uniqueIds = [...new Set(tangkiIds.filter(Boolean))];
  const ujiLabs = [];

  for (const tangkiId of uniqueIds) {
    const latest = await getLatestUjiLabForTanki(tangkiId, transaction);
    const tank = latest?.tanki || (await tanki.findByPk(tangkiId, { transaction }));
    const kode = tank?.kode || `#${tangkiId}`;

    if (!latest) {
      throw new Error(
        `Tanki ${kode} belum memiliki uji lab K3S. Lakukan uji lab terlebih dahulu`,
      );
    }

    if (latest.BABongkarId) {
      throw new Error(
        `Tanki ${kode} perlu uji lab K3S baru sebelum membuat BA Bongkar`,
      );
    }

    if (latest.kualitas !== "ONSPEC") {
      throw new Error(
        `Tanki ${kode} hasil uji lab OFFSPEC. Lakukan pencampuran bahan kimia lalu uji ulang`,
      );
    }

    ujiLabs.push(latest);
  }

  return ujiLabs;
};

const buildBABongkarWhere = async ({ startDate, endDate, tangkiId, baId }) => {
  const whereCondition = {};

  if (baId) {
    whereCondition.id = parseInt(baId, 10);
  }

  if (startDate || endDate) {
    whereCondition.tanggal = {};
    if (startDate) {
      whereCondition.tanggal[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.tanggal[Op.lte] = end;
    }
  }

  if (tangkiId) {
    const parsedTangkiId = parseInt(tangkiId, 10);
    const pengisianWithBA = await pengisianTanki.findAll({
      where: {
        tangkiId: parsedTangkiId,
        BABongkarId: { [Op.ne]: null },
      },
      attributes: ["BABongkarId"],
      group: ["BABongkarId"],
      raw: true,
    });

    const baIds = pengisianWithBA
      .map((item) => item.BABongkarId)
      .filter(Boolean);

    if (!baIds.length) {
      return { whereCondition: { id: -1 }, emptyResult: true };
    }

    if (whereCondition.id) {
      if (!baIds.includes(whereCondition.id)) {
        return { whereCondition: { id: -1 }, emptyResult: true };
      }
    } else {
      whereCondition.id = { [Op.in]: baIds };
    }
  }

  return { whereCondition, emptyResult: false };
};

const parseUkuranBA = (ukuranCairan, ukuranAir) => {
  const parsedUkuranCairan =
    ukuranCairan !== null && ukuranCairan !== undefined && ukuranCairan !== ""
      ? parseInt(ukuranCairan, 10)
      : null;
  const parsedUkuranAir =
    ukuranAir !== null && ukuranAir !== undefined && ukuranAir !== ""
      ? parseInt(ukuranAir, 10)
      : null;
  const uMin =
    parsedUkuranCairan !== null &&
    parsedUkuranAir !== null &&
    !Number.isNaN(parsedUkuranCairan) &&
    !Number.isNaN(parsedUkuranAir)
      ? parsedUkuranCairan - parsedUkuranAir
      : null;

  return { parsedUkuranCairan, parsedUkuranAir, uMin };
};

const LITER_PER_BARREL = 158.987;
const LITER_PER_DRUM = 200;

const convertVolumeToBarrel = (volume, satuanName) => {
  const value = Number(volume);
  if (Number.isNaN(value)) return 0;

  const satuan = String(satuanName || "barrel").trim().toLowerCase();

  if (satuan === "barrel") return value;
  if (satuan === "liter") return value / LITER_PER_BARREL;
  if (satuan === "drum") return (value * LITER_PER_DRUM) / LITER_PER_BARREL;

  return value;
};

const roundBarrelVolume = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

const buildUkuranDoc = ({ parsedUkuranCairan, parsedUkuranAir, uMin }) => ({
  uCair: parsedUkuranCairan ?? "-",
  uAir: parsedUkuranAir ?? "-",
  uMin: uMin ?? "-",
});

const parseFactorTank = (factorTank) =>
  factorTank !== null && factorTank !== undefined && factorTank !== ""
    ? parseFloat(factorTank)
    : null;

const buildFactorDocFields = (ukuranDoc, factorTank) => {
  const factor = parseFactorTank(factorTank);
  const uCairNum = typeof ukuranDoc.uCair === "number" ? ukuranDoc.uCair : null;
  const uAirNum = typeof ukuranDoc.uAir === "number" ? ukuranDoc.uAir : null;
  const uMinNum = typeof ukuranDoc.uMin === "number" ? ukuranDoc.uMin : null;

  return {
    ...ukuranDoc,
    factor: factor ?? "-",
    vCair:
      factor !== null && !Number.isNaN(factor) && uCairNum !== null
        ? factor * uCairNum
        : "-",
    vAir:
      factor !== null && !Number.isNaN(factor) && uAirNum !== null
        ? factor * uAirNum
        : "-",
    vMin:
      factor !== null && !Number.isNaN(factor) && uMinNum !== null
        ? factor * uMinNum
        : "-",
  };
};

const joinUniqueValues = (values) => {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed || trimmed === "-" || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result.length ? result.join(", ") : "-";
};

const buildBABongkarRows = (pengisianList, ukuranLookup) => {
  const byTank = new Map();

  for (const pengisian of pengisianList) {
    const tangkiId = pengisian.tangkiId ?? pengisian.tanki?.id;
    if (!tangkiId) continue;

    if (!byTank.has(tangkiId)) {
      byTank.set(tangkiId, {
        tangkiId,
        kode: pengisian.tanki?.kode || "-",
        factorTank: pengisian.tanki?.factorTank,
        items: [],
      });
    }

    byTank.get(tangkiId).items.push(pengisian);
  }

  const rows = [];

  for (const group of byTank.values()) {
    const nopolList = [];
    const driverList = [];

    for (const pengisian of group.items) {
      for (const kp of pengisian.konfirmasiPenerimaans || []) {
        const plat = kp.suratJalan?.transportir?.plat;
        const namaSupir = kp.suratJalan?.supir?.nama;
        if (plat) nopolList.push(plat);
        if (namaSupir) driverList.push(namaSupir);
      }
    }

    const ukuranDoc =
      ukuranLookup.get(group.tangkiId) ||
      ukuranLookup.get("default") ||
      buildUkuranDoc(parseUkuranBA(null, null));
    const docFields = buildFactorDocFields(ukuranDoc, group.factorTank);

    rows.push({
      nopol: joinUniqueValues(nopolList),
      driver: joinUniqueValues(driverList),
      noTanki: group.kode,
      ...docFields,
    });
  }

  return rows.sort((a, b) =>
    String(a.noTanki).localeCompare(String(b.noTanki), "id"),
  );
};

const buildUkuranLookup = (ba, tankiDetails = []) => {
  const lookup = new Map();
  const fallback = buildUkuranDoc(
    parseUkuranBA(ba?.ukuranCairan, ba?.ukuranAir),
  );
  lookup.set("default", fallback);

  for (const detail of tankiDetails) {
    const tangkiId = detail.tangkiId;
    if (!tangkiId) continue;
    lookup.set(
      tangkiId,
      buildUkuranDoc(parseUkuranBA(detail.ukuranCairan, detail.ukuranAir)),
    );
  }

  return lookup;
};

const parseTankiBAPayload = (body) => {
  const { tanggal, ukuranCairan, ukuranAir, ids, tanki: tankiPayload } = body;

  if (Array.isArray(tankiPayload) && tankiPayload.length) {
    return tankiPayload
      .map((item) => ({
        tangkiId: parseInt(item.tangkiId, 10),
        ids: (Array.isArray(item.ids) ? item.ids : [])
          .map((id) => parseInt(id, 10))
          .filter((id) => Number.isInteger(id) && id > 0),
        ukuranCairan:
          item.ukuranCairan !== undefined && item.ukuranCairan !== ""
            ? item.ukuranCairan
            : null,
        ukuranAir:
          item.ukuranAir !== undefined && item.ukuranAir !== ""
            ? item.ukuranAir
            : null,
      }))
      .filter(
        (item) =>
          Number.isInteger(item.tangkiId) &&
          item.tangkiId > 0 &&
          item.ids.length,
      );
  }

  const pengisianIds = (Array.isArray(ids) ? ids : [])
    .map((id) => parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!pengisianIds.length) return [];

  return [
    {
      tangkiId: null,
      ids: pengisianIds,
      ukuranCairan,
      ukuranAir,
    },
  ];
};

const generateBABongkarBuffer = (tanggal, data) => {
  const templatePath = path.join(
    __dirname,
    "../public/BAST/BABongkar-template.docx",
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template BA Bongkar tidak ditemukan");
  }

  const tanggalObj = new Date(tanggal);
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    hari: tanggalObj.toLocaleDateString("id-ID", { weekday: "long" }),
    tanggal: formatTanggal(tanggal),
    jam: tanggalObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    data,
  });

  return doc.getZip().generate({ type: "nodebuffer" });
};

const sendDocxDownload = (res, buffer, fileName) => {
  const outputPath = path.join(__dirname, "../public/output", fileName);

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  res.send(buffer);
  fs.unlinkSync(outputPath);
};

module.exports = {
  getAllBABongkar: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const { startDate, endDate, tangkiId, baId } = req.query;

    try {
      const { whereCondition, emptyResult } = await buildBABongkarWhere({
        startDate,
        endDate,
        tangkiId,
        baId,
      });

      if (emptyResult) {
        return res.status(200).json({
          success: true,
          result: [],
          page,
          limit,
          totalRows: 0,
          totalPage: 0,
        });
      }

      const result = await BABongkar.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [
          ["tanggal", "DESC"],
          ["createdAt", "DESC"],
        ],
        include: [
          {
            model: pengisianTanki,
            include: baBongkarPengisianInclude,
          },
          {
            model: BABongkarTanki,
            include: [{ model: tanki, attributes: ["id", "kode"] }],
          },
          {
            model: ujiLabK3S,
            as: "ujiLabK3S",
            include: [{ model: tanki, attributes: ["id", "kode"] }],
          },
          {
            model: BAK3S,
            as: "BAK3S",
          },
        ],
      });

      const totalRows = await BABongkar.count({ where: whereCondition });
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

  getAllPengisianTanki: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const whereCondition = {};
    try {
      const result = await pengisianTanki.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [
          ["tanggal", "DESC"],
          ["createdAt", "DESC"],
        ],
        include: [
          { model: tanki },
          {
            model: BABongkar,
            include: [{ model: BABongkarTanki }],
          },
          { model: satuanVolume },
          {
            model: konfirmasiPenerimaan,
            through: { attributes: [] },
            include: [
              {
                model: suratJalan,
                include: [
                  { model: mitra },
                  { model: supir },
                  { model: transportir },
                  { model: satuanVolume },
                ],
              },
              { model: pegawai },
            ],
          },
        ],
      });
      const totalRows = await pengisianTanki.count({
        where: whereCondition,
      });
      const totalPage = Math.ceil(totalRows / limit);
      return res
        .status(200)
        .json({ success: true, result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postPengisianTanki: async (req, res) => {
    console.log(req.body);
    const {
      tangkiId,
      tanggal,
      flowMeter,
      gross,
      net,
      penampilanVisual,
      warna,
      kandunganAir,
      BSW,
      catatan,
      saksi,
      satuanVolumeId,
      ids,
    } = req.body;
    const transaction = await sequelize.transaction();
    try {
      const result = await pengisianTanki.create(
        {
          tangkiId,
          tanggal,
          flowMeter,
          gross,
          net,
          penampilanVisual,
          warna,
          kandunganAir,
          BSW,
          catatan,
          saksi,
          satuanVolumeId: satuanVolumeId ? parseInt(satuanVolumeId, 10) : null,
        },
        { transaction },
      );

      const konfirmasiIds = parseKonfirmasiIds(ids);
      if (konfirmasiIds.length) {
        await result.setKonfirmasiPenerimaans(konfirmasiIds, { transaction });
      }

      await transaction.commit();

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "pengisianTanki:created",
        title: "Pengisian Tanki",
        description: `Pengisian tanki baru dicatat (gross: ${gross}, net: ${net})`,
        entity: "pengisianTanki",
        entityId: result.id,
      });

      return res.status(200).json({
        message: "berhasil tambah data",
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({
        message: err,
      });
    }
  },

  getAllTanki: async (req, res) => {
    try {
      const result = await tanki.findAll({
        order: [["kode", "ASC"]],
        include: [
          { model: daftarUnitKerja },
          { model: stasiunPengumpulMinyak },
          { model: satuanVolume },
        ],
      });
      const resultSatuanVolume = await satuanVolume.findAll({
        order: [["id", "ASC"]],
      });
      const resultStasiunPengumpulMinyak = await stasiunPengumpulMinyak.findAll(
        { order: [["nama", "ASC"]] },
      );
      return res.status(200).json({
        result,
        resultSatuanVolume,
        resultStasiunPengumpulMinyak,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getKonfirmasiPenerimaan: async (req, res) => {
    try {
      const result = await konfirmasiPenerimaan.findAll({
        include: [
          {
            model: suratJalan,
            include: [
              { model: mitra },
              { model: transportir },
              { model: satuanVolume },
            ],
          },
          { model: pegawai },
          {
            model: pengisianTanki,
            through: { attributes: [] },
            include: [{ model: tanki, attributes: ["id", "kode"] }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getUjiLabK3S: async (req, res) => {
    const { tangkiId } = req.query;
    const whereCondition = {};

    if (tangkiId) {
      const parsed = parseInt(tangkiId, 10);
      if (!parsed) {
        return res.status(400).json({ error: "ID tanki tidak valid" });
      }
      whereCondition.tangkiId = parsed;
    }

    try {
      const result = await ujiLabK3S.findAll({
        where: whereCondition,
        include: [
          { model: tanki, attributes: ["id", "kode"] },
          { model: BABongkar, attributes: ["id", "tanggal"] },
        ],
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  postUjiLabK3S: async (req, res) => {
    const { tangkiId, tanggal, api, BSNW, suhu, sg, kualitas } = req.body;

    const parsedTangkiId = parseInt(tangkiId, 10);
    const apiValue = parseDecimalInput(api);
    const bsnwValue = parseDecimalInput(BSNW);
    const suhuValue = parseDecimalInput(suhu);
    const sgValue = parseDecimalInput(sg);
    const kualitasValue = String(kualitas || "")
      .trim()
      .toUpperCase();

    if (
      !parsedTangkiId ||
      apiValue === null ||
      bsnwValue === null ||
      suhuValue === null ||
      sgValue === null ||
      !["OFFSPEC", "ONSPEC"].includes(kualitasValue)
    ) {
      return res.status(400).json({
        error:
          "Tanki, API, BSNW, suhu, SG, dan kualitas (OFFSPEC/ONSPEC) wajib diisi",
      });
    }

    try {
      const tank = await tanki.findByPk(parsedTangkiId);
      if (!tank) {
        return res.status(404).json({ error: "Tanki tidak ditemukan" });
      }

      let foto = null;
      if (req.file) {
        foto = `/uji-lab-k3s/${req.file.filename}`;
      }

      const result = await ujiLabK3S.create({
        tangkiId: parsedTangkiId,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        foto,
        api: apiValue,
        BSNW: bsnwValue,
        suhu: suhuValue,
        sg: sgValue,
        kualitas: kualitasValue,
      });

      const created = await ujiLabK3S.findByPk(result.id, {
        include: [
          { model: tanki, attributes: ["id", "kode"] },
          { model: BABongkar, attributes: ["id", "tanggal"] },
        ],
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "ujiLabK3S:created",
        title: "Uji Lab K3S",
        description: `Uji lab tanki ${tank.kode} dicatat (${kualitasValue})`,
        entity: "ujiLabK3S",
        entityId: result.id,
      });

      return res.status(200).json({
        message: "Uji lab K3S berhasil disimpan",
        result: created,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteUjiLabK3S: async (req, res) => {
    const { id } = req.params;

    try {
      const existing = await ujiLabK3S.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Data uji lab tidak ditemukan" });
      }

      if (existing.BABongkarId) {
        return res.status(400).json({
          error:
            "Uji lab yang sudah dipakai untuk BA Bongkar tidak dapat dihapus",
        });
      }

      await ujiLabK3S.destroy({ where: { id } });
      return res.status(200).json({ message: "Uji lab K3S berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  postBAK3S: async (req, res) => {
    const BABongkarId = parseInt(req.body.BABongkarId, 10);
    if (!BABongkarId) {
      return res.status(400).json({ error: "BA Bongkar wajib dipilih" });
    }

    const parsed = parseBak3sPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    try {
      const ba = await BABongkar.findByPk(BABongkarId);
      if (!ba) {
        return res.status(404).json({ error: "BA Bongkar tidak ditemukan" });
      }

      const existing = await BAK3S.findOne({ where: { BABongkarId } });
      if (existing) {
        return res.status(400).json({
          error: "BA Bongkar ini sudah memiliki BAK3S",
        });
      }

      const dokumen = req.file ? `/bak3s/${req.file.filename}` : null;
      const result = await BAK3S.create({
        BABongkarId,
        dokumen,
        api: parsed.api,
        BSNW: parsed.BSNW,
        produksi: parsed.produksi,
        sg: parsed.sg,
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "BAK3S:created",
        title: "BAK3S",
        description: `BAK3S dibuat untuk BA Bongkar #${BABongkarId}`,
        entity: "BAK3S",
        entityId: result.id,
      });

      return res.status(200).json({
        message: "BAK3S berhasil disimpan",
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  editBAK3S: async (req, res) => {
    const { id } = req.params;
    const parsed = parseBak3sPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    try {
      const existing = await BAK3S.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "BAK3S tidak ditemukan" });
      }

      let dokumen = existing.dokumen;
      if (req.file) {
        deletePublicFile(existing.dokumen);
        dokumen = `/bak3s/${req.file.filename}`;
      }

      await BAK3S.update(
        {
          dokumen,
          api: parsed.api,
          BSNW: parsed.BSNW,
          produksi: parsed.produksi,
          sg: parsed.sg,
        },
        { where: { id } },
      );

      const result = await BAK3S.findByPk(id);
      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "BAK3S:updated",
        title: "BAK3S Diperbarui",
        description: `BAK3S BA Bongkar #${existing.BABongkarId} diperbarui`,
        entity: "BAK3S",
        entityId: result.id,
      });

      return res.status(200).json({
        message: "BAK3S berhasil diperbarui",
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteBAK3S: async (req, res) => {
    const { id } = req.params;

    try {
      const existing = await BAK3S.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "BAK3S tidak ditemukan" });
      }

      deletePublicFile(existing.dokumen);
      await BAK3S.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "BAK3S:deleted",
        title: "BAK3S Dihapus",
        description: `BAK3S BA Bongkar #${existing.BABongkarId} dihapus`,
        entity: "BAK3S",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "BAK3S berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  addTanki: async (req, res) => {
    const {
      unitKerjaId,
      stasiunPengumpulMinyakId,
      kode,
      kapasitas,
      factorTank,
      satuanVolumeId,
    } = req.body;
    try {
      const filePath = "tanki";
      let foto = null;
      if (req.file) {
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }
      const result = await tanki.create({
        unitKerjaId: unitKerjaId ? parseInt(unitKerjaId, 10) : null,
        stasiunPengumpulMinyakId: stasiunPengumpulMinyakId
          ? parseInt(stasiunPengumpulMinyakId, 10)
          : null,
        kode,
        kapasitas: parseInt(kapasitas),
        foto,
        factorTank: parseFactorTank(factorTank),
        satuanVolumeId: satuanVolumeId ? parseInt(satuanVolumeId, 10) : null,
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "tanki:created",
        title: "Tanki Baru",
        description: `Tanki ${kode} ditambahkan`,
        entity: "tanki",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  editTanki: async (req, res) => {
    const { id } = req.params;
    const {
      unitKerjaId,
      stasiunPengumpulMinyakId,
      kode,
      kapasitas,
      factorTank,
      satuanVolumeId,
    } = req.body;
    try {
      const existing = await tanki.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Tanki tidak ditemukan" });
      }

      const filePath = "tanki";
      let foto = existing.foto;
      if (req.file) {
        foto = `/${filePath}/${req.file.filename}`;
      }

      await tanki.update(
        {
          unitKerjaId: unitKerjaId
            ? parseInt(unitKerjaId, 10)
            : existing.unitKerjaId,
          stasiunPengumpulMinyakId: stasiunPengumpulMinyakId
            ? parseInt(stasiunPengumpulMinyakId, 10)
            : null,
          kode,
          kapasitas: parseInt(kapasitas),
          foto,
          factorTank: parseFactorTank(factorTank),
          satuanVolumeId: satuanVolumeId ? parseInt(satuanVolumeId, 10) : null,
        },
        { where: { id } },
      );

      const result = await tanki.findByPk(id, {
        include: [
          { model: daftarUnitKerja },
          { model: stasiunPengumpulMinyak },
          { model: satuanVolume },
        ],
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "tanki:updated",
        title: "Tanki Diperbarui",
        description: `Data tanki ${kode} diperbarui`,
        entity: "tanki",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteTanki: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await tanki.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Tanki tidak ditemukan" });
      }

      const pengisianCount = await pengisianTanki.count({
        where: { tangkiId: id },
      });
      if (pengisianCount > 0) {
        return res.status(400).json({
          error:
            "Tanki masih memiliki riwayat pengisian dan tidak dapat dihapus.",
        });
      }

      await tanki.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "tanki:deleted",
        title: "Tanki Dihapus",
        description: `Tanki ${existing.kode} dihapus`,
        entity: "tanki",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Tanki berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  postBABongkar: async (req, res) => {
    const { tanggal } = req.body;
    const tankiGroups = parseTankiBAPayload(req.body);

    if (!tanggal) {
      return res
        .status(400)
        .json({ message: "Tanggal BA Bongkar wajib diisi" });
    }

    const pengisianIds = [
      ...new Set(tankiGroups.flatMap((group) => group.ids)),
    ];

    if (!pengisianIds.length) {
      return res
        .status(400)
        .json({ message: "Minimal satu pengisian tanki harus dipilih" });
    }

    const transaction = await sequelize.transaction();
    let committed = false;

    try {
      const pengisianList = await pengisianTanki.findAll({
        where: { id: { [Op.in]: pengisianIds } },
        include: pengisianIncludeForBA,
        transaction,
      });

      if (pengisianList.length !== pengisianIds.length) {
        throw new Error("Beberapa data pengisian tanki tidak ditemukan");
      }

      const sudahAdaBA = pengisianList.filter((item) => item.BABongkarId);
      if (sudahAdaBA.length) {
        throw new Error(
          "Beberapa pengisian tanki sudah memiliki BA Bongkar",
        );
      }

      const pengisianById = new Map(
        pengisianList.map((item) => [item.id, item]),
      );
      const resolvedGroups = [];

      for (const group of tankiGroups) {
        const items = group.ids.map((id) => pengisianById.get(id)).filter(Boolean);
        const tangkiIds = [
          ...new Set(
            items
              .map((item) => item.tangkiId ?? item.tanki?.id)
              .filter(Boolean),
          ),
        ];

        if (group.tangkiId) {
          const mismatch = items.find(
            (item) => (item.tangkiId ?? item.tanki?.id) !== group.tangkiId,
          );
          if (mismatch) {
            throw new Error(
              "Pengisian tanki tidak sesuai dengan tanki yang dipilih",
            );
          }
        }

        if (tangkiIds.length !== 1 && !group.tangkiId) {
          for (const tangkiId of tangkiIds) {
            const groupItems = items.filter(
              (item) => (item.tangkiId ?? item.tanki?.id) === tangkiId,
            );
            resolvedGroups.push({
              tangkiId,
              ids: groupItems.map((item) => item.id),
              ukuranCairan: group.ukuranCairan,
              ukuranAir: group.ukuranAir,
            });
          }
        } else {
          resolvedGroups.push({
            tangkiId: group.tangkiId || tangkiIds[0],
            ids: group.ids,
            ukuranCairan: group.ukuranCairan,
            ukuranAir: group.ukuranAir,
          });
        }
      }

      const ujiLabs = await assertTankiSiapBABongkar(
        resolvedGroups.map((group) => group.tangkiId),
        transaction,
      );

      const firstUkuran = parseUkuranBA(
        resolvedGroups[0]?.ukuranCairan,
        resolvedGroups[0]?.ukuranAir,
      );

      const resultBA = await BABongkar.create(
        {
          tanggal,
          ukuranCairan: firstUkuran.parsedUkuranCairan,
          ukuranAir: firstUkuran.parsedUkuranAir,
        },
        { transaction },
      );

      await BABongkarTanki.bulkCreate(
        resolvedGroups.map((group) => {
          const ukuran = parseUkuranBA(group.ukuranCairan, group.ukuranAir);
          return {
            BABongkarId: resultBA.id,
            tangkiId: group.tangkiId,
            ukuranCairan: ukuran.parsedUkuranCairan,
            ukuranAir: ukuran.parsedUkuranAir,
          };
        }),
        { transaction },
      );

      await pengisianTanki.update(
        { BABongkarId: resultBA.id },
        {
          where: { id: { [Op.in]: pengisianIds } },
          transaction,
        },
      );

      await ujiLabK3S.update(
        { BABongkarId: resultBA.id },
        {
          where: { id: { [Op.in]: ujiLabs.map((item) => item.id) } },
          transaction,
        },
      );

      await transaction.commit();
      committed = true;

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "baBongkar:created",
        title: "BA Bongkar",
        description: `BA Bongkar dibuat untuk ${resolvedGroups.length} tanki (${pengisianIds.length} pengisian)`,
        entity: "BABongkar",
        entityId: resultBA.id,
      });

      const ukuranLookup = buildUkuranLookup(resultBA, resolvedGroups);
      const data = buildBABongkarRows(pengisianList, ukuranLookup);
      const buffer = generateBABongkarBuffer(tanggal, data);
      const outputFileName = `BA_Bongkar_${Date.now()}.docx`;

      sendDocxDownload(res, buffer, outputFileName);
    } catch (err) {
      if (!committed) {
        await transaction.rollback();
      }
      console.error("Error membuat BA Bongkar:", err);
      return res.status(500).json({
        message: err.message || "Gagal membuat BA Bongkar",
      });
    }
  },

  cetakBABongkar: async (req, res) => {
    try {
      const { BABongkarId } = req.body;

      if (!BABongkarId) {
        return res
          .status(400)
          .json({ message: "ID BA Bongkar wajib diisi" });
      }

      const baId = parseInt(BABongkarId, 10);
      const dataBA = await BABongkar.findByPk(baId);

      if (!dataBA) {
        return res
          .status(404)
          .json({ message: "BA Bongkar tidak ditemukan" });
      }

      const pengisianList = await pengisianTanki.findAll({
        where: { BABongkarId: baId },
        include: pengisianIncludeForBA,
        order: [["id", "ASC"]],
      });

      if (!pengisianList.length) {
        return res.status(404).json({
          message: "Data pengisian tanki untuk BA Bongkar tidak ditemukan",
        });
      }

      const tankiDetails = await BABongkarTanki.findAll({
        where: { BABongkarId: baId },
      });
      const ukuranLookup = buildUkuranLookup(dataBA, tankiDetails);
      const data = buildBABongkarRows(pengisianList, ukuranLookup);
      const buffer = generateBABongkarBuffer(dataBA.tanggal, data);
      const outputFileName = `BA_Bongkar_${baId}_${Date.now()}.docx`;

      sendDocxDownload(res, buffer, outputFileName);
    } catch (err) {
      console.error("Error cetak ulang BA Bongkar:", err);
      return res.status(500).json({
        message: err.message || "Gagal mencetak ulang BA Bongkar",
      });
    }
  },

  cetakBAST: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID pengisian tanki wajib diisi" });
      }

      const dataPengisian = await pengisianTanki.findOne({
        where: { id: parseInt(id, 10) },
        include: [
          { model: tanki },
          {
            model: konfirmasiPenerimaan,
            through: { attributes: [] },
            include: [
              {
                model: suratJalan,
                include: [
                  { model: transportir },
                  { model: supir },
                  { model: mitra, include: [{ model: jenisMitra }] },
                ],
              },
              { model: pegawai },
            ],
          },
        ],
      });

      if (!dataPengisian) {
        return res
          .status(404)
          .json({ message: "Data pengisian tanki tidak ditemukan" });
      }

      const konfirmasiList = dataPengisian.konfirmasiPenerimaans || [];
      let nomorBAST = dataPengisian.nomorSurat;

      if (!nomorBAST) {
        const kpPertama = konfirmasiList[0];
        const mitraData = kpPertama?.suratJalan?.mitra;

        if (!mitraData) {
          return res.status(400).json({
            message: "Data mitra tidak ditemukan untuk generate nomor BAST",
          });
        }
        if (!mitraData.jenisMitra?.kode || !mitraData.kode) {
          return res.status(400).json({
            message: "Kode jenis mitra atau kode mitra tidak ditemukan",
          });
        }

        const dbNoBAST = await nomorSuratKPBPN.findOne({ where: { id: 2 } });

        if (!dbNoBAST) {
          return res.status(500).json({
            message: "Template nomor surat BAST tidak ditemukan",
          });
        }

        const tanggalNomor =
          dataPengisian.tanggal ||
          kpPertama?.tanggal ||
          kpPertama?.suratJalan?.tanggal ||
          dataPengisian.createdAt ||
          new Date();

        const kodeMitra = `${mitraData.jenisMitra.kode}-${mitraData.kode}`;
        const nomorUrut = parseInt(mitraData.nomorUrut, 10) + 1;

        nomorBAST = dbNoBAST.nomor
          .replace("NOMOR", nomorUrut.toString())
          .replace("BULAN", getRomanMonth(new Date(tanggalNomor)))
          .replace("TAHUN", "2026")
          .replace("KODE", kodeMitra);

        await mitra.update({ nomorUrut }, { where: { id: mitraData.id } });

        await pengisianTanki.update(
          { nomorSurat: nomorBAST },
          { where: { id: parseInt(id, 10) } },
        );
      }
      const grossNum = parseInt(dataPengisian.gross, 10) || 0;
      const netNum = parseInt(dataPengisian.net, 10) || 0;
      const tanggalSumber =
        dataPengisian.tanggal || dataPengisian.createdAt || new Date();
      const tanggalObj = new Date(tanggalSumber);

      const data = konfirmasiList.map((kp, index) => ({
        no: index + 1,
        noPol: kp.suratJalan?.transportir?.plat || "-",
        nama: kp.suratJalan?.supir?.nama || kp.suratJalan?.mitra?.nama || "-",
        kapasitas:
          kp.suratJalan?.transportir?.kapasitas ??
          kp.volume ??
          kp.suratJalan?.volume ??
          "-",
      }));

      const templatePath = path.join(
        __dirname,
        "../public/BAST/BAST-template.docx",
      );

      if (!fs.existsSync(templatePath)) {
        throw new Error("Template BAST tidak ditemukan");
      }

      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        nomor: nomorBAST,
        tanggal: formatTanggal(tanggalSumber),
        jam: tanggalObj.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        beratJenis: dataPengisian.flowMeter ?? "-",
        penampilan: dataPengisian.penampilanVisual ?? "-",
        warna: dataPengisian.warna ?? "-",
        air: dataPengisian.kandunganAir ?? "-",
        BSW: dataPengisian.BSW ?? "-",
        gross: dataPengisian.gross ?? 0,
        net: dataPengisian.net ?? 0,
        loss: grossNum - netNum,
        catatan: dataPengisian.catatan ?? "-",
        data,
      });

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const outputFileName = `BAST_${Date.now()}.docx`;
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
    } catch (err) {
      console.error("Error generating BAST:", err);
      return res.status(500).json({
        message: err.message || err.toString(),
        code: 500,
      });
    }
  },
  editPengisianTanki: async (req, res) => {
    const { id } = req.params;
    const {
      tangkiId,
      tanggal,
      flowMeter,
      gross,
      net,
      penampilanVisual,
      warna,
      kandunganAir,
      BSW,
      catatan,
      saksi,
      satuanVolumeId,
      nomorSurat,
      ids,
    } = req.body;
    const transaction = await sequelize.transaction();

    try {
      const existing = await pengisianTanki.findByPk(id, { transaction });

      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Data pengisian tanki tidak ditemukan",
        });
      }

      const nomorSuratValue =
        nomorSurat === undefined
          ? existing.nomorSurat
          : String(nomorSurat).trim() || null;

      await pengisianTanki.update(
        {
          tangkiId,
          tanggal,
          flowMeter,
          gross,
          net,
          penampilanVisual,
          warna,
          kandunganAir,
          BSW,
          catatan,
          saksi,
          nomorSurat: nomorSuratValue,
          satuanVolumeId: satuanVolumeId
            ? parseInt(satuanVolumeId, 10)
            : null,
        },
        { where: { id }, transaction },
      );

      await existing.setKonfirmasiPenerimaans(parseKonfirmasiIds(ids), {
        transaction,
      });

      await transaction.commit();

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "pengisianTanki:updated",
        title: "Pengisian Tanki",
        description: `Data pengisian tanki #${id} diperbarui`,
        entity: "pengisianTanki",
        entityId: parseInt(id, 10),
      });

      return res.status(200).json({
        message: "Data pengisian tanki berhasil diperbarui",
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({
        message: err.message || err.toString(),
      });
    }
  },

  deletePengisianTanki: async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const existing = await pengisianTanki.findByPk(id, { transaction });

      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Data pengisian tanki tidak ditemukan",
        });
      }

      if (existing.BABongkarId) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Pengisian tanki sudah memiliki BA Bongkar dan tidak dapat dihapus",
        });
      }

      if (existing.nomorSurat) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Pengisian tanki sudah memiliki nomor surat BAST dan tidak dapat dihapus",
        });
      }

      await existing.setKonfirmasiPenerimaans([], { transaction });
      await pengisianTanki.destroy({ where: { id }, transaction });
      await transaction.commit();

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "pengisianTanki:deleted",
        title: "Pengisian Tanki",
        description: `Data pengisian tanki #${id} dihapus`,
        entity: "pengisianTanki",
        entityId: parseInt(id, 10),
      });

      return res.status(200).json({
        message: "Data pengisian tanki berhasil dihapus",
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({
        message: err.message || err.toString(),
      });
    }
  },

  getStokOpname: async (req, res) => {
    const { startDate, endDate, tangkiId } = req.query;

    try {
      const parsedTangkiId = tangkiId ? parseInt(tangkiId, 10) : null;

      const buildDateRange = () => {
        const range = {};
        if (startDate) {
          range[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          range[Op.lte] = end;
        }
        return Object.keys(range).length ? range : null;
      };

      const toDateKey = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().split("T")[0];
      };

      const pengisianWhere = {};
      const pengisianDateRange = buildDateRange();
      if (pengisianDateRange) {
        pengisianWhere.tanggal = pengisianDateRange;
      }
      if (parsedTangkiId) {
        pengisianWhere.tangkiId = parsedTangkiId;
      }

      const baWhere = {};
      const baDateRange = buildDateRange();
      if (baDateRange) {
        baWhere.tanggal = baDateRange;
      }

      const SATUAN = "barrel";

      const calcKeluarBarrel = (ukuranCairan, ukuranAir, factorTank) => {
        const ukuran = parseUkuranBA(ukuranCairan, ukuranAir);
        const factor = Number(factorTank);
        if (
          ukuran.uMin === null ||
          Number.isNaN(factor) ||
          factor <= 0
        ) {
          return 0;
        }
        return roundBarrelVolume(ukuran.uMin * factor);
      };

      const pengisianInclude = [
        { model: tanki },
        {
          model: BABongkar,
          include: [{ model: BABongkarTanki }],
        },
        { model: satuanVolume },
      ];

      const baPengisianWhere = parsedTangkiId
        ? { tangkiId: parsedTangkiId }
        : undefined;

      const [pengisianList, baList] = await Promise.all([
        pengisianTanki.findAll({
          where: pengisianWhere,
          include: pengisianInclude,
          order: [
            ["tanggal", "ASC"],
            ["id", "ASC"],
          ],
        }),
        BABongkar.findAll({
          where: baWhere,
          include: [
            {
              model: pengisianTanki,
              where: baPengisianWhere,
              required: Boolean(parsedTangkiId),
              include: [{ model: tanki }],
            },
            { model: BABongkarTanki },
          ],
          order: [
            ["tanggal", "ASC"],
            ["id", "ASC"],
          ],
        }),
      ]);

      const rowMap = new Map();

      const getOrCreateRow = (dateKey, tangkiIdValue, tankInfo = {}) => {
        const key = `${dateKey}|${tangkiIdValue}`;
        if (!rowMap.has(key)) {
          rowMap.set(key, {
            tanggal: dateKey,
            tangkiId: tangkiIdValue,
            kode: tankInfo.kode || "-",
            satuan: SATUAN,
            masuk: 0,
            keluar: 0,
            jumlahMasuk: 0,
            jumlahKeluar: 0,
            ukuranCairan: null,
            ukuranAir: null,
            baIds: [],
            detailMasuk: [],
            detailKeluar: [],
          });
        }

        const row = rowMap.get(key);
        if ((!row.kode || row.kode === "-") && tankInfo.kode) {
          row.kode = tankInfo.kode;
        }
        row.satuan = SATUAN;
        return row;
      };

      for (const item of pengisianList) {
        const dateKey = toDateKey(item.tanggal || item.createdAt);
        const tangkiIdValue = item.tangkiId ?? item.tanki?.id;
        if (!dateKey || !tangkiIdValue) continue;

        const row = getOrCreateRow(dateKey, tangkiIdValue, {
          kode: item.tanki?.kode,
        });

        const satuanAsli = item.satuanVolume?.satuan || "Barrel";
        const grossBarrel = roundBarrelVolume(
          convertVolumeToBarrel(item.gross, satuanAsli),
        );
        const netBarrel = roundBarrelVolume(
          convertVolumeToBarrel(item.net, satuanAsli),
        );

        row.masuk += grossBarrel;
        row.jumlahMasuk += 1;
        row.detailMasuk.push({
          id: item.id,
          gross: item.gross,
          net: item.net,
          grossBarrel,
          netBarrel,
          satuan: satuanAsli,
          tanggal: item.tanggal || item.createdAt,
          BABongkarId: item.BABongkarId,
        });
      }

      for (const ba of baList) {
        const dateKey = toDateKey(ba.tanggal);
        if (!dateKey) continue;

        const byTank = new Map();
        for (const item of ba.pengisianTankis || []) {
          const tangkiIdValue = item.tangkiId ?? item.tanki?.id;
          if (!tangkiIdValue) continue;

          if (!byTank.has(tangkiIdValue)) {
            byTank.set(tangkiIdValue, {
              kode: item.tanki?.kode,
              factorTank: item.tanki?.factorTank,
              pengisianIds: [],
            });
          }

          const group = byTank.get(tangkiIdValue);
          group.pengisianIds.push(item.id);
        }

        for (const [tangkiIdValue, group] of byTank.entries()) {
          const row = getOrCreateRow(dateKey, tangkiIdValue, {
            kode: group.kode,
          });

          const ukuranDetail = (ba.BABongkarTankis || []).find(
            (detail) => detail.tangkiId === tangkiIdValue,
          );
          const ukuranCairan =
            ukuranDetail?.ukuranCairan ?? ba.ukuranCairan;
          const ukuranAir = ukuranDetail?.ukuranAir ?? ba.ukuranAir;

          const volumeKeluar = calcKeluarBarrel(
            ukuranCairan,
            ukuranAir,
            group.factorTank,
          );

          row.keluar += volumeKeluar;
          row.jumlahKeluar += 1;

          if (row.ukuranCairan === null && ukuranCairan !== null) {
            row.ukuranCairan = ukuranCairan;
          }
          if (row.ukuranAir === null && ukuranAir !== null) {
            row.ukuranAir = ukuranAir;
          }

          if (!row.baIds.includes(ba.id)) {
            row.baIds.push(ba.id);
          }

          row.detailKeluar.push({
            baId: ba.id,
            ukuranCairan,
            ukuranAir,
            volume: volumeKeluar,
            pengisianIds: group.pengisianIds,
          });
        }
      }

      const result = Array.from(rowMap.values())
        .map((row) => {
          const masuk = roundBarrelVolume(row.masuk);
          const keluar = roundBarrelVolume(row.keluar);
          return {
            ...row,
            masuk,
            keluar,
            selisih: roundBarrelVolume(masuk - keluar),
          };
        })
        .sort((a, b) => {
          if (a.tanggal !== b.tanggal) {
            return b.tanggal.localeCompare(a.tanggal);
          }
          return String(a.kode).localeCompare(String(b.kode), "id");
        });

      return res.status(200).json({
        success: true,
        result,
        totalRows: result.length,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getTankiMonitoring: async (req, res) => {
    try {
      const result = await tanki.findAll({
        include: [
          {
            model: daftarUnitKerja,
          },
          { model: satuanVolume },
          {
            model: pengisianTanki,
            where: {
              BABongkarId: null,
            },
            required: true,
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
