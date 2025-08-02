const db = require('../../../config/db');

exports.info = async (req, res) => {
  const sqlString = 'SELECT * FROM website_info';
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.send({ status: 1, message: '请求成功', data: result })
    }
  })
}