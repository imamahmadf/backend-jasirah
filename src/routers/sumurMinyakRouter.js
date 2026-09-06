const express = require("express");
const { sumurMinyakControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const { authenticateUser } = require("../lib/auth");
const routers = express.Router();

routers.get("/get", authenticateUser, sumurMinyakControllers.getSumurMinyak);
routers.get(
  "/get/detail/:id",
  authenticateUser,
  sumurMinyakControllers.getSumurMinyakById,
);
routers.get(
  "/get/produksi/:sumurMinyakId",
  authenticateUser,
  sumurMinyakControllers.getProduksiSumurBySumurMinyak,
);
routers.post(
  "/post",
  authenticateUser,
  fileUploader({
    destinationFolder: "sumur-minyak",
    fileType: "image",
    prefix: "FOTO-SUMUR",
  }).single("pic"),
  sumurMinyakControllers.addSumurMinyak,
);
routers.post(
  "/edit/:id",
  authenticateUser,
  fileUploader({
    destinationFolder: "sumur-minyak",
    fileType: "image",
    prefix: "FOTO-SUMUR",
  }).single("pic"),
  sumurMinyakControllers.editSumurMinyak,
);
routers.post(
  "/edit-klasifikasi/:id",
  authenticateUser,
  sumurMinyakControllers.updateKlasifikasiSumurMinyak,
);
routers.post(
  "/edit-pemilik/:id",
  authenticateUser,
  sumurMinyakControllers.updatePemilikSumurMinyak,
);
routers.post(
  "/delete/:id",
  authenticateUser,
  sumurMinyakControllers.deleteSumurMinyak,
);

module.exports = routers;
