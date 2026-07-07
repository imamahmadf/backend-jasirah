const express = require("express");
const { dashboardControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", dashboardControllers.getDashboard);
routers.post("/refresh", dashboardControllers.refreshDashboardSocket);

module.exports = routers;
