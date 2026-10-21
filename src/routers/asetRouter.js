const express = require("express");
const { asetControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();
const uploadFoto = fileUploader({
  destinationFolder: "aset",
  fileType: "image",
  prefix: "FOTO-ASET",
}).single("pic");

routers.get("/get", asetControllers.getAset);
routers.get("/get/seed", asetControllers.getSeed);
routers.get("/get/kode-berikutnya", asetControllers.getKodeBerikutnya);
routers.get("/get/detail/:id", asetControllers.getDetail);
routers.post("/post", uploadFoto, asetControllers.postAset);
routers.post("/put/:id", uploadFoto, asetControllers.editAset);
routers.post("/mutasi/:id", asetControllers.postMutasi);
routers.get("/delete/:id", asetControllers.hapusAset);
routers.post("/post/jenis", asetControllers.postJenis);
routers.post("/post/kondisi", asetControllers.postKondisi);

module.exports = routers;
