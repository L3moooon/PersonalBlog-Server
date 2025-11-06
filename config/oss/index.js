// OSS配置信息
const OSS = require("ali-oss");
const ossConfig = {
	accessKeyId: process.env.OSS_ACCESS_KEY_ID,
	accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
	region: process.env.OSS_REGION,
	bucket: process.env.OSS_BUCKET,
};
const ossClient = new OSS(ossConfig);

(async () => {
	try {
		const result = await ossClient.listBuckets();
		console.log("OSS 连接成功！");
	} catch (error) {
		console.error("OSS 连接失败：", error.message);
	}
})();
module.exports = ossClient;
