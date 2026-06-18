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
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const { formatTanggal, getRomanMonth } = require("../lib/perjalananHelpers");

module.exports = {
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
          {
            model: konfirmasiPenerimaan,
            include: [
              {
                model: suratJalan,
                include: [
                  { model: mitra },
                  { model: supir },
                  { model: transportir },
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
      return res.status(200).json({ result });
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
            include: [{ model: mitra }, { model: transportir }],
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
    const { unitKerjaId, kode, kapasitas } = req.body;
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
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  postBAPenerimaan: async (req, res) => {
    const { tanggal, ids } = req.body;

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
        include: [
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
        ],
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

      const resultBA = await BAPenerimaan.create({ tanggal }, { transaction });

      await pengisianTanki.update(
        { BAPenerimaanId: resultBA.id },
        {
          where: { id: { [Op.in]: pengisianIds } },
          transaction,
        },
      );

      await transaction.commit();
      committed = true;

      const tanggalObj = new Date(tanggal);
      const data = [];

      for (const pengisian of pengisianList) {
        const konfirmasiList = pengisian.konfirmasiPenerimaans || [];

        if (!konfirmasiList.length) {
          data.push({
            nopol: "-",
            driver: "-",
            noTanki: pengisian.tanki?.kode || "-",
          });
          continue;
        }

        for (const kp of konfirmasiList) {
          data.push({
            nopol: kp.suratJalan?.transportir?.plat || "-",
            driver: kp.suratJalan?.supir?.nama || "-",
            noTanki: pengisian.tanki?.kode || "-",
          });
        }
      }

      const templatePath = path.join(
        __dirname,
        "../public/BAST/BAPenerimaan-template.docx",
      );

      if (!fs.existsSync(templatePath)) {
        throw new Error("Template BA Penerimaan tidak ditemukan");
      }

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

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const outputFileName = `BA_Penerimaan_${Date.now()}.docx`;
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
      if (!committed) {
        await transaction.rollback();
      }
      console.error("Error membuat BA Penerimaan:", err);
      return res.status(500).json({
        message: err.message || "Gagal membuat BA Penerimaan",
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
                  { model: mitra },
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

        const kodeMitra = mitraData.kode;
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
};
