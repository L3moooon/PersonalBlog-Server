const express = require('express');
const router = express.Router();
const handler = require('@handler/role');

router.post('/getRoleList', handler.getRoleList);//获取角色列表
router.post('/add', handler.addRole);//新增角色

module.exports = router;