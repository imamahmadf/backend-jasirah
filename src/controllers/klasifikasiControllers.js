const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  rincianBPD,
  perjalanan,
  personil,
  jenisRincianBPD,
  tempat,
  jenisTempat,
  PPTK,
  rill,
  daftarUnitKerja,
  indukUnitKerja,
  sequelize,
  user,
  userRole,
  role,
  profile,
  kodeKlasifikasi,
  suratKeluar,
  klasifikasi,
} = require("../models");
const fs = require("fs");

module.exports = {
  getKlasifikasi: async (req, res) => {
    try {
      const result = await klasifikasi.findAll({
        attributes: ["id", "namaKlasifikasi", "kode"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getKodeKlasifikasi: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kodeKlasifikasi.findAll({
        attributes: ["id", "kegiatan", "kode"],
        where: { klasifikasiId: id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
};
