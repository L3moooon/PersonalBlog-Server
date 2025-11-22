const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/friendship");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.get("/getFriendshipList", handler.getFriendshipList); //获取音乐列表

module.exports = router;
