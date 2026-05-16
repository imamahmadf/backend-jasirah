const express = require("express");
const { perencanaanControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", perencanaanControllers.getAllProgram);
routers.get("/get/unit-kerja", perencanaanControllers.getUnitKerja);
routers.get("/get/indikator/:id", perencanaanControllers.getAllIndikator);
routers.get(
  "/get/detail-sub-kegiatan/:id",
  perencanaanControllers.getDetailSubKegiatan
);

routers.get(
  "/get/detail-kegiatan/:id",
  perencanaanControllers.getDetailKegiatan
);
routers.get("/get/detail-program/:id", perencanaanControllers.getDetailProgram);
routers.post("/post/target", perencanaanControllers.postTarget);
routers.post("/update/target", perencanaanControllers.updateTarget);
routers.post("/post/capaian", perencanaanControllers.postCapaian);
routers.post(
  "/post/anggaran-perubahan",
  perencanaanControllers.postAnggaranPerubahan
);

module.exports = routers;
