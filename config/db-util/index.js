const mysql = require("mysql2");

const dbConfig = {
	//基础配置
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	//连接配置
	waitForConnections: true,
	connectionLimit: 10, // 最大连接数
	queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);
// 封装query函数，返回Promise
exports.query = (sql, params) => {
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
