const express = require("express");
const router = express.Router();
const { mutasiPersediaanControllers } = require("../controllers");

router.get(
  "/get/stok/:unitKerjaId",
  mutasiPersediaanControllers.getStokTersedia
);
router.get(
  "/get/list/:unitKerjaId",
  mutasiPersediaanControllers.getMutasiList
);
router.get("/get/detail/:id", mutasiPersediaanControllers.getMutasiDetail);
router.post("/post", mutasiPersediaanControllers.postMutasi);

module.exports = router;
