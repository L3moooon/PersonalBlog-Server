//标签
const db = require('@config/db')

//新增标签
exports.addTag = async (req, res) => {
  const { name } = req.body
  const sqlString = "INSERT INTO tag(tag_name) VALUES (?) "
  db.query(sqlString, [name], (err, row) => {
    if (err) {
      return res.send({ code: 0, message: err })
    }
    return res.send({ status: 1, message: '添加成功' })
  })
}
//删除标签
exports.delTag = async (req, res) => {
  const { id } = req.body
  const sqlString = "DELETE FROM tag WHERE id=?"
  db.query(sqlString, [id], (err, row) => {
    if (err) {
      return res.send({ code: 0, message: err })
    }
    return res.json({ status: 1, message: '删除成功' })
  })
}

//获取标签列表
exports.getAllTags = async (req, res) => {
  const sqlString = "SELECT * FROM tag"
  db.query(sqlString, (err, row) => {
    if (err) {
      return res.send({ code: 0, message: err })
    }
    return res.json({ status: 1, data: row })
  })
}
