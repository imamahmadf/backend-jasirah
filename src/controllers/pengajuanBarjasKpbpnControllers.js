const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { convertDocxToPdf } = require("../utils/docxToPdf");
const { getActiveTemplateFilePath } = require("../utils/templateKPBPN");
const {
  buildPengajuanDocxFromRecord,
  buildPengajuanDownloadBaseName,
} = require("../utils/pengajuanBarjasDocx");
const { ROLE_KPBPN, getKpbpnRoleIds } = require("../lib/auth");
const { estimasiTerbaruMap } = require("./barangJasaKpbpnControllers");
const { buatNomorPengajuan } = require("../lib/nomorPengajuanKpbpn");
const { sendMessage } = require("../services/waServices");
const {
  selaraskanStokPengajuan,
  STATUS_MASUK_STOK,
} = require("../lib/stokBarangKpbpn");
const {
  sequelize,
  pengajuanBarjasKpbpn,
  itemPengajuanBarjasKpbpn,
  statusPengajuanKpbpn,
  userKPBPN,
  userRoleKPBPN,
  barangJasaKpbpn,
  mutasiStokBarangKpbpn,
} = require("../models");

const bacaPayload = (body) => {
  if (!body?.payload) return body || {};
  if (typeof body.payload === "string") return JSON.parse(body.payload);
  return body.payload;
};

const tanggalOnly = (value) => {
  if (!value) return null;
  const text = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  return text;
};

const parseUang = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const digits = String(value).replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
};

const parseJumlah = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number * 1000) / 1000;
};

const fotoDariRequest = (files) => {
  const map = {};
  (files || []).forEach((file) => {
    const match = /^foto_(\d+)$/.exec(file.fieldname || "");
    if (!match) return;
    map[Number(match[1])] = `/pengajuan-barjas/${file.filename}`;
  });
  return map;
};

const hapusFile = (relPath) => {
  if (!relPath || typeof relPath !== "string") return;
  const abs = path.join(__dirname, "../public", relPath.replace(/^\//, ""));
  fs.unlink(abs, () => {});
};

const buatNomor = (tanggal, transaction) =>
  buatNomorPengajuan(tanggal, transaction);

const normalisasiItem = (items, fotoMap) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Minimal satu barang atau jasa wajib diisi" };
  }

  const hasil = [];
  items.forEach((item, index) => {
    const nama = String(item?.nama || "").trim();
    const jumlah = parseJumlah(item?.jumlah);
    const spesifikasi = String(item?.spesifikasi || "").trim();
    const keterangan = String(item?.keterangan || "").trim();
    const satuan = String(item?.satuan || "").trim() || "unit";
    const kosong =
      !nama &&
      !spesifikasi &&
      !keterangan &&
      !item?.jumlah;

    if (kosong) return;

    if (!nama) {
      hasil.push({ error: `Nama barang atau jasa pada baris ${index + 1} wajib diisi` });
      return;
    }
    if (!jumlah) {
      hasil.push({ error: `Jumlah pada baris ${index + 1} harus lebih dari 0` });
      return;
    }

    hasil.push({
      id: item.id ? parseInt(item.id, 10) : null,
      nama,
      spesifikasi: spesifikasi || null,
      jumlah,
      satuan,
      keterangan: keterangan || null,
      fotoLama: item.foto || null,
      hapusFoto: Boolean(item.hapusFoto),
      fotoBaru: fotoMap[index] || null,
      barangJasaKpbpnId: item.barangJasaKpbpnId || null,
    });
  });

  const error = hasil.find((item) => item.error);
  if (error) return { error: error.error };
  if (hasil.length === 0) {
    return { error: "Minimal satu barang atau jasa wajib diisi" };
  }
  return { items: hasil };
};

const includePengguna = [
  { model: userKPBPN, attributes: ["id", "nama", "namaPengguna"] },
  { model: userKPBPN, as: "mengetahui", attributes: ["id", "nama"] },
  { model: userKPBPN, as: "menyetujui", attributes: ["id", "nama"] },
];

const includeDetail = [
  { model: statusPengajuanKpbpn, attributes: ["id", "nama"] },
  ...includePengguna,
  {
    model: itemPengajuanBarjasKpbpn,
    separate: true,
    order: [["id", "ASC"]],
  },
];

