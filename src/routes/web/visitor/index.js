const express = require('express');
const router = express.Router();
const userHandler = require('@controllers/visitor')

router.post('/visited', userHandler.visited);
module.exports = router;