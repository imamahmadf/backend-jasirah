const express = require("express");
const { stockOpnameTankiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", stockOpnameTankiControllers.getAll);
routers.get("/get/:id", stockOpnameTankiControllers.getById);
routers.post("/post", stockOpnameTankiControllers.post);
routers.post("/edit/:id", stockOpnameTankiControllers.edit);
routers.post("/delete/:id", stockOpnameTankiControllers.remove);

module.exports = routers;
