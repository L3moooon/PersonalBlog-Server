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
      result.forEach(v => {
        if (v.tag && v.tag.length > 0) {
          v.tag = v.tag.split(',')
        }
      })
    }
    return res.json({ status: 1, message: '请求成功！', data: result })
  })
}
//新增或修改文章
exports.article = async (req, res) => {
  try {
    const { id, title, cover_img, abstract, content, status, tag } = req.body
    if (id) {//修改文章
      const sqlString1 = 'UPDATE article SET title = ?, cover_img = ?, abstract = ?,content = ?, status = ? WHERE id = ?'
      await query(sqlString1, [title, cover_img, abstract, content, status, id])

      if (tag && tag.length > 0) {
        const tagValues = tag.map(tagId => [id, tagId]);
        const sqlString2 = "DELETE FROM article_tag_relation WHERE article_id=?"
        const sqlString3 = 'INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?';
        await query(sqlString2, [id])
        await query(sqlString3, [tagValues]);//批量插入
      }
      return res.send({ status: 1, message: '修改成功！' });
    } else {//新增文章
      const sqlString1 = 'INSERT INTO article(title,cover_img,abstract,content,status) VALUES(?,?,?,?,?)'
      const addArticleResult = await query(sqlString1, [title, cover_img, abstract, content, status])
      const articleId = addArticleResult.insertId;
      if (tag && tag.length > 0) {
        const tagValues = tag.map(tagId => [articleId, tagId]);
        const sqlString2 = 'INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?';
        await query(sqlString2, [tagValues]);//批量插入
      }
      return res.send({ status: 1, message: '添加成功！' });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
}

//更改文章显隐状态
exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body
    const sqlString1 = 'UPDATE article SET status=? WHERE id=?'
    await query(sqlString1, [status, id])
    return res.send({ status: 1, message: '修改成功！' });
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
}
//删除文章
exports.delArticle = async (req, res) => {
  const { id } = req.body
  const sqlString = 'DELETE FROM article WHERE id=?'
  db.query(sqlString, [id], (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.send({ status: 1, message: '删除成功！' })
    }
  })
}
//根据id获取文章
exports.getArticle = async (req, res) => {
  const { id } = req.body
  const sqlString = 'SELECT * FROM article WHERE id=?'
  db.query(sqlString, [id], (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result[0] })
    }
  })
}
//获取文章所有评论
exports.getAllComments = async (req, res) => {
  try {
    const { id } = req.body
    const sqlString = 'SELECT c.id, c.article_id, c.user_id, c.parent_id, c.content, c.like_count, c.comment_date, wa.name AS reply_name, wa.portrait AS reply_portrait,pwa.name AS parent_name FROM comment c JOIN web_account wa ON c.user_id = wa.id LEFT JOIN comment pc ON c.parent_id = pc.id LEFT JOIN web_account pwa ON pc.user_id = pwa.id WHERE c.article_id = ?'
    const result = await query(sqlString, [id])
    return res.json({ status: 1, message: '请求成功！', data: result })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}
//获取评论管理面板
exports.getCommentPanel = async (req, res) => {

}
//发表或回复评论
exports.comment = async (req, res) => {
  try {
    const { article_id, user_id, parent_id, content } = req.body
    const sqlString = 'INSERT INTO comment(article_id,user_id,parent_id,content) VALUES(?,?,?,?)'
    await query(sqlString, [article_id, user_id, parent_id, content])
    return res.send({ status: 1, message: '请求成功！' })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}
//删除评论
exports.delComment = async (req, res) => {
  const { id } = req.body
}
