const { query } = require("@config/db-util");

exports.getMusicList = async (req, res) => {
	try {
		const {
			pageNo = 1, // 页码，默认第1页
			pageSize = 10, // 每页条数，默认10条
			searchKey, // 搜索关键词
		} = req.query;
		const offset = (pageNo - 1) * pageSize; // 计算分页偏移量
		let sql = `SELECT * FROM music m;`;

		// 条件部分
		const whereConditions = [];
		const queryParams = [];

		// 处理搜索关键词（搜索标题和内容）
		if (searchKey) {
			whereConditions.push("(m.name LIKE ? OR m.author LIKE ?)");
			const likeValue = `%${searchKey}%`;
			queryParams.push(likeValue, likeValue);
		}
		// 添加WHERE条件
		if (whereConditions.length > 0) {
			sql += ` WHERE ${whereConditions.join(" AND ")}`;
		}
		// 分组
		sql += " GROUP BY a.id";
		// 获取总条数（用于分页）
		const countSql = `SELECT COUNT(DISTINCT m.id) AS total FROM music m ${
			whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
		}`;
		const countResult = await query(countSql, queryParams);
		const total = countResult[0].total;
		// 添加分页
		sql += " LIMIT ?,OFFSET ?";
		queryParams.push(offset, parseInt(pageSize), offset);
		const result = query(sql);
		// 返回数据（包含分页信息）
		return res.json({
			code: 1,
			msg: "请求成功！",
			data: result,
			pagination: {
				total,
				pageNo: parseInt(pageNo),
				pageSize: parseInt(pageSize),
			},
		});
	} catch (error) {
		return res.send({ code: 0, message: error.message });
	}
};
