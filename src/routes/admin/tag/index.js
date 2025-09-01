const express = require('express');
const router = express.Router();
const handler = require('@controllers/tag');
const { verifyToken } = require('@middleware/auth'); // 引入中间件
router.use(verifyToken)
router.post('/addTag', handler.addTag);//新增标签
router.post('/delTag', handler.delTag);//删除标签
router.post('/getAllTags', handler.getAllTags);//获取所有标签

module.exports = router;