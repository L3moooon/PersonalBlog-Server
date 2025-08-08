const express = require('express');
const router = express.Router();
const userHandler = require('@handler/user')

router.post('/visited', userHandler.visited);
module.exports = router;