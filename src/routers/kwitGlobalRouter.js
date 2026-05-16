const express = require("express");
const { kwitGlobalControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", kwitGlobalControllers.getKwitGlobal);
routers.get("/get/all", kwitGlobalControllers.getAllKwitGlobal);
routers.post("/post", kwitGlobalControllers.postKwitGlobal);
routers.get("/get/detail/:id", kwitGlobalControllers.getPerjalananKwitGlobal);
routers.get("/get/all-perjalanan/:id", kwitGlobalControllers.getAllPerjalanan);
routers.post("/post/add-perjalanan", kwitGlobalControllers.addPerjalanan);
routers.post("/post/cetak", kwitGlobalControllers.cetakKwitansi);
routers.post("/post/ajukan/:id", kwitGlobalControllers.ajukan);

routers.post("/post/tolak/:id", kwitGlobalControllers.tolak);
routers.post("/post/verifikasi/:id", kwitGlobalControllers.verifikasi);
routers.post("/post/hapus-perjalanan", kwitGlobalControllers.hapusPerjalanan);
routers.post("/hapus/:id", kwitGlobalControllers.hapusKwitansi);
routers.post(
  "/post/update-subkegiatan",
  kwitGlobalControllers.updateSubKegiatan
);
routers.post("/update", kwitGlobalControllers.updateKwitGlobal);
module.exports = routers;
