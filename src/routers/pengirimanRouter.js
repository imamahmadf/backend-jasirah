const express = require("express");
const { pengirimanControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

routers.get("/get", pengirimanControllers.getSuratJalan);
routers.get(
  "/get/konfirmasi/:suratJalanId",
  pengirimanControllers.getKonfirmasiBySuratJalan,
);
routers.get("/get/seed", pengirimanControllers.getSeed);
routers.get("/get/cetak/:id", pengirimanControllers.cetakSuratJalan);
routers.post("/post", pengirimanControllers.addSuratJalan);
routers.post("/edit/:id", pengirimanControllers.editSuratJalan);
routers.post("/delete/:id", pengirimanControllers.deleteSuratJalan);
routers.post(
  "/post/konfirmasi",
  fileUploader({
    destinationFolder: "konfirmasi-penerimaan",
    fileType: "image",
    prefix: "FOTO-KONFIRMASI",
  }).single("foto"),
  pengirimanControllers.addKonfirmasiPenerimaan,
);
routers.post(
  "/edit/konfirmasi/:id",
  fileUploader({
    destinationFolder: "konfirmasi-penerimaan",
    fileType: "image",
    prefix: "FOTO-KONFIRMASI",
  }).single("foto"),
  pengirimanControllers.editKonfirmasiPenerimaan,
);
routers.get(
  "/get/produksi-sumur/:suratJalanId",
  pengirimanControllers.getProduksiSumurBySuratJalan,
);
routers.post("/post/produksi-sumur", pengirimanControllers.saveProduksiSumur);
routers.post("/verifikasi/:id", pengirimanControllers.verifikasiSuratJalan);
routers.post("/batal/:id", pengirimanControllers.batalSuratJalan);
routers.get("/admin/stats", pengirimanControllers.getAdminDataStats);
routers.post(
  "/admin/delete-all-surat-jalan",
  pengirimanControllers.deleteAllSuratJalan,
);
routers.post(
  "/admin/delete-all-pengisian-tanki",
  pengirimanControllers.deleteAllPengisianTanki,
);
routers.post(
  "/admin/delete-all-uji-lab",
  pengirimanControllers.deleteAllUjiLabK3S,
);
routers.get(
  "/detail-surat-jalan/:id",
  pengirimanControllers.getDetailSuratJalan,
);

module.exports = routers;
