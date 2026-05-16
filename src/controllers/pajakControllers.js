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
  daftarSubKegiatan,
  daftarKegiatan,
  ttdSuratTugas,
  dalamKota,
  jenisPerjalanan,
  sequelize,
  user,
  userRole,
  role,
  profile,
  pajak,
} = require("../models");

const { Op } = require("sequelize");
// const { scrapeData } = require("../services/scraper");
// const { sendMessage } = require("../services/waServices");

module.exports = {
  // cekPajak: async (req, res) => {
  //   console.log("BODY:", req.body); // <-- debug
  //   try {
  //     const { kt, nomor, seri, id, phone } = req.body;
  //     const params = { kt, nomor, seri };
  //     const result = await scrapeData(params);
  //     if (!result.nopol) {
  //       return res.status(404).json({ message: "Data tidak ditemukan" });
  //     }
  //     console.log(result);
  //     await pajak.upsert({
  //       id,
  //       nopol: result.nopol,
  //       tg_pkb: result.tg_pkb,
  //       tg_stnk: result.tg_stnk,
  //       total: result.total,
  //     });
  //     const message = `🚗 *Info Pajak Kendaraan*\n\n• Nopol: ${result.nopol}\n• Masa PKB: ${result.tg_pkb}\n• Masa STNK: ${result.tg_stnk}\n• Total Biaya: ${result.total}`;
  //     // Kirim WhatsApp
  //     if (phone) {
  //       await sendMessage(phone, message);
  //     }
  //     res.json({ success: true, data: result });
  //   } catch (err) {
  //     console.error(err);
  //     res
  //       .status(500)
  //       .json({ message: "Terjadi kesalahan", error: err.message });
  //   }
  // },
};
