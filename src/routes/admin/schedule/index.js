const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/schedule");
const { verifyToken } = require("@middleware/auth"); // 引入中间件

router.use(verifyToken);
router.get("/getBackupLog", handler.getBackupLog); //新增或编辑角色
router.get("/getRebootLog", handler.getRebootLog); //删除角色
router.get("/getStatusLog", handler.getStatusLog); //获取角色列表

module.exports = router;
