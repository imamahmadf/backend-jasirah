const express = require("express");
const routers = express.Router();
const { presensiControllers } = require("../controllers");

routers.get(
  "/get/daftar-presensi",
  presensiControllers.getDetailPresensiMinggunan,
);
routers.get(
  "/get/kalender-pekerja-mingguan",
  presensiControllers.getKalenderPresensiMingguan,
);
routers.post("/post", presensiControllers.postPresensiMingguan);
routers.post("/hapus/:id", presensiControllers.hapusPresensi);
routers.post("/get/status", presensiControllers.getStatusPresensi);
routers.get(
  "/get/rekap-mingguan",
  presensiControllers.getRekapPresensiMingguan,
);
module.exports = routers;
