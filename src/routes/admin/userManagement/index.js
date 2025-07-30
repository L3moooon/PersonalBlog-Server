const express = require('express');
const router = express.Router();
const handler = require('../../../router-handler/admin/user')

router.post('/getAllUserList', handler.getAllUserList);//获取所有用户列表

module.exports = router;