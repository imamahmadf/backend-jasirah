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
  BAPenerimaan,
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
    include: [
      {
        model: suratJalan,
        include: [{ model: transportir }, { model: supir }],
      },
    ],
  },
];

const baPenerimaanPengisianInclude = [
  { model: tanki },
  { model: satuanVolume },
  {
    model: konfirmasiPenerimaan,
    include: [
      {
        model: suratJalan,
        include: [{ model: mitra }, { model: supir }, { model: transportir }],
      },
      { model: pegawai },
    ],
  },
];

const buildBAPenerimaanWhere = async ({ startDate, endDate, tangkiId, baId }) => {
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
        BAPenerimaanId: { [Op.ne]: null },
      },
      attributes: ["BAPenerimaanId"],
      group: ["BAPenerimaanId"],
      raw: true,
    });

    const baIds = pengisianWithBA
      .map((item) => item.BAPenerimaanId)
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

const buildUkuranDoc = ({ parsedUkuranCairan, parsedUkuranAir, uMin }) => ({
  uCair: parsedUkuranCairan ?? "-",
  uAir: parsedUkuranAir ?? "-",
  uMin: uMin ?? "-",
});

const buildFactorDocFields = (ukuranDoc, factorTank) => {
  const factor =
    factorTank !== null && factorTank !== undefined && factorTank !== ""
      ? parseInt(factorTank, 10)
      : null;
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

const buildBAPenerimaanRows = (pengisianList, ukuranDoc) => {
  const nopolList = [];
  const driverList = [];
  const noTankiList = [];

  for (const pengisian of pengisianList) {
    const kodeTanki = pengisian.tanki?.kode;
    if (kodeTanki) noTankiList.push(kodeTanki);

    for (const kp of pengisian.konfirmasiPenerimaans || []) {
      const plat = kp.suratJalan?.transportir?.plat;
      const namaSupir = kp.suratJalan?.supir?.nama;
      if (plat) nopolList.push(plat);
      if (namaSupir) driverList.push(namaSupir);
    }
  }

  const factorTank = pengisianList.find((item) => item.tanki?.factorTank != null)
    ?.tanki?.factorTank;
  const docFields = buildFactorDocFields(ukuranDoc, factorTank);

  return [
    {
      nopol: joinUniqueValues(nopolList),
      driver: joinUniqueValues(driverList),
      noTanki: joinUniqueValues(noTankiList),
      ...docFields,
    },
  ];
};

const generateBAPenerimaanBuffer = (tanggal, data) => {
  const templatePath = path.join(
    __dirname,
    "../public/BAST/BAPenerimaan-template.docx",
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template BA Penerimaan tidak ditemukan");
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
  getAllBAPenerimaan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const { startDate, endDate, tangkiId, baId } = req.query;

    try {
      const { whereCondition, emptyResult } = await buildBAPenerimaanWhere({
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

      const result = await BAPenerimaan.findAll({
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
            include: baPenerimaanPengisianInclude,
          },
        ],
      });

      const totalRows = await BAPenerimaan.count({ where: whereCondition });
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
          { model: BAPenerimaan },
          { model: satuanVolume },
          {
            model: konfirmasiPenerimaan,
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

      if (ids?.length) {
        await konfirmasiPenerimaan.update(
          { pengisianTankiId: result.id },
          {
            where: { id: { [Op.in]: ids } },
            transaction,
          },
        );
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
        include: [{ model: daftarUnitKerja }],
      });
      const resultSatuanVolume = await satuanVolume.findAll({
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ result, resultSatuanVolume });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getKonfirmasiPenerimaan: async (req, res) => {
    try {
      const result = await konfirmasiPenerimaan.findAll({
        where: { pengisianTankiId: null },
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
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  addTanki: async (req, res) => {
    const { unitKerjaId, kode, kapasitas, factorTank } = req.body;
    try {
      const filePath = "tanki";
      let foto = null;
      if (req.file) {
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }
      const result = await tanki.create({
        unitKerjaId: parseInt(unitKerjaId),
        kode,
        kapasitas: parseInt(kapasitas),
        foto,
        factorTank,
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
    const { unitKerjaId, kode, kapasitas, factorTank } = req.body;
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
          unitKerjaId: parseInt(unitKerjaId),
          kode,
          kapasitas: parseInt(kapasitas),
          foto,
          factorTank,
        },
        { where: { id } },
      );

      const result = await tanki.findByPk(id, {
        include: [{ model: daftarUnitKerja }],
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

  postBAPenerimaan: async (req, res) => {
    const { tanggal, ukuranCairan, ukuranAir, ids } = req.body;

    if (!tanggal) {
      return res
        .status(400)
        .json({ message: "Tanggal BA Penerimaan wajib diisi" });
    }

    if (!ids?.length) {
      return res
        .status(400)
        .json({ message: "Minimal satu pengisian tanki harus dipilih" });
    }

    const transaction = await sequelize.transaction();
    let committed = false;

    try {
      const pengisianIds = ids.map((id) => parseInt(id, 10));
      const pengisianList = await pengisianTanki.findAll({
        where: { id: { [Op.in]: pengisianIds } },
        include: pengisianIncludeForBA,
        transaction,
      });

      if (pengisianList.length !== pengisianIds.length) {
        throw new Error("Beberapa data pengisian tanki tidak ditemukan");
      }

      const sudahAdaBA = pengisianList.filter((item) => item.BAPenerimaanId);
      if (sudahAdaBA.length) {
        throw new Error(
          "Beberapa pengisian tanki sudah memiliki BA Penerimaan",
        );
      }

      const ukuran = parseUkuranBA(ukuranCairan, ukuranAir);

      const resultBA = await BAPenerimaan.create(
        {
          tanggal,
          ukuranCairan: ukuran.parsedUkuranCairan,
          ukuranAir: ukuran.parsedUkuranAir,
        },
        { transaction },
      );

      await pengisianTanki.update(
        { BAPenerimaanId: resultBA.id },
        {
          where: { id: { [Op.in]: pengisianIds } },
          transaction,
        },
      );

      await transaction.commit();
      committed = true;

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "baPenerimaan:created",
        title: "BA Penerimaan",
        description: `BA Penerimaan dibuat untuk ${pengisianIds.length} pengisian tanki`,
        entity: "BAPenerimaan",
        entityId: resultBA.id,
      });

      const ukuranDoc = buildUkuranDoc(ukuran);
      const data = buildBAPenerimaanRows(pengisianList, ukuranDoc);
      const buffer = generateBAPenerimaanBuffer(tanggal, data);
      const outputFileName = `BA_Penerimaan_${Date.now()}.docx`;

      sendDocxDownload(res, buffer, outputFileName);
    } catch (err) {
      if (!committed) {
        await transaction.rollback();
      }
      console.error("Error membuat BA Penerimaan:", err);
      return res.status(500).json({
        message: err.message || "Gagal membuat BA Penerimaan",
      });
    }
  },

  cetakBAPenerimaan: async (req, res) => {
    try {
      const { BAPenerimaanId } = req.body;

      if (!BAPenerimaanId) {
        return res
          .status(400)
          .json({ message: "ID BA Penerimaan wajib diisi" });
      }

      const baId = parseInt(BAPenerimaanId, 10);
      const dataBA = await BAPenerimaan.findByPk(baId);

      if (!dataBA) {
        return res
          .status(404)
          .json({ message: "BA Penerimaan tidak ditemukan" });
      }

      const pengisianList = await pengisianTanki.findAll({
        where: { BAPenerimaanId: baId },
        include: pengisianIncludeForBA,
        order: [["id", "ASC"]],
      });

      if (!pengisianList.length) {
        return res.status(404).json({
          message: "Data pengisian tanki untuk BA Penerimaan tidak ditemukan",
        });
      }

      const ukuranDoc = buildUkuranDoc(
        parseUkuranBA(dataBA.ukuranCairan, dataBA.ukuranAir),
      );
      const data = buildBAPenerimaanRows(pengisianList, ukuranDoc);
      const buffer = generateBAPenerimaanBuffer(dataBA.tanggal, data);
      const outputFileName = `BA_Penerimaan_${baId}_${Date.now()}.docx`;

      sendDocxDownload(res, buffer, outputFileName);
    } catch (err) {
      console.error("Error cetak ulang BA Penerimaan:", err);
      return res.status(500).json({
        message: err.message || "Gagal mencetak ulang BA Penerimaan",
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

      if (existing.BAPenerimaanId) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Pengisian tanki sudah memiliki BA Penerimaan dan tidak dapat diubah",
        });
      }

      if (existing.nomorSurat) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Pengisian tanki sudah memiliki nomor surat BAST dan tidak dapat diubah",
        });
      }

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
          satuanVolumeId: satuanVolumeId
            ? parseInt(satuanVolumeId, 10)
            : null,
        },
        { where: { id }, transaction },
      );

      await konfirmasiPenerimaan.update(
        { pengisianTankiId: null },
        { where: { pengisianTankiId: id }, transaction },
      );

      if (ids?.length) {
        await konfirmasiPenerimaan.update(
          { pengisianTankiId: id },
          {
            where: { id: { [Op.in]: ids } },
            transaction,
          },
        );
      }

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

      if (existing.BAPenerimaanId) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Pengisian tanki sudah memiliki BA Penerimaan dan tidak dapat dihapus",
        });
      }

      if (existing.nomorSurat) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Pengisian tanki sudah memiliki nomor surat BAST dan tidak dapat dihapus",
        });
      }

      await konfirmasiPenerimaan.update(
        { pengisianTankiId: null },
        { where: { pengisianTankiId: id }, transaction },
      );

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

  getTankiMonitoring: async (req, res) => {
    try {
      const result = await tanki.findAll({
        include: [
          {
            model: daftarUnitKerja,
          },
          {
            model: pengisianTanki,
            where: {
              BAPenerimaanId: null,
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
