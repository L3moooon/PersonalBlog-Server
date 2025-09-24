const express = require('express');
const router = express.Router();
const articleHandler = require('@controllers/article')
const { verifyToken } = require('@middleware/auth'); // 引入中间件

router.use(verifyToken)
router.get('/getArticleList', articleHandler.getArticleList);//后台获取所有文章列表
router.post("/addArticle", articleHandler.addArticle);//新增文章
router.patch('/updateArticle', articleHandler.updateArticle);//编辑文章
// router.patch('/changeStatus', articleHandler.changeStatus);//更改文章显隐状态
// router.patch('/changeTop', articleHandler.changeTop);//更改文章置顶状态
router.delete('/deleteArticle', articleHandler.deleteArticle);//删除文章

module.exports = router;