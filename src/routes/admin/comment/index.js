const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/comment");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.get("/getComments", handler.getCommentPanel); //获取评论
router.delete("/deleteComment/:id", handler.deleteComment); //删除评论

module.exports = router;
