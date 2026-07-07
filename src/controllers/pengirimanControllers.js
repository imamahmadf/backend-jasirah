const {
  suratJalan,
  mitra,
  transportir,
  supir,
  daftarUnitKerja,
  statusSuratJalan,
  konfirmasiPenerimaan,
  nomorSuratKPBPN,
  jenisTransportir,
  jenisMitra,
  satuanVolume,
  pegawai,
} = require("../models");

const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { buildSuratJalanDocxFromRecord } = require("../utils/suratJalanDocx");
const { getRomanMonth } = require("../lib/perjalananHelpers");
const { sendMessage } = require("../services/waServices");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");
const {
  emitNotifikasiSuratJalanDraft,
} = require("./notifikasiControllers");

const toTimeString = (time) => {
  if (!time) return null;
  const value = String(time).trim();
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  return null;
};

module.exports = {
  getSuratJalan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const mitraId = parseInt(req.query.mitraId);
    const transportirId = parseInt(req.query.transportirId);
    const supirId = parseInt(req.query.supirId);
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const statusSuratJalanId = parseInt(req.query.statusSuratJalanId);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const allowedSortBy = ["tanggal", "nomor", "volume"];
    const sortBy = allowedSortBy.includes(req.query.sortBy)
      ? req.query.sortBy
      : "tanggal";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    const whereCondition = {};

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (supirId) {
      whereCondition.supirId = supirId;
    }
    if (mitraId) {
      whereCondition.mitraId = mitraId;
    }
    if (transportirId) {
      whereCondition.transportirId = transportirId;
    }
    if (statusSuratJalanId) {
      whereCondition.statusSuratJalanId = statusSuratJalanId;
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

    try {
      const result = await suratJalan.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
          { model: mitra },
          { model: transportir },
          { model: daftarUnitKerja },
          { model: supir },
          { model: statusSuratJalan },
          { model: satuanVolume },
        ],
      });

      const totalRows = await suratJalan.count({
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

  getSeed: async (req, res) => {
    try {
      const resultMitra = await mitra.findAll({
        include: [{ model: supir }],
      });
      const resultTransportir = await transportir.findAll({
        include: [{ model: satuanVolume }],
      });
      const resultStatusSuratJalan = await statusSuratJalan.findAll({});
      const resultSatuanVolume = await satuanVolume.findAll({});

      return res.status(200).json({
        resultMitra,
        resultTransportir,
        resultStatusSuratJalan,
        resultSatuanVolume,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addSuratJalan: async (req, res) => {
    const {
      volume,
      satuanVolumeId,
      tanggal,
      mitraId,
      transportirId,
      unitKerjaId,
      supirId,
      jamDatang,
      jamPergi,
    } = req.body;
    console.log("CEK DATA", req.body);
    if (
      !tanggal ||
      !mitraId ||
      !transportirId ||
      !unitKerjaId ||
      !supirId ||
      volume === undefined ||
      volume === "" ||
      !satuanVolumeId
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    try {
      const parsedMitraId = parseInt(mitraId, 10);
      const parsedTransportirId = parseInt(transportirId, 10);
      const parsedSupirId = parseInt(supirId, 10);
      const parsedSatuanVolumeId = parseInt(satuanVolumeId, 10);

      const result = await suratJalan.create({
        volume: parseInt(volume, 10),
        satuanVolumeId: parsedSatuanVolumeId,
        // nomor: nomorBaru,
        tanggal: new Date(tanggal),
        jamDatang: jamDatang,
        jamPergi: jamPergi,
        mitraId: parsedMitraId,
        transportirId: parsedTransportirId,
        unitKerjaId: parseInt(unitKerjaId, 10),
        supirId: parsedSupirId,
        statusSuratJalanId: 1,
      });

      res.status(200).json({
        success: true,
        result,
      });

      const io = req.app.get("socketio");
      setImmediate(async () => {
        try {
          const [mitraData, transportirData, supirData, satuanData] =
            await Promise.all([
              mitra.findByPk(parsedMitraId),
              transportir.findByPk(parsedTransportirId),
              supir.findByPk(parsedSupirId),
              satuanVolume.findByPk(parsedSatuanVolumeId),
            ]);

          if (mitraData?.kontak) {
            const tanggalStr = new Date(tanggal).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const message = [
              "📦 *Notifikasi Surat Jalan*",
              "",
              `Yth. ${mitraData.nama},`,
              "",
              "Surat jalan baru telah dibuat dengan detail berikut:",
              "",
              `• Tanggal: ${tanggalStr}`,
              `• Volume: ${volume} ${satuanData?.satuan || ""}`,
              transportirData?.plat
                ? `• Transportir: ${transportirData.plat}`
                : null,
              supirData?.nama ? `• Supir: ${supirData.nama}` : null,
              jamDatang ? `• Jam Datang: ${jamDatang}` : null,
              jamPergi ? `• Jam Pergi: ${jamPergi}` : null,
              "",
              "Status: DRAFT",
              "",
              "_Pesan otomatis dari sistem Jasirah Diza Berjaya_",
            ]
              .filter(Boolean)
              .join("\n");

            const waResult = await sendMessage(mitraData.kontak, message);
            if (waResult.queued) {
              console.log(
                `📋 WA ke mitra ${mitraData.nama} masuk antrian, akan terkirim setelah WhatsApp siap`,
              );
            } else if (!waResult.success) {
              console.warn(
                `Gagal kirim WA ke mitra ${mitraData.nama}:`,
                waResult.error,
              );
            }
          }

          await notifyDashboardChange(io, {
            type: "suratJalan:created",
            title: "Surat Jalan Baru",
            description: `Surat jalan untuk ${mitraData?.nama || "mitra"} dibuat (DRAFT)`,
            entity: "suratJalan",
            entityId: result.id,
          });
          await emitNotifikasiSuratJalanDraft(io);
        } catch (bgErr) {
          console.error("Background task addSuratJalan:", bgErr);
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  cetakSuratJalan: async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    try {
      const result = await suratJalan.findOne({
        where: { id },
        include: [
          { model: mitra },
          {
            model: transportir,
            include: [{ model: jenisTransportir }, { model: satuanVolume }],
          },
          { model: daftarUnitKerja },
          { model: supir },
          { model: statusSuratJalan },
          { model: satuanVolume },
        ],
      });

      if (!result) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      if (result.statusSuratJalanId === 1) {
        return res.status(400).json({
          error: "Surat jalan berstatus DRAFT belum dapat dicetak",
        });
      }

      let verifikasiCode = result.verifikasi;
      if (!verifikasiCode) {
        verifikasiCode = (
          Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
        ).toUpperCase();

        await suratJalan.update(
          { verifikasi: verifikasiCode },
          { where: { id } },
        );
      }

      const buffer = await buildSuratJalanDocxFromRecord(
        result,
        verifikasiCode,
      );
      const outputFileName = `surat-jalan_${result.nomor || id}_${Date.now()}.docx`;
      const outputPath = path.join(
        __dirname,
        "../public/output",
        outputFileName,
      );

      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      }

      fs.writeFileSync(outputPath, buffer);

      res.download(outputPath, outputFileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          return res.status(500).send("Error generating file");
        }
        fs.unlinkSync(outputPath);
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  verifikasiSuratJalan: async (req, res) => {
    const id = req.params.id;
    const mitraId = parseInt(req.body.mitraId, 10);

    const randomCode = (
      Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
    ).toUpperCase();

    try {
      const [dbSurat, dbMitra, dbNoSurat] = await Promise.all([
        suratJalan.findByPk(id),
        mitra.findByPk(mitraId),
        nomorSuratKPBPN.findOne({ where: { id: 1 } }),
      ]);

      if (!dbSurat) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }
      if (!dbMitra) {
        return res.status(400).json({ error: "Mitra tidak ditemukan" });
      }

      const kodeMitra = dbMitra.kode;
      const nomorUrut = parseInt(dbNoSurat.nomorUrut) + 1;

      const nomorBaru = dbNoSurat.nomor
        .replace("NOMOR", nomorUrut.toString())
        .replace("BULAN", getRomanMonth(new Date(dbSurat.tanggal)))
        .replace("TAHUN", "2026")
        .replace("KODE", kodeMitra);

      await nomorSuratKPBPN.update(
        { nomorUrut }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: 1 } },
      );

      const result = await suratJalan.update(
        {
          verifikasi: randomCode,
          nomor: nomorBaru,
          statusSuratJalanId: 2,
        },
        {
          where: { id },
        },
      );

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "suratJalan:verified",
        title: "Surat Jalan Diverifikasi",
        description: `Surat jalan ${nomorBaru} berstatus KIRIM`,
        entity: "suratJalan",
        entityId: parseInt(id, 10),
      });
      await emitNotifikasiSuratJalanDraft(io);

      return res.status(200).json({
        message: "Surat jalan berhasil diverifikasi",
        verifikasi: randomCode,
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: err.message,
      });
    }
  },

  getKonfirmasiBySuratJalan: async (req, res) => {
    const suratJalanId = parseInt(req.params.suratJalanId, 10);

    if (!suratJalanId) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    try {
      const result = await konfirmasiPenerimaan.findAll({
        where: { suratJalanId },
        include: [
          { model: pegawai },
          {
            model: suratJalan,
            include: [{ model: mitra }, { model: satuanVolume }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addKonfirmasiPenerimaan: async (req, res) => {
    const { suratJalanId, tanggal, volume, pegawaiId, catatan } = req.body;

    if (
      !suratJalanId ||
      !tanggal ||
      volume === undefined ||
      volume === "" ||
      !pegawaiId
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    try {
      const suratJalanData = await suratJalan.findOne({
        where: { id: parseInt(suratJalanId, 10) },
      });

      if (!suratJalanData) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      if (suratJalanData.statusSuratJalanId !== 2) {
        return res.status(400).json({
          error:
            "Konfirmasi hanya dapat dilakukan untuk surat jalan berstatus KIRIM",
        });
      }

      const result = await konfirmasiPenerimaan.create({
        suratJalanId: parseInt(suratJalanId, 10),
        tanggal: new Date(tanggal),
        volume: parseInt(volume, 10),
        pegawaiId: parseInt(pegawaiId, 10),
        catatan: catatan || null,
      });

      await suratJalan.update(
        { statusSuratJalanId: 3 },
        { where: { id: parseInt(suratJalanId, 10) } },
      );

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "konfirmasi:created",
        title: "Konfirmasi Penerimaan",
        description: `Konfirmasi penerimaan surat jalan #${suratJalanId} disimpan`,
        entity: "konfirmasiPenerimaan",
        entityId: result.id,
      });

      return res.status(200).json({
        success: true,
        message: "Konfirmasi penerimaan berhasil disimpan",
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
