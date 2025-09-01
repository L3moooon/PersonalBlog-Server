// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

// Token验证中间件
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ status: 0, message: '未提供有效Token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // 将用户信息挂载到req对象
    next(); // 验证通过，继续执行
  } catch (error) {
    return res.json({ status: 0, message: 'Token无效或已过期' });
  }
};

module.exports = { verifyToken };