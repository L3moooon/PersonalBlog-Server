const express = require("express");
const router = express.Router();
const handler = require("@controllers/web/article");

router.post("/getArticle", handler.getArticle); //获取文章
router.post("/getComment", handler.getAllComments); //获取文章评论
router.post("/view", handler.view); //更新访问量
router.post("/comment", handler.comment); //评论文章
router.post("/delComment", handler.delComment); //删除评论

module.exports = router;
