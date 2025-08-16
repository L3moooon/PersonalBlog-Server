//后台登录
const db = require('@config/db');
const IP2Region = require('ip2region').default;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const query = new IP2Region();
const secretKey = crypto.randomBytes(32).toString('hex');

//后台管理员登录
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // 输入验证
  if (!email || !password) {
    return res.json({ status: 0, message: '邮箱和密码是必需的' });
  }
  try {
    const sql = 'SELECT * FROM admin_account WHERE email = ? AND password = ?';
    console.log('执行的 SQL:', sql, [email, password]);
    db.query(sql, [email, password], (err, rows) => {
      if (err) {
        return handleError(res, err);
      }
      if (rows.length === 0) {
        return res.json({ status: 0, message: '用户名或密码错误' });
      }
      const token = jwt.sign({ email }, secretKey, { expiresIn: '168h' });
      //登录成功时获取ip地址
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const ipAddress = JSON.stringify(query.search(ip));
      //将ip数据添加到数据库
      const sqlString = 'UPDATE admin_account SET ip = ?, location = ?,last_login_time = ? WHERE email = ?';
      const time = Date.now
      db.query(sqlString, [ip, ipAddress, time, email], (err2) => {
        if (err) {
          return handleError(res, err2);
        }
        res.json({ status: 1, token, name: rows[0].name });
      });
    });
  } catch (error) {
    handleError(res, error);
  }
};

//后台管理员注册
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // 检查邮箱是否已存在
    const checkSql = 'SELECT * FROM admin_account WHERE email = ?';
    db.query(checkSql, [email], (err, existingRows) => {
      if (err) {
        return handleError(res, err);
      }
      if (existingRows.length > 0) {
        return res.json({ status: 0, message: '该邮箱已被注册' });
      }
      // 插入新用户
      const insertSql = 'INSERT INTO admin_account (email, password, name) VALUES (?, ?, ?)';
      db.query(insertSql, [email, password, name], (err, result) => {
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


// 统一错误处理函数
const handleError = (res, error) => {
  return res.send({ status: 0, message: error.message });
};