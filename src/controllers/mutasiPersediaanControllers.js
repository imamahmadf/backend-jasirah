const {
  mutasiPersediaan,
  stokMasuk,
  stokKeluar,
  persediaan,
  daftarUnitKerja,
  sumberDana,
  satuanPersediaan,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

const stokInclude = [
  {
    model: persediaan,
    attributes: ["id", "nama", "kodeBarang", "NUSP"],
  },
  {
    model: sumberDana,
    attributes: ["id", "sumber"],
    required: false,
  },
  {
    model: satuanPersediaan,
    attributes: ["id", "satuan"],
    required: false,
  },
];

const mapStokTersediaRows = (rows) =>
  rows
    .map((sm) => {
      const totalKeluar = sm.stokKeluars
        ? sm.stokKeluars.reduce((s, k) => s + (k.jumlah || 0), 0)
        : 0;
      const sisaStok = (sm.jumlah || 0) - totalKeluar;
      return {
        id: sm.id,
        unitKerjaId: sm.unitKerjaId,
        persediaanId: sm.persediaanId,
        jumlah: sm.jumlah,
        sisaStok,
        hargaSatuan: sm.hargaSatuan,
        spesifikasi: sm.spesifikasi,
        tanggal: sm.tanggal,
        foto: sm.foto,
        mutasiPersediaanId: sm.mutasiPersediaanId,
        persediaan: sm.persediaan,
        sumberDana: sm.sumberDana,
        satuanPersediaan: sm.satuanPersediaan,
        daftarUnitKerja: sm.daftarUnitKerja || null,
      };
    })
    .filter((r) => r.sisaStok > 0);

const stokTersediaQueryInclude = [
  ...stokInclude,
  {
    model: daftarUnitKerja,
    attributes: ["id", "unitKerja", "kode"],
  },
  {
    model: stokKeluar,
    attributes: ["jumlah"],
    required: false,
  },
];

const mutasiListInclude = [
  {
    model: stokMasuk,
    as: "stokMasukAsal",
    include: stokInclude,
  },
  {
    model: stokMasuk,
    as: "stokMasukTujuan",
    attributes: [
      "id",
      "persediaanId",
      "unitKerjaId",
      "jumlah",
      "hargaSatuan",
      "tanggal",
      "mutasiPersediaanId",
      "stokMasukAsalId",
    ],
  },
  {
    model: daftarUnitKerja,
    as: "unitKerjaAsal",
    attributes: ["id", "unitKerja", "kode"],
  },
  {
    model: daftarUnitKerja,
    as: "unitKerjaTujuan",
    attributes: ["id", "unitKerja", "kode"],
  },
];

module.exports = {
  getAllStokTersedia: async (req, res) => {
    try {
      const rows = await stokMasuk.findAll({
        include: stokTersediaQueryInclude,
        order: [
          [{ model: daftarUnitKerja }, "unitKerja", "ASC"],
          ["tanggal", "DESC"],
        ],
      });

      const result = mapStokTersediaRows(rows);
      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil stok tersedia semua unit kerja",
        error: err.toString(),
      });
    }
  },

  getStokTersedia: async (req, res) => {
    const { unitKerjaId } = req.params;

    try {
      const rows = await stokMasuk.findAll({
        where: { unitKerjaId },
        include: stokTersediaQueryInclude,
        order: [["tanggal", "DESC"]],
      });

      const result = mapStokTersediaRows(rows);
      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil stok tersedia",
        error: err.toString(),
      });
    }
  },

  getMutasiList: async (req, res) => {
    const { unitKerjaId } = req.params;
    const isAll = unitKerjaId === "all";

    try {
      const result = await mutasiPersediaan.findAll({
        where: isAll
          ? {}
          : {
              [Op.or]: [
                { unitKerjaAsalId: unitKerjaId },
                { unitKerjaTujuanId: unitKerjaId },
              ],
            },
        include: mutasiListInclude,
        order: [["tanggal", "DESC"], ["id", "DESC"]],
      });

      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data mutasi",
        error: err.toString(),
      });
    }
  },

  getMutasiDetail: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await mutasiPersediaan.findByPk(id, {
        include: mutasiListInclude,
      });

      if (!result) {
        return res.status(404).json({ message: "Mutasi tidak ditemukan" });
      }

      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil detail mutasi",
        error: err.toString(),
      });
    }
  },

  postMutasi: async (req, res) => {
    const {
      stokMasukAsalId,
      unitKerjaTujuanId,
      jumlah,
      tanggal,
      keterangan,
    } = req.body;

    let transaction;

    try {
      if (!stokMasukAsalId || !unitKerjaTujuanId || !jumlah || !tanggal) {
        return res.status(400).json({
          message: "stokMasukAsalId, unitKerjaTujuanId, jumlah, dan tanggal wajib diisi",
        });
      }

      transaction = await sequelize.transaction();

      const asal = await stokMasuk.findByPk(stokMasukAsalId, { transaction });
      if (!asal) {
        await transaction.rollback();
        return res.status(404).json({ message: "Stok asal tidak ditemukan" });
      }

      if (Number(asal.unitKerjaId) === Number(unitKerjaTujuanId)) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Unit kerja tujuan tidak boleh sama dengan unit asal",
        });
      }

      const unitTujuan = await daftarUnitKerja.findByPk(unitKerjaTujuanId, {
        attributes: ["id", "unitKerja", "kode"],
        transaction,
      });
      if (!unitTujuan) {
        await transaction.rollback();
        return res.status(404).json({ message: "Unit kerja tujuan tidak ditemukan" });
      }

      const totalKeluar =
        (await stokKeluar.sum("jumlah", {
          where: { stokMasukId: stokMasukAsalId },
          transaction,
        })) || 0;
      const sisaStok = asal.jumlah - totalKeluar;

      if (Number(jumlah) > sisaStok) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Jumlah mutasi melebihi sisa stok. Sisa tersedia: ${sisaStok}`,
        });
      }

      const mutasi = await mutasiPersediaan.create(
        {
          stokMasukAsalId,
          unitKerjaAsalId: asal.unitKerjaId,
          unitKerjaTujuanId,
          jumlah: Number(jumlah),
          tanggal,
          keterangan: keterangan || null,
          status: "selesai",
        },
        { transaction }
      );

      const labelTujuan = unitTujuan.unitKerja || unitTujuan.kode || "unit tujuan";

      await stokKeluar.create(
        {
          stokMasukId: stokMasukAsalId,
          mutasiPersediaanId: mutasi.id,
          jumlah: Number(jumlah),
          tanggal,
          tujuan: `Mutasi ke ${labelTujuan}`,
          keterangan: keterangan || `Mutasi persediaan #${mutasi.id}`,
        },
        { transaction }
      );

      const masukTujuan = await stokMasuk.create(
        {
          persediaanId: asal.persediaanId,
          unitKerjaId: unitKerjaTujuanId,
          jumlah: Number(jumlah),
          hargaSatuan: asal.hargaSatuan,
          tanggal,
          keterangan: keterangan || "Barang hasil mutasi antar unit kerja",
          spesifikasi: asal.spesifikasi,
          sumberDanaId: asal.sumberDanaId,
          satuanPersediaanId: asal.satuanPersediaanId,
          foto: asal.foto,
          mutasiPersediaanId: mutasi.id,
          stokMasukAsalId: stokMasukAsalId,
        },
        { transaction }
      );

      await mutasi.update(
        { stokMasukTujuanId: masukTujuan.id },
        { transaction }
      );

      await transaction.commit();

      const result = await mutasiPersediaan.findByPk(mutasi.id, {
        include: mutasiListInclude,
      });

      return res.status(200).json({ success: true, result });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan mutasi persediaan",
        error: err.toString(),
      });
    }
  },

  batalkanMutasi: async (req, res) => {
    const { id } = req.params;
    let transaction;

    try {
      transaction = await sequelize.transaction();

      const mutasi = await mutasiPersediaan.findByPk(id, { transaction });
      if (!mutasi) {
        await transaction.rollback();
        return res.status(404).json({ message: "Mutasi tidak ditemukan" });
      }

      if (mutasi.status === "dibatalkan") {
        await transaction.rollback();
        return res.status(400).json({ message: "Mutasi sudah dibatalkan sebelumnya" });
      }

      const masukTujuan = mutasi.stokMasukTujuanId
        ? await stokMasuk.findByPk(mutasi.stokMasukTujuanId, { transaction })
        : await stokMasuk.findOne({
            where: { mutasiPersediaanId: mutasi.id },
            transaction,
          });

      if (!masukTujuan) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Data stok masuk tujuan mutasi tidak ditemukan",
        });
      }

      const totalKeluarTujuan =
        (await stokKeluar.sum("jumlah", {
          where: { stokMasukId: masukTujuan.id },
          transaction,
        })) || 0;

      if (totalKeluarTujuan > 0) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Stok hasil mutasi di unit tujuan sudah digunakan, mutasi tidak dapat dibatalkan",
        });
      }

      let keluar = await stokKeluar.findOne({
        where: { mutasiPersediaanId: mutasi.id },
        transaction,
      });

      if (!keluar) {
        keluar = await stokKeluar.findOne({
          where: {
            stokMasukId: mutasi.stokMasukAsalId,
            jumlah: mutasi.jumlah,
            [Op.or]: [
              { keterangan: { [Op.like]: `%#${mutasi.id}%` } },
              { tujuan: { [Op.like]: "Mutasi ke%" } },
            ],
          },
          transaction,
        });
      }

      if (!keluar) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Data stok keluar mutasi tidak ditemukan",
        });
      }

      await keluar.destroy({ transaction });
      await masukTujuan.destroy({ transaction });
      await mutasi.destroy({ transaction });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Mutasi berhasil dibatalkan. Stok telah dikembalikan ke kondisi semula.",
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal membatalkan mutasi persediaan",
        error: err.toString(),
      });
    }
  },
};
