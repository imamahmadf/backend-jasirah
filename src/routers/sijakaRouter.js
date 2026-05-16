const express = require("express");
const { sijakaControllers } = require("../controllers");

const routers = express.Router();

routers.get(
  "/get/pegawai-unit-kerja/:id",
  sijakaControllers.getPegawaiUnitKerja
);

module.exports = routers;
