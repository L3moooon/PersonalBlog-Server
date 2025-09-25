const express = require('express');
const router = express.Router();
const handler = require('@controllers/web/traffic')
const { verifyToken } = require('@middleware/auth'); // 引入中间件

router.use(verifyToken)
router.post('/userIn', handler.userIn);//新增标签
router.post('/userOut', handler.userOut);//删除标签

module.exports = router;