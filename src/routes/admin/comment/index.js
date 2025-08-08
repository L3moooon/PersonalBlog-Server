const express = require('express');
const router = express.Router();
const handler = require('@handler/article');

router.post('/getComments', handler.getCommentPanel);//获取评论
router.post('/delComment', handler.delComment);//删除评论

module.exports = router;