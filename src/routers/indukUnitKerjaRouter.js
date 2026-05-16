const express = require("express");
const { indukUnitKerjaControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/:id", indukUnitKerjaControllers.getIndukUnitKerja);
routers.get(
  "/get/detail/:id",
  indukUnitKerjaControllers.getDetailIndukUnitKerja,
);
routers.post(
  "/delete/ttd-surat-tugas/:id",
  indukUnitKerjaControllers.deleteTtdSuratTugas,
);
routers.post(
  "/delete/tanda-tangan",
  indukUnitKerjaControllers.deleteTandaTangan,
);

routers.post(
  "/update/ttd-surat-tugas",
  indukUnitKerjaControllers.updateTtdSuratTugas,
);
routers.post("/edit/unit-kerja/:id", indukUnitKerjaControllers.editUnitKerja);
routers.post("/edit/:id", indukUnitKerjaControllers.editIndukUnitKerja);
routers.post(
  "/update/tanda-tangan",
  indukUnitKerjaControllers.updateTandaTangan,
);

routers.post("/post/tanda-tangan", indukUnitKerjaControllers.postTandaTangan);

routers.post("/post/unit-kerja", indukUnitKerjaControllers.postUnitKerja);
routers.post(
  "/post/ttd-surat-tugas",
  indukUnitKerjaControllers.postTtdSuratTugas,
);

routers.get("/get", indukUnitKerjaControllers.getDaftarIndukUnitKerja);
routers.post("/post", indukUnitKerjaControllers.postIndukUnitKerja);
routers.post("/penomoran/:id", indukUnitKerjaControllers.updatePenomoran);
routers.post("/keuangan/:id", indukUnitKerjaControllers.updateKeuangan);
module.exports = routers;
