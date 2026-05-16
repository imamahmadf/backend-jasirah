const express = require("express");
const { rekapAsetControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", rekapAsetControllers.getRekapAdminPersediaan);

module.exports = routers;
