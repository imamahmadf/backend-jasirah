const express = require("express");
const { stasiunPengumpulMinyakControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", stasiunPengumpulMinyakControllers.getStasiunPengumpulMinyak);
routers.post("/post", stasiunPengumpulMinyakControllers.addStasiunPengumpulMinyak);
routers.post(
  "/edit/:id",
  stasiunPengumpulMinyakControllers.editStasiunPengumpulMinyak,
);
routers.post(
  "/delete/:id",
  stasiunPengumpulMinyakControllers.deleteStasiunPengumpulMinyak,
);

module.exports = routers;
