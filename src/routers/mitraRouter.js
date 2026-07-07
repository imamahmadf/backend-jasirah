const express = require("express");
const { mitraControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

routers.get("/get", mitraControllers.getMitra);
routers.post("/post", mitraControllers.addMitra);
routers.post(
  "/post/transportir",
  fileUploader({
    destinationFolder: "transportir",
    fileType: "image",
    prefix: "FOTO-TRANSPORTIR",
  }).single("pic"),
  mitraControllers.addTransportir,
);
routers.post(
  "/post/supir",
  fileUploader({
    destinationFolder: "supir",
    fileType: "image",
    prefix: "FOTO-SUPIR",
  }).fields([
    { name: "ktp", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]),
  mitraControllers.addSupir,
);
routers.post("/edit/:id", mitraControllers.editMitra);
routers.post("/delete/:id", mitraControllers.deleteMitra);
routers.post(
  "/edit/transportir/:id",
  fileUploader({
    destinationFolder: "transportir",
    fileType: "image",
    prefix: "FOTO-TRANSPORTIR",
  }).single("pic"),
  mitraControllers.editTransportir,
);
routers.post("/delete/transportir/:id", mitraControllers.deleteTransportir);
routers.post(
  "/edit/supir/:id",
  fileUploader({
    destinationFolder: "supir",
    fileType: "image",
    prefix: "FOTO-SUPIR",
  }).fields([
    { name: "ktp", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]),
  mitraControllers.editSupir,
);
routers.post("/delete/supir/:id", mitraControllers.deleteSupir);

module.exports = routers;
