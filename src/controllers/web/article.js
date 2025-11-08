const { query } = require("@config/db-util");

//根据id获取文章
exports.getArticle = async (req, res) => {
	try {
		const { id } = req.body;
		const sqlString = "SELECT * FROM article WHERE id=?";
		const data = await query(sqlString, [id]);
		if (data.length > 0) {
			return res.json({ status: 1, message: "请求成功！", data: data[0] });
		}
	} catch (error) {
		return res.json({ status: 1, message: "请求成功！", data: result[0] });
	}
};

//更新文章访问量
exports.view = async (req, res) => {
	try {
		const { id } = req.body;
		const sqlString = "UPDATE article SET view=view+1 WHERE id=?";
		await query(sqlString, [id]);
		return res.json({ status: 1, message: "请求成功！" });
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};
//更新文章点赞量
// exports.view = async (req, res) => {
//   //同一用户只能点赞一次
// }

//获取文章所有评论
exports.getAllComments = async (req, res) => {
	try {
		const { id } = req.body;
		const identify = parseInt(id);
		const sqlString = `
      SELECT 
        c.id, 
        c.article_id, 
        c.user_id, 
        c.parent_id, 
        c.content, 
        c.like_count, 
        c.comment_date, 
        wa.name AS reply_name, 
        wa.portrait AS reply_portrait,
        pwa.name AS parent_name 
      FROM comment c JOIN web_account wa ON c.user_id = wa.identify 
      LEFT JOIN comment pc ON c.parent_id = pc.id 
      LEFT JOIN web_account pwa ON pc.user_id = pwa.identify WHERE c.article_id = ?
    `;
		const result = await query(sqlString, [identify]);
		return res.json({ status: 1, message: "请求成功！", data: result });
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};

//发表或回复评论
exports.comment = async (req, res) => {
	try {
		const { article_id, user_id, parent_id, content } = req.body;
		const sqlString =
			"INSERT INTO comment(article_id,user_id,parent_id,content) VALUES(?,?,?,?)";
		await query(sqlString, [article_id, user_id, parent_id, content]);
		return res.send({ code: 1, msg: "请求成功！" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};
//删除评论
exports.delComment = async (req, res) => {
	try {
		const { id } = req.body;
		const sqlString = "DELETE FROM comment WHERE id=?";
		await query(sqlString, [id]);
		return res.send({ status: 1, message: "删除成功！" });
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};
