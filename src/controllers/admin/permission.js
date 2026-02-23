const { query } = require("@config/db-util");

//获取权限列表
exports.getPermissionList = async (req, res) => {
	try {
		const result = await query(
			// "SELECT * FROM admin_permission ORDER BY parent_id ASC,permission_type ASC, path ASC, component ASC, permission_code ASC"
			"SELECT * FROM admin_permission"
		);
		return res.send({ code: 1, msg: "请求成功！", data: result });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};

//新增权限
exports.addPermission = async (req, res) => {
	try {
		const {
			parent_id,
			permission_name,
			permission_type,
			path,
			component,
			permission_code,
		} = req.body;
		const sqlString =
			"INSERT INTO admin_permission(parent_id,permission_name,permission_type,path,component,permission_code,create_time) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)";
		await query(sqlString, [
			parent_id,
			permission_name,
			permission_type,
			path,
			component,
			permission_code,
		]);
		return res.send({ code: 1, msg: "添加成功" });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};
//编辑权限
exports.editPermission = async (req, res) => {
	try {
		const {
			id,
			parent_id,
			permission_name,
			permission_type,
			path,
			component,
			permission_code,
			disabled,
		} = req.body;
		const sqlString = `UPDATE admin_permission
       SET parent_id = ?,
       permission_name = ?,
       permission_type = ?,
       path = ?,
       component = ?,
       permission_code = ?,
       disabled = ?,
       update_time = CURRENT_TIMESTAMP
       WHERE id = ?`;
		await query(sqlString, [
			parent_id,
			permission_name,
			permission_type,
			path,
			component,
			permission_code,
			disabled,
			id,
		]);
		return res.send({ code: 1, msg: "编辑成功" });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};
//删除权限
exports.deletePermission = async (req, res) => {
	try {
		const { id } = req.body;
		const sqlString = "DELETE FROM admin_permission WHERE id = ?";
		await query(sqlString, [id]);
		return res.send({ code: 1, msg: "删除成功" });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};
