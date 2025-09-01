const db = require('@config/db')
const { query } = require('@config/db-util');
// 新增或更新角色
exports.addRole = async (req, res) => {
  try {
    const { role_name, description } = req.body
    const sqlString = `
      INSERT INTO admin_role 
        (role_name, description, create_time, update_time) 
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `
    query(sqlString, [role_name, description])
    return res.send({ status: 1, message: '角色添加成功' })
  } catch (error) {
    return res.send({ code: 0, message: err.message })
  }
}
// 获取角色列表
exports.getRoleList = async (req, res) => {
  try {
    const sqlString = 'SELECT * FROM admin_role';
    const result = await query(sqlString)
    return res.json({
      status: 1,
      message: '角色列表获取成功',
      data: result
    })
  } catch (error) {
    return res.send({ code: 0, message: err.message })
  }
}
//获取权限列表
exports.getPermissionList = async (req, res) => {
  try {
    const sqlString = 'SELECT * FROM admin_permission';
    const result = await query(sqlString)
    return res.json({
      status: 1,
      message: '权限列表获取成功',
      data: result
    })
  } catch (error) {
    return res.send({ code: 0, message: err.message })
  }
}
// 获取单个角色权限详情
exports.getRoleDetail = async (req, res) => {
  const { id } = req.params
  const sqlString = `
    SELECT id, role_name, role_code, description, create_time, update_time, disabled 
    FROM sys_role 
    WHERE id = ?
  `
  db.query(sqlString, [id], (err, result) => {
    if (err) {
      return res.send({ code: 0, message: err.message })
    }

    if (result.length === 0) {
      return res.send({ code: 0, message: '角色不存在' })
    }

    return res.send({
      status: 1,
      message: '角色详情获取成功',
      data: result[0]
    })
  })
}
// 角色分配权限
exports.assignPermission = async (req, res) => {
  const { id } = req.params
  const { permissionIds } = req.body // 权限ID数组，如 [1,2,3]

  if (!permissionIds || !Array.isArray(permissionIds)) {
    return res.send({ code: 0, message: '请传入有效的权限ID数组' })
  }

  // 开启事务
  db.beginTransaction((err) => {
    if (err) {
      return res.send({ code: 0, message: err.message })
    }

    // 1. 先删除原有权限关联
    const deleteSql = 'DELETE FROM sys_role_permission WHERE role_id = ?'
    db.query(deleteSql, [id], (deleteErr) => {
      if (deleteErr) {
        return db.rollback(() => {
          res.send({ code: 0, message: deleteErr.message })
        })
      }

      // 2. 批量插入新的权限关联
      if (permissionIds.length === 0) {
        // 如果没有权限，直接提交事务
        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => {
              res.send({ code: 0, message: commitErr.message })
            })
          }
          res.send({ status: 1, message: '权限分配成功' })
        })
        return
      }

      const insertSql = `
        INSERT INTO sys_role_permission (role_id, permission_id, create_time) 
        VALUES ${permissionIds.map(() => '(?, ?, NOW())').join(',')}
      `
      // 构建参数数组 [roleId, permId1, roleId, permId2, ...]
      const params = []
      permissionIds.forEach(permId => {
        params.push(id, permId)
      })

      db.query(insertSql, params, (insertErr) => {
        if (insertErr) {
          return db.rollback(() => {
            res.send({ code: 0, message: insertErr.message })
          })
        }

        // 提交事务
        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => {
              res.send({ code: 0, message: commitErr.message })
            })
          }
          res.send({ status: 1, message: '权限分配成功' })
        })
      })
    })
  })
}

// 删除角色
exports.deleteRole = async (req, res) => {
  const { id } = req.params

  // 先检查是否有关联的权限或用户（可选，根据业务需求添加）
  const checkSql = `
    SELECT COUNT(*) as关联数 FROM sys_role_permission WHERE role_id = ?
    UNION ALL
    SELECT COUNT(*) as关联数 FROM sys_user_role WHERE role_id = ?
  `
  db.query(checkSql, [id, id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.send({ code: 0, message: checkErr.message })
    }

    // 如果有关联数据，阻止删除（可选逻辑）
    const permissionCount = checkResult[0].关联数
    const userCount = checkResult[1].关联数
    if (permissionCount > 0 || userCount > 0) {
      return res.send({
        code: 0,
        message: `该角色已关联${permissionCount}个权限和${userCount}个用户，无法删除`
      })
    }

    // 执行删除
    const deleteSql = 'DELETE FROM sys_role WHERE id = ?'
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        return res.send({ code: 0, message: err.message })
      }

      if (result.affectedRows === 0) {
        return res.send({ code: 0, message: '角色不存在' })
      }

      return res.send({ status: 1, message: '角色删除成功' })
    })
  })
}


