const db = require('../../../config/db');

//获取所有文章
exports.getAllArticle = async (req, res) => {
  // const sqlString = 'SELECT * FROM article'
  const sqlString = "SELECT a.*,  GROUP_CONCAT(t.tag_name SEPARATOR ', ') AS tag FROM article a LEFT JOIN article_tag_relation at ON a.id = at.article_id  LEFT JOIN tag t ON at.tag_id = t.id GROUP BY a.id; "
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
}
//新增文章
exports.addArticle = async (req, res) => {
  const sqlString = 'SELECT * FROM article WHERE id=?'
  db.query(sqlString, [req.id], (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
}
//删除文章
exports.delArticle = async (req, res) => {
  const sqlString = 'SELECT * FROM article'
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
}
//修改文章
exports.editArticle = async (req, res) => {
  const sqlString = 'SELECT * FROM article'
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
}
//获取文章
exports.getArticle = async (req, res) => {
  const sqlString = 'SELECT * FROM article'
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result })
    }
  })
}

