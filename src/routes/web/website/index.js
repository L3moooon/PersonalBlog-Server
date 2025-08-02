const express = require('express');
const router = express.Router();
const websiteHandler = require('../../../router-handler/web/website')
const themeHandler = require('../../../router-handler/web/theme')

router.post('/info', websiteHandler.info);//获取网站运转信息
router.post('/theme', themeHandler.theme);//获取网站主题信息
module.exports = router;