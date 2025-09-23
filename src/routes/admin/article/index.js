const express = require('express');
const router = express.Router();
const articleHandler = require('@controllers/article')
const { verifyToken } = require('@middleware/auth'); // 引入中间件

router.use(verifyToken)
router.get('/getArticleList', articleHandler.getArticleList);//后台获取所有文章列表
router.post('/update', articleHandler.update);//新增或编辑文章
router.post('/changeStatus', articleHandler.changeStatus);//更改文章显隐状态
router.post('/changeTop', articleHandler.changeTop);//更改文章置顶状态
router.post('/del', articleHandler.delArticle);//删除文章

module.exports = router;