const db = require('../../../config/db');
const { query } = require('../../../config/db-util');
//获取所有文章
exports.getAllArticle = async (req, res) => {
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
  try {
    const { title, cover_img, abstract, content, status, tags } = req.body
    const sqlString1 = 'INSERT INTO article(title,cover_img,abstract,content,status) VALUES(?,?,?,?,?)'
    const addArticleResult = await query(sqlString1, [title, cover_img, abstract, content, status])
    const articleId = addArticleResult.insertId;
    if (tags && tags.length > 0) {
      const tagValues = tags.map(tagId => [articleId, tagId]);
      const sqlString2 = 'INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?';
      await query(sqlString2, [tagValues]);//批量插入
    }
    res.json({ status: 1, message: '添加成功！' });
  } catch (error) {
    res.send({ status: 0, message: err.message });
  }

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

