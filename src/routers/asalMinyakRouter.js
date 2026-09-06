const express = require("express");
const { asalMinyakControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", asalMinyakControllers.getAsalMinyak);
routers.post("/post", asalMinyakControllers.addAsalMinyak);
routers.post("/edit/:id", asalMinyakControllers.editAsalMinyak);
routers.post("/delete/:id", asalMinyakControllers.deleteAsalMinyak);

module.exports = routers;
