const express = require("express");
const { satuanIndikatorControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", satuanIndikatorControllers.getAllSatuanIndikator);
routers.get(
  "/get/simple",
  satuanIndikatorControllers.getAllSatuanIndikatorSimple
);
routers.get("/get/:id", satuanIndikatorControllers.getSatuanIndikatorById);
routers.post("/post", satuanIndikatorControllers.createSatuanIndikator);
routers.post("/update/:id", satuanIndikatorControllers.updateSatuanIndikator);
routers.post("/delete/:id", satuanIndikatorControllers.deleteSatuanIndikator);

module.exports = routers;
