const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/permission");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.get("/getPermissionList", handler.getPermissionList); //获取权限列表
router.post("/addPermission", handler.addPermission); //新增权限
router.post("/deletePermission", handler.deletePermission); //删除权限
router.post("/editPermission", handler.editPermission); //编辑权限

module.exports = router;
