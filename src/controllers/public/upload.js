// const fs = require("fs");
// const path = require("path");
// const ossClient = require("@config/oss");

// // 上传文件到OSS
// exports.upload = async (req, res) => {
// 	try {
// 		if (!req.file) {
// 			return res.status(400).json({ message: "请选择要上传的文件" });
// 		}
// 		const localFilePath = req.file.path;
// 		const fileExt = path.extname(req.file.originalname);

// 		const mimetype = req.file.mimetype;
// 		// 根据文件类型设置OSS中的存储路径
// 		// const fileType = req.file.mimetype.startsWith('image/') ? 'images' : 'videos';
// 		let fileType;
// 		// 按mimetype前缀依次判断文件类型
// 		if (mimetype.startsWith("image/")) {
// 			fileType = "images"; // 图片类型（jpg、png、gif等）
// 		} else if (mimetype.startsWith("video/")) {
// 			fileType = "videos"; // 视频类型（mp4、avi、mov等）
// 		} else if (mimetype.startsWith("audio/")) {
// 			fileType = "audios"; // 音乐/音频类型（mp3、wav、flac等）
// 		} else {
// 			fileType = "others"; // 其他类型（如文档、压缩包等，可根据需求定义）
// 		}
// 		const ossFilePath = `${fileType}/${Date.now()}${fileExt}`;

// 		// 上传文件到OSS
// 		const result = await ossClient.put(ossFilePath, localFilePath);
// 		const pathUrl = result.url.replace(
// 			"http://willi-bucket.oss-cn-beijing.aliyuncs.com",
// 			""
// 		);
// 		console.log(pathUrl);
// 		// 删除本地临时文件
// 		fs.unlinkSync(localFilePath);
// 		// 返回上传结果，包含文件URL
// 		return res.json({
// 			status: 1,
// 			message: "文件上传成功",
// 			data: {
// 				name: req.file.originalname,
// 				url: pathUrl,
// 			},
// 		});
// 	} catch (error) {
// 		console.error("上传失败:", error);
// 		res.status(500).json({
// 			message: "文件上传失败",
// 			error: error.message,
// 		});
// 	}
// };

// const StsClient = require("@alicloud/sts-sdk");
// // 创建STS客户端
// const sts = new StsClient({
// 	endpoint: "sts.aliyuncs.com",
// 	accessKeyId: process.env.ALI_ROLE_ACCESS_KEY_ID,
// 	accessKeySecret: process.env.ALI_ROLE_ACCESS_KEY_SECRET,
// });

const { STS } = require("ali-oss");
exports.getStsToken = async (req, res) => {
	const sts = new STS({
		accessKeyId: process.env.ALI_ROLE_ACCESS_KEY_ID,
		accessKeySecret: process.env.ALI_ROLE_ACCESS_KEY_SECRET,
	});
	const roleArn = process.env.ALI_ROLE_ARN; // 角色ARN
	const roleSessionName = "upload"; // 角色会话名称
	const durationSeconds = 1800; // 角色会话过期时间
	const policy = "";
	try {
		const result = await sts.assumeRole(
			roleArn,
			policy,
			durationSeconds,
			roleSessionName
		);
		// console.log(result);
		return res.json({
			code: 1,
			message: "获取 STS Token 成功",
			data: {
				accessKeyId: result.credentials.AccessKeyId,
				accessKeySecret: result.credentials.AccessKeySecret,
				securityToken: result.credentials.SecurityToken,
				expiration: result.credentials.Expiration,
				region: "oss-cn-beijing",
			},
		});
	} catch (error) {
		console.error("获取 STS Token 失败:", error);
		return res.status(500).json({
			code: 0,
			message: "获取 STS Token 失败",
			error: error.message,
		});
	}
};
