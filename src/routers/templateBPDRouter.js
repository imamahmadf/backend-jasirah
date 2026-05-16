const express = require("express");
const { templateBPDControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/all", templateBPDControllers.getAllTemplateBPD);
routers.get("/search", templateBPDControllers.searchTemplateBPD);
routers.get("/get/:id", templateBPDControllers.getTemplateBPD);
routers.post("/post", templateBPDControllers.postTemplateBPD);
routers.post("/update/:id", templateBPDControllers.updateTemplateBPD);
routers.post("/update-status/:id", templateBPDControllers.updateStatusTemplateBPD);
routers.post("/apply", templateBPDControllers.applyTemplateBPD);

module.exports = routers;
