const express = require("express");
const { tujuanControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/dalam-kota", tujuanControllers.getDalamKota);
routers.post("/edit", tujuanControllers.editDalamKota);
routers.get("/get/seed", tujuanControllers.getSeed);
routers.post("/post", tujuanControllers.addTujuan);

module.exports = routers;
