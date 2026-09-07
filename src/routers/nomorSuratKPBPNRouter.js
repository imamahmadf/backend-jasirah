const express = require("express");
const nomorSuratKPBPNControllers = require("../controllers/nomorSuratKPBPNControllers");

const routers = express.Router();

routers.get("/get", nomorSuratKPBPNControllers.getNomorUrut);
routers.post(
  "/edit/surat/:id",
  nomorSuratKPBPNControllers.updateNomorSuratKPBPN,
);
routers.post("/edit/mitra/:id", nomorSuratKPBPNControllers.updateNomorUrutMitra);

module.exports = routers;
