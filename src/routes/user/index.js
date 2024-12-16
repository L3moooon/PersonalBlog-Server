const db = require('../../../config/db')
const express = require('express');
const router = express.Router();

router.post('/info', (req, res) => {
  const sqlString = 'SELECT * FROM user'
  db.query(sqlString, (err, result) => {
    console.log(result);
    if (err) {
      return res.send({ status: 1, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
});

module.exports = router;