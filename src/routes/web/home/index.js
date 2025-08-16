const express = require('express');
const router = express.Router();
const homeHandler = require('@handler/webHome')

router.post('/getHomeArticle', homeHandler.getHomeArticle);//通用首页文章列表
router.post('/info', homeHandler.info);//获取网站运转信息
router.post('/theme', homeHandler.theme);//获取网站主题信息
// router.post('/theme', homeHandler.theme);//获取推荐文章
// router.post('/theme', homeHandler.theme);//获取标签云

module.exports = router;