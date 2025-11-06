const { query } = require("@config/db-util");

// 获取所有友情链接（已通过审核的）
exports.getAllLink = async (req, res) => {
	try {
		const sqlString = `
      SELECT name, url, introduce, cover, email 
      FROM friendship 
      WHERE status = 1 
      ORDER BY id DESC
    `;
		const result = await query(sqlString);
		return res.send({ code: 1, data: result, msg: "获取友链成功" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};

// 友情链接申请
exports.applyForLink = async (req, res) => {
	try {
		const { name, url, introduce, cover, email } = req.body;
		// 插入友链申请数据，status 默认为 0（待审核）
		const sqlString = `
      INSERT INTO friendship (name, url, introduce, cover, email, status) 
      VALUES (?, ?, ?, ?, ?, 0)
    `;
		await query(sqlString, [name, url, introduce, cover, email]);
		return res.send({ code: 1, msg: "友链申请提交成功，待审核" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};
