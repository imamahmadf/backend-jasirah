const express = require("express");
const { kwitansiControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.post(
  "/post/rampung",
  fileUploader({
    destinationFolder: "bukti",
    fileType: "image",
    prefix: "BUKTI",
  }).single("pic"),
  kwitansiControllers.postRampung
);

routers.post(
  "/post/bukti-perjalanan",
  fileUploader({
    destinationFolder: "bukti",
    fileType: "image",
    prefix: "BUKTI-PERJALANAN",
  }).any(), // Menggunakan .any() untuk menerima semua field (files dan form data)
  kwitansiControllers.postBuktiKegiatan
);
routers.get("/get/rampung/:id", kwitansiControllers.getRampung);
routers.post("/post/cetak-kwitansi", kwitansiControllers.cetakKwitansi);
routers.post("/post/cetak-kwitansi-bulk", kwitansiControllers.cetakKwitansiBulk);
routers.post("/post/cetak-kwitansi-pdf", kwitansiControllers.cetakKwitansiPDF);
routers.post(
  "/post/kwitansi-otomatis",
  kwitansiControllers.cetakKwitansiOtomatis
);
routers.post(
  "/post/kwitansi-otomatis-bulk",
  kwitansiControllers.cetakKwitansiOtomatisBulk
);
routers.post("/delete/rincian-bpd", kwitansiControllers.deleteBPD);
routers.post("/update/rincian-bpd", kwitansiControllers.updateBPD);
routers.post("/verifikasi/terima", kwitansiControllers.terimaVerifikasi);
routers.post("/verifikasi/tolak", kwitansiControllers.tolakVerifikasi);
routers.post("/post/pengajuan/:id", kwitansiControllers.pengajuan);
routers.post("/update/kwitansi-global", kwitansiControllers.addKwitansiGlobal);

module.exports = routers;
