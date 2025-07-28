const express = require('express');
const router = express.Router();

// 在这里定义各种路由，比如
router.get('/somePath', (req, res) => {
  res.send('这是某个路由的响应');
});

module.exports = router;