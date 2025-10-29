const express = require("express");
const router = express.Router();
const handler = require("@controllers/web/user");

router.post("/visited", handler.visited); //访问记录
router.post("/modifyInfo", handler.modifyInfo); //访问记录

module.exports = router;
