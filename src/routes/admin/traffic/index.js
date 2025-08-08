const express = require('express');
const router = express.Router();
const trafficHandler = require('@handler/traffic')

router.post('/userIn', trafficHandler.userIn);//新增标签
router.post('/userOut', trafficHandler.userOut);//删除标签

module.exports = router;