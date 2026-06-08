const express = require("express");
const router = express.Router();
const { persediaanControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

router.get("/get", persediaanControllers.getAllObPersediaan);
router.get("/get/seed", persediaanControllers.getSeed);
router.post("/post", persediaanControllers.postPersediaan);
router.get("/get/masuk/:id", persediaanControllers.getStokMasuk);
router.get("/search", persediaanControllers.searchPersediaan);
router.post(
  "/post/masuk",
  fileUploader({
    destinationFolder: "persediaan",
    fileType: "image",
    prefix: "FOTO-PERSEDIAAN",
  }).single("pic"),
  persediaanControllers.postMasuk
);
router.get("/get/stok/:id", persediaanControllers.getStok);
router.get("/get/detail-keluar", persediaanControllers.getStokKeluar);
router.get("/get/tracking-list/:unitKerjaId", persediaanControllers.getTrackingList);
router.get("/get/tracking/:persediaanId", persediaanControllers.getTrackingDetail);
router.post("/post/keluar", persediaanControllers.postKeluar);
router.get(
  "/delete/keluar/:id",
  persediaanControllers.hapusStokKeluar,
);
router.post("/edit/keluar", persediaanControllers.editStokKeluar);
module.exports = router;
