const db = require('../../config/db');
const sqlString = 'SELECT * FROM admin_account'
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
exports.login = async (req, res) => {
  console.log(2222);
  // db.query(sqlString, (err, result) => {
  //   if (err) {
  //     return res.send({ status: 1, message: err.message })
  //   }
  //   if (result.length > 0) {
  //     return res.send({ status: 1, message: '请求成功', data: result })
  //   }
  // })
  const { email, password } = req.body

  try {
    const [rows] = await db.execute('SELECT * FROM admin_account WHERE email=? AND password =?', [email, password])
    if (rows.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    res.json({ token, name: rows });
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
};


exports.register = async (req, res) => {
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.send({ status: 1, message: '请求成功', data: result })
    }
  })
};