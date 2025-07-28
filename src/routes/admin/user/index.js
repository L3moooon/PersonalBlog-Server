const express = require('express');
const router = express.Router();
const handler = require('../../../router-handler/admin/login')

router.post('/login', handler.login);
router.post('/register', handler.register);

module.exports = router;