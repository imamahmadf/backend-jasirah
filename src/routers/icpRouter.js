const express = require("express");
const { icpControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const { authenticateUser, authorizeKpbpnRoles } = require("../lib/auth");

const routers = express.Router();
const ROLE_SUPER_ADMIN = 1;
const ROLE_KEUANGAN = 4;
const allowIcpAccess = [
  authenticateUser,
  authorizeKpbpnRoles([ROLE_SUPER_ADMIN, ROLE_KEUANGAN]),
];

const dokumenUploader = fileUploader({
  destinationFolder: "icp",
  fileTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ],
  prefix: "DOKUMEN-ICP",
});

routers.get("/get", ...allowIcpAccess, icpControllers.getIcp);
routers.get("/rekapitulasi", ...allowIcpAccess, icpControllers.getRekapitulasi);
routers.post(
  "/post",
  ...allowIcpAccess,
  dokumenUploader.single("dokumen"),
  icpControllers.addIcp,
);
routers.post(
  "/edit/:id",
  ...allowIcpAccess,
  dokumenUploader.single("dokumen"),
  icpControllers.editIcp,
);
routers.post("/delete/:id", ...allowIcpAccess, icpControllers.deleteIcp);

module.exports = routers;
