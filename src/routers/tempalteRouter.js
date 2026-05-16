const express = require("express");
const fileUploader = require("../middleware/uploader");
const templateControllers = require("../controllers/templateControllers");

const router = express.Router();
router.post(
  "/upload-keuangan",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KEUANGAN",
  }).single("file"),
  templateControllers.addTemplateKeuangan
);

router.post(
  "/upload-keuangan-global",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KEUANGAN-GLOBAL",
  }).single("file"),
  templateControllers.addTemplateKeuanganGlobal
);

router.post(
  "/upload",
  fileUploader({
    destinationFolder: "template",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE",
  }).single("file"),
  templateControllers.uploadTemplate
);

router.post(
  "/upload-kadis",
  fileUploader({
    destinationFolder: "template",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KADIS",
  }).single("file"),
  templateControllers.uploadTemplateKadis
);

router.post(
  "/upload-aset",
  fileUploader({
    destinationFolder: "template",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-ASET",
  }).single("file"),
  templateControllers.uploadTemplateAset
);

router.post(
  "/upload-undangan",
  fileUploader({
    destinationFolder: "bukti",
    fileType: "application/pdf",
    prefix: "UNDANGAN",
  }).single("file"),
  templateControllers.uploadUndangan
);

router.get("/get/:id", templateControllers.getTemplate);
router.get("/get-keuangan", templateControllers.getTemplateKeuangan);
router.get("/get-kadis", templateControllers.getTemplateKadis);
router.get("/get-aset", templateControllers.getTemplateAset);
router.get("/download", templateControllers.downloadTemplateKeuangan);
router.get("/download-undangan", templateControllers.downloadUndangan);

router.post(
  "/delete/template-keuangan/:id",
  templateControllers.deleteTempateKeuangan
);
router.post(
  "/delete/template-keuangan-global/:id",
  templateControllers.deleteTempateGlobal
);

// ==================== Edit Template Keuangan Routes ====================
router.post(
  "/edit-keuangan/:id",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KEUANGAN",
  }).single("file"),
  templateControllers.editTemplateKeuangan
);

router.post(
  "/edit-keuangan-global/:id",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KEUANGAN-GLOBAL",
  }).single("file"),
  templateControllers.editTemplateKeuanganGlobal
);

router.post(
  "/edit-all-kwitansi/:id",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-ALL-KWITANSI",
  }).single("file"),
  templateControllers.updateTemplateAllKwitansi
);

// ==================== Template All Kwitansi Routes ====================
router.get("/get-all-kwitansi", templateControllers.getTemplateAllKwitansi);

router.post(
  "/upload-all-kwitansi",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-ALL-KWITANSI",
  }).single("file"),
  templateControllers.addTemplateAllKwitansi
);

router.post(
  "/update-all-kwitansi/:id",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-ALL-KWITANSI",
  }).single("file"),
  templateControllers.updateTemplateAllKwitansi
);

router.post(
  "/delete/template-all-kwitansi/:id",
  templateControllers.deleteTemplateAllKwitansi
);

module.exports = router;
