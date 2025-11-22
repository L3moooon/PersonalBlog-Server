const { query } = require("@config/db-util");

//获取管理员列表
exports.getAdminList = async (req, res) => {
	try {
		const { pageNo = 1, pageSize = 10 } = req.query;
		const page = parseInt(pageNo);
		const size = parseInt(pageSize);
		const offset = (page - 1) * size;
		const sqlString = `
      SELECT 
        aq.id AS account_id,
        aq.account, 
        aq.name, 
        aq.avatar, 
        aq.create_time, 
        aq.last_login_time, 
        aq.ip, 
        aq.location, 
        aq.status,
        GROUP_CONCAT(r.id SEPARATOR ',') AS role_ids,
        GROUP_CONCAT(r.role_name SEPARATOR ',') AS role_names
      FROM admin_account aq
      LEFT JOIN account_role_relation ar ON aq.id = ar.user_id
      LEFT JOIN admin_role r ON ar.role_id = r.id
      GROUP BY aq.id 
      ORDER BY aq.create_time DESC 
      LIMIT ? OFFSET ?
    `;
		const result = await query(sqlString, [size, offset]);

		result.forEach((item) => {
			if (item.location) {
				item.location = JSON.parse(item.location);
			}
			if (item.role_names) {
				item.role_names = item.role_names.split(",");
			}
			if (item.role_ids) {
				item.role_ids = item.role_ids.split(",").map((v) => parseInt(v));
			}
		});
		// 查询总条数（用于计算总页数）
		const countSql = "SELECT COUNT(*) as total FROM admin_account";
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
