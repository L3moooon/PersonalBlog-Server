const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");
const ossClient = require("@config/oss");
const zlib = require("zlib"); // Node.js 内置压缩模块，替代 gzip 命令（跨平台）
const { promisify } = require("util");
const { exec } = require("child_process");
const { dbConfig, dbBackupConfig } = require("@config/db-util");
const { query } = require("@config/db-util");

// 确保备份目录存在
const backupDir = path.join(__dirname, "..", "..", "..", "temp");
if (!fs.existsSync(backupDir)) {
	fs.mkdirSync(backupDir, { recursive: true });
}

// 工具函数：格式化时间戳
const getTimestamp = () => {
	const date = new Date();
	return date.toISOString().replace(/[:T]/g, "-").split(".")[0]; // 格式：2023-10-05-14-30-22
};
// 执行备份的函数
async function backupDatabase() {
	const logData = {
		filename: "",
		file_size: 0,
		oss_url: "",
		error_msg: "",
		duration: 0,
		status: "failed",
	};
	const startTime = Date.now();
	const timestamp = getTimestamp();
	const filename = `${dbConfig.database}-${timestamp}.sql`;
	const filepath = path.join(backupDir, filename);
	try {
		// 构建mysqldump命令
		const cmd = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > ${filepath}`;

		console.log(`开始备份数据库到 ${filepath}`);

		await promisify(exec)(cmd); // 使用 promisify 转换为 Promise
		// 获取文件大小
		const stats = fs.statSync(filepath);
		logData.file_size = stats.size;
		console.log(`备份成功: ${filepath} (大小: ${stats.size} bytes)`);
		// 备份成功后压缩
		const ossUrl = await compressBackup(filepath);
		logData.oss_url = ossUrl;
		logData.status = "success";
	} catch (error) {
		console.error(`备份失败: ${error.message}`);
		logData.error_msg = error.message;
	} finally {
		// 计算耗时并记录日志
		logData.duration = (Date.now() - startTime) / 1000;
		await logToDatabase(logData);
	}
}

// 压缩备份文件
async function compressBackup(filepath) {
	try {
		const compressedFile = `${filepath}.gz`;
		const input = fs.createReadStream(filepath);
		const output = fs.createWriteStream(compressedFile);
		const gzip = zlib.createGzip();

		// 使用pipeline替代pipe（修复流处理问题）
		await pipeline(input, gzip, output);
		console.log(`压缩成功: ${compressedFile}`);

		// 压缩后删除原始 SQL 文件（节省空间）
		fs.unlinkSync(filepath);
		// 上传到 OSS
		return await uploadToOSS(compressedFile);
	} catch (error) {
		console.error(`压缩失败: ${error.message}`);
		throw error;
	}
}

// 上传到OSS
async function uploadToOSS(filepath) {
	try {
		const filename = path.basename(filepath);
		const key = `${dbBackupConfig.folder}/${filename}`;

		// 上传文件
		const result = await ossClient.put(key, filepath);
		console.log(`文件已上传到OSS: ${result.url}`);

		// 上传成功后删除本地压缩文件
		fs.unlinkSync(filepath);
		console.log(`已删除本地文件: ${filepath}`);

		// 清理旧备份（如果有的话）
		await cleanOldBackups();
		return result.url;
	} catch (err) {
		throw new Error(`OSS上传错误: ${err.message}`);
	}
}
async function cleanOldBackups() {
	try {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - dbBackupConfig.keepDays); // 保留最近 N 天

		const files = fs.readdirSync(backupDir);
		for (const file of files) {
			const filePath = path.join(backupDir, file);
			const stats = fs.statSync(filePath);
			// 只删除过期的文件（跳过目录）
			if (stats.isFile() && stats.mtime < cutoffDate) {
				fs.unlinkSync(filePath);
				console.log(`已删除旧备份: ${filePath}`);
			}
		}
	} catch (err) {
		console.error(`清理旧备份失败: ${err.message}`);
	}
}

const logToDatabase = async (logData) => {
	try {
		const sqlString = `
    INSERT INTO log_db 
      (filename, file_size, oss_url, error_msg, duration, status, time) 
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
		await query(sqlString, [
			logData.filename,
			logData.file_size,
			logData.oss_url,
			logData.error_msg,
			logData.duration,
			logData.status,
		]);
		console.log("备份日志已记录到数据库");
	} catch (error) {
		console.error("记录备份日志失败:", err.message);
	}
};

// 立即执行一次备份（可选）
if (process.argv.includes("--immediate")) {
	backupDatabase();
}
// 定时执行备份任务（修复日志冗余问题）
console.log(`已设置定时备份数据库任务，执行时间: ${dbBackupConfig.cronTime}`);
// 定时执行备份任务
const backupJob = schedule.scheduleJob(dbBackupConfig.cronTime, () => {
	console.log("定时备份任务数据库任务开始执行");
	backupDatabase().catch((err) => console.error("定时备份失败:", err));
});

module.exports = backupJob;
