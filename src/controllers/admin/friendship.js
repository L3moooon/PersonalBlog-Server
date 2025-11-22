const { query } = require("@config/db-util");

exports.getFriendshipList = async (req, res) => {
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
		// SQL：查询当前用户的所有好友，关联好友的用户信息
		const sqlString = `
      SELECT *
      FROM friendship
      ORDER BY apply_time DESC
      LIMIT ?, ?
    `;

		// 执行查询，参数为当前用户ID
		const result = await query(sqlString, [offset, sizePerPage]);
		// 5. 查询总条数（用于计算总页数）
		const countSql = `
      SELECT COUNT(*) AS total FROM friendship 
    `;
		const totalResult = await query(countSql);
		const total = totalResult[0].total; // 总好友数
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
