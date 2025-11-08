const { query } = require("@config/db-util");

// 获取所有留言（关联用户信息）
exports.getAllMessage = async (req, res) => {
	try {
		// 联查 message 表和 web_account 表，获取留言内容及用户信息
		const sqlString = `
      SELECT 
        m.id, 
        m.user_id, 
        m.content, 
        m.create_time,
        w.name, 
        w.portrait,
        w.address
      FROM 
        message m 
        LEFT JOIN web_account w ON m.user_id = w.identify
      ORDER BY 
        m.create_time DESC
    `;
		const result = await query(sqlString);
		return res.send({ code: 1, data: result, msg: "获取留言成功" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};

// 发表留言
exports.addMessage = async (req, res) => {
	try {
		const { user_id, content } = req.body;
		// 插入留言数据到 message 表
		const sqlString = `
      INSERT INTO message (user_id, content) 
      VALUES (?, ?)
    `;
		await query(sqlString, [user_id, content]);
		return res.send({ code: 1, msg: "留言发表成功" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};
