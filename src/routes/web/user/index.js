const express = require('express');
const router = express.Router();
const userHandler = require('../../../router-handler/web/user')

router.post('/visited', userHandler.visited);
module.exports = router;