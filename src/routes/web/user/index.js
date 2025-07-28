const express = require('express');
const router = express.Router();
const userHandler = require('../../../router-handler/web/user')

router.post('/info', userHandler.info);
module.exports = router;