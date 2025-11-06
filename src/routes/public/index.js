const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadHandler = require("@controllers/public/upload");

const router = express.Router();

// 配置Multer用于处理文件上传（临时存储在本地）
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = "./temp";
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		// 保留原始文件扩展名
		const ext = path.extname(file.originalname);
		const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, filename);
	},
});
// 文件过滤：只允许图片和视频
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype.startsWith("image/") ||
		file.mimetype.startsWith("video/")
	) {
		cb(null, true);
	} else {
		cb(new Error("只允许上传图片和视频文件"), false);
	}
};
//限制上传文件大小
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 限制5MB
	},
});

router.post("/upload", upload.single("file"), uploadHandler.upload); //通用上传

module.exports = router;
