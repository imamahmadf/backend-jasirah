const {
  suratJalan,
  mitra,
  transportir,
  supir,
  daftarUnitKerja,
  stasiunPengumpulMinyak,
  asalMinyak,
  statusSuratJalan,
  konfirmasiPenerimaan,
  nomorSuratKPBPN,
  jenisTransportir,
  jenisMitra,
  satuanVolume,
  pegawai,
  sumurMinyak,
  produksiSumur,
  pengisianTanki,
  tanki,
  BABongkar,
  BABongkarTanki,
  ujiLabK3S,
  BAK3S,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const {
  buildSuratJalanDocxFromRecord,
  buildSuratJalanDownloadBaseName,
} = require("../utils/suratJalanDocx");
const { getActiveTemplateFilePath } = require("../utils/templateKPBPN");
const { convertDocxToPdf } = require("../utils/docxToPdf");
const { getRomanMonth } = require("../lib/perjalananHelpers");
const { sendMessage } = require("../services/waServices");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");
const { emitNotifikasiSuratJalanDraft } = require("./notifikasiControllers");
const fs = require("fs");
const path = require("path");

const toTimeString = (time) => {
  if (!time) return null;
  const value = String(time).trim();
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  return null;
};

const LITER_PER_BARREL = 158.987;
const LITER_PER_DRUM = 200;

const convertVolumeToLiter = (volume, satuanName) => {
  const value = Number(volume);
  if (Number.isNaN(value)) return 0;

  const satuan = String(satuanName || "barrel")
    .trim()
    .toLowerCase();
  if (satuan === "barrel") return value * LITER_PER_BARREL;
  if (satuan === "liter") return value;
  if (satuan === "drum") return value * LITER_PER_DRUM;

  return value;
};

const parseDecimalBody = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
};

