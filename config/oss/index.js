// OSS配置信息
const OSS = require('ali-oss');
const ossConfig = {
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  region: process.env.OSS_REGION,
  bucket: process.env.OSS_BUCKET,
};
const ossClient = new OSS(ossConfig)

module.exports = ossClient
