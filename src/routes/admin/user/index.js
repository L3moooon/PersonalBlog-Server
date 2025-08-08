const express = require('express');
const router = express.Router();
const handler = require('@handler/login')

router.post('/login', handler.login);//用户登录
router.post('/register', handler.register);//用户注册

module.exports = router;