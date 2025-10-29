const express = require("express");
const router = express.Router();
const handler = require("@controllers/admin/analysis");
const { verifyToken } = require("@middleware/auth");

router.use(verifyToken);
router.get("/getNumData", handler.getNumData); //获取滚动数字数据
router.get("/getGeoData", handler.getGeoData); //获取地图数据
router.get("/getLineData", handler.getLineData); //获取折线图数据
router.get("/getBarData", handler.getBarData); //获取柱状图数据
router.get("/getPieData", handler.getPieData); //获取饼状图数据

module.exports = router;
