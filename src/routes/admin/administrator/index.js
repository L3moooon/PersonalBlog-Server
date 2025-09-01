const express = require('express');
const router = express.Router();
const { verifyToken } = require('@middleware/auth'); // 引入中间件
const handler = require('@controllers/administrator');

router.post('/login', handler.login);//管理员登录
router.post('/register', handler.register);//管理员注册
router.post('/getAdminList', verifyToken, handler.getAdminList);//获取所有管理员列表

module.exports = router;