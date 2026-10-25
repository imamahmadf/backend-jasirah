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
  nomorUrutSuratJalanAsal,
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
  userKPBPN,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const {
  sumurIdsUntukInputProduksi,
  muatSumurDenganMitraHistoris,
} = require("../lib/riwayatMitraSumur");
const { isPetugasKeamananOnly } = require("../lib/auth");

const rejectPetugasKeamanan = (req, res, message) => {
  if (!isPetugasKeamananOnly(req)) return false;
  res.status(403).json({ error: message });
  return true;
};
const {
  buildSuratJalanDocxFromRecord,
  buildSuratJalanDownloadBaseName,
} = require("../utils/suratJalanDocx");
const {
  buildKonfirmasiPenerimaanDocx,
  buildKonfirmasiPenerimaanDownloadBaseName,
} = require("../utils/konfirmasiPenerimaanDocx");
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
  if (time instanceof Date && !Number.isNaN(time.getTime())) {
    return [
      String(time.getHours()).padStart(2, "0"),
      String(time.getMinutes()).padStart(2, "0"),
      String(time.getSeconds()).padStart(2, "0"),
    ].join(":");
  }
  const value = String(time).trim();
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [hh, mm] = value.split(":");
    return `${hh.padStart(2, "0")}:${mm}:00`;
  }
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
    const [hh, mm, ss] = value.split(":");
    return `${hh.padStart(2, "0")}:${mm}:${ss}`;
  }
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

const resolveUserKPBPNId = (req, bodyField) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET || "SECRET_KEY",
      );
      if (decoded?.id && Array.isArray(decoded.roleIds)) {
        return decoded.id;
      }
    } catch (_) {
      // Token tidak valid; fallback ke body
    }
  }

  const fromField = parseInt(req.body?.[bodyField], 10);
  if (Number.isInteger(fromField)) return fromField;

  const fromGeneric = parseInt(req.body?.userKPBPNId, 10);
  return Number.isInteger(fromGeneric) ? fromGeneric : null;
};

const getUserKPBPNInclude = (as) => ({
  model: userKPBPN,
  as,
  attributes: ["id", "nama", "namaPengguna", "profilePic"],
});

const parseDecimalBody = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
};

const roundVolumeNumber = (value, maxDecimals = 3) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  const factor = 10 ** maxDecimals;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

const isDimensiKosong = (value) => {
  if (value === undefined || value === null || value === "") return true;
  const num = Number(value);
  return Number.isNaN(num) || num <= 0;
};

const simpanDimensiTransportirKosong = async (
  transportirData,
  panjangInput,
  lebarInput,
) => {
  if (!transportirData) return;
  const updateDimensi = {};
  const panjangBaru = parseDecimalBody(panjangInput);
  const lebarBaru = parseDecimalBody(lebarInput);
  if (
    isDimensiKosong(transportirData.panjang) &&
    panjangBaru !== null &&
    panjangBaru > 0
  ) {
    updateDimensi.panjang = roundVolumeNumber(panjangBaru, 3);
  }
  if (
    isDimensiKosong(transportirData.lebar) &&
    lebarBaru !== null &&
    lebarBaru > 0
  ) {
    updateDimensi.lebar = roundVolumeNumber(lebarBaru, 3);
  }
  if (!Object.keys(updateDimensi).length) return;

  const panjangAkhir = Number(
    updateDimensi.panjang ?? transportirData.panjang,
  );
  const lebarAkhir = Number(updateDimensi.lebar ?? transportirData.lebar);
  if (panjangAkhir > 0 && lebarAkhir > 0) {
    updateDimensi.factorTank = roundVolumeNumber(
      (panjangAkhir * lebarAkhir) / 1000,
      3,
    );
  }
  await transportirData.update(updateDimensi);
};

const calcVolumeDrum = (tinggiCm, panjangCm, lebarCm) => {
  const tinggi = parseDecimalBody(tinggiCm);
  const panjang = parseDecimalBody(panjangCm);
  const lebar = parseDecimalBody(lebarCm);
  if (
    tinggi === null ||
    panjang === null ||
    lebar === null ||
    tinggi <= 0 ||
    panjang <= 0 ||
    lebar <= 0
  ) {
    return null;
  }
  const liter = (tinggi * panjang * lebar) / 1000;
  return roundVolumeNumber(liter / LITER_PER_DRUM, 3);
};

const parseProduksiNumber = (value) => {
  const parsed = parseDecimalBody(value);
  if (parsed === null || parsed <= 0) return 0;
  return roundVolumeNumber(parsed, 3);
};

const convertVolumeToBarrel = (volume, satuanName) => {
  const liter = convertVolumeToLiter(volume, satuanName);
  return roundVolumeNumber(liter / LITER_PER_BARREL, 3);
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

const getUploadedKonfirmasiFile = (req, fieldName) =>
  req.files?.[fieldName]?.[0] || (fieldName === "foto" ? req.file : null) || null;

const buildKonfirmasiFotoPath = (file) =>
  file ? `/konfirmasi-penerimaan/${file.filename}` : null;

const konfirmasiDokumenInclude = [
  { model: satuanVolume },
  {
    model: suratJalan,
    include: [
      { model: mitra, include: [{ model: jenisMitra }] },
      {
        model: transportir,
        include: [{ model: satuanVolume }],
      },
      { model: supir },
      { model: satuanVolume },
    ],
  },
];

const nextNomorUrutSuratJalan = async (mitraId, asalMinyakId, transaction) => {
  await nomorUrutSuratJalanAsal.findOrCreate({
    where: { mitraId, asalMinyakId },
    defaults: { nomorUrut: 0 },
    transaction,
  });

  const counter = await nomorUrutSuratJalanAsal.findOne({
    where: { mitraId, asalMinyakId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!counter) {
    throw new Error("Nomor urut surat jalan tidak dapat dikunci");
  }

  const nomorUrut = (parseInt(counter.nomorUrut, 10) || 0) + 1;
  await counter.update({ nomorUrut }, { transaction });
  return nomorUrut;
};

const nomorUrutDariSuratJalan = (nomorSuratJalan) => {
  const bagian = String(nomorSuratJalan || "")
    .trim()
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
  const kepala = bagian[0] || "";
  const urut = kepala.match(/(\d{3})$/)?.[1];
  if (!urut) return null;
  return {
    urut,
    bulan: bagian.length >= 2 ? bagian[bagian.length - 2] : "",
    tahun: bagian[bagian.length - 1] || "",
  };
};

const assignNomorBeritaAcara = async (konfirmasiRow) => {
  if (konfirmasiRow?.nomor) return konfirmasiRow.nomor;

  const suratJalanId =
    konfirmasiRow?.suratJalanId || konfirmasiRow?.suratJalan?.id;
  if (!suratJalanId) {
    throw new Error("Surat jalan konfirmasi penerimaan tidak ditemukan");
  }

  return sequelize.transaction(async (transaction) => {
    const locked = await konfirmasiPenerimaan.findByPk(konfirmasiRow.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!locked) {
      throw new Error("Konfirmasi penerimaan tidak ditemukan");
    }
    if (locked.nomor) {
      konfirmasiRow.nomor = locked.nomor;
      return locked.nomor;
    }

    const surat = await suratJalan.findByPk(locked.suratJalanId, {
      transaction,
      include: [{ model: mitra }],
    });

    if (!surat?.nomor) {
      throw new Error("Nomor surat jalan belum tersedia");
    }
    if (!surat.mitra?.kode) {
      throw new Error("Kode mitra tidak ditemukan untuk nomor berita acara");
    }

    const pecahan = nomorUrutDariSuratJalan(surat.nomor);
    if (!pecahan) {
      throw new Error("Nomor urut tidak ditemukan pada nomor surat jalan");
    }

    const tanggalSurat = new Date(surat.tanggal || Date.now());
    const bulan =
      pecahan.bulan ||
      getRomanMonth(
        Number.isNaN(tanggalSurat.getTime()) ? new Date() : tanggalSurat,
      );
    const tahun =
      pecahan.tahun ||
      String(
        Number.isNaN(tanggalSurat.getTime())
          ? new Date().getFullYear()
          : tanggalSurat.getFullYear(),
      );
    const nomor = `${pecahan.urut}/BAP/KPBPN-${surat.mitra.kode}/${bulan}/${tahun}`;

    await locked.update({ nomor }, { transaction });
    konfirmasiRow.nomor = nomor;
    return nomor;
  });
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
          {
            model: produksiSumur,
            attributes: ["id", "produksi", "satuanVolumeId"],
            separate: true,
            include: [{ model: satuanVolume, attributes: ["id", "satuan"] }],
          },
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
        order: [["nama", "ASC"]],
      });
      const resultSupir = await supir.findAll({
        order: [["nama", "ASC"]],
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
        resultSupir,
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
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat menambah surat jalan",
      )
    ) {
      return;
    }

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
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat mengubah surat jalan",
      )
    ) {
      return;
    }

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
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat menghapus surat jalan",
      )
    ) {
      return;
    }

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

      for (const kp of konfirmasiList) {
        deleteKonfirmasiFoto(kp.foto);
        deleteKonfirmasiFoto(kp.fotoLab);
      }

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
        req,
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
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat memverifikasi surat jalan",
      )
    ) {
      return;
    }

    const id = req.params.id;
    const mitraId = parseInt(req.body.mitraId, 10);

    const randomCode = (
      Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
    ).toUpperCase();

    try {
      const nomorBaru = await sequelize.transaction(async (transaction) => {
        const [dbSurat, dbMitra, dbNoSurat] = await Promise.all([
          suratJalan.findByPk(id, {
            include: [{ model: asalMinyak }],
            transaction,
          }),
          mitra.findByPk(mitraId, { transaction }),
          nomorSuratKPBPN.findOne({ where: { id: 1 }, transaction }),
        ]);

        if (!dbSurat) {
          const error = new Error("Surat jalan tidak ditemukan");
          error.statusCode = 404;
          throw error;
        }
        if (!dbMitra) {
          const error = new Error("Mitra tidak ditemukan");
          error.statusCode = 400;
          throw error;
        }
        if (!dbNoSurat?.nomor) {
          const error = new Error("Template nomor surat jalan tidak ditemukan");
          error.statusCode = 500;
          throw error;
        }
        if (!dbSurat.asalMinyak?.nomor || !dbSurat.asalMinyakId) {
          const error = new Error("Asal minyak belum diisi pada surat jalan");
          error.statusCode = 400;
          throw error;
        }

        const nomorUrut = await nextNomorUrutSuratJalan(
          dbMitra.id,
          dbSurat.asalMinyakId,
          transaction,
        );
        const nomorAsalMinyak = String(dbSurat.asalMinyak.nomor).trim();
        const nomorGabungan = `${nomorAsalMinyak}${nomorUrut
          .toString()
          .padStart(3, "0")}`;
        const nomor = dbNoSurat.nomor
          .replace("NOMOR", nomorGabungan)
          .replace("BULAN", getRomanMonth(new Date(dbSurat.tanggal)))
          .replace("TAHUN", "2026")
          .replace("KODE", dbMitra.kode);

        await dbSurat.update(
          {
            verifikasi: randomCode,
            nomor,
            statusSuratJalanId: 2,
          },
          { transaction },
        );

        return nomor;
      });

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
        nomor: nomorBaru,
      });
    } catch (err) {
      console.log(err);
      return res.status(err.statusCode || 500).json({
        error: err.message,
      });
    }
  },

  batalSuratJalan: async (req, res) => {
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat membatalkan surat jalan",
      )
    ) {
      return;
    }

    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ error: "ID surat jalan tidak valid" });
    }

    try {
      const existing = await suratJalan.findByPk(id);

      if (!existing) {
        return res.status(404).json({ error: "Surat jalan tidak ditemukan" });
      }

      if (existing.statusSuratJalanId === 4) {
        return res.status(400).json({
          error: "Surat jalan sudah berstatus BATAL",
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

  getDaftarKonfirmasiPenerimaan: async (req, res) => {
    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = limit * page;
    const search = String(req.query.search || "").trim();

    const where = {};
    const include = [
      getUserKPBPNInclude("userPK"),
      getUserKPBPNInclude("userLab"),
      { model: satuanVolume, attributes: ["id", "satuan"] },
      {
        model: suratJalan,
        include: [
          { model: mitra, attributes: ["id", "nama"] },
          { model: satuanVolume, attributes: ["id", "satuan"] },
          { model: statusSuratJalan, attributes: ["id", "status"] },
          { model: transportir, attributes: ["id", "plat"] },
          { model: supir, attributes: ["id", "nama"] },
        ],
      },
    ];

    if (search) {
      const term = { [Op.like]: `%${search}%` };
      where[Op.or] = [
        { nomor: term },
        { "$suratJalan.nomor$": term },
        { "$suratJalan.mitra.nama$": term },
      ];
    }

    try {
      const result = await konfirmasiPenerimaan.findAll({
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

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage: Math.ceil(totalRows / limit),
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
          getUserKPBPNInclude("userPK"),
          getUserKPBPNInclude("userLab"),
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
    const { suratJalanId, pegawaiId } = req.body;
    const parsedPegawaiId = pegawaiId ? parseInt(pegawaiId, 10) : null;

    if (!suratJalanId) {
      return res.status(400).json({ error: "Surat jalan wajib diisi" });
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
            "Konfirmasi kedatangan hanya dapat dilakukan untuk surat jalan berstatus KIRIM",
        });
      }

      const existingKonfirmasi = await konfirmasiPenerimaan.findOne({
        where: { suratJalanId: parseInt(suratJalanId, 10) },
      });

      if (existingKonfirmasi) {
        return res.status(400).json({
          error: "Konfirmasi penerimaan untuk surat jalan ini sudah ada",
        });
      }

      const jamKedatangan = toTimeString(req.body.jamKedatangan);
      if (!jamKedatangan) {
        return res.status(400).json({
          error: "Jam kedatangan wajib diisi",
        });
      }

      const foto =
        buildKonfirmasiFotoPath(getUploadedKonfirmasiFile(req, "foto")) ||
        null;

      const result = await konfirmasiPenerimaan.create({
        suratJalanId: parseInt(suratJalanId, 10),
        tanggal: new Date(),
        jamKedatangan,
        volume: null,
        pegawaiId: Number.isNaN(parsedPegawaiId) ? null : parsedPegawaiId,
        catatan: null,
        api: null,
        BSNW: null,
        foto,
        fotoLab: null,
        userPKId: resolveUserKPBPNId(req, "userPKId"),
        userLabId: null,
      });

      await suratJalan.update(
        { statusSuratJalanId: 3 },
        { where: { id: parseInt(suratJalanId, 10) } },
      );

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "konfirmasi:created",
        title: "Konfirmasi Penerimaan",
        description: `Konfirmasi kedatangan surat jalan #${suratJalanId} disimpan`,
        entity: "konfirmasiPenerimaan",
        entityId: result.id,
      });

      return res.status(200).json({
        success: true,
        message: "Konfirmasi kedatangan berhasil disimpan",
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editKonfirmasiPenerimaan: async (req, res) => {
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan hanya dapat melakukan konfirmasi kedatangan",
      )
    ) {
      return;
    }

    const id = parseInt(req.params.id, 10);
    const {
      tanggal,
      volume,
      volumeAir,
      volumeAkhir,
      tinggiCairan,
      panjangTransportir,
      lebarTransportir,
      pegawaiId,
      catatan,
      api,
      BSNW,
      SG,
      nomor,
      tahap,
    } = req.body;
    const tahapKonfirmasi = String(tahap || "").toLowerCase();
    const isBongkar = tahapKonfirmasi === "bongkar";
    const isVolume = tahapKonfirmasi === "volume";
    const isEditVolume = tahapKonfirmasi === "edit-volume";

    if (!id) {
      return res
        .status(400)
        .json({ error: "ID konfirmasi penerimaan tidak valid" });
    }

    const apiValue = parseDecimalBody(api);
    const bsnwValue = parseDecimalBody(BSNW);
    const sgValue = parseDecimalBody(SG);
    const volumeAirValue = parseDecimalBody(volumeAir);
    const volumeAkhirValue = parseDecimalBody(volumeAkhir);
    const parsedVolume = parseDecimalBody(volume);
    const volumeValue =
      parsedVolume === null ? null : roundVolumeNumber(parsedVolume, 3);
    const tinggiCairanValue = parseDecimalBody(tinggiCairan);
    const parsedPegawaiId = pegawaiId ? parseInt(pegawaiId, 10) : null;

    if (isVolume || isEditVolume) {
      const tinggiBelumDiisi =
        isVolume && (tinggiCairanValue === null || tinggiCairanValue <= 0);
      const airTidakValid =
        volumeAirValue !== null && volumeAirValue < 0;
      const editBelumLengkap =
        isEditVolume &&
        (volumeValue === null ||
          volumeValue <= 0 ||
          volumeAirValue === null ||
          !String(nomor ?? "").trim());
      if (tinggiBelumDiisi || airTidakValid || editBelumLengkap) {
        return res.status(400).json({
          error: isEditVolume
            ? "Nomor konfirmasi, volume, dan volume air wajib diisi"
            : tinggiBelumDiisi
              ? "Tinggi cairan wajib diisi"
              : "Volume air tidak valid",
        });
      }
    } else if (isBongkar) {
      if (
        !tanggal ||
        apiValue === null ||
        bsnwValue === null ||
        sgValue === null
      ) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }
    } else if (
      !tanggal ||
      volumeValue === null ||
      volumeValue <= 0 ||
      volumeAirValue === null ||
      volumeAirValue < 0 ||
      apiValue === null ||
      bsnwValue === null ||
      sgValue === null ||
      !String(nomor ?? "").trim()
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    try {
      const existing = await konfirmasiPenerimaan.findByPk(id, {
        include: [{ model: suratJalan, include: [{ model: transportir }] }],
      });

      if (!existing) {
        return res
          .status(404)
          .json({ error: "Konfirmasi penerimaan tidak ditemukan" });
      }

      const statusId = existing.suratJalan?.statusSuratJalanId;

      if (statusId === 4) {
        return res.status(400).json({
          error:
            "Konfirmasi penerimaan pada surat jalan BATAL tidak dapat diubah",
        });
      }

      if (isVolume && statusId !== 3) {
        return res.status(400).json({
          error:
            "Konfirmasi volume hanya dapat dilakukan untuk surat jalan berstatus TIBA",
        });
      }

      if (isEditVolume && statusId !== 6) {
        return res.status(400).json({
          error:
            "Perubahan nomor dan volume hanya dapat dilakukan saat status masih VOLUME",
        });
      }

      if (!isVolume && !isBongkar && !isEditVolume && statusId === 6) {
        return res.status(400).json({
          error:
            "Saat status masih VOLUME, hanya nomor konfirmasi dan data volume yang dapat diubah",
        });
      }

      if (isBongkar && statusId !== 6) {
        return res.status(400).json({
          error:
            "Konfirmasi bongkar hanya dapat dilakukan setelah konfirmasi volume",
        });
      }

      let foto = existing.foto;
      let fotoLab = existing.fotoLab;
      if (!isEditVolume) {
        const uploadedFoto = getUploadedKonfirmasiFile(req, "foto");
        const uploadedFotoLab = getUploadedKonfirmasiFile(req, "fotoLab");

        if (uploadedFoto) {
          deleteKonfirmasiFoto(existing.foto);
          foto = buildKonfirmasiFotoPath(uploadedFoto);
        }
        if (uploadedFotoLab) {
          deleteKonfirmasiFoto(existing.fotoLab);
          fotoLab = buildKonfirmasiFotoPath(uploadedFotoLab);
        }
      }

      let volumeDrum = volumeValue;
      let satuanVolumeId =
        existing.satuanVolumeId ?? existing.suratJalan?.satuanVolumeId;
      if (isVolume) {
        await simpanDimensiTransportirKosong(
          existing.suratJalan?.transportir,
          panjangTransportir,
          lebarTransportir,
        );
        if (volumeValue !== null && volumeValue > 0) {
          volumeDrum = volumeValue;
        } else {
          volumeDrum = calcVolumeDrum(
            tinggiCairan,
            existing.suratJalan?.transportir?.panjang,
            existing.suratJalan?.transportir?.lebar,
          );
        }
        if (volumeDrum === null || volumeDrum <= 0) {
          return res.status(400).json({
            error:
              "Volume wajib diisi. Lengkapi tinggi cairan beserta panjang dan lebar transportir, atau isi volume secara manual",
          });
        }
        const drumSatuan = await satuanVolume.findOne({
          where: { satuan: "Drum" },
        });
        if (!drumSatuan) {
          return res.status(400).json({
            error: "Satuan volume Drum tidak ditemukan",
          });
        }
        satuanVolumeId = drumSatuan.id;
      }

      const volumeAirTerisi = volumeAirValue !== null;
      if (!isBongkar && volumeAirTerisi && volumeAirValue > volumeDrum) {
        return res.status(400).json({
          error: "Volume air tidak boleh lebih besar dari volume",
        });
      }

      const volumeAkhirSimpan = volumeAirTerisi
        ? roundVolumeNumber(volumeDrum - volumeAirValue, 3)
        : null;

      const volumeFields = {
        volume: volumeDrum,
        volumeAir: volumeAirTerisi ? volumeAirValue : null,
        volumeAkhir: isBongkar ? volumeAkhirValue : volumeAkhirSimpan,
        satuanVolumeId,
      };

      const nomorBaru = String(nomor ?? "").trim();
      if ((isEditVolume || (!isVolume && !isBongkar)) && nomorBaru) {
        const nomorDipakai = await konfirmasiPenerimaan.findOne({
          where: {
            nomor: nomorBaru,
            id: { [Op.ne]: id },
          },
        });
        if (nomorDipakai) {
          return res.status(400).json({
            error: "Nomor konfirmasi sudah digunakan",
          });
        }
      }

      let updatePayload;
      const volumeLengkap = isVolume && volumeAirValue !== null;

      if (isVolume) {
        updatePayload = {
          ...volumeFields,
          tinggiCairan: tinggiCairanValue,
        };
      } else if (isEditVolume) {
        updatePayload = {
          nomor: nomorBaru,
          ...volumeFields,
        };
      } else if (isBongkar) {
        updatePayload = {
          tanggal: new Date(tanggal),
          catatan: catatan || null,
          api: apiValue,
          BSNW: bsnwValue,
          SG: sgValue,
          foto,
          fotoLab,
          userLabId:
            resolveUserKPBPNId(req, "userLabId") ?? existing.userLabId,
        };
      } else {
        updatePayload = {
          nomor: nomorBaru,
          tanggal: new Date(tanggal),
          ...volumeFields,
          pegawaiId:
            pegawaiId === undefined || pegawaiId === null || pegawaiId === ""
              ? existing.pegawaiId
              : Number.isNaN(parsedPegawaiId)
                ? existing.pegawaiId
                : parsedPegawaiId,
          catatan: catatan || null,
          api: apiValue,
          BSNW: bsnwValue,
          SG: sgValue,
          foto,
          fotoLab,
        };
      }

      await existing.update(updatePayload);

      if (volumeLengkap) {
        try {
          await assignNomorBeritaAcara(existing);
        } catch (nomorErr) {
          console.error("Gagal membuat nomor berita acara:", nomorErr);
        }
      }

      if (existing.suratJalanId && (volumeLengkap || isBongkar)) {
        await suratJalan.update(
          { statusSuratJalanId: volumeLengkap ? 6 : 5 },
          { where: { id: existing.suratJalanId } },
        );
      }

      try {
        const io = req.app.get("socketio");
        await notifyDashboardChange(io, {
          type: isBongkar
            ? "konfirmasi:bongkar"
            : isVolume
              ? "konfirmasi:volume"
              : "konfirmasi:updated",
          title: isBongkar
            ? "Konfirmasi Bongkar"
            : isVolume
              ? volumeLengkap
                ? "Konfirmasi Volume"
                : "Tinggi Cairan Tersimpan"
              : "Konfirmasi Penerimaan Diperbarui",
          description: isBongkar
            ? `Konfirmasi bongkar #${id} disimpan`
            : isVolume
              ? volumeLengkap
                ? `Konfirmasi volume #${id} disimpan`
                : `Tinggi cairan konfirmasi #${id} disimpan`
              : `Konfirmasi penerimaan #${id} diperbarui`,
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
        message: isBongkar
          ? "Konfirmasi bongkar berhasil disimpan"
          : isVolume
            ? volumeLengkap
              ? "Konfirmasi volume berhasil disimpan"
              : "Tinggi cairan berhasil disimpan"
            : "Konfirmasi penerimaan berhasil diperbarui",
        lengkap: isVolume ? volumeLengkap : true,
        result: existing,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  cetakBeritaAcaraPengukuran: async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res
        .status(400)
        .json({ error: "ID konfirmasi penerimaan tidak valid" });
    }

    try {
      const record = await konfirmasiPenerimaan.findByPk(id, {
        include: konfirmasiDokumenInclude,
      });

      if (!record) {
        return res
          .status(404)
          .json({ error: "Konfirmasi penerimaan tidak ditemukan" });
      }

      if (
        record.volume === null ||
        record.volume === undefined ||
        record.volumeAir === null ||
        record.volumeAir === undefined ||
        record.volumeAkhir === null ||
        record.volumeAkhir === undefined
      ) {
        return res.status(400).json({
          error:
            "Berita acara pengukuran hanya dapat dibuat setelah konfirmasi volume lengkap",
        });
      }

      await assignNomorBeritaAcara(record);

      const templatePath = await getActiveTemplateFilePath(
        "konfirmasiPenerimaan",
      );
      if (!templatePath) {
        return res.status(400).json({
          error:
            "Template konfirmasi penerimaan aktif tidak ditemukan. Unggah dan aktifkan template pada menu Template Dokumen KPBPN.",
        });
      }

      const docxBuffer = buildKonfirmasiPenerimaanDocx(record, templatePath);
      const outputFileName = `${buildKonfirmasiPenerimaanDownloadBaseName(record)}.docx`;
      const encodedFileName = encodeURIComponent(outputFileName);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${outputFileName}"; filename*=UTF-8''${encodedFileName}`,
      );
      return res.send(docxBuffer);
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

      const tanggalSurat = suratJalanData.tanggal
        ? new Date(suratJalanData.tanggal)
        : null;
      const tanggalValid =
        tanggalSurat && !Number.isNaN(tanggalSurat.getTime());
      const awalHari = tanggalValid ? new Date(tanggalSurat) : null;
      const akhirHari = tanggalValid ? new Date(tanggalSurat) : null;
      if (tanggalValid) {
        awalHari.setHours(0, 0, 0, 0);
        akhirHari.setHours(23, 59, 59, 999);
      }

      const [
        sumurHistorisIds,
        resultProduksi,
        resultSatuanVolume,
        produksiHariIni,
      ] = await Promise.all([
        sumurIdsUntukInputProduksi(
          suratJalanData.mitraId,
          suratJalanData.tanggal,
        ),
        produksiSumur.findAll({
          where: { suratJalanId },
          include: [{ model: sumurMinyak }, { model: satuanVolume }],
        }),
        satuanVolume.findAll({ order: [["satuan", "ASC"]] }),
        tanggalValid
          ? produksiSumur.findAll({
              attributes: ["sumurMinyakId"],
              where: {
                suratJalanId: { [Op.ne]: suratJalanId },
                produksi: { [Op.gt]: 0 },
              },
              include: [
                {
                  model: suratJalan,
                  attributes: [],
                  required: true,
                  where: {
                    mitraId: suratJalanData.mitraId,
                    tanggal: { [Op.between]: [awalHari, akhirHari] },
                  },
                },
              ],
            })
          : Promise.resolve([]),
      ]);

      const sumurTerisiHariIni = [
        ...new Set(produksiHariIni.map((row) => row.sumurMinyakId)),
      ];
      const sumurIds = [
        ...new Set([
          ...sumurHistorisIds,
          ...resultProduksi.map((row) => row.sumurMinyakId),
        ]),
      ];
      const resultSumurMinyak = await muatSumurDenganMitraHistoris(
        sumurIds,
        suratJalanData.tanggal,
      );

      return res.status(200).json({
        success: true,
        suratJalan: suratJalanData,
        resultSumurMinyak,
        resultProduksi,
        resultSatuanVolume,
        sumurTerisiHariIni,
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
          produksi: parseProduksiNumber(item.produksi),
        }))
        .filter((item) => item.sumurMinyakId && item.produksi > 0);

      const totalProduksiBarrel = roundVolumeNumber(
        normalizedItems.reduce(
          (sum, item) =>
            sum +
            convertVolumeToLiter(item.produksi, satuanProduksi.satuan) /
              LITER_PER_BARREL,
          0,
        ),
        3,
      );

      const volumeSuratJalanBarrel = convertVolumeToBarrel(
        suratJalanData.volume,
        suratJalanData.satuanVolume?.satuan || "barrel",
      );

      if (totalProduksiBarrel !== volumeSuratJalanBarrel) {
        return res.status(400).json({
          error: `Total produksi harus sama dengan volume surat jalan (${suratJalanData.volume} ${suratJalanData.satuanVolume?.satuan || ""})`,
        });
      }

      const sumurIds = normalizedItems.map((item) => item.sumurMinyakId);
      const [sumurMilikMitra, produksiTersimpan] = await Promise.all([
        sumurIdsUntukInputProduksi(
          suratJalanData.mitraId,
          suratJalanData.tanggal,
        ),
        produksiSumur.findAll({
          attributes: ["sumurMinyakId"],
          where: { suratJalanId: parsedSuratJalanId },
        }),
      ]);
      const allowedSumurIds = new Set([
        ...sumurMilikMitra,
        ...produksiTersimpan.map((row) => row.sumurMinyakId),
      ]);

      if (sumurIds.some((sumurId) => !allowedSumurIds.has(sumurId))) {
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
          totalProduksiBarrel,
        });
      } catch (txErr) {
        if (!transaction.finished) {
          await transaction.rollback();
        }
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
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat menghapus data",
      )
    ) {
      return;
    }

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
    if (
      rejectPetugasKeamanan(
        req,
        res,
        "Petugas Keamanan tidak dapat melihat detail surat jalan",
      )
    ) {
      return;
    }

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
              getUserKPBPNInclude("userPK"),
              getUserKPBPNInclude("userLab"),
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
                        include: [
                          {
                            model: tanki,
                            attributes: ["id", "kode", "factorTank"],
                          },
                        ],
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

  getSuratJalanByVerifikasi: async (req, res) => {
    const kode = String(req.params.kode || "").trim();

    if (!kode) {
      return res.status(400).json({ error: "Kode verifikasi tidak valid" });
    }

    try {
      const result = await suratJalan.findOne({
        where: { verifikasi: kode },
        attributes: [
          "nomor",
          "tanggal",
          "volume",
          "jamDatang",
          "jamPergi",
          "verifikasi",
        ],
        include: [
          {
            model: mitra,
            attributes: ["nama", "alamat", "kontak", "penanggungJawab"],
            include: [{ model: jenisMitra, attributes: ["jenis"] }],
          },
          {
            model: transportir,
            attributes: ["plat", "kapasitas", "foto"],
            include: [
              { model: jenisTransportir, attributes: ["jenis"] },
              { model: satuanVolume, attributes: ["satuan"] },
            ],
          },
          { model: supir, attributes: ["nama", "foto"] },
          { model: daftarUnitKerja, attributes: ["unitKerja"] },
          { model: stasiunPengumpulMinyak, attributes: ["nama"] },
          { model: asalMinyak, attributes: ["nomor", "asal"] },
          { model: statusSuratJalan, attributes: ["status"] },
          { model: satuanVolume, attributes: ["satuan"] },
          {
            model: produksiSumur,
            attributes: ["produksi", "tanggal"],
            include: [
              { model: sumurMinyak, attributes: ["nama", "nomor"] },
              { model: satuanVolume, attributes: ["satuan"] },
            ],
          },
          {
            model: konfirmasiPenerimaan,
            attributes: [
              "tanggal",
              "volume",
              "catatan",
              "api",
              "BSNW",
              "foto",
              "fotoLab",
            ],
            include: [
              { model: pegawai, attributes: ["nama"] },
              getUserKPBPNInclude("userPK"),
              getUserKPBPNInclude("userLab"),
            ],
          },
        ],
        order: [
          [produksiSumur, "tanggal", "DESC"],
          [konfirmasiPenerimaan, "tanggal", "DESC"],
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
      return res.status(500).json({ error: err.message });
    }
  },
};
