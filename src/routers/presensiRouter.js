const express = require("express");
const routers = express.Router();
const { presensiControllers } = require("../controllers");

routers.get(
  "/get/daftar-presensi",
  presensiControllers.getDetailPresensiMinggunan,
);
routers.post("/post", presensiControllers.postPresensiMingguan);
module.exports = routers;
