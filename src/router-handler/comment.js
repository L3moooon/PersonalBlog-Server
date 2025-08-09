const { query } = require('@config/db-util');
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
  try {
    const sqlString = "SELECT c.id,c.article_id, a.title,c.user_id,u1.name AS user_name,c.parent_id,u2.name AS  reply_user_name,c.content,c.comment_date,c.edit_date,c.like_count FROM comment c JOIN article a ON c.article_id = a.id JOIN web_account u1 ON c.user_id = u1.id LEFT JOIN web_account u2 ON c.parent_id = u2.id; "
    const result = await query(sqlString)
    return res.json({ status: 1, message: '请求成功！', data: result })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }

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
  try {
    const { id } = req.body
    const sqlString = 'DELETE FROM comment WHERE id=?'
    await query(sqlString, [id])
    return res.send({ status: 1, message: '删除成功！' })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}
