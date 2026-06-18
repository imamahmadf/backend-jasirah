const express = require("express");
const { pengirimanControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

routers.get("/get", pengirimanControllers.getSuratJalan);
routers.get("/get/seed", pengirimanControllers.getSeed);
routers.get("/get/cetak/:id", pengirimanControllers.cetakSuratJalan);
routers.post("/post", pengirimanControllers.addSuratJalan);
routers.post("/post/konfirmasi", pengirimanControllers.addKonfirmasiPenerimaan);
routers.post("/verifikasi/:id", pengirimanControllers.verifikasiSuratJalan);

module.exports = routers;