const bacaIdOpsional = (value, label) => {
  if (value === null || value === undefined || value === "") return null;
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return { error: `${label} tidak valid` };
  }
  return id;
};

const pemintaPunyaRole = (req, roleId) =>
  getKpbpnRoleIds(req).includes(Number(roleId));

const userMemilikiRole = async (userId, roleId) => {
  const row = await userRoleKPBPN.findOne({
    where: { userKPBPNId: userId, roleKPBPNId: roleId },
    attributes: ["id"],
  });
  return Boolean(row);
};

const pastikanBarangJasa = async (items, jenis) => {
  for (const item of items) {
    const barangJasaId = bacaIdOpsional(item.barangJasaKpbpnId, "Barang atau jasa");
    if (barangJasaId?.error) return { error: barangJasaId.error };
    item.barangJasaKpbpnId = barangJasaId;
    if (!barangJasaId) continue;
    const master = await barangJasaKpbpn.findByPk(barangJasaId, {
      attributes: ["id", "jenis"],
    });
    if (!master) return { error: "Barang atau jasa terdaftar tidak ditemukan" };
    if (master.jenis !== jenis) {
      return { error: "Jenis barang atau jasa tidak sesuai dengan jenis pengajuan" };
    }
  }
  return { items };
};

const daftarUserPeran = async (roleId) => {
  const rows = await userRoleKPBPN.findAll({
    where: { roleKPBPNId: roleId },
    include: [{ model: userKPBPN, attributes: ["id", "nama"] }],
  });
  return rows
    .map((row) => row.userKPBPN)
    .filter(Boolean)
    .map((user) => ({ id: user.id, nama: user.nama }))
    .sort((a, b) => String(a.nama).localeCompare(String(b.nama), "id"));
};

const simpanItem = async (pengajuanId, items, transaction) => {
  const existing = await itemPengajuanBarjasKpbpn.findAll({
    where: { pengajuanBarjasKpbpnId: pengajuanId },
    transaction,
  });
  const keepIds = new Set(items.map((item) => item.id).filter(Boolean));

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      hapusFile(row.foto);
      await row.destroy({ transaction });
    }
  }

  const itemBaru = items.filter((item) => !item.id && item.barangJasaKpbpnId);
  const estimasiTerbaru = await estimasiTerbaruMap(
    itemBaru.map((item) => item.barangJasaKpbpnId),
    transaction,
  );

  for (const item of items) {
    let foto = item.fotoLama;
    if (item.fotoBaru) {
      if (item.fotoLama && item.fotoLama !== item.fotoBaru) hapusFile(item.fotoLama);
      foto = item.fotoBaru;
    } else if (item.hapusFoto) {
      hapusFile(item.fotoLama);
      foto = null;
    }

    const data = {
      nama: item.nama,
      spesifikasi: item.spesifikasi,
      jumlah: item.jumlah,
      satuan: item.satuan,
      keterangan: item.keterangan,
      foto,
      pengajuanBarjasKpbpnId: pengajuanId,
      barangJasaKpbpnId: item.barangJasaKpbpnId,
    };

    if (item.id) {
      await itemPengajuanBarjasKpbpn.update(data, {
        where: { id: item.id, pengajuanBarjasKpbpnId: pengajuanId },
        transaction,
      });
    } else {
      const estimasiHarga = item.barangJasaKpbpnId
        ? (estimasiTerbaru.get(Number(item.barangJasaKpbpnId)) ?? null)
        : null;
      await itemPengajuanBarjasKpbpn.create(
        { ...data, estimasiHarga },
        { transaction },
      );
    }
  }
};

const keSeribu = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 1000);
};

const NOMOR_NOTIF_PENGAJUAN =
  process.env.WA_NOTIF_PENGAJUAN || "08175101951";

