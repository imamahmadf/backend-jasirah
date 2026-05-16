const express = require("express");
const { perencanaanAdminControllers } = require("../controllers");

const routers = express.Router();

routers.get(
  "/get/sub-kegiatan/:id",
  perencanaanAdminControllers.getSubKegiatan
);
routers.get("/get/kegiatan/:id", perencanaanAdminControllers.getKegiatan);
routers.get("/get/program/:id", perencanaanAdminControllers.getProgram);
// ///////////GET SEED///////////////
routers.get(
  "/get/seed/sub-kegiatan/:id",
  perencanaanAdminControllers.getSeedSubKegPer
);

routers.get(
  "/get/seed/kegiatan/:id",
  perencanaanAdminControllers.getSeedKegiatan
);

routers.get(
  "/get/seed/program/:id",
  perencanaanAdminControllers.getSeedProgram
);
// ///////////GET SEED///////////////
// ///////////POST///////////////
routers.post("/post/sub-kegiatan", perencanaanAdminControllers.postSubKegiatan);
routers.post("/post/kegiatan", perencanaanAdminControllers.postKegiatan);
routers.post("/post/program", perencanaanAdminControllers.postProgram);

// ///////////POST///////////////
// ///////////EDIT///////////////

routers.post(
  "/edit/sub-kegiatan/:id",
  perencanaanAdminControllers.editSubKegiatan
);
routers.post("/edit/kegiatan/:id", perencanaanAdminControllers.editKegiatan);
routers.post("/edit/program/:id", perencanaanAdminControllers.editProgram);
// ///////////EDIT///////////////
// ///////////Detele///////////////
routers.post(
  "/delete/sub-kegiatan/:id",
  perencanaanAdminControllers.deleteSubKegiatan
);

routers.post(
  "/delete/kegiatan/:id",
  perencanaanAdminControllers.deleteKegiatan
);
// ///////////Detele///////////////
// ///////////Indikator///////////////

routers.post("/post/indikator", perencanaanAdminControllers.postIndikator);
// ///////////Dashboard///////////////
routers.get("/dashboard", perencanaanAdminControllers.getDashboard);
// ///////////Dashboard///////////////
module.exports = routers;
