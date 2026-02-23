//文章评论
const { query } = require("@config/db-util");

//获取评论列表
exports.getCommentPanel = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10 } = req.query;
		// 转换分页参数为数字
		const currentPage = Number(pageNo);
		const sizePerPage = Number(pageSize);
		if (
			isNaN(currentPage) ||
			isNaN(sizePerPage) ||
			currentPage < 1 ||
			sizePerPage < 1
		) {
			return res.json({ code: 0, msg: "分页参数格式错误" });
		}
		const offset = (currentPage - 1) * sizePerPage;
		const sqlString = `
    SELECT 
      c.*,
      a.title,
      u1.name AS user_name
      FROM comment c 
      JOIN article a ON c.article_id = a.id 
      JOIN web_account u1 ON c.user_id = u1.id 
      LEFT JOIN web_account u2 ON c.parent_id = u2.id
      LIMIT ?, ?
    `;
		const result = await query(sqlString, [offset, sizePerPage]);
		const countSql = `
      SELECT COUNT(*) AS total 
      FROM comment c 
      JOIN article a ON c.article_id = a.id 
      JOIN web_account u1 ON c.user_id = u1.id 
    `;
		const totalResult = await query(countSql);
		const total = totalResult[0].total;
		return res.json({
			code: 1,
			msg: "获取好友列表成功",
			data: result,
			pagination: {
				page: currentPage, // 当前页码
				pageSize: sizePerPage, // 每页条数
				total, // 总条数
			},
		});
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};

//更新评论
exports.updateComment = async (req, res) => {
	try {
		const { id, ...otherFields } = req.body;
		if (!id) {
			return res.status(400).send({ code: 0, msg: "评论ID不能为空" });
		}
		const allowFields = [
			"content",
			"status",
			"top",
			"parent_id",
			"article_id",
			"user_id",
		];
		const [updateFields, updateValues] = Object.entries(otherFields)
			.filter(([key]) => allowFields.includes(key))
			.reduce(
				([fields, values], [key, value]) => {
					fields.push(`${key} = ?`);
					values.push(value);
					return [fields, values];
				},
				[[], []],
			);
		updateValues.push(id); // WHERE条件的id
		if ("content" in otherFields) {
			updateFields.push("last_edit_date = CURRENT_TIMESTAMP");
		}
		// 执行评论更新
		const sqlString1 = `UPDATE comment SET ${updateFields.join(
			", ",
		)} WHERE id = ?`;
		console.log(sqlString1);
		console.log(updateFields, updateValues);

		await query(sqlString1, updateValues);
		return res.send({ code: 1, msg: "修改成功！" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
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
