const express = require("express");
const { verifikasiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/:id", verifikasiControllers.getVerifikasi);

module.exports = routers;
