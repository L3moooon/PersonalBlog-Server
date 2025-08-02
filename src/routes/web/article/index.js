const express = require('express');
const router = express.Router();
const handler = require('../../../router-handler/public/article')

router.post('/getArticle', handler.getArticle);
router.post('/getComment', handler.getAllComments);
router.post('/comment', handler.comment);
router.post('/delComment', handler.delComment);

module.exports = router;