const express = require("express");
const { tankiControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.get("/get", tankiControllers.getAllPengisianTanki);
routers.get("/get/ba-bongkar", tankiControllers.getAllBABongkar);
routers.get("/get/tanki", tankiControllers.getAllTanki);
routers.get(
  "/get/konfirmasi-penerimaan",
  tankiControllers.getKonfirmasiPenerimaan,
);
routers.get("/get/uji-lab", tankiControllers.getUjiLabK3S);
routers.post(
  "/post/uji-lab",
  fileUploader({
    destinationFolder: "uji-lab-k3s",
    fileType: "image",
    prefix: "FOTO-UJI-LAB",
  }).single("pic"),
  tankiControllers.postUjiLabK3S,
);
routers.post("/delete/uji-lab/:id", tankiControllers.deleteUjiLabK3S);
routers.post(
  "/post/bak3s",
  fileUploader({
    destinationFolder: "bak3s",
    fileTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ],
    prefix: "DOKUMEN-BAK3S",
  }).single("dokumen"),
  tankiControllers.postBAK3S,
);
routers.post(
  "/edit/bak3s/:id",
  fileUploader({
    destinationFolder: "bak3s",
    fileTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ],
    prefix: "DOKUMEN-BAK3S",
  }).single("dokumen"),
  tankiControllers.editBAK3S,
);
routers.post("/delete/bak3s/:id", tankiControllers.deleteBAK3S);
routers.post("/post", tankiControllers.postPengisianTanki);
routers.post("/edit/:id", tankiControllers.editPengisianTanki);
routers.post("/delete/:id", tankiControllers.deletePengisianTanki);
routers.post("/post/ba-bongkar", tankiControllers.postBABongkar);
routers.post("/cetak/ba-bongkar", tankiControllers.cetakBABongkar);
routers.post("/cetak/bast", tankiControllers.cetakBAST);
routers.get("/get/stok-opname", tankiControllers.getStokOpname);
routers.get("/get/tanki-monitoring", tankiControllers.getTankiMonitoring);
routers.post(
  "/post/tanki",
  fileUploader({
    destinationFolder: "tanki",
    fileType: "image",
    prefix: "FOTO-TANKI",
  }).single("pic"),
  tankiControllers.addTanki,
);
routers.post(
  "/edit/tanki/:id",
  fileUploader({
    destinationFolder: "tanki",
    fileType: "image",
    prefix: "FOTO-TANKI",
  }).single("pic"),
  tankiControllers.editTanki,
);
routers.post("/delete/tanki/:id", tankiControllers.deleteTanki);

module.exports = routers;
