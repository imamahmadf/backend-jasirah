const express = require("express");
const { bangunanControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post", bangunanControllers.postBangunan);
routers.get("/get", bangunanControllers.getBangunan);

module.exports = routers;
