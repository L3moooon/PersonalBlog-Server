const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/music");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.get("/getMusicList", handler.getMusicList); //获取音乐列表

module.exports = router;
