const express = require('express');
const router = express.Router();
const handler = require('@controllers/visitor')
const { verifyToken } = require('@middleware/auth'); // 引入中间件
router.use(verifyToken)
router.post('/getList', handler.getVisitorList);//获取所有访客列表

module.exports = router;