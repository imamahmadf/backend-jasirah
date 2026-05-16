const express = require("express");
const { rekapControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", rekapControllers.getPerjalanan);
routers.get("/get/sppd", rekapControllers.getSPPD);

routers.get("/get/surat-tugas", rekapControllers.getSuratTugas);
routers.get("/get/surat-tugas/download", rekapControllers.downloadSuratTugas);
routers.post("/post/sppd", rekapControllers.postSPPD);

routers.get("/get/perjalanan/download", rekapControllers.getRekap);

module.exports = routers;
