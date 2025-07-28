const sqlString = 'SELECT * FROM article'
const db = require('../../../config/db');
exports.article = async (req, res) => {
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
}
