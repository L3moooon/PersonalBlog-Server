const express = require('express');
const router = express.Router();
const articleHandler = require('@handler/article')
const commentHandler = require('@handler/comment')

router.post('/getArticle', articleHandler.getArticle);
router.post('/getComment', commentHandler.getAllComments);
router.post('/comment', commentHandler.comment);
router.post('/delComment', commentHandler.delComment);

module.exports = router;