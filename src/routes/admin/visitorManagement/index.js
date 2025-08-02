const express = require('express');
const router = express.Router();
const handler = require('../../../router-handler/web/user')

router.post('/getList', handler.getVisitorList);//获取所有访客列表

module.exports = router;