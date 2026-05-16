const express = require("express");
const { kendaraanDinasControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.get("/get", kendaraanDinasControllers.getKendaraanDinas);
routers.post("/booking", kendaraanDinasControllers.postKendaraanDinas);
routers.get("/get/detail/:id", kendaraanDinasControllers.getKendaraanDinasSaya);

routers.get(
  "/get/detail-kendaraan/:id",
  kendaraanDinasControllers.getDetailKendaraanDinas
);
routers.post(
  "/upload-bukti",
  fileUploader({
    destinationFolder: "kendaraan-dinas",
    fileType: "image",
    prefix: "FOTO-KENDARAAN-DINAS",
  }).fields([
    { name: "kmAkhir", maxCount: 1 },
    { name: "kondisiAkhir", maxCount: 1 },
  ]),
  kendaraanDinasControllers.fotoBukti
);
routers.post("/verifikasi/:id", kendaraanDinasControllers.updateStatus);
routers.delete(
  "/hapus-semua-foto",
  kendaraanDinasControllers.hapusSemuaFotoKendaraanDinas
);
routers.post("/delete/:id", kendaraanDinasControllers.batalkanKendaraanDinas);

module.exports = routers;