const kirimNotifPengajuanBaru = async (pengajuan) => {
  const tanggalStr = pengajuan.tanggal
    ? new Date(`${pengajuan.tanggal}T00:00:00`).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
  const namaPemohon = pengajuan.pemohon || pengajuan.userKPBPN?.nama;
  const message = [
    "📋 *Notifikasi Pengajuan Barang & Jasa*",
    "",
    "Pengajuan baru telah dibuat:",
    "",
    `• Nomor: ${pengajuan.nomor}`,
    `• Tanggal: ${tanggalStr}`,
    `• Jenis: ${pengajuan.jenis}`,
    `• Level: ${pengajuan.level}`,
    namaPemohon ? `• Pemohon: ${namaPemohon}` : null,
    `• Keperluan: ${pengajuan.keperluan}`,
    "",
    "_Pesan otomatis dari sistem Jasirah Diza Berjaya_",
  ]
    .filter(Boolean)
    .join("\n");

  let dokumen = null;
  try {
    const templatePath = await getActiveTemplateFilePath("pengajuanBarjas");
    if (!templatePath) {
      console.warn(
        "Template pengajuan tidak aktif, notifikasi WA dikirim tanpa PDF",
      );
    } else {
      const docxBuffer = await buildPengajuanDocxFromRecord(
        pengajuan,
        templatePath,
      );
      const pdfBuffer = await convertDocxToPdf(docxBuffer);
      dokumen = {
        mimetype: "application/pdf",
        data: pdfBuffer.toString("base64"),
        filename: `${buildPengajuanDownloadBaseName(pengajuan)}.pdf`,
      };
    }
  } catch (err) {
    console.warn(
      `Gagal membuat PDF pengajuan ${pengajuan.nomor}:`,
      err.message,
    );
  }

  const waResult = await sendMessage(NOMOR_NOTIF_PENGAJUAN, message, dokumen);
  if (waResult.queued) {
    console.log(
      `📋 WA pengajuan ${pengajuan.nomor} masuk antrian ke ${NOMOR_NOTIF_PENGAJUAN}`,
    );
  } else if (!waResult.success) {
    console.warn(
      `Gagal kirim WA pengajuan ${pengajuan.nomor}:`,
      waResult.error,
    );
  }
};

const bolehKelolaData = (req) => {
  const roleIds = getKpbpnRoleIds(req);
  return (
    roleIds.includes(ROLE_KPBPN.SUPER_ADMIN) ||
    roleIds.includes(ROLE_KPBPN.ADMIN)
  );
};

