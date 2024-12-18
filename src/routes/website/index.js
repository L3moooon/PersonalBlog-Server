const express = require('express');
const router = express.Router();
const websiteHandler = require('../../router-handler/website')

router.post('/info', websiteHandler.info);
module.exports = router;