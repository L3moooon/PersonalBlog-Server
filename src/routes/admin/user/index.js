const express = require('express');
const router = express.Router();
const handler = require('../../../router-handler/admin/login')

router.post('/login', handler.login);//用户登录
router.post('/register', handler.register);//用户注册

module.exports = router;