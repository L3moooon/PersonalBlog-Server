const mysql = require("mysql2");
const path = require("path");

const dbConfig = {
	//基础配置
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};
const dbBackupConfig = {
	//连接配置
	waitForConnections: true,
	connectionLimit: 10, // 最大连接数
	queueLimit: 0,
	//备份
	cronTime: "0 2 * * *", // 每天凌晨2点
	backupDir: path.join(__dirname, "backups"),
	keepDays: 7,
	// OSS存储目录
	folder: "db-backups",
};
const pool = mysql.createPool(dbConfig);
// 封装query函数，返回Promise
const query = (sql, params) => {
	return new Promise((resolve, reject) => {
		pool.query(sql, params, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
};
module.exports = {
	query,
	dbConfig,
	dbBackupConfig,
};
