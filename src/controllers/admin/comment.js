//文章评论
const { query } = require("@config/db-util");

//获取评论列表
exports.getCommentPanel = async (req, res) => {
	try {
		const sqlString = `
    SELECT 
      c.*,
      a.title,
      u1.name AS user_name
      FROM comment c 
      JOIN article a ON c.article_id = a.id 
      JOIN web_account u1 ON c.user_id = u1.id 
      LEFT JOIN web_account u2 ON c.parent_id = u2.id;
    `;
		const result = await query(sqlString);
		return res.json({ code: 1, msg: "请求成功！", data: result });
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};
//删除评论
exports.deleteComment = async (req, res) => {
	try {
		const { id } = req.body;
		const sqlString = "DELETE FROM comment WHERE id=?";
		await query(sqlString, [id]);
		return res.send({ status: 1, message: "删除成功！" });
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};
