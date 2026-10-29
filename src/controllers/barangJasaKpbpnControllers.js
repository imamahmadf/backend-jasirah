const { Op } = require("sequelize");
const {
  sequelize,
  barangJasaKpbpn,
  itemPengajuanBarjasKpbpn,
  pengajuanBarjasKpbpn,
  statusPengajuanKpbpn,
  mutasiStokBarangKpbpn,
} = require("../models");
const { getKpbpnRoleIds, getKpbpnUserId, ROLE_KPBPN } = require("../lib/auth");
const { catatPemakaian } = require("../lib/stokBarangKpbpn");

const samaTeks = (a, b) =>
  String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

const angka = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const cariMaster = (daftar, { nama, jenis, satuan }) =>
  daftar.find(
    (row) =>
      row.jenis === jenis &&
      samaTeks(row.nama, nama) &&
      samaTeks(row.satuan || "unit", satuan || "unit"),
  );

const ringkasMaster = (row) => ({
  id: row.id,
  nama: row.nama,
  jenis: row.jenis,
  satuan: row.satuan || "unit",
  spesifikasi: row.spesifikasi || null,
});

const lebihBaru = (a, b) => {
  const tanggalA = String(a.tanggal || "");
  const tanggalB = String(b.tanggal || "");
  if (tanggalA !== tanggalB) return tanggalA > tanggalB;
  if (Number(a.pengajuanId) !== Number(b.pengajuanId)) {
    return Number(a.pengajuanId) > Number(b.pengajuanId);
  }
  return Number(a.itemId) > Number(b.itemId);
};

const estimasiTerbaruMap = async (barangJasaIds, transaction) => {
  const ids = [
    ...new Set(
      (barangJasaIds || []).map((id) => Number(id)).filter((id) => id > 0),
    ),
  ];
  const hasil = new Map();
  if (!ids.length) return hasil;

  const rows = await itemPengajuanBarjasKpbpn.findAll({
    attributes: ["id", "barangJasaKpbpnId", "estimasiHarga"],
    where: {
      barangJasaKpbpnId: ids,
      estimasiHarga: { [Op.ne]: null },
    },
    include: [
      {
        model: pengajuanBarjasKpbpn,
        attributes: ["id", "tanggal"],
        required: true,
      },
    ],
    transaction,
  });

  const terbaik = new Map();
  rows.forEach((row) => {
    const calon = {
      harga: row.estimasiHarga,
      tanggal: row.pengajuanBarjasKpbpn?.tanggal,
      pengajuanId: row.pengajuanBarjasKpbpn?.id,
      itemId: row.id,
    };
    const ada = terbaik.get(Number(row.barangJasaKpbpnId));
    if (!ada || lebihBaru(calon, ada)) {
      terbaik.set(Number(row.barangJasaKpbpnId), calon);
    }
  });
  terbaik.forEach((nilai, kunci) => hasil.set(Number(kunci), nilai.harga));
  return hasil;
};

const muatItemTertaut = () =>
  itemPengajuanBarjasKpbpn.findAll({
    attributes: ["id", "nama", "jumlah", "satuan", "barangJasaKpbpnId", "pengajuanBarjasKpbpnId"],
    include: [
      {
        model: pengajuanBarjasKpbpn,
        attributes: ["id", "nomor", "tanggal", "jenis"],
        include: [{ model: statusPengajuanKpbpn, attributes: ["id", "nama"] }],
      },
    ],
  });

const ringkasPengajuan = (item) => ({
  itemId: item.id,
  pengajuanId: item.pengajuanBarjasKpbpn?.id || item.pengajuanBarjasKpbpnId,
  nomor: item.pengajuanBarjasKpbpn?.nomor || "-",
  tanggal: item.pengajuanBarjasKpbpn?.tanggal || null,
  status: item.pengajuanBarjasKpbpn?.statusPengajuanKpbpn?.nama || "-",
  jumlah: angka(item.jumlah),
  satuan: item.satuan || "unit",
});

const rekapMaster = (master, items) => {
  const milik = items.filter((item) => item.barangJasaKpbpnId === master.id);
  const pengajuanIds = new Set(milik.map((item) => item.pengajuanBarjasKpbpnId));
  const totalJumlah = milik.reduce((sum, item) => sum + angka(item.jumlah), 0);
  const jumlahDitolak = milik.reduce((sum, item) => {
    if (item.pengajuanBarjasKpbpn?.statusPengajuanKpbpn?.nama !== "Ditolak") return sum;
    return sum + angka(item.jumlah);
  }, 0);

  return {
    ...ringkasMaster(master),
    stok: master.jenis === "barang" ? angka(master.stok) : null,
    totalJumlah,
    jumlahDitolak,
    jumlahBerjalan: totalJumlah - jumlahDitolak,
    jumlahPengajuan: pengajuanIds.size,
  };
};

const kelompokBelum = (items) => {
  const peta = new Map();
  items
    .filter((item) => !item.barangJasaKpbpnId)
    .forEach((item) => {
      const jenis = item.pengajuanBarjasKpbpn?.jenis || "barang";
      const satuan = item.satuan || "unit";
      const kunci = `${String(item.nama || "").trim().toLowerCase()}|${jenis}|${satuan.trim().toLowerCase()}`;
      if (!peta.has(kunci)) {
        peta.set(kunci, {
          nama: String(item.nama || "").trim(),
          jenis,
          satuan,
          totalJumlah: 0,
          jumlahBaris: 0,
          itemPengajuanId: item.id,
        });
      }
      const kelompok = peta.get(kunci);
      kelompok.totalJumlah += angka(item.jumlah);
      kelompok.jumlahBaris += 1;
    });

  return [...peta.values()].sort((a, b) => a.nama.localeCompare(b.nama, "id"));
};

const bacaMaster = (body) => {
  const nama = String(body?.nama || "").trim();
  const jenis = body?.jenis;
  const satuan = String(body?.satuan || "").trim() || "unit";
  const spesifikasi = String(body?.spesifikasi || "").trim() || null;
  if (!nama) return { error: "Nama barang atau jasa wajib diisi" };
  if (jenis !== "barang" && jenis !== "jasa") {
    return { error: "Jenis harus barang atau jasa" };
  }
  return { nama, jenis, satuan, spesifikasi };
};

module.exports = {
  estimasiTerbaruMap,
  getAll: async (req, res) => {
    try {
      const masters = await barangJasaKpbpn.findAll({
        order: [
          ["nama", "ASC"],
          ["id", "ASC"],
        ],
      });
      if (String(req.query.ringkas || "") === "1") {
        const estimasi = await estimasiTerbaruMap(masters.map((row) => row.id));
        return res.status(200).json({
          success: true,
          result: masters.map((row) => ({
            ...ringkasMaster(row),
            estimasiTerbaru: estimasi.has(Number(row.id))
              ? estimasi.get(Number(row.id))
              : null,
          })),
        });
      }

      const items = await muatItemTertaut();
      const pernahStok = new Set(
        (
          await mutasiStokBarangKpbpn.findAll({
            attributes: ["barangJasaKpbpnId"],
            group: ["barangJasaKpbpnId"],
          })
        ).map((row) => row.barangJasaKpbpnId),
      );
      const search = String(req.query.search || "").trim().toLowerCase();
      const jenis = String(req.query.jenis || "").trim();
      let result = masters.map((master) => {
        const rekap = rekapMaster(master, items);
        rekap.stokHabis =
          master.jenis === "barang" &&
          angka(master.stok) === 0 &&
          pernahStok.has(master.id);
        return rekap;
      });
      let belum = kelompokBelum(items);
      if (jenis === "barang" || jenis === "jasa") {
        result = result.filter((row) => row.jenis === jenis);
        belum = belum.filter((row) => row.jenis === jenis);
      }
      if (search) {
        result = result.filter((row) =>
          `${row.nama} ${row.spesifikasi || ""}`.toLowerCase().includes(search),
        );
        belum = belum.filter((row) => row.nama.toLowerCase().includes(search));
      }

      return res.status(200).json({
        success: true,
        result,
        belum,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getRiwayat: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID barang atau jasa tidak valid" });

    try {
      const master = await barangJasaKpbpn.findByPk(id);
      if (!master) {
        return res.status(404).json({ error: "Barang atau jasa tidak ditemukan" });
      }
      const items = await muatItemTertaut();
      const milik = items.filter((item) => item.barangJasaKpbpnId === id);
      const mutasi = await mutasiStokBarangKpbpn.findAll({
        where: { barangJasaKpbpnId: id },
        order: [["id", "DESC"]],
        limit: 50,
      });
      const rekap = rekapMaster(master, items);
      rekap.stokHabis =
        master.jenis === "barang" &&
        angka(master.stok) === 0 &&
        mutasi.length > 0;
      return res.status(200).json({
        success: true,
        result: rekap,
        riwayat: milik.map(ringkasPengajuan),
        mutasi: mutasi.map((row) => ({
          id: row.id,
          jenis: row.jenis,
          jumlah: angka(row.jumlah),
          keterangan: row.keterangan || "-",
          tanggal: row.createdAt,
          pengajuanId: row.pengajuanBarjasKpbpnId || null,
        })),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    const data = bacaMaster(req.body);
    if (data.error) return res.status(400).json({ error: data.error });

    try {
      const masters = await barangJasaKpbpn.findAll({ where: { jenis: data.jenis } });
      if (cariMaster(masters, data)) {
        return res.status(400).json({
          error: "Barang atau jasa dengan nama, jenis, dan satuan yang sama sudah terdaftar",
        });
      }
      const created = await barangJasaKpbpn.create(data);
      return res.status(200).json({
        success: true,
        message: "Barang atau jasa berhasil didaftarkan",
        result: ringkasMaster(created),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  edit: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const data = bacaMaster(req.body);
    if (!id) return res.status(400).json({ error: "ID barang atau jasa tidak valid" });
    if (data.error) return res.status(400).json({ error: data.error });

    try {
      const existing = await barangJasaKpbpn.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Barang atau jasa tidak ditemukan" });
      }
      if (existing.jenis === "barang" && data.jenis !== "barang" && angka(existing.stok) > 0) {
        return res.status(400).json({
          error: "Barang yang masih memiliki stok tidak dapat diubah menjadi jasa",
        });
      }
      const masters = await barangJasaKpbpn.findAll({
        where: { jenis: data.jenis, id: { [Op.ne]: id } },
      });
      if (cariMaster(masters, data)) {
        return res.status(400).json({
          error: "Barang atau jasa dengan nama, jenis, dan satuan yang sama sudah terdaftar",
        });
      }
      await existing.update(data);
      return res.status(200).json({
        success: true,
        message: "Barang atau jasa berhasil diperbarui",
        result: ringkasMaster(existing),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  remove: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID barang atau jasa tidak valid" });

    try {
      const existing = await barangJasaKpbpn.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Barang atau jasa tidak ditemukan" });
      }
      const terpakai = await itemPengajuanBarjasKpbpn.count({
        where: { barangJasaKpbpnId: id },
      });
      const adaMutasi = await mutasiStokBarangKpbpn.count({
        where: { barangJasaKpbpnId: id },
      });
      if (terpakai > 0 || adaMutasi > 0) {
        return res.status(400).json({
          error: "Barang atau jasa masih dipakai di pengajuan, jadi tidak bisa dihapus",
        });
      }
      await existing.destroy();
      return res.status(200).json({
        success: true,
        message: "Barang atau jasa berhasil dihapus",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  daftarkanDariItem: async (req, res) => {
    const itemId = parseInt(req.body.itemPengajuanId, 10);
    if (!itemId) {
      return res.status(400).json({ error: "Item pengajuan wajib dipilih" });
    }

    const transaction = await sequelize.transaction();
    try {
      const item = await itemPengajuanBarjasKpbpn.findByPk(itemId, {
        include: [{ model: pengajuanBarjasKpbpn, attributes: ["id", "jenis"] }],
        transaction,
      });
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({ error: "Item pengajuan tidak ditemukan" });
      }

      const nama = String(item.nama || "").trim();
      const jenis = item.pengajuanBarjasKpbpn?.jenis;
      const satuan = String(item.satuan || "").trim() || "unit";
      if (!nama || (jenis !== "barang" && jenis !== "jasa")) {
        await transaction.rollback();
        return res.status(400).json({ error: "Item pengajuan tidak lengkap" });
      }

      const masters = await barangJasaKpbpn.findAll({
        where: { jenis },
        transaction,
      });
      let master = cariMaster(masters, { nama, jenis, satuan });
      if (!master) {
        master = await barangJasaKpbpn.create(
          {
            nama,
            jenis,
            satuan,
            spesifikasi: item.spesifikasi || null,
          },
          { transaction },
        );
      }

      const kandidat = await itemPengajuanBarjasKpbpn.findAll({
        where: { barangJasaKpbpnId: null },
        include: [
          {
            model: pengajuanBarjasKpbpn,
            attributes: ["jenis"],
            where: { jenis },
            required: true,
          },
        ],
        transaction,
      });
      const ids = kandidat
        .filter(
          (row) => samaTeks(row.nama, nama) && samaTeks(row.satuan || "unit", satuan),
        )
        .map((row) => row.id);

      if (ids.length) {
        await itemPengajuanBarjasKpbpn.update(
          { barangJasaKpbpnId: master.id },
          { where: { id: ids }, transaction },
        );
      }

      await transaction.commit();
      return res.status(200).json({
        success: true,
        message: `${nama} didaftarkan. ${ids.length} baris pengajuan terhubung.`,
        terhubung: ids.length,
        result: ringkasMaster(master),
      });
    } catch (err) {
      if (!transaction.finished) await transaction.rollback();
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  pakaiStok: async (req, res) => {
    const roleIds = getKpbpnRoleIds(req);
    const boleh = [
      ROLE_KPBPN.SUPER_ADMIN,
      ROLE_KPBPN.ADMIN,
      ROLE_KPBPN.KEUANGAN,
      ROLE_KPBPN.GENERAL_AFFAIR,
    ].some((roleId) => roleIds.includes(roleId));
    if (!boleh) {
      return res.status(403).json({
        error: "Stok hanya dapat dikurangi oleh Super Admin, Admin, Keuangan, atau General Affair",
      });
    }

    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID barang tidak valid" });

    try {
      const master = await catatPemakaian({
        barangJasaId: id,
        jumlah: req.body.jumlah,
        keterangan: req.body.keterangan,
        userId: getKpbpnUserId(req),
      });
      return res.status(200).json({
        success: true,
        message: "Stok berhasil dikurangi",
        result: { id: master.id, stok: angka(master.stok) },
      });
    } catch (err) {
      console.log(err);
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  },
};
