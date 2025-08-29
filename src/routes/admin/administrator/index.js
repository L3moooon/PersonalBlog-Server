const express = require('express');
const router = express.Router();
const handler = require('@handler/administrator');

router.post('/login', handler.login);//管理员登录
router.post('/register', handler.register);//管理员注册
router.post('/getAdminList', handler.getAdminList);//获取所有管理员列表

module.exports = router;