const express = require('express')
const router = express.Router()
const handler = require('@handler/theme')
router.post('/modifyTheme', handler.modifyTheme)
module.exports = router