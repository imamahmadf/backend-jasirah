const express = require("express");
const { suratPesananControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post", suratPesananControllers.postNomor);
routers.get("/get/:id", suratPesananControllers.getNomor);

module.exports = routers;
