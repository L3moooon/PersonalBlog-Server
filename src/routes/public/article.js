const express = require('express');
const router = express.Router();
const handler = require('../../router-handler/public/article')

router.post('/article', handler.article);
module.exports = router;