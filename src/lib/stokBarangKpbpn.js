const {
  sequelize,
  barangJasaKpbpn,
  itemPengajuanBarjasKpbpn,
  pengajuanBarjasKpbpn,
  statusPengajuanKpbpn,
  mutasiStokBarangKpbpn,
} = require("../models");

const STATUS_MASUK_STOK = new Set(["Disetujui", "Diproses", "Selesai"]);

const gagal = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

const keSeribu = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 1000);
};

const dariSeribu = (value) => value / 1000;

const samaTeks = (a, b) =>
  String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

const ubahStok = async (barangJasaId, delta, transaction) => {
  const master = await barangJasaKpbpn.findByPk(barangJasaId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!master) throw gagal("Barang tidak ditemukan", 404);

  const berikutnya = keSeribu(master.stok) + keSeribu(delta);
  if (berikutnya < 0) {
    throw gagal("Stok tidak mencukupi karena sebagian barang sudah terpakai");
  }
  await master.update({ stok: dariSeribu(berikutnya) }, { transaction });
  return master;
};

const pastikanMasterBarang = async (item, transaction) => {
  if (item.barangJasaKpbpnId) {
    const master = await barangJasaKpbpn.findByPk(item.barangJasaKpbpnId, {
      transaction,
    });
    if (!master || master.jenis !== "barang") {
      throw gagal("Stok hanya dapat dicatat untuk barang");
    }
    return master;
  }

  const satuan = String(item.satuan || "").trim() || "unit";
  const kandidat = await barangJasaKpbpn.findAll({
    where: { jenis: "barang" },
    transaction,
  });
  let master = kandidat.find(
    (row) => samaTeks(row.nama, item.nama) && samaTeks(row.satuan || "unit", satuan),
  );
  if (!master) {
    master = await barangJasaKpbpn.create(
      {
        nama: String(item.nama || "").trim(),
        jenis: "barang",
        satuan,
        spesifikasi: item.spesifikasi || null,
        stok: 0,
      },
      { transaction },
    );
  }
  await item.update({ barangJasaKpbpnId: master.id }, { transaction });
  return master;
};

const tarikMutasi = async (mutasi, transaction) => {
  await ubahStok(mutasi.barangJasaKpbpnId, -Number(mutasi.jumlah), transaction);
  await mutasi.destroy({ transaction });
};

const selaraskanStokPengajuan = async (pengajuanId, transaction) => {
  const pengajuan = await pengajuanBarjasKpbpn.findByPk(pengajuanId, {
    include: [{ model: statusPengajuanKpbpn, attributes: ["id", "nama"] }],
    transaction,
  });
  if (!pengajuan) return { masukStok: false };

  const masukStok =
    pengajuan.jenis === "barang" &&
    STATUS_MASUK_STOK.has(pengajuan.statusPengajuanKpbpn?.nama);

  const items = await itemPengajuanBarjasKpbpn.findAll({
    where: { pengajuanBarjasKpbpnId: pengajuanId },
    transaction,
  });
  const mutasiMasuk = await mutasiStokBarangKpbpn.findAll({
    where: { pengajuanBarjasKpbpnId: pengajuanId, jenis: "masuk" },
    transaction,
  });
  const itemIds = new Set(items.map((item) => item.id));

  if (!masukStok) {
    for (const mutasi of mutasiMasuk) {
      await tarikMutasi(mutasi, transaction);
    }
    return { masukStok: false };
  }

  for (const mutasi of mutasiMasuk) {
    if (!itemIds.has(mutasi.itemPengajuanBarjasKpbpnId)) {
      await tarikMutasi(mutasi, transaction);
    }
  }
  const mutasiSisa = mutasiMasuk.filter((row) =>
    itemIds.has(row.itemPengajuanBarjasKpbpnId),
  );

  for (const item of items) {
    const master = await pastikanMasterBarang(item, transaction);
    const jumlah = dariSeribu(keSeribu(item.jumlah));
    const mutasiAktif = mutasiSisa.find(
      (row) => row.itemPengajuanBarjasKpbpnId === item.id,
    );

    if (!mutasiAktif) {
      await ubahStok(master.id, jumlah, transaction);
      await mutasiStokBarangKpbpn.create(
        {
          jenis: "masuk",
          jumlah,
          keterangan: `Masuk dari pengajuan ${pengajuan.nomor}`,
          barangJasaKpbpnId: master.id,
          pengajuanBarjasKpbpnId: pengajuan.id,
          itemPengajuanBarjasKpbpnId: item.id,
        },
        { transaction },
      );
      continue;
    }

    if (mutasiAktif.barangJasaKpbpnId !== master.id) {
      await ubahStok(
        mutasiAktif.barangJasaKpbpnId,
        -Number(mutasiAktif.jumlah),
        transaction,
      );
      await ubahStok(master.id, jumlah, transaction);
      await mutasiAktif.update(
        {
          barangJasaKpbpnId: master.id,
          jumlah,
          keterangan: `Masuk dari pengajuan ${pengajuan.nomor}`,
        },
        { transaction },
      );
      continue;
    }

    const selisih = keSeribu(jumlah) - keSeribu(mutasiAktif.jumlah);
    if (selisih !== 0) {
      await ubahStok(master.id, dariSeribu(selisih), transaction);
      await mutasiAktif.update({ jumlah }, { transaction });
    }
  }

  return { masukStok: true };
};

const catatPemakaian = async ({ barangJasaId, jumlah, keterangan, userId }) => {
  const qty = dariSeribu(keSeribu(jumlah));
  if (qty <= 0) throw gagal("Jumlah pemakaian harus lebih dari 0");

  const transaction = await sequelize.transaction();
  try {
    const master = await barangJasaKpbpn.findByPk(barangJasaId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!master) throw gagal("Barang atau jasa tidak ditemukan", 404);
    if (master.jenis !== "barang") throw gagal("Stok hanya tersedia untuk barang");

    const berikutnya = keSeribu(master.stok) - keSeribu(qty);
    if (berikutnya < 0) throw gagal("Stok tidak mencukupi");

    await master.update({ stok: dariSeribu(berikutnya) }, { transaction });
    await mutasiStokBarangKpbpn.create(
      {
        jenis: "keluar",
        jumlah: qty,
        keterangan: String(keterangan || "").trim() || "Pemakaian stok",
        barangJasaKpbpnId: master.id,
        userKPBPNId: userId || null,
      },
      { transaction },
    );
    await transaction.commit();
    return master;
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    throw err;
  }
};

module.exports = {
  STATUS_MASUK_STOK,
  selaraskanStokPengajuan,
  catatPemakaian,
};
