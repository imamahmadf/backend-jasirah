const express = require("express");
const { capaianControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post", capaianControllers.postCapaian);
routers.get("/get/all-capaian/:id", capaianControllers.getAllCapaian);
routers.post("/update/:id", capaianControllers.terimaCapaian);
routers.post("/edit/:id", capaianControllers.editCapaian);

module.exports = routers;
