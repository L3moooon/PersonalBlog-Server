const express = require('express');
const router = express.Router();
const articleHandler = require('@controllers/article')
const commentHandler = require('@controllers/comment')

router.post('/getArticle', articleHandler.getArticle);//获取文章
router.post('/getComment', commentHandler.getAllComments);//获取文章评论
router.post('/view', articleHandler.view);//更新访问量

router.post('/comment', commentHandler.comment);//评论文章
router.post('/delComment', commentHandler.delComment);//删除评论

module.exports = router;