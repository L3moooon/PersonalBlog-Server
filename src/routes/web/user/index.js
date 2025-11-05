const express = require("express");
const router = express.Router();
const handler = require("@controllers/web/user");

router.post("/visited", handler.visited); //访问量记录
router.post("/trackInfo", handler.trackInfo); //埋点统计
router.post("/modifyInfo", handler.modifyInfo); //修改个人信息

module.exports = router;
