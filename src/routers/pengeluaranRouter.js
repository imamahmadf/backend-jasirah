const express = require("express");
const { pengeluaranControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();
routers.post(
  "/post",
  fileUploader({
    destinationFolder: "pengeluaran",
    fileType: "image",
    prefix: "FOTO-PENGELUARAN",
  }).single("pic"),
  pengeluaranControllers.postPengeluaran,
);
routers.post(
  "/put/:id",
  fileUploader({
    destinationFolder: "pengeluaran",
    fileType: "image",
    prefix: "FOTO-PENGELUARAN",
  }).single("pic"),
  pengeluaranControllers.editPengeluaran,
);
routers.get("/get", pengeluaranControllers.getAllPengeluaran);
routers.get("/get/dashboard", pengeluaranControllers.getDashboardPengeluaran);

routers.get("/get/seed", pengeluaranControllers.getSeed);

module.exports = routers;
