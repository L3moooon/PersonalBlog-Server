const express = require('express')
const router = express.Router()
const handler = require('../../../router-handler/web/user')
router.post('/modifyUser', handler.modifyUser)
module.exports = router