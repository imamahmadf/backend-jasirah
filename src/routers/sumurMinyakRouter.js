const express = require("express");
const { sumurMinyakControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.get("/get", sumurMinyakControllers.getSumurMinyak);
routers.post(
  "/post",
  fileUploader({
    destinationFolder: "sumur-minyak",
    fileType: "image",
    prefix: "FOTO-SUMUR",
  }).single("pic"),
  sumurMinyakControllers.addSumurMinyak,
);
routers.post(
  "/edit/:id",
  fileUploader({
    destinationFolder: "sumur-minyak",
    fileType: "image",
    prefix: "FOTO-SUMUR",
  }).single("pic"),
  sumurMinyakControllers.editSumurMinyak,
);
routers.post("/delete/:id", sumurMinyakControllers.deleteSumurMinyak);

module.exports = routers;
