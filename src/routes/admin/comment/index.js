const express = require('express');
const router = express.Router();
const handler = require('@controllers/comment');
const { verifyToken } = require('@middleware/auth'); // 引入中间件
router.use(verifyToken)
router.post('/getComments', handler.getCommentPanel);//获取评论
router.post('/delComment', handler.delComment);//删除评论

module.exports = router;