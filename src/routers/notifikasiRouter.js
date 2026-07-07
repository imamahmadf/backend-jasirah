const express = require("express");
const { notifikasiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", notifikasiControllers.getNotifikasi);
routers.get("/kpbpn/get", notifikasiControllers.getNotifikasiKPBPN);

module.exports = routers;
