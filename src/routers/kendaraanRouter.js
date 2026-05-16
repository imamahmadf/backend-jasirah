const express = require("express");
const { kendaraanControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

routers.post("/post", kendaraanControllers.addKendaraan);
routers.get("/get", kendaraanControllers.getKendaraan);
routers.get("/get/seed", kendaraanControllers.getSeedKendaraan);
routers.get("/get/detail/:id", kendaraanControllers.getDetailKendaraan);
routers.post("/cek", kendaraanControllers.cekPajak);
routers.get(
  "/get/induk-unit-kerja/:id",
  kendaraanControllers.getKendaraanIndukUnitKerja
);
routers.post("/surat", kendaraanControllers.cetakSurat);

routers.post(
  "/post/foto-kendaraan",
  fileUploader({
    destinationFolder: "kendaraan",
    fileType: "image",
    prefix: "FOTO-KENDARAAN",
  }).single("pic"),
  kendaraanControllers.postFoto
);

routers.post("/edit/:id", kendaraanControllers.editKendaraan);

routers.post("/post/mutasi", kendaraanControllers.mutasi);
routers.get(
  "/get/download",

  kendaraanControllers.getDownloadKendaraan
);
module.exports = routers;
