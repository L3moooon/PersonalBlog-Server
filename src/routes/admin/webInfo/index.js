const express = require('express')
const router = express.Router()
const handler = require('@handler/webHome')

router.post('/modifyTheme', handler.modifyTheme)
router.post('/theme', handler.theme);//获取网站主题信息

module.exports = router