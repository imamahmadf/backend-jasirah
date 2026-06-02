const express = require("express");
const { payrollControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();
routers.get("/get/detail-payroll/:id", payrollControllers.getDetailPayroll);
routers.get("/get", payrollControllers.getDaftarPayroll);
routers.get("/get/pengaturan", payrollControllers.getPengaturanPayroll);
routers.post("/post/tunjangan", payrollControllers.postTunjangan);
routers.post("/post/potongan", payrollControllers.postPotongan);
routers.post("/post/tambah-tunjangan", payrollControllers.tambahTunjangan);
routers.post("/put/edit-tunjangan/:id", payrollControllers.editTunjangan);
routers.post(
  "/put/edit-payroll-tunjangan/:id",
  payrollControllers.editPayrollTunjangan,
);
routers.post("/delete/tunjangan/:id", payrollControllers.hapusTunjangan);
routers.post("/post/tambah-potongan", payrollControllers.tambahPotongan);
routers.post("/post/payroll", payrollControllers.postPayroll);
routers.post("/post/slip-gaji", payrollControllers.generateSlipGaji);
module.exports = routers;
