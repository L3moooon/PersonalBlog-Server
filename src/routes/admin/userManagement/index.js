const express = require('express');
const router = express.Router();
const handler = require('../../../router-handler/admin/user')

router.post('/getAllUserList', handler.getAllUserList);

module.exports = router;