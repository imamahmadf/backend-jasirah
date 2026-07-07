const express = require("express");
const fileUploader = require("../middleware/uploader");
const templateKPBPNControllers = require("../controllers/templateKPBPNControllers");

const router = express.Router();

const docxUploader = fileUploader({
  destinationFolder: "template-kpbpn",
  fileType:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  prefix: "TEMPLATE-KPBPN",
});

router.get("/get", templateKPBPNControllers.getAllTemplateKPBPN);

router.post(
  "/upload",
  docxUploader.single("file"),
  templateKPBPNControllers.addTemplateKPBPN,
);

router.post(
  "/edit/:id",
  docxUploader.single("file"),
  templateKPBPNControllers.editTemplateKPBPN,
);

router.patch(
  "/status/:id",
  templateKPBPNControllers.updateStatusTemplateKPBPN,
);

router.post("/delete/:id", templateKPBPNControllers.deleteTemplateKPBPN);

router.get("/download", templateKPBPNControllers.downloadTemplateKPBPN);

module.exports = router;
