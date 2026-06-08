const express = require("express");
const { laporanPersediaanControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

routers.get("/get", laporanPersediaanControllers.getLaporan);
routers.post("/post", laporanPersediaanControllers.postLaporan);
routers.get("/get/detail/:id", laporanPersediaanControllers.getDetailLaporan);
routers.post("/edit", laporanPersediaanControllers.editStatus);
routers.get(
  "/delete/stok-masuk/:id",
  laporanPersediaanControllers.hapusStokMasuk,
);
routers.post(
  "/edit/stok-masuk",
  fileUploader({
    destinationFolder: "persediaan",
    fileType: "image",
    prefix: "FOTO-PERSEDIAAN",
  }).single("pic"),
  laporanPersediaanControllers.editStokMasuk,
);
module.exports = routers;
