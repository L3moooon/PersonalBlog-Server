const db = require('../../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  // 输入验证
  if (!email || !password) {
    return res.status(400).json({ status: 0, message: '邮箱和密码是必需的' });
  }
  try {
    const sql = 'SELECT * FROM admin_account WHERE email = ? AND password = ?';
    console.log('执行的 SQL:', sql, [email, password]);
    db.query(sql, [email, password], (err, rows) => {
      if (err) {
        return handleError(res, err);
      }
      if (rows.length === 0) {
        return res.status(401).json({ status: 0, message: '用户名或密码错误' });
      }

      const token = jwt.sign({ email }, secretKey, { expiresIn: '168h' });
      res.json({ status: 1, token, name: rows[0].name });
    });
  } catch (error) {
    handleError(res, error);
  }
};


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
        return res.status(409).json({ status: 0, message: '该邮箱已被注册' });
      }

      // 插入新用户
      const insertSql = 'INSERT INTO admin_account (email, password, name) VALUES (?, ?, ?)';
      db.query(insertSql, [email, password, name], (err, result) => {
        if (err) {
          return handleError(res, err);
        }
        res.status(201).json({ status: 1, message: '注册成功' });
      });
    });
  } catch (error) {
    handleError(res, error);
  }
};

// 统一错误处理函数
const handleError = (res, error) => {
  return res.send({ status: 0, message: error.message });
};