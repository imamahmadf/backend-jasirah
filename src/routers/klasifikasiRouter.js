const express = require("express");
const { klasifikasiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", klasifikasiControllers.getKlasifikasi);
routers.get(
  "/get/kode-klasifikasi/:id",
  klasifikasiControllers.getKodeKlasifikasi
);

module.exports = routers;
