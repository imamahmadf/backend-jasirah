const express = require("express");

const { adminControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/detail-perjalanan/:id", adminControllers.detailPerjalanan);
routers.get("/get/surat-keluar", adminControllers.getSuratKeluar);
routers.get("/get/surat-keluar/download", adminControllers.downloadSuratKeluar);
routers.post("/post/surat-keluar", adminControllers.postSuratKeluar);
routers.get("/get/induk-unit-kerja", adminControllers.getIndukUnitKerja);
routers.get("/get/sumber-dana", adminControllers.getSumberDana);
routers.get("/get/unit-kerja", adminControllers.getUnitKerja);
routers.get(
  "/get/keuangan/daftar-perjalanan",
  adminControllers.getAllPerjalananKeuangan
);
routers.post("/delete/surat-keluar/:id", adminControllers.deleteSuratKeluar);

routers.get("/search/unit-kerja", adminControllers.searchUnitKerja);
routers.get("/get/dashboard", adminControllers.getDashboardKeuangan);
routers.post(
  "/delete/perjalanan-by-unitkerja/:unitKerjaId",
  adminControllers.deletePerjalananByUnitKerjaId
);
module.exports = routers;
