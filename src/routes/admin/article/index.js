const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/article");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.get("/getArticleList", handler.getArticleList); //后台获取所有文章列表
router.post("/addArticle", handler.addArticle); //新增文章
router.patch("/updateArticle", handler.updateArticle); //编辑文章
router.delete("/deleteArticle/:id", handler.deleteArticle); //删除文章

router.get("/getTagList", handler.getTagList); //获取所有标签
router.post("/addTag", handler.addTag); //新增标签
router.delete("/deleteTag/:id", handler.deleteTag); //删除标签

module.exports = router;
