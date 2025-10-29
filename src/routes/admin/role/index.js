const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/role");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.post("/addOrEditRole", handler.addOrEditRole); //新增或编辑角色
router.post("/deleteRole", handler.deleteRole); //删除角色
router.post("/getRoleList", handler.getRoleList); //获取角色列表
router.post("/getPermissionList", handler.getPermissionList); //获取权限列表
router.post("/getRoleDetail", handler.getRoleDetail); //获取单个角色权限详情
router.post("/assignPermission", handler.assignPermission); //获取角色列表

module.exports = router;
