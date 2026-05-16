const express = require("express");
const routers = express.Router();
const { nomorSuratControllers } = require("../controllers");

routers.get("/get/:id", nomorSuratControllers.getNomorSurat);
routers.get("/get", nomorSuratControllers.getJenisSurat);
routers.post("/edit/:id", nomorSuratControllers.editNomorLoket);
routers.post("/edit/nomor/:id", nomorSuratControllers.editNomorSurat);

module.exports = routers;
