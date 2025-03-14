const db = require('../../../config/db')
const express = require('express');
const router = express.Router();

router.get('/article', (req, res) => {
  const sqlString = 'SELECT * FROM article'
  db.query(sqlString, (err, result) => {
    // console.log(result);
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
});

module.exports = router;