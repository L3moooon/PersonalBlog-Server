const express = require('express');
const router = express.Router();
const handler = require('@handler/tag');

router.post('/addTag', handler.addTag);//新增标签
router.post('/delTag', handler.delTag);//删除标签
router.post('/getAllTags', handler.getAllTags);//获取所有标签

module.exports = router;