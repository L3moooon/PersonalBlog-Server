//后台登录
const { query } = require('@config/db-util');
const IP2Region = require('ip2region').default;
const jwt = require('jsonwebtoken');
const { secretKey } = require('@config/jwt'); // 引入固定密钥
const IPquery = new IP2Region();

//后台管理员登录
exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;
    if (!account || !password) { // 输入验证
      return res.json({ status: 0, message: '邮箱和密码是必需的' });
    }
    const sqsqlStringl = `
      SELECT 
        a.id as user_id, 
        a.name,
        p.permission_type,
        p.path,
        p.component,
        p.permission_code
      FROM admin_account a
      LEFT JOIN account_role_relation ar ON a.id = ar.user_id
      LEFT JOIN admin_role r ON ar.role_id = r.id
      LEFT JOIN role_permission_relation rp ON r.id = rp.role_id
      LEFT JOIN admin_permission p ON rp.permission_id = p.id
      WHERE a.account = ? AND a.password = ?
    `;
    const result = await query(sqsqlStringl, [account, password]);
    if (result.length === 0) {
      return res.json({ status: 0, message: '用户名或密码错误' });
    }
    const { user_id, name } = result[0];
    const routeKeys = [];
    const componentKeys = [];
    const buttonKeys = [];
    result.map(item => {
      switch (item.permission_type) {
        case 1:
          routeKeys.push(item.path)
          break;
        case 2:
          componentKeys.push(item.component)
          break;
        case 3:
          buttonKeys.push(item.permission_code)
          break;
        default:
          break;
      }
    });
    const token = jwt.sign({ user_id }, secretKey, { expiresIn: '168h' });
    //登录成功时获取ip地址
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const address = JSON.stringify(IPquery.search(ip));
    //将ip数据添加到数据库
    const sqlString2 = 'UPDATE admin_account SET ip = ?, location = ? ,last_login_time = CURRENT_TIMESTAMP WHERE account = ?';
    await query(sqlString2, [ip, address, account, password]);
    return res.json({
      status: 1,
      token,
      user: {
        name,
        permissions: {
          routeKeys,
          componentKeys,
          buttonKeys
        },
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

//后台管理员注册-默认角色为游客
exports.register = async (req, res) => {
  const { account, password, name } = req.body;
  try {
    // 检查邮箱是否已存在
    const checkSql = 'SELECT * FROM admin_account WHERE account = ?';
    const checkResult = await query(checkSql, [account]);
    if (checkResult.length > 0) {
      return res.json({ status: 0, message: '该邮箱已被注册' });
    }
    // 插入新用户
    const insertSql = 'INSERT INTO admin_account (account, password, name) VALUES (?, ?, ?)';
    const insertResult = await query(insertSql, [account, password, name])
    // 为新用户分配默认角色
    const defaultRoleId = 4; // 默认角色ID-游客
    const assignRoleSql = 'INSERT INTO account_role_relation (user_id, role_id) VALUES (?, ?)';
    await query(assignRoleSql, [insertResult.insertId, defaultRoleId]);
    res.json({ status: 1, message: '注册成功' });
  } catch (error) {
    handleError(res, error);
  }
};
//忘记密码

//获取所有管理员
exports.getAdminList = async (req, res) => {
  try {
    const sqlString = "SELECT id, account, create_time, last_login_time, ip, location,status FROM admin_account "
    const result = await query(sqlString)
    result.forEach(item => {
      if (item.location) {
        item.location = JSON.parse(item.location);
      }
    });
    res.json({ status: 1, data: result });
  } catch (error) {
    handleError(res, error);
  }

}

// 统一错误处理函数
const handleError = (res, error) => {
  return res.send({ status: 0, message: error.message });
};