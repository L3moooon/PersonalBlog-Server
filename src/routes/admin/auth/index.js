const express = require('express');
const router = express.Router();
const handler = require('@controllers/admin/auth');

router.post('/login', handler.login);//管理员登录
router.post('/register', handler.register);//管理员注册
router.post('/getEmailCaptcha', handler.getEmailCaptcha);//获取邮箱验证码

module.exports = router;