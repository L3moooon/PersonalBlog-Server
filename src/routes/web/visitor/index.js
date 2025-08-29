const express = require('express');
const router = express.Router();
const userHandler = require('@handler/visitor')

router.post('/visited', userHandler.visited);
module.exports = router;