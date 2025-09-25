// 配置邮件发送器
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.NODE_MAILER_HOST, // 邮箱SMTP服务器
  port: process.env.NODE_MAILER_PORT, // 端口号
  secure: process.env.NODE_MAILER_SECURE,
  auth: {
    user: process.env.NODE_MAILER_AUTH_USER, // 邮箱地址
    pass: process.env.NODE_MAILER_AUTH_PASS // 邮箱授权码
  }
});
module.exports = transporter