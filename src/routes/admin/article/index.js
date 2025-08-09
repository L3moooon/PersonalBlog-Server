const express = require('express');
const router = express.Router();
const articleHandler = require('@handler/article')

router.post('/editOrAdd', articleHandler.article);//新增或编辑文章
router.post('/changeStatus', articleHandler.changeStatus);//更改文章显隐状态
router.post('/changeTop', articleHandler.changeTop);//更改文章置顶状态
router.post('/del', articleHandler.delArticle);//删除文章
router.post('/get', articleHandler.getArticle);//获取文章

module.exports = router;