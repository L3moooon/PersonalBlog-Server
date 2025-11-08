const { query } = require("@config/db-util");

// 获取服务器状态列表
exports.getStatusLog = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10 } = req.query;
		const page = parseInt(pageNo, 10);
		const size = parseInt(pageSize, 10);
		const offset = (page - 1) * size;
		const sqlString =
			"SELECT *  FROM log_server ORDER BY time DESC LIMIT ? OFFSET ?";
		const result = await query(sqlString, [size, offset]);
		// 查询总条数（用于计算总页数）
		const countSql = "SELECT COUNT(*) as total FROM log_server";
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
// 获取服务器重启日志列表
exports.getRebootLog = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10 } = req.query;
		const page = parseInt(pageNo, 10);
		const size = parseInt(pageSize, 10);
		const offset = (page - 1) * size; // 计算分页偏移量
		const sqlString =
			"SELECT * FROM log_reboot ORDER BY time DESC LIMIT ? OFFSET ?";
		const result = await query(sqlString, [size, offset]);

		// 查询总条数（用于计算总页数）
		const countSql = "SELECT COUNT(*) as total FROM log_reboot";
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

// 获取数据库备份日志列表
exports.getBackupLog = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10 } = req.query;
		const page = parseInt(pageNo, 10);
		const size = parseInt(pageSize, 10);
		const offset = (page - 1) * size; // 计算分页偏移量
		const sqlString =
			"SELECT * FROM log_db ORDER BY time DESC LIMIT ? OFFSET ?";
		const result = await query(sqlString, [size, offset]);
		// 查询总条数（用于计算总页数）
		const countSql = "SELECT COUNT(*) as total FROM log_db";
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
