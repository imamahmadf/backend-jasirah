const express = require("express");
const { pegawaiControllers } = require("../controllers");
const { authenticateUser, authorizeRole } = require("../lib/auth");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.get("/get", pegawaiControllers.getPegawai);
routers.get(
  "/get/daftar",
  authenticateUser,
  pegawaiControllers.getDaftarPegawai
);
routers.get("/get/one-pegawai/:id", pegawaiControllers.getOnePegawai);
routers.get("/get/seed", pegawaiControllers.getSeedPegawai);
routers.post("/edit", pegawaiControllers.editPegawai);
routers.post("/post", authenticateUser, pegawaiControllers.addPegawai);
routers.get("/get/detail-pegawai/:id", pegawaiControllers.getDetailPegawai);
routers.get("/search", pegawaiControllers.searchPegawai);
routers.get("/get/unit-kerja-pegawai", pegawaiControllers.getPegawaiStatistik);

routers.get(
  "/get/download",
  authenticateUser,
  pegawaiControllers.getDownloadPegawai
);
routers.get(
  "/get/unit-kerja/:id",
  authenticateUser,
  pegawaiControllers.getPegawaiUnitKerja
);
routers.post("/post/batch", pegawaiControllers.getPegawaiBatch);
routers.post("/personil/edit-pegawai", pegawaiControllers.editPersonil);
routers.post("/personil/hapus/:id", pegawaiControllers.hapusPersonil);
routers.post("/personil/tambah", pegawaiControllers.tambahPersonil);

routers.post(
  "/upload-usulan",
  fileUploader({
    destinationFolder: "pegawai",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "USULAN",
  }).single("file"),
  pegawaiControllers.uploadBerkas
);
routers.get("/get/usulan/:id", pegawaiControllers.getDokumen);
routers.get("/get/usulan", pegawaiControllers.getUsulan);

routers.post("/post/mutasi", pegawaiControllers.mutasiPegawai);
module.exports = routers;
