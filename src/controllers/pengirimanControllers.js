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
const fs = require("fs");
const path = require("path");
const { buildSuratJalanDocxFromRecord } = require("../utils/suratJalanDocx");
const { getRomanMonth } = require("../lib/perjalananHelpers");
const { sendMessage } = require("../services/waServices");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");
const { emitNotifikasiSuratJalanDraft } = require("./notifikasiControllers");

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

      if (existing.statusSuratJalanId === 3) {
        return res.status(400).json({
          error: "Surat jalan yang sudah dikonfirmasi tidak dapat diubah",
        });
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
      if (!dbSurat.asalMinyak?.nomor) {
        return res.status(400).json({
          error: "Asal minyak belum diisi pada surat jalan",
        });
      }

      const kodeMitra = dbMitra.kode;
      const nomorUrut = parseInt(dbNoSurat.nomorUrut) + 1;
      const nomorAsalMinyak = String(dbSurat.asalMinyak.nomor).trim();
      const nomorGabungan = `${nomorAsalMinyak}${nomorUrut.toString().padStart(3, "0")}`;

      const nomorBaru = dbNoSurat.nomor
        .replace("NOMOR", nomorGabungan)
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

    const parseDecimalInput = (value) => {
      if (value === undefined || value === null || value === "") return null;
      const normalized = String(value).trim().replace(",", ".");
      const num = parseFloat(normalized);
      return Number.isNaN(num) ? null : num;
    };

    const apiValue = parseDecimalInput(api);
    const bsnwValue = parseDecimalInput(BSNW);

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
      const [totalSuratJalan, totalKonfirmasi, totalProduksi] =
        await Promise.all([
          suratJalan.count(),
          konfirmasiPenerimaan.count(),
          produksiSumur.count({
            where: { suratJalanId: { [Op.not]: null } },
          }),
        ]);

      return res.status(200).json({
        success: true,
        totalSuratJalan,
        totalKonfirmasi,
        totalProduksi,
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