module.exports = {
  getSeed: async (req, res) => {
    try {
      const status = await statusPengajuanKpbpn.findAll({
        attributes: ["id", "nama"],
        order: [["id", "ASC"]],
      });
      const [supervisor, generalManager] = await Promise.all([
        daftarUserPeran(ROLE_KPBPN.SUPERVISOR),
        daftarUserPeran(ROLE_KPBPN.GENERAL_MANAGER),
      ]);
      return res.status(200).json({
        success: true,
        status,
        supervisor,
        generalManager,
        level: [
          { value: "normal", label: "Normal" },
          { value: "urgent", label: "Urgent" },
        ],
        jenis: [
          { value: "barang", label: "Barang" },
          { value: "jasa", label: "Jasa" },
        ],
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req, res) => {
    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = page * limit;
    const search = String(req.query.search || "").trim();
    const level = String(req.query.level || "").trim();
    const jenis = String(req.query.jenis || "").trim();
    const statusId = parseInt(req.query.statusId, 10) || null;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nomor: { [Op.like]: `%${search}%` } },
        { keperluan: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } },
      ];
    }
    if (level === "normal" || level === "urgent") where.level = level;
    if (jenis === "barang" || jenis === "jasa") where.jenis = jenis;
    if (statusId) where.statusPengajuanKpbpnId = statusId;

    try {
      const { count, rows } = await pengajuanBarjasKpbpn.findAndCountAll({
        where,
        include: [
          { model: statusPengajuanKpbpn, attributes: ["id", "nama"] },
          ...includePengguna,
        ],
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
        limit,
        offset,
        distinct: true,
      });

      const ids = rows.map((row) => row.id);
      const itemRows = ids.length
        ? await itemPengajuanBarjasKpbpn.findAll({
            attributes: [
              "pengajuanBarjasKpbpnId",
              "jumlah",
              "estimasiHarga",
              "hargaAktual",
            ],
            where: { pengajuanBarjasKpbpnId: ids },
          })
        : [];

      const result = rows.map((row) => {
        const json = row.toJSON();
        const milik = itemRows.filter(
          (item) => item.pengajuanBarjasKpbpnId === row.id,
        );
        json.jumlahItem = milik.length;
        const adaEstimasi = milik.some(
          (item) => item.estimasiHarga != null && item.estimasiHarga !== "",
        );
        json.totalEstimasi = adaEstimasi
          ? milik.reduce(
              (sum, item) =>
                sum + Number(item.jumlah) * Number(item.estimasiHarga || 0),
              0,
            )
          : null;
        json.totalAktual = milik.reduce(
          (sum, item) =>
            sum + Number(item.jumlah) * Number(item.hargaAktual || 0),
          0,
        );
        return json;
      });

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows: count,
        totalPage: Math.ceil(count / limit),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getDetail: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID pengajuan tidak valid" });

    try {
      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      if (!result) {
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    let payload;
    try {
      payload = bacaPayload(req.body);
    } catch (err) {
      return res.status(400).json({ error: "Data pengajuan tidak valid" });
    }

    const tanggal = tanggalOnly(payload.tanggal);
    const jenis = payload.jenis;
    const level = payload.level || "normal";
    const keperluan = String(payload.keperluan || "").trim();
    const pemohonId = parseInt(payload.pemohonId, 10);
    const fotoMap = fotoDariRequest(req.files);

    if (!tanggal) {
      return res.status(400).json({ error: "Tanggal pengajuan wajib diisi" });
    }
    if (jenis !== "barang" && jenis !== "jasa") {
      return res.status(400).json({ error: "Jenis harus barang atau jasa" });
    }
    if (level !== "normal" && level !== "urgent") {
      return res.status(400).json({ error: "Level harus normal atau urgent" });
    }
    if (!keperluan) {
      return res.status(400).json({ error: "Keperluan wajib diisi" });
    }
    if (!pemohonId) {
      return res.status(400).json({ error: "Pemohon wajib diisi" });
    }

    const normalized = normalisasiItem(payload.items, fotoMap);
    if (normalized.error) {
      Object.values(fotoMap).forEach(hapusFile);
      return res.status(400).json({ error: normalized.error });
    }
    const cekBarang = await pastikanBarangJasa(normalized.items, jenis);
    if (cekBarang.error) {
      Object.values(fotoMap).forEach(hapusFile);
      return res.status(400).json({ error: cekBarang.error });
    }

    const transaction = await sequelize.transaction();
    try {
      const [pemohon, statusAwal] = await Promise.all([
        userKPBPN.findByPk(pemohonId, { transaction }),
        statusPengajuanKpbpn.findOne({
          where: { nama: "Diajukan" },
          transaction,
        }),
      ]);

      if (!pemohon) {
        throw Object.assign(new Error("Pemohon tidak ditemukan"), {
          statusCode: 400,
        });
      }
      if (!statusAwal) {
        throw Object.assign(new Error("Status pengajuan belum tersedia"), {
          statusCode: 500,
        });
      }

      const nomor = await buatNomor(tanggal, transaction);
      const created = await pengajuanBarjasKpbpn.create(
        {
          nomor,
          tanggal,
          level,
          jenis,
          keperluan,
          catatan: String(payload.catatan || "").trim() || null,
          tanggalDibutuhkan: tanggalOnly(payload.tanggalDibutuhkan),
          lokasi: String(payload.lokasi || "").trim() || null,
          statusPengajuanKpbpnId: statusAwal.id,
          pemohonId,
        },
        { transaction },
      );

      await simpanItem(created.id, normalized.items, transaction);
      await transaction.commit();

      const result = await pengajuanBarjasKpbpn.findByPk(created.id, {
        include: includeDetail,
      });
      res.status(200).json({
        success: true,
        message: "Pengajuan berhasil dibuat",
        result,
      });
      setImmediate(() => {
        kirimNotifPengajuanBaru(result).catch((err) => {
          console.error("Gagal menyiapkan notifikasi pengajuan:", err);
        });
      });
      return;
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      Object.values(fotoMap).forEach(hapusFile);
      console.log(err);
      return res
        .status(err.statusCode || 500)
        .json({ error: err.message || "Gagal membuat pengajuan" });
    }
  },

  edit: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID pengajuan tidak valid" });

    let payload;
    try {
      payload = bacaPayload(req.body);
    } catch (err) {
      return res.status(400).json({ error: "Data pengajuan tidak valid" });
    }

    const tanggal = tanggalOnly(payload.tanggal);
    const jenis = payload.jenis;
    const level = payload.level || "normal";
    const keperluan = String(payload.keperluan || "").trim();
    const fotoMap = fotoDariRequest(req.files);

    if (!tanggal) {
      return res.status(400).json({ error: "Tanggal pengajuan wajib diisi" });
    }
    if (jenis !== "barang" && jenis !== "jasa") {
      return res.status(400).json({ error: "Jenis harus barang atau jasa" });
    }
    if (level !== "normal" && level !== "urgent") {
      return res.status(400).json({ error: "Level harus normal atau urgent" });
    }
    if (!keperluan) {
      return res.status(400).json({ error: "Keperluan wajib diisi" });
    }

    const normalized = normalisasiItem(payload.items, fotoMap);
    if (normalized.error) {
      Object.values(fotoMap).forEach(hapusFile);
      return res.status(400).json({ error: normalized.error });
    }
    const cekBarang = await pastikanBarangJasa(normalized.items, jenis);
    if (cekBarang.error) {
      Object.values(fotoMap).forEach(hapusFile);
      return res.status(400).json({ error: cekBarang.error });
    }

    const transaction = await sequelize.transaction();
    try {
      const existing = await pengajuanBarjasKpbpn.findByPk(id, { transaction });
      if (!existing) {
        throw Object.assign(new Error("Pengajuan tidak ditemukan"), {
          statusCode: 404,
        });
      }

      await existing.update(
        {
          tanggal,
          level,
          jenis,
          keperluan,
          catatan: String(payload.catatan || "").trim() || null,
          tanggalDibutuhkan: tanggalOnly(payload.tanggalDibutuhkan),
          lokasi: String(payload.lokasi || "").trim() || null,
        },
        { transaction },
      );
      await simpanItem(id, normalized.items, transaction);
      await selaraskanStokPengajuan(id, transaction);
      await transaction.commit();

      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      return res.status(200).json({
        success: true,
        message: "Pengajuan berhasil diperbarui",
        result,
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      Object.values(fotoMap).forEach(hapusFile);
      console.log(err);
      return res
        .status(err.statusCode || 500)
        .json({ error: err.message || "Gagal memperbarui pengajuan" });
    }
  },

  simpanPenandatangan: async (req, res, { roleId, field, labelPeran, labelUser }) => {
    if (!pemintaPunyaRole(req, roleId)) {
      return res.status(403).json({
        error: `${labelUser} hanya dapat diisi oleh ${labelPeran}`,
      });
    }

    const id = parseInt(req.params.id, 10);
    const userId = bacaIdOpsional(req.body[field], labelUser);
    if (!id) return res.status(400).json({ error: "ID pengajuan tidak valid" });
    if (userId?.error) return res.status(400).json({ error: userId.error });

    try {
      const existing = await pengajuanBarjasKpbpn.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }
      if (userId && !(await userMemilikiRole(userId, roleId))) {
        return res.status(400).json({
          error: `${labelUser} harus user dengan role ${labelPeran}`,
        });
      }

      await existing.update({ [field]: userId });
      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      return res.status(200).json({
        success: true,
        message: `${labelUser} berhasil disimpan`,
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updateMengetahui: async (req, res) =>
    module.exports.simpanPenandatangan(req, res, {
      roleId: ROLE_KPBPN.SUPERVISOR,
      field: "mengetahuiId",
      labelPeran: "Supervisor",
      labelUser: "Mengetahui",
    }),

  updateMenyetujui: async (req, res) =>
    module.exports.simpanPenandatangan(req, res, {
      roleId: ROLE_KPBPN.GENERAL_MANAGER,
      field: "menyetujuiId",
      labelPeran: "General Manager",
      labelUser: "Menyetujui",
    }),

  updateStatus: async (req, res) => {
    if (!pemintaPunyaRole(req, ROLE_KPBPN.GENERAL_AFFAIR)) {
      return res.status(403).json({
        error: "Status pengajuan hanya dapat diubah oleh General Affair",
      });
    }

    const id = parseInt(req.params.id, 10);
    const statusId = parseInt(req.body.statusPengajuanKpbpnId, 10);
    const alasanPenolakan = String(req.body.alasanPenolakan || "").trim();

    if (!id || !statusId) {
      return res.status(400).json({ error: "Status pengajuan wajib diisi" });
    }

    const transaction = await sequelize.transaction();
    try {
      const existing = await pengajuanBarjasKpbpn.findByPk(id, {
        include: [{ model: statusPengajuanKpbpn, attributes: ["id", "nama"] }],
        transaction,
      });
      const status = await statusPengajuanKpbpn.findByPk(statusId, { transaction });

      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }
      if (!status) {
        await transaction.rollback();
        return res.status(400).json({ error: "Status pengajuan tidak valid" });
      }
      if (status.nama === "Ditolak" && !alasanPenolakan) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Alasan penolakan wajib diisi",
        });
      }

      const namaLama = existing.statusPengajuanKpbpn?.nama;
      await existing.update(
        {
          statusPengajuanKpbpnId: status.id,
          alasanPenolakan: status.nama === "Ditolak" ? alasanPenolakan : null,
        },
        { transaction },
      );
      await selaraskanStokPengajuan(id, transaction);
      await transaction.commit();

      const lamaMasuk =
        existing.jenis === "barang" && STATUS_MASUK_STOK.has(namaLama);
      const baruMasuk =
        existing.jenis === "barang" && STATUS_MASUK_STOK.has(status.nama);
      let message = "Status pengajuan berhasil diperbarui";
      if (!lamaMasuk && baruMasuk) {
        message += ". Barang pengajuan masuk ke stok.";
      }
      if (lamaMasuk && !baruMasuk) {
        message += ". Barang ditarik kembali dari stok.";
      }

      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      return res.status(200).json({
        success: true,
        message,
        result,
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      console.log(err);
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  updateEstimasi: async (req, res) => {
    if (!pemintaPunyaRole(req, ROLE_KPBPN.GENERAL_AFFAIR)) {
      return res.status(403).json({
        error: "Estimasi harga hanya dapat diisi oleh General Affair",
      });
    }

    const id = parseInt(req.params.id, 10);
    const items = Array.isArray(req.body.items) ? req.body.items : null;
    if (!id || !items) {
      return res.status(400).json({ error: "Data estimasi harga wajib diisi" });
    }

    const transaction = await sequelize.transaction();
    try {
      const existing = await pengajuanBarjasKpbpn.findByPk(id, { transaction });
      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }

      for (const item of items) {
        const itemId = parseInt(item.id, 10);
        if (!itemId) continue;
        const estimasiHarga =
          item.estimasiHarga === "" || item.estimasiHarga == null
            ? null
            : parseUang(item.estimasiHarga);
        await itemPengajuanBarjasKpbpn.update(
          { estimasiHarga },
          {
            where: { id: itemId, pengajuanBarjasKpbpnId: id },
            transaction,
          },
        );
      }

      await transaction.commit();
      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      return res.status(200).json({
        success: true,
        message: "Estimasi harga berhasil disimpan",
        result,
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updateHarga: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const items = Array.isArray(req.body.items) ? req.body.items : null;

    if (!id || !items) {
      return res.status(400).json({ error: "Data harga aktual wajib diisi" });
    }

    const transaction = await sequelize.transaction();
    try {
      const existing = await pengajuanBarjasKpbpn.findByPk(id, { transaction });
      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }

      for (const item of items) {
        const itemId = parseInt(item.id, 10);
        if (!itemId) continue;
        const hargaAktual =
          item.hargaAktual === "" || item.hargaAktual == null
            ? null
            : parseUang(item.hargaAktual);
        await itemPengajuanBarjasKpbpn.update(
          { hargaAktual },
          {
            where: { id: itemId, pengajuanBarjasKpbpnId: id },
            transaction,
          },
        );
      }

      await transaction.commit();
      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      return res.status(200).json({
        success: true,
        message: "Harga aktual berhasil disimpan",
        result,
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getAdminStats: async (req, res) => {
    if (!bolehKelolaData(req)) {
      return res.status(403).json({
        error: "Hanya Super Admin atau Admin yang dapat melihat data ini",
      });
    }

    try {
      const [totalPengajuan, totalItem] = await Promise.all([
        pengajuanBarjasKpbpn.count(),
        itemPengajuanBarjasKpbpn.count(),
      ]);
      return res.status(200).json({
        success: true,
        totalPengajuan,
        totalItem,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteAll: async (req, res) => {
    if (!bolehKelolaData(req)) {
      return res.status(403).json({
        error: "Hanya Super Admin atau Admin yang dapat menghapus semua pengajuan",
      });
    }

    const transaction = await sequelize.transaction();
    try {
      const totalPengajuan = await pengajuanBarjasKpbpn.count({ transaction });
      if (!totalPengajuan) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Tidak ada data pengajuan untuk dihapus",
        });
      }

      const items = await itemPengajuanBarjasKpbpn.findAll({
        attributes: ["foto"],
        transaction,
      });
      const fotos = items.map((item) => item.foto).filter(Boolean);
      const mutasiMasuk = await mutasiStokBarangKpbpn.findAll({
        attributes: ["barangJasaKpbpnId", "jumlah"],
        where: {
          jenis: "masuk",
          pengajuanBarjasKpbpnId: { [Op.ne]: null },
        },
        transaction,
      });
      const pengurang = new Map();
      mutasiMasuk.forEach((row) => {
        const barangId = row.barangJasaKpbpnId;
        pengurang.set(barangId, (pengurang.get(barangId) || 0) + keSeribu(row.jumlah));
      });

      for (const [barangId, jumlah] of pengurang) {
        const master = await barangJasaKpbpn.findByPk(barangId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!master) continue;
        const sisa = Math.max(0, keSeribu(master.stok) - jumlah);
        await master.update({ stok: sisa / 1000 }, { transaction });
      }

      await mutasiStokBarangKpbpn.destroy({
        where: { pengajuanBarjasKpbpnId: { [Op.ne]: null } },
        transaction,
      });
      const totalItem = await itemPengajuanBarjasKpbpn.destroy({
        where: {},
        transaction,
      });
      await pengajuanBarjasKpbpn.destroy({ where: {}, transaction });
      await transaction.commit();
      fotos.forEach(hapusFile);

      return res.status(200).json({
        success: true,
        message: `${totalPengajuan} pengajuan berhasil dihapus`,
        totalPengajuan,
        totalItem,
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  remove: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID pengajuan tidak valid" });

    const transaction = await sequelize.transaction();
    try {
      const existing = await pengajuanBarjasKpbpn.findByPk(id, {
        include: [
          { model: statusPengajuanKpbpn, attributes: ["id", "nama"] },
          { model: itemPengajuanBarjasKpbpn },
        ],
        transaction,
      });

      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }
      if (existing.statusPengajuanKpbpn?.nama !== "Diajukan") {
        await transaction.rollback();
        return res.status(400).json({
          error: "Hanya pengajuan berstatus Diajukan yang dapat dihapus",
        });
      }

      const fotos = (existing.itemPengajuanBarjasKpbpns || [])
        .map((item) => item.foto)
        .filter(Boolean);
      await itemPengajuanBarjasKpbpn.destroy({
        where: { pengajuanBarjasKpbpnId: id },
        transaction,
      });
      await existing.destroy({ transaction });
      await transaction.commit();
      fotos.forEach(hapusFile);

      return res.status(200).json({
        success: true,
        message: "Pengajuan berhasil dihapus",
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  cetak: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ error: "ID pengajuan tidak valid" });
    }

    try {
      const result = await pengajuanBarjasKpbpn.findByPk(id, {
        include: includeDetail,
      });
      if (!result) {
        return res.status(404).json({ error: "Pengajuan tidak ditemukan" });
      }

      const templatePath = await getActiveTemplateFilePath("pengajuanBarjas");
      if (!templatePath) {
        return res.status(400).json({
          error:
            "Template pengajuan aktif tidak ditemukan. Unggah dan aktifkan template pada menu Template Dokumen KPBPN.",
        });
      }

      const docxBuffer = await buildPengajuanDocxFromRecord(
        result,
        templatePath,
      );
      const format = String(req.query.format || "pdf").toLowerCase();
      const isDocx = format === "docx" || format === "doc" || format === "word";
      const ext = isDocx ? "docx" : "pdf";
      const outputFileName = `${buildPengajuanDownloadBaseName(result)}.${ext}`;
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

      let pdfBuffer;
      try {
        pdfBuffer = await convertDocxToPdf(docxBuffer);
      } catch (err) {
        const message = String(err.message || "Gagal mengonversi pengajuan ke PDF").replace(
          "surat jalan",
          "pengajuan",
        );
        return res.status(500).json({ error: message });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${outputFileName}"; filename*=UTF-8''${encodedFileName}`,
      );
      return res.send(pdfBuffer);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
