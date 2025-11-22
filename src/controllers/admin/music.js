const { query } = require("@config/db-util");

exports.getMusicList = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10, searchKey } = req.query;

		// 1. 分页参数转换与校验（避免非数字导致的计算错误）
		const currentPage = Number(pageNo);
		const sizePerPage = Number(pageSize);
		if (
			isNaN(currentPage) ||
			isNaN(sizePerPage) ||
			currentPage < 1 ||
			sizePerPage < 1
		) {
			return res.json({ code: 0, msg: "分页参数格式错误，需为正整数" });
		}
		const offset = (currentPage - 1) * sizePerPage;

		// 2. 构建 SQL 语句（初始语句不含分号，避免拼接错误）
		let sql = "SELECT * FROM music m";
		const whereConditions = [];
		const queryParams = [];

		// 3. 处理搜索关键词（搜索歌名和歌手）
		if (searchKey) {
			whereConditions.push("(m.name LIKE ? OR m.author LIKE ?)");
			const likeValue = `%${searchKey}%`;
			queryParams.push(likeValue, likeValue); // 两个占位符对应两个参数
		}

		// 4. 拼接 WHERE 条件
		if (whereConditions.length > 0) {
			sql += ` WHERE ${whereConditions.join(" AND ")}`;
		}

		// 5. 如需去重，添加 GROUP BY（注意别名正确，这里用 m.id）
		// 提示：如果 music 表无重复数据，可删除此句
		sql += " GROUP BY m.id";

		// 6. 拼接分页 LIMIT（注意参数顺序）
		sql += " LIMIT ?, ?";
		queryParams.push(offset, sizePerPage); // 仅添加偏移量和每页条数

		// 7. 查询总条数（与列表查询条件一致，确保总数准确）
		const countSql = `
      SELECT COUNT(DISTINCT m.id) AS total 
      FROM music m 
      ${
				whereConditions.length > 0
					? `WHERE ${whereConditions.join(" AND ")}`
					: ""
			}
      ${whereConditions.length > 0 ? "GROUP BY m.id" : ""}
    `;
		const countResult = await query(countSql, queryParams.slice(0, -2)); // 排除 LIMIT 参数
		const total = countResult[0].total || 0;

		// 8. 查询当前页数据（必须加 await，否则拿不到结果）
		const result = await query(sql, queryParams);

		// 9. 返回结果
		return res.json({
			code: 1,
			msg: "请求成功！",
			data: result,
			pagination: {
				total,
				pageNo: currentPage,
				pageSize: sizePerPage,
			},
		});
	} catch (error) {
		return res.json({ code: 0, message: error.message });
	}
};
