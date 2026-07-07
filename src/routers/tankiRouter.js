const express = require("express");
const { tankiControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.get("/get", tankiControllers.getAllPengisianTanki);
routers.get("/get/ba-penerimaan", tankiControllers.getAllBAPenerimaan);
routers.get("/get/tanki", tankiControllers.getAllTanki);
routers.get(
  "/get/konfirmasi-penerimaan",
  tankiControllers.getKonfirmasiPenerimaan,
);
routers.post("/post", tankiControllers.postPengisianTanki);
routers.post("/edit/:id", tankiControllers.editPengisianTanki);
routers.post("/delete/:id", tankiControllers.deletePengisianTanki);
routers.post("/post/ba-penerimaan", tankiControllers.postBAPenerimaan);
routers.post("/cetak/ba-penerimaan", tankiControllers.cetakBAPenerimaan);
routers.post("/cetak/bast", tankiControllers.cetakBAST);
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
