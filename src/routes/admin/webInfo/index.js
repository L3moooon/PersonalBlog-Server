const express = require('express')
const router = express.Router()
const handler = require('@controllers/webHome')
const { verifyToken } = require('@middleware/auth'); // 引入中间件
router.use(verifyToken)
router.post('/modifyTheme', handler.modifyTheme)
router.post('/theme', handler.theme);//获取网站主题信息

module.exports = router