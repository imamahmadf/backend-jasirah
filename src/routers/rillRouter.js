const express = require("express");
const { rillControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post", rillControllers.postRill);
routers.post("/update", rillControllers.editRill);
routers.post("/delete", rillControllers.deleteRill);
routers.get("/tes", rillControllers.tes);

module.exports = routers;
