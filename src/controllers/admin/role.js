const { query } = require("@config/db-util");
// 新增或更新角色
exports.addOrEditRole = async (req, res) => {
	try {
		const { id, role_name, role_code, description } = req.body;
		//更新角色
		if (id) {
			const sqlString = `
        UPDATE admin_role 
        SET role_name = ? , role_code = ? , description = ?, update_time = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
			await query(sqlString, [role_name, role_code, description, id]);
			return res.send({ status: 1, message: "角色更新成功" });
		}
		//新增角色
		else {
			// if (!role_name || !role_code) {
			//   return res.send({ status: 0, message: '角色名称和角色编码不能为空' })
			// }
			const sqlString = `
        INSERT INTO admin_role 
          (role_name, role_code, description, create_time, update_time) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
			await query(sqlString, [role_name, role_code, description]);
			return res.send({ status: 1, message: "角色添加成功" });
		}
	} catch (error) {
		return res.send({ code: 0, message: error.message });
	}
};

//获取权限列表
exports.getPermissionList = async (req, res) => {
	try {
		const sqlString = "SELECT * FROM admin_permission";
		const result = await query(sqlString);
		return res.json({
			status: 1,
			message: "权限列表获取成功",
			data: result,
		});
	} catch (error) {
		return res.send({ code: 0, message: err.message });
	}
};
// 获取角色列表
exports.getRoleList = async (req, res) => {
	try {
		const sqlString = `
      SELECT 
        ar.*,
        GROUP_CONCAT(rp.permission_id) AS permission_ids 
      FROM admin_role ar
      LEFT JOIN role_permission_relation rp ON ar.id = rp.role_id
      GROUP BY ar.id; 
    `;
		const result = await query(sqlString);
		result.forEach((v) => {
			if (v.permission_ids) {
				v.permission_ids = v.permission_ids.split(",").map((v) => parseInt(v));
			}
		});
		return res.json({
			code: 1,
			msg: "角色列表获取成功",
			data: result,
		});
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};

// 获取单个角色权限详情
exports.getRoleDetail = async (req, res) => {
	try {
		const { id } = req.body;
		const sqlString = `
      SELECT 
        ap.id
      FROM admin_role ar 
      LEFT JOIN role_permission_relation rp ON ar.id = rp.role_id 
      LEFT JOIN admin_permission ap ON rp.permission_id = ap.id
      WHERE ar.id = ? AND ap.id IS NOT NULL
    `;
		const result = await query(sqlString, [id]);
		// console.log(result);
		const resArr = [];
		result.forEach((item) => {
			resArr.push(item.id);
		});
		return res.json({
			status: 1,
			message: "角色详情获取成功",
			data: resArr,
		});
	} catch (error) {
		return res.send({ code: 0, message: error.message });
	}
};
// 角色分配权限
exports.assignPermission = async (req, res) => {
	try {
		const { id, permission_ids } = req.body; // 权限ID数组，如 [1,2,3]
		if (!id) {
			return res.send({ status: 0, message: "角色ID不能为空" });
		}
		// 先删除该角色已有的权限
		const deleteSql = "DELETE FROM role_permission_relation WHERE role_id = ?";
		await query(deleteSql, [id]);
		// 然后插入新的权限
		if (Array.isArray(permission_ids) && permission_ids.length > 0) {
			const insertValues = permission_ids.map((permissionId) => [
				id,
				permissionId,
			]);
			const insertSql =
				"INSERT INTO role_permission_relation (role_id, permission_id) VALUES ?";
			await query(insertSql, [insertValues]);
		}
		return res.send({ code: 1, msg: "权限分配成功" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};

// 删除角色
exports.deleteRole = async (req, res) => {
	try {
		const { id } = req.body;
		if (!id) {
			return res.send({ status: 0, message: "角色ID不能为空" });
		}
		//先删除对应权限
		const sqlString2 = "DELETE FROM role_permission_relation WHERE role_id = ?";
		await query(sqlString2, [id]);
		const sqlString1 = "DELETE FROM admin_role WHERE id = ?";
		await query(sqlString1, [id]);
		return res.send({ status: 1, message: "角色删除成功" });
	} catch (error) {
		return res.send({ code: 0, message: error.message });
	}
};
