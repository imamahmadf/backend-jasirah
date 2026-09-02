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
routers.post("/post/konfirmasi", pengirimanControllers.addKonfirmasiPenerimaan);
routers.get(
  "/get/produksi-sumur/:suratJalanId",
  pengirimanControllers.getProduksiSumurBySuratJalan,
);
routers.post(
  "/post/produksi-sumur",
  pengirimanControllers.saveProduksiSumur,
);
routers.post("/verifikasi/:id", pengirimanControllers.verifikasiSuratJalan);

module.exports = routers;
