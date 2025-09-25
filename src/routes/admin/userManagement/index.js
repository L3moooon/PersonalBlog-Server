const express = require('express');
const router = express.Router();
const handler = require('@controllers/admin/userManagement');
const { verifyToken } = require('@middleware/auth'); // 引入中间件

router.use(verifyToken)
router.post('/getAdminList', handler.getAdminList);//获取所有管理员列表

module.exports = router;