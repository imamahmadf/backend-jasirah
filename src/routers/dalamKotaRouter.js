const express = require("express");
const { dalamKotaControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post/surat-tugas", dalamKotaControllers.postSuratTugas);
routers.get("/get/dalam-kota/:id", dalamKotaControllers.getDalamKota);
routers.get("/get/serach", dalamKotaControllers.serachDalamKota);
routers.post("/update-status", dalamKotaControllers.updateStatus);

module.exports = routers;
