const express = require('express');
const router = express.Router();
const handler = require('@handler/visitor')

router.post('/getList', handler.getVisitorList);//获取所有访客列表

module.exports = router;