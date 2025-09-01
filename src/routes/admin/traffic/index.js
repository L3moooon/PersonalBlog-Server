const express = require('express');
const router = express.Router();
const trafficHandler = require('@controllers/traffic')
const { verifyToken } = require('@middleware/auth'); // 引入中间件
router.use(verifyToken)
router.post('/userIn', trafficHandler.userIn);//新增标签
router.post('/userOut', trafficHandler.userOut);//删除标签

module.exports = router;