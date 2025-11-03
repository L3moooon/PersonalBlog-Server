const express = require("express");
const router = express.Router();
const handler = require("@controllers/web/home");

router.get("/getHomeArticle", handler.getHomeArticle); //通用首页文章列表
router.post("/info", handler.info); //获取网站运转信息
// router.post("/theme", handler.theme); //获取网站主题信息
router.post("/getRecommendArticle", handler.getRecommendArticle); //获取推荐文章
router.get("/getTagCloud", handler.getTagCloud); //获取标签云

module.exports = router;
