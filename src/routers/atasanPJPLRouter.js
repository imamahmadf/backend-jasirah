const express = require("express");
const { atasanPJPLControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/all-kontrak", atasanPJPLControllers.getKontrakPegawai);

module.exports = routers;
