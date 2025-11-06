const express = require("express");
const router = express.Router();
const handler = require("@controllers/web/message");

router.get("/getAllMessage", handler.getAllMessage);
router.post("/addMessage", handler.addMessage); //获取网站运转信息

module.exports = router;
