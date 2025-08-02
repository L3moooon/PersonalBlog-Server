const express = require('express')
const router = express.Router()
const handler = require('../../../router-handler/web/theme')
router.post('/modifyTheme', handler.modifyTheme)
module.exports = router