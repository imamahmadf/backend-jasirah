const express = require("express");
const { barjasControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/dokumen/:id", barjasControllers.getDokumen);
routers.get("/get", barjasControllers.getAll);
routers.post("/post/sp", barjasControllers.postSP);
routers.post("/post/dokumen-barjas", barjasControllers.postBarjas);
routers.post("/post/barjas", barjasControllers.postBarjas);
routers.get("/get/seed/:id", barjasControllers.getSeed);
routers.get("/get/sub-kegiatan/search", barjasControllers.searchSubKegiatan);
routers.get("/get/rekanan/search", barjasControllers.searchRekanan);
routers.get("/get/seed-detail", barjasControllers.getDetilSeed);
routers.post("/post/tambah-dokumen", barjasControllers.postDokumenBarjas);
routers.post("/post/rekanan", barjasControllers.postRekanan);
routers.get("/get/download", barjasControllers.getDownloadBarjas);
routers.get("/get/jenis-dokumen/:id", barjasControllers.getJenisDokumen);
routers.post("/post/jenis-dokumen", barjasControllers.postJenisDokumen);
routers.post("/edit/jenis-dokumen", barjasControllers.editJenisDokumen);
routers.post("/edit/dokumen", barjasControllers.editDokumenBarjas);

routers.post("/post/jenis-barjas", barjasControllers.postJenisBarjas);
routers.post("/post/akun-belanja", barjasControllers.postAkunBelanja);
routers.post("/post/jenis-belanja", barjasControllers.postJenisBelanja);
routers.get("/get/pengaturan", barjasControllers.getPengaturan);

routers.post("/delete/barjas", barjasControllers.deleteBarjas);

routers.get("/get/nomor-sp", barjasControllers.getNomorSP);
routers.post("/post/nomor-sp", barjasControllers.postNomorSP);
routers.post("/edit/nomor-sp", barjasControllers.editNomorSP);

routers.get("/get/dashboard", barjasControllers.getDashboardAset);
routers.post("/delete/sp", barjasControllers.deleteSP);
module.exports = routers;
