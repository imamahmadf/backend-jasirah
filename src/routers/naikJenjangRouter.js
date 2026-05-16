const express = require("express");
const { naikJenjangControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

routers.post(
  "/post/naik-jenjang",
  fileUploader({
    destinationFolder: "pegawai",
    fileType: "application/pdf",
    prefix: "USULAN",
  }).any(),

  naikJenjangControllers.postNaikJenjang
);
routers.get("/get/detail/:id", naikJenjangControllers.getDetailusulan);
routers.post("/update/status", naikJenjangControllers.updateStatus);
routers.post(
  "/update/usulan",
  fileUploader({
    destinationFolder: "pegawai",
    fileType: "application/pdf",
    prefix: "USULAN",
  }).any(),

  naikJenjangControllers.updateUsulan
);

routers.get(
  "/get/laporan-usulan-pegawai",
  naikJenjangControllers.getAllLaporanUsulanPegawai
);
routers.post(
  "/post/laporan-usulan-pegawai",
  naikJenjangControllers.postLaporanUsulanPegawai
);
routers.post(
  "/update/laporan-usulan-pegawai/:id",
  naikJenjangControllers.updateLaporanUsulanPegawai
);
routers.get(
  "/get/one/laporan-usulan-pegawai",
  naikJenjangControllers.getOneLaporanUsulanPegawai
);

routers.post("/update/link-sertifikat", naikJenjangControllers.updateLink);
routers.get("/get/usulan", naikJenjangControllers.getUsulan);
routers.get("/get/:id", naikJenjangControllers.getProfile);
module.exports = routers;
