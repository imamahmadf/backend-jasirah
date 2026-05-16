const express = require("express");
const { indikatorControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", indikatorControllers.getAllIndikator);
routers.get("/get/:id", indikatorControllers.getIndikatorById);
routers.get("/search/program", indikatorControllers.searchProgram);
routers.get("/search/kegiatan", indikatorControllers.searchKegiatan);
routers.get("/search/sub-keg-per", indikatorControllers.searchSubKegPer);
routers.post("/post", indikatorControllers.createIndikator);
routers.post("/update/:id", indikatorControllers.updateIndikator);
routers.post("/delete/:id", indikatorControllers.deleteIndikator);

module.exports = routers;