const deleteKonfirmasiFoto = (relativePath) => {
  if (!relativePath) return;
  const normalized = String(relativePath).replace(/^[/\\]+/, "");
  if (!normalized.startsWith("konfirmasi-penerimaan/")) return;
  const fullPath = path.join(__dirname, "../public", normalized);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("Gagal menghapus foto konfirmasi:", err);
    }
  }
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
    const stasiunPengumpulMinyakId = parseInt(
      req.query.stasiunPengumpulMinyakId,
    );
    const asalMinyakId = parseInt(req.query.asalMinyakId);
    const statusSuratJalanId = parseInt(req.query.statusSuratJalanId);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const allowedSortBy = ["id", "tanggal", "nomor", "volume"];
    const sortBy = allowedSortBy.includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    const whereCondition = {};

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (stasiunPengumpulMinyakId) {
      whereCondition.stasiunPengumpulMinyakId = stasiunPengumpulMinyakId;
    }
    if (asalMinyakId) {
      whereCondition.asalMinyakId = asalMinyakId;
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
          { model: stasiunPengumpulMinyak },
          { model: asalMinyak },
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
      const resultStasiunPengumpulMinyak = await stasiunPengumpulMinyak.findAll(
        { order: [["nama", "ASC"]] },
      );
      const resultAsalMinyak = await asalMinyak.findAll({
        order: [["nomor", "ASC"]],
      });

      return res.status(200).json({
        resultMitra,
        resultTransportir,
        resultStatusSuratJalan,
        resultSatuanVolume,
        resultStasiunPengumpulMinyak,
        resultAsalMinyak,
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
      stasiunPengumpulMinyakId,
      asalMinyakId,
      supirId,
      jamDatang,
      jamPergi,
    } = req.body;
    console.log("CEK DATA", req.body);
    if (
      !tanggal ||
      !mitraId ||
      !transportirId ||
      !stasiunPengumpulMinyakId ||
      !asalMinyakId ||
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
        unitKerjaId: unitKerjaId ? parseInt(unitKerjaId, 10) : null,
        stasiunPengumpulMinyakId: parseInt(stasiunPengumpulMinyakId, 10),
        asalMinyakId: parseInt(asalMinyakId, 10),
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

  editSuratJalan: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const {
      nomor,
      volume,
      satuanVolumeId,
      tanggal,
      mitraId,
      transportirId,
      unitKerjaId,
      stasiunPengumpulMinyakId,
      asalMinyakId,
      supirId,
      jamDatang,
      jamPergi,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    if (
      !tanggal ||
      !mitraId ||
      !transportirId ||
      !stasiunPengumpulMinyakId ||
      !asalMinyakId ||
      !supirId ||
      volume === undefined ||
      volume === "" ||
      !satuanVolumeId
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    try {
      const existing = await suratJalan.findByPk(id);

      if (!existing) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      const parsedMitraId = parseInt(mitraId, 10);
      const parsedTransportirId = parseInt(transportirId, 10);
      const parsedSupirId = parseInt(supirId, 10);
      const parsedSatuanVolumeId = parseInt(satuanVolumeId, 10);
      const nomorBaru =
        nomor === undefined || nomor === null
          ? existing.nomor
          : String(nomor).trim() || null;

      if (nomorBaru) {
        const nomorDipakai = await suratJalan.findOne({
          where: {
            nomor: nomorBaru,
            id: { [Op.ne]: id },
          },
        });

        if (nomorDipakai) {
          return res.status(400).json({
            error: "Nomor surat jalan sudah digunakan",
          });
        }
      }

      await existing.update({
        nomor: nomorBaru,
        volume: parseInt(volume, 10),
        satuanVolumeId: parsedSatuanVolumeId,
        tanggal: new Date(tanggal),
        jamDatang: jamDatang || null,
        jamPergi: jamPergi || null,
        mitraId: parsedMitraId,
        transportirId: parsedTransportirId,
        unitKerjaId: unitKerjaId
          ? parseInt(unitKerjaId, 10)
          : existing.unitKerjaId,
        stasiunPengumpulMinyakId: parseInt(stasiunPengumpulMinyakId, 10),
        asalMinyakId: parseInt(asalMinyakId, 10),
        supirId: parsedSupirId,
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "suratJalan:updated",
        title: "Surat Jalan Diperbarui",
        description: `Surat jalan ${nomorBaru || existing.nomor || `#${id}`} diperbarui`,
        entity: "suratJalan",
        entityId: id,
      });

      return res.status(200).json({
        success: true,
        message: "Surat jalan berhasil diperbarui",
        result: existing,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteSuratJalan: async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    const transaction = await sequelize.transaction();

    try {
      const existing = await suratJalan.findByPk(id, {
        include: [
          {
            model: konfirmasiPenerimaan,
            include: [{ model: pengisianTanki, attributes: ["id"] }],
          },
        ],
        transaction,
      });

      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      const konfirmasiList = existing.konfirmasiPenerimaans || [];
      const usedInPengisian = konfirmasiList.some(
        (kp) => (kp.pengisianTankis || []).length > 0,
      );

      if (usedInPengisian) {
        await transaction.rollback();
        return res.status(400).json({
          error:
            "Surat jalan sudah digunakan pada pengisian tanki dan tidak dapat dihapus",
        });
      }

      const konfirmasiIds = konfirmasiList.map((kp) => kp.id);

      if (konfirmasiIds.length) {
        await sequelize.query(
          "DELETE FROM pengisianTankiKonfirmasis WHERE konfirmasiPenerimaanId IN (:ids)",
          {
            replacements: { ids: konfirmasiIds },
            transaction,
          },
        );
        await konfirmasiPenerimaan.destroy({
          where: { id: { [Op.in]: konfirmasiIds } },
          transaction,
        });
      }

      await produksiSumur.destroy({
        where: { suratJalanId: id },
        transaction,
      });
      await suratJalan.destroy({
        where: { id },
        transaction,
      });

      await transaction.commit();

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: "suratJalan:deleted",
          title: "Surat Jalan Dihapus",
          description: `Surat jalan ${existing.nomor || `#${id}`} dihapus`,
          entity: "suratJalan",
          entityId: id,
        });
        if (existing.statusSuratJalanId === 1) {
          await emitNotifikasiSuratJalanDraft(io);
        }
      } catch (notifyErr) {
        console.error(
          "Gagal mengirim notifikasi hapus surat jalan:",
          notifyErr,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Surat jalan berhasil dihapus",
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
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
          { model: mitra, include: [{ model: jenisMitra }] },
          {
            model: transportir,
            include: [{ model: jenisTransportir }, { model: satuanVolume }],
          },
          { model: daftarUnitKerja },
          { model: stasiunPengumpulMinyak },
          { model: asalMinyak },
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

      const templatePath = await getActiveTemplateFilePath("suratJalan");
      if (!templatePath) {
        return res.status(400).json({
          error:
            "Template surat jalan aktif tidak ditemukan. Unggah dan aktifkan template pada menu Template Dokumen KPBPN.",
        });
      }

      const docxBuffer = await buildSuratJalanDocxFromRecord(
        result,
        verifikasiCode,
        templatePath,
      );
      const format = String(req.query.format || "pdf").toLowerCase();
      const isDocx =
        format === "docx" || format === "doc" || format === "word";
      const ext = isDocx ? "docx" : "pdf";
      const outputFileName = `${buildSuratJalanDownloadBaseName(result)}.${ext}`;
      const encodedFileName = encodeURIComponent(outputFileName);

      if (isDocx) {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${outputFileName}"; filename*=UTF-8''${encodedFileName}`,
        );
        return res.send(docxBuffer);
      }

      const pdfBuffer = await convertDocxToPdf(docxBuffer);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${outputFileName}"; filename*=UTF-8''${encodedFileName}`,
      );
      return res.send(pdfBuffer);
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
        suratJalan.findByPk(id, { include: [{ model: asalMinyak }] }),
        mitra.findByPk(mitraId),
        nomorSuratKPBPN.findOne({ where: { id: 1 } }),
      ]);

      if (!dbSurat) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }
      if (!dbMitra) {
        return res.status(400).json({ error: "Mitra tidak ditemukan" });
      }
      if (!dbNoSurat?.nomor) {
        return res.status(500).json({
          error: "Template nomor surat jalan tidak ditemukan",
        });
      }
      if (!dbSurat.asalMinyak?.nomor) {
        return res.status(400).json({
          error: "Asal minyak belum diisi pada surat jalan",
        });
      }

      const kodeMitra = dbMitra.kode;
      const nomorUrut = (parseInt(dbMitra.nomorUrutSuratJalan, 10) || 0) + 1;
      const nomorAsalMinyak = String(dbSurat.asalMinyak.nomor).trim();
      const nomorGabungan = `${nomorAsalMinyak}${nomorUrut.toString().padStart(3, "0")}`;

      const nomorBaru = dbNoSurat.nomor
        .replace("NOMOR", nomorGabungan)
        .replace("BULAN", getRomanMonth(new Date(dbSurat.tanggal)))
        .replace("TAHUN", "2026")
        .replace("KODE", kodeMitra);

      await mitra.update(
        { nomorUrutSuratJalan: nomorUrut },
        { where: { id: dbMitra.id } },
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

  batalSuratJalan: async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    try {
      const existing = await suratJalan.findByPk(id, {
        include: [
          {
            model: konfirmasiPenerimaan,
            include: [{ model: pengisianTanki, attributes: ["id"] }],
          },
        ],
      });

      if (!existing) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      if (existing.statusSuratJalanId === 4) {
        return res.status(400).json({
          error: "Surat jalan sudah berstatus BATAL",
        });
      }

      if (existing.statusSuratJalanId === 3) {
        return res.status(400).json({
          error: "Surat jalan yang sudah tiba tidak dapat dibatalkan",
        });
      }

      const konfirmasiList = existing.konfirmasiPenerimaans || [];
      const usedInPengisian = konfirmasiList.some(
        (kp) => (kp.pengisianTankis || []).length > 0,
      );

      if (usedInPengisian) {
        return res.status(400).json({
          error:
            "Surat jalan sudah digunakan pada pengisian tanki dan tidak dapat dibatalkan",
        });
      }

      const previousStatusId = existing.statusSuratJalanId;
      await existing.update({ statusSuratJalanId: 4 });

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: "suratJalan:cancelled",
          title: "Surat Jalan Dibatalkan",
          description: `Surat jalan ${existing.nomor || `#${id}`} berstatus BATAL`,
          entity: "suratJalan",
          entityId: id,
        });
        if (previousStatusId === 1) {
          await emitNotifikasiSuratJalanDraft(io);
        }
      } catch (notifyErr) {
        console.error(
          "Gagal mengirim notifikasi batal surat jalan:",
          notifyErr,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Surat jalan berhasil dibatalkan",
        result: existing,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
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
          {
            model: pengisianTanki,
            through: { attributes: [] },
            include: [{ model: tanki, attributes: ["id", "kode"] }],
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
    const { suratJalanId, tanggal, volume, pegawaiId, catatan, api, BSNW } =
      req.body;

    const apiValue = parseDecimalBody(api);
    const bsnwValue = parseDecimalBody(BSNW);

    if (
      !suratJalanId ||
      !tanggal ||
      volume === undefined ||
      volume === "" ||
      !pegawaiId ||
      apiValue === null ||
      bsnwValue === null
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

      let foto = null;
      if (req.file) {
        foto = `/konfirmasi-penerimaan/${req.file.filename}`;
      }

      const result = await konfirmasiPenerimaan.create({
        suratJalanId: parseInt(suratJalanId, 10),
        tanggal: new Date(tanggal),
        volume: parseInt(volume, 10),
        pegawaiId: parseInt(pegawaiId, 10),
        catatan: catatan || null,
        api: apiValue,
        BSNW: bsnwValue,
        foto,
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

  editKonfirmasiPenerimaan: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { tanggal, volume, pegawaiId, catatan, api, BSNW } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "ID konfirmasi penerimaan tidak valid" });
    }

    const apiValue = parseDecimalBody(api);
    const bsnwValue = parseDecimalBody(BSNW);

    if (
      !tanggal ||
      volume === undefined ||
      volume === "" ||
      !pegawaiId ||
      apiValue === null ||
      bsnwValue === null
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    try {
      const existing = await konfirmasiPenerimaan.findByPk(id, {
        include: [{ model: suratJalan }],
      });

      if (!existing) {
        return res
          .status(404)
          .json({ error: "Konfirmasi penerimaan tidak ditemukan" });
      }

      if (existing.suratJalan?.statusSuratJalanId === 4) {
        return res.status(400).json({
          error:
            "Konfirmasi penerimaan pada surat jalan BATAL tidak dapat diubah",
        });
      }

      let foto = existing.foto;
      if (req.file) {
        deleteKonfirmasiFoto(existing.foto);
        foto = `/konfirmasi-penerimaan/${req.file.filename}`;
      }

      await existing.update({
        tanggal: new Date(tanggal),
        volume: parseInt(volume, 10),
        pegawaiId: parseInt(pegawaiId, 10),
        catatan: catatan || null,
        api: apiValue,
        BSNW: bsnwValue,
        foto,
      });

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: "konfirmasi:updated",
          title: "Konfirmasi Penerimaan Diperbarui",
          description: `Konfirmasi penerimaan #${id} diperbarui`,
          entity: "konfirmasiPenerimaan",
          entityId: id,
        });
      } catch (notifyErr) {
        console.error(
          "Gagal mengirim notifikasi edit konfirmasi:",
          notifyErr,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Konfirmasi penerimaan berhasil diperbarui",
        result: existing,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getProduksiSumurBySuratJalan: async (req, res) => {
    const suratJalanId = parseInt(req.params.suratJalanId, 10);

    if (!suratJalanId) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    try {
      const suratJalanData = await suratJalan.findByPk(suratJalanId, {
        include: [{ model: satuanVolume }],
      });

      if (!suratJalanData) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      const [resultSumurMinyak, resultProduksi, resultSatuanVolume] =
        await Promise.all([
          sumurMinyak.findAll({
            where: { mitraId: suratJalanData.mitraId },
            order: [["nama", "ASC"]],
          }),
          produksiSumur.findAll({
            where: { suratJalanId },
            include: [{ model: sumurMinyak }, { model: satuanVolume }],
          }),
          satuanVolume.findAll({ order: [["satuan", "ASC"]] }),
        ]);

      return res.status(200).json({
        success: true,
        suratJalan: suratJalanData,
        resultSumurMinyak,
        resultProduksi,
        resultSatuanVolume,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  saveProduksiSumur: async (req, res) => {
    const { suratJalanId, items, satuanVolumeId } = req.body;

    if (!suratJalanId || !Array.isArray(items) || !satuanVolumeId) {
      return res.status(400).json({
        error: "Data produksi, satuan volume, dan surat jalan wajib diisi",
      });
    }

    const parsedSuratJalanId = parseInt(suratJalanId, 10);
    const parsedSatuanVolumeId = parseInt(satuanVolumeId, 10);

    try {
      const [suratJalanData, satuanProduksi] = await Promise.all([
        suratJalan.findByPk(parsedSuratJalanId, {
          include: [{ model: satuanVolume }],
        }),
        satuanVolume.findByPk(parsedSatuanVolumeId),
      ]);

      if (!suratJalanData) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      if (!satuanProduksi) {
        return res.status(400).json({ error: "Satuan volume tidak valid" });
      }

      const normalizedItems = items
        .map((item) => ({
          sumurMinyakId: parseInt(item.sumurMinyakId, 10),
          produksi: parseInt(item.produksi, 10) || 0,
        }))
        .filter((item) => item.sumurMinyakId && item.produksi > 0);

      const totalProduksiLiter = normalizedItems.reduce(
        (sum, item) =>
          sum + convertVolumeToLiter(item.produksi, satuanProduksi.satuan),
        0,
      );

      const volumeSuratJalanLiter = convertVolumeToLiter(
        suratJalanData.volume,
        suratJalanData.satuanVolume?.satuan || "barrel",
      );

      if (Math.abs(totalProduksiLiter - volumeSuratJalanLiter) >= 0.001) {
        return res.status(400).json({
          error: `Total produksi harus sama dengan volume surat jalan (${suratJalanData.volume} ${suratJalanData.satuanVolume?.satuan || ""})`,
        });
      }

      const sumurIds = normalizedItems.map((item) => item.sumurMinyakId);
      const validSumur = await sumurMinyak.findAll({
        where: {
          id: sumurIds,
          mitraId: suratJalanData.mitraId,
        },
      });

      if (validSumur.length !== sumurIds.length) {
        return res.status(400).json({
          error: "Terdapat sumur minyak yang tidak valid untuk mitra ini",
        });
      }

      const transaction = await sequelize.transaction();

      try {
        await produksiSumur.destroy({
          where: { suratJalanId: parsedSuratJalanId },
          transaction,
        });

        const created = await produksiSumur.bulkCreate(
          normalizedItems.map((item) => ({
            suratJalanId: parsedSuratJalanId,
            sumurMinyakId: item.sumurMinyakId,
            produksi: item.produksi,
            satuanVolumeId: parsedSatuanVolumeId,
            tanggal: suratJalanData.tanggal,
          })),
          { transaction },
        );

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: "Produksi sumur berhasil disimpan",
          result: created,
          totalProduksiLiter,
        });
      } catch (txErr) {
        await transaction.rollback();
        throw txErr;
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getAdminDataStats: async (req, res) => {
    try {
      const [
        totalSuratJalan,
        totalKonfirmasi,
        totalProduksi,
        totalPengisianTanki,
        totalPengisianDenganBA,
        totalBABongkarTerkait,
        totalUjiLabK3S,
        totalUjiLabDenganBA,
      ] = await Promise.all([
        suratJalan.count(),
        konfirmasiPenerimaan.count(),
        produksiSumur.count({
          where: { suratJalanId: { [Op.not]: null } },
        }),
        pengisianTanki.count(),
        pengisianTanki.count({
          where: { BABongkarId: { [Op.not]: null } },
        }),
        pengisianTanki.count({
          distinct: true,
          col: "BABongkarId",
          where: { BABongkarId: { [Op.not]: null } },
        }),
        ujiLabK3S.count(),
        ujiLabK3S.count({
          where: { BABongkarId: { [Op.not]: null } },
        }),
      ]);

      return res.status(200).json({
        success: true,
        totalSuratJalan,
        totalKonfirmasi,
        totalProduksi,
        totalPengisianTanki,
        totalPengisianDenganBA,
        totalBABongkarTerkait,
        totalUjiLabK3S,
        totalUjiLabDenganBA,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteAllSuratJalan: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const [totalSuratJalan, totalKonfirmasi, totalProduksi] =
        await Promise.all([
          suratJalan.count({ transaction }),
          konfirmasiPenerimaan.count({ transaction }),
          produksiSumur.count({
            where: { suratJalanId: { [Op.not]: null } },
            transaction,
          }),
        ]);

      if (totalSuratJalan === 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Tidak ada data surat jalan untuk dihapus",
        });
      }

      const konfirmasiRows = await konfirmasiPenerimaan.findAll({
        attributes: ["id"],
        raw: true,
        transaction,
      });
      const konfirmasiIds = konfirmasiRows.map((row) => row.id);

      if (konfirmasiIds.length) {
        await sequelize.query(
          "DELETE FROM pengisianTankiKonfirmasis WHERE konfirmasiPenerimaanId IN (:ids)",
          {
            replacements: { ids: konfirmasiIds },
            transaction,
          },
        );
      }

      await konfirmasiPenerimaan.destroy({
        where: { id: { [Op.gt]: 0 } },
        transaction,
      });
      await produksiSumur.destroy({
        where: { suratJalanId: { [Op.not]: null } },
        transaction,
      });
      const deletedSuratJalan = await suratJalan.destroy({
        where: { id: { [Op.gt]: 0 } },
        transaction,
      });

      await transaction.commit();

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: "suratJalan:deletedAll",
          title: "Semua Surat Jalan Dihapus",
          description: `${deletedSuratJalan} surat jalan dihapus`,
          entity: "suratJalan",
        });
        await emitNotifikasiSuratJalanDraft(io);
      } catch (notifyErr) {
        console.error(
          "Gagal mengirim notifikasi hapus surat jalan:",
          notifyErr,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Semua data surat jalan berhasil dihapus",
        deletedSuratJalan,
        deletedKonfirmasiPenerimaan: totalKonfirmasi,
        deletedProduksiSumur: totalProduksi,
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteAllPengisianTanki: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const [totalPengisianTanki, totalPengisianDenganBA] = await Promise.all([
        pengisianTanki.count({ transaction }),
        pengisianTanki.count({
          where: { BABongkarId: { [Op.not]: null } },
          transaction,
        }),
      ]);

      if (totalPengisianTanki === 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Tidak ada data pengisian tanki untuk dihapus",
        });
      }

      const pengisianRows = await pengisianTanki.findAll({
        attributes: ["id", "BABongkarId"],
        raw: true,
        transaction,
      });
      const pengisianIds = pengisianRows.map((row) => row.id);
      const baIds = [
        ...new Set(
          pengisianRows.map((row) => row.BABongkarId).filter(Boolean),
        ),
      ];

      if (pengisianIds.length) {
        await sequelize.query(
          "DELETE FROM pengisianTankiKonfirmasis WHERE pengisianTankiId IN (:ids)",
          {
            replacements: { ids: pengisianIds },
            transaction,
          },
        );
      }

      const deletedPengisianTanki = await pengisianTanki.destroy({
        where: { id: { [Op.gt]: 0 } },
        transaction,
      });

      let deletedUjiLab = 0;
      let deletedBAK3S = 0;
      let deletedBABongkar = 0;

      if (baIds.length) {
        deletedUjiLab = await ujiLabK3S.destroy({
          where: { BABongkarId: { [Op.in]: baIds } },
          transaction,
        });
        deletedBAK3S = await BAK3S.destroy({
          where: { BABongkarId: { [Op.in]: baIds } },
          transaction,
        });
        await BABongkarTanki.destroy({
          where: { BABongkarId: { [Op.in]: baIds } },
          transaction,
        });
        deletedBABongkar = await BABongkar.destroy({
          where: { id: { [Op.in]: baIds } },
          transaction,
        });
      }

      await transaction.commit();

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: "pengisianTanki:deletedAll",
          title: "Semua Pengisian Tanki Dihapus",
          description: `${deletedPengisianTanki} pengisian tanki dihapus`,
          entity: "pengisianTanki",
        });
      } catch (notifyErr) {
        console.error(
          "Gagal mengirim notifikasi hapus pengisian tanki:",
          notifyErr,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Semua data pengisian tanki berhasil dihapus",
        deletedPengisianTanki,
        deletedPengisianDenganBA: totalPengisianDenganBA,
        deletedBABongkar,
        deletedUjiLab,
        deletedBAK3S,
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteAllUjiLabK3S: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const [totalUjiLabK3S, totalUjiLabDenganBA] = await Promise.all([
        ujiLabK3S.count({ transaction }),
        ujiLabK3S.count({
          where: { BABongkarId: { [Op.not]: null } },
          transaction,
        }),
      ]);

      if (totalUjiLabK3S === 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Tidak ada data uji lab K3S untuk dihapus",
        });
      }

      const deletedUjiLabK3S = await ujiLabK3S.destroy({
        where: { id: { [Op.gt]: 0 } },
        transaction,
      });

      await transaction.commit();

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: "ujiLabK3S:deletedAll",
          title: "Semua Uji Lab K3S Dihapus",
          description: `${deletedUjiLabK3S} uji lab K3S dihapus`,
          entity: "ujiLabK3S",
        });
      } catch (notifyErr) {
        console.error("Gagal mengirim notifikasi hapus uji lab K3S:", notifyErr);
      }

      return res.status(200).json({
        success: true,
        message: "Semua data uji lab K3S berhasil dihapus",
        deletedUjiLabK3S,
        deletedUjiLabDenganBA: totalUjiLabDenganBA,
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getDetailSuratJalan: async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    try {
      const result = await suratJalan.findOne({
        where: { id },
        include: [
          { model: mitra, include: [{ model: jenisMitra }] },
          {
            model: transportir,
            include: [{ model: jenisTransportir }, { model: satuanVolume }],
          },
          { model: supir },
          { model: daftarUnitKerja },
          { model: stasiunPengumpulMinyak },
          { model: asalMinyak },
          { model: statusSuratJalan },
          { model: satuanVolume },
          {
            model: produksiSumur,
            include: [{ model: sumurMinyak }, { model: satuanVolume }],
          },
          {
            model: konfirmasiPenerimaan,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
              },
              {
                model: pengisianTanki,
                through: { attributes: [] },
                include: [
                  {
                    model: tanki,
                    include: [
                      { model: satuanVolume },
                      { model: stasiunPengumpulMinyak },
                    ],
                  },
                  { model: satuanVolume },
                  {
                    model: BABongkar,
                    include: [
                      {
                        model: ujiLabK3S,
                        as: "ujiLabK3S",
                        include: [{ model: tanki, attributes: ["id", "kode"] }],
                      },
                      { model: BAK3S, as: "BAK3S" },
                      {
                        model: BABongkarTanki,
                        include: [{ model: tanki, attributes: ["id", "kode"] }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        order: [
          [produksiSumur, "id", "ASC"],
          [konfirmasiPenerimaan, "createdAt", "DESC"],
        ],
      });

      if (!result) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
