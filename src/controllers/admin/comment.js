//文章评论
const { query } = require('@config/db-util');

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
//删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.body
    const sqlString = 'DELETE FROM comment WHERE id=?'
    await query(sqlString, [id])
    return res.send({ status: 1, message: '删除成功！' })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}
