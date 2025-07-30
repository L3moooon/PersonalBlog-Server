const express = require('express');
const router = express.Router();
const articleHandler = require('../../../router-handler/public/article')

router.post('/addArticle', articleHandler.addArticle);//新增文章
router.post('/delArticle', articleHandler.delArticle);//删除文章
router.post('/editArticle', articleHandler.editArticle);//编辑文章
router.post('/getArticle', articleHandler.getArticle);//获取文章

module.exports = router;