const express = require('express');
const router = express.Router();
const handler = require('@controllers/collect');

router.post('/performance', handler.performance);//收集前台性能信息
module.exports = router;