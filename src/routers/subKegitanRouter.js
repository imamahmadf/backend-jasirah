const express = require("express");
const routers = express.Router();
const { subKegiatanControllers } = require("../controllers");
routers.post("/edit/anggaran", subKegiatanControllers.editAnggaran);
routers.get("/get/:id", subKegiatanControllers.getSubKegiatanLaporan);
routers.get("/get-filter/:id", subKegiatanControllers.getSubKegiatan);
routers.post("/delete/:id", subKegiatanControllers.deleteSubKegiatan);
routers.post("/edit/:id", subKegiatanControllers.editSubKegiatan);
routers.post("/post", subKegiatanControllers.postSubKegiatan);
routers.post("/post/anggaran", subKegiatanControllers.postAnggaran);

module.exports = routers;
