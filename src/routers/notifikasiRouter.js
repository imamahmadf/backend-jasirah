const express = require("express");
const { notifikasiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", notifikasiControllers.getNotifikasi);

module.exports = routers;
