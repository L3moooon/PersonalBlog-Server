const express = require('express');
const router = express.Router();
const { verifyToken } = require('@middleware/auth'); // 引入中间件
const handler = require('@controllers/role');

router.use(verifyToken)
router.post('/getRoleList', handler.getRoleList);//获取角色列表
router.post('/getPermissionList', handler.getPermissionList);//获取角色列表

router.post('/add', handler.addRole);//新增角色

module.exports = router;