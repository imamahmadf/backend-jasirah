const express = require("express");
const { keuanganControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/bendahara/:id", keuanganControllers.getBendahara);
routers.post("/post/bendahara", keuanganControllers.postBendahara);
routers.get("/get/sumber-dana/:id", keuanganControllers.getSumberDana);
routers.post("/delete/bendahara/:id", keuanganControllers.deleteBendahara);
routers.post("/delete/perjalanan/:id", keuanganControllers.deletePersonil);
routers.get("/get/all-sumber-dana", keuanganControllers.getAllSumberDana);
routers.post("/edit/sumber-dana/:id", keuanganControllers.editSumberDana);
routers.post("/edit/uang-harian/:id", keuanganControllers.editUangHarian);
routers.post(
  "/edit/jenis-perjalanan/:id",
  keuanganControllers.editJenisPerjalanan
);

module.exports = routers;
