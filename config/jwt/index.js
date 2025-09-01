module.exports = {
  secretKey: process.env.JWT_SECRET,// 固定密钥
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',// 过期时间
};

// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);