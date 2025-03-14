const express = require('express');
const router = express.Router();
const loginHandler = require('../../router-handler/login')

router.post('/login', loginHandler.login);
router.post('/register', loginHandler.register);

module.exports = router;