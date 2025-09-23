const { createClient } = require('redis');

// 创建Redis客户端
const redisClient = createClient({
  // 连接配置
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // 可选：连接超时设置（毫秒）
    connectTimeout: 5000
  },

  // 认证配置（如果Redis设置了密码）
  password: process.env.REDIS_PASSWORD,

  // 数据库编号（默认0）
  database: 0
});

// 错误处理
redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

// 连接Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis连接成功');
  } catch (err) {
    console.error('Redis连接失败:', err);
  }
})();

// 导出客户端实例
module.exports = redisClient;
