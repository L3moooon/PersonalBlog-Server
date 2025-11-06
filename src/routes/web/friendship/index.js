const express = require("express");
const router = express.Router();
const handler = require("@controllers/web/friendship");

router.get("/getAllLink", handler.getAllLink);
router.post("/applyForLink", handler.applyForLink); //获取网站运转信息

module.exports = router;
