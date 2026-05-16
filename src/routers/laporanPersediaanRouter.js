const express = require("express");
const { laporanPersediaanControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", laporanPersediaanControllers.getLaporan);
routers.post("/post", laporanPersediaanControllers.postLaporan);
routers.get("/get/detail/:id", laporanPersediaanControllers.getDetailLaporan);
routers.post("/edit", laporanPersediaanControllers.editStatus);
module.exports = routers;
