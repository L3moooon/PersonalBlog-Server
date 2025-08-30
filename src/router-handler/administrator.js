//后台登录
const db = require('@config/db');
const { query } = require('@config/db-util');
const IP2Region = require('ip2region').default;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const IPquery = new IP2Region();
const secretKey = crypto.randomBytes(32).toString('hex');

//后台管理员登录
exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;
    if (!account || !password) { // 输入验证
      return res.json({ status: 0, message: '邮箱和密码是必需的' });
    }
    const sqsqlStringl = 'SELECT * FROM admin_account WHERE account = ? AND password = ?';
    const result = await query(sqsqlStringl, [account, password]);
    if (result.length === 0) {
      return res.json({ status: 0, message: '用户名或密码错误' });
    }
    const token = jwt.sign({ account }, secretKey, { expiresIn: '168h' });
    //登录成功时获取ip地址
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const address = JSON.stringify(IPquery.search(ip));
    //将ip数据添加到数据库
    const sqlString2 = 'UPDATE admin_account SET ip = ?, location = ? ,last_login_time = CURRENT_TIMESTAMP WHERE account = ?';
    await query(sqlString2, [ip, address, account, password]);
    return res.json({ status: 1, token, name: result[0].name });
  } catch (error) {
    handleError(res, error);
  }
};

//后台管理员注册
exports.register = async (req, res) => {
  const { account, password, name } = req.body;
  try {
    // 检查邮箱是否已存在
    const checkSql = 'SELECT * FROM admin_account WHERE account = ?';
    db.query(checkSql, [account], (err, existingRows) => {
      if (err) {
        return handleError(res, err);
      }
      if (existingRows.length > 0) {
        return res.json({ status: 0, message: '该邮箱已被注册' });
      }
      // 插入新用户
      const insertSql = 'INSERT INTO admin_account (account, password, name) VALUES (?, ?, ?)';
      db.query(insertSql, [account, password, name], (err, result) => {
        if (err) {
          return handleError(res, err);
        }
        res.json({ status: 1, message: '注册成功' });
      });
    });
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
    res.send({ status: 0, message: error.message });
  }

}
// 统一错误处理函数
const handleError = (res, error) => {
  return res.send({ status: 0, message: error.message });
};