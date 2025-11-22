const { query } = require("@config/db-util/index");

//获取游客列表
exports.getVisitorList = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10 } = req.query;

		const page = parseInt(pageNo, 10);
		const size = parseInt(pageSize, 10);

		const offset = (page - 1) * size;
		const sqlString =
			"SELECT * FROM web_account ORDER BY last_login_time DESC LIMIT ? OFFSET ?";
		const result = await query(sqlString, [size, offset]);
		result.forEach((item) => {
			if (item.address) {
				item.address = JSON.parse(item.address);
			}
		});
		// 查询总条数（用于计算总页数）
		const countSql = "SELECT COUNT(*) as total FROM web_account";
		const countResult = await query(countSql);
		const total = countResult[0].total;

		return res.json({
			code: 1,
			msg: "获取成功",
			data: result, // 当前页数据列表
			pagination: {
				pageNo: page, // 当前页码
				pageSize: size, // 每页条数
				total, // 总条数
			},
		});
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};
