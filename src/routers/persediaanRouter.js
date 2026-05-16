const express = require("express");
const router = express.Router();
const { persediaanControllers } = require("../controllers");

router.get("/get", persediaanControllers.getAllObPersediaan);
router.get("/get/seed", persediaanControllers.getSeed);
router.post("/post", persediaanControllers.postPersediaan);
router.get("/get/masuk/:id", persediaanControllers.getStokMasuk);
router.get("/search", persediaanControllers.searchPersediaan);
router.post("/post/masuk", persediaanControllers.postMasuk);
router.get("/get/stok/:id", persediaanControllers.getStok);
router.get("/get/detail-keluar", persediaanControllers.getStokKeluar);
router.post("/post/keluar", persediaanControllers.postKeluar);
module.exports = router;
