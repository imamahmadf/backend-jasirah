const express = require("express");
const { perjalananControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post/nota-dinas", perjalananControllers.postNotaDinas);

routers.post(
  "/post/kendaraan-dinas",
  perjalananControllers.postPerjalananKendaraan,
);

routers.post("/post/surat-tugas", perjalananControllers.postSuratTugas);
routers.post("/post/surat-perjalanan-dinas", perjalananControllers.postSPD);
routers.post(
  "/post/surat-tugas-kendaraan",
  perjalananControllers.postSuratTugasKendaraan,
);
routers.post(
  "/post/surat-tugas-kadis",
  perjalananControllers.postSuratTugasKadis,
);
routers.get("/get/seed", perjalananControllers.getSeedPerjalanan);
routers.get("/get/all-perjalanan", perjalananControllers.getAllPerjalanan);
routers.get(
  "/get/all-perjalanan-kendaraan",
  perjalananControllers.getAllPerjalananKendaraan,
);
routers.get(
  "/get/detail-perjalanan/:id",
  perjalananControllers.getDetailPerjalanan,
);
routers.get(
  "/get/jenis-perjalanan/:id",
  perjalananControllers.getJenisPerjalanan,
);
routers.get("/get/kadis", perjalananControllers.getPerjalananKaDis);
routers.post("/delete/:id", perjalananControllers.deletePerjalanan);
routers.post("/post/daftar/nota-dinas", perjalananControllers.cetakNotaDinas);
routers.post("/edit/:id", perjalananControllers.editPerjalanan);
routers.post("/edit-tempat/:id", perjalananControllers.editTujuan);
routers.get(
  "/get/seed-kendaraan",
  perjalananControllers.getSeedPerjalananKendaraan,
);

routers.post("/edit-nomor-surat/:id", perjalananControllers.editNomorSurat);

module.exports = routers;
