const express = require('express');
const router = express.Router();
const handler = require('@handler/admin')

router.post('/getAdminList', handler.getAdminList);//获取所有用户列表

module.exports = router;