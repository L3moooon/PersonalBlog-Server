require("module-alias/register"); //引入路径别名
require("dotenv").config(); //引入环境变量

const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const glob = require("glob");
const app = express();
const server = http.createServer(app);
const path = require("path");
const initializeWebSocket = require("@utils/ws");

const { startBackupJob, stopBackupJob } = require("@scripts/backup/index");
const { startMonitorJob, stopMonitorJob } = require("@scripts/monitor/index");
const {
	startRebootJob,
	stopRebootJob,
	afterRebootJob,
} = require("@scripts/reboot/index");

app.use(cors()); //解决跨域
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 路由接口
const ROOT_PATH = path.join(__dirname, "routes/**/*.js").replace(/\\/g, "/");
const routeFiles = glob.sync(ROOT_PATH);
routeFiles.forEach((file) => {
	const route = require(file);
	const basePath = path
		.relative(path.join(__dirname, "routes"), path.dirname(file))
		.replace(/\\/g, "/");
	app.use(`/${basePath}`, route); //注册路由
});

server.listen(process.env.HTTP_PORT, () => {
	initializeWebSocket(server); //webSocket初始化
	startBackupJob(); //定时备份数据库任务
	startMonitorJob(); //定时监控服务器状态任务
	startRebootJob(); //定时重启服务器任务
	afterRebootJob(); //重启服务器完成
	console.log(`Server is running on http://127.0.0.1:${process.env.HTTP_PORT}`);
});

const handleShutdown = () => {
	// console.log("开始关闭服务...");
	stopMonitorJob();
	stopBackupJob();
	stopRebootJob();
	// 关闭 HTTP 服务器
	server.close(() => {
		console.log("HTTP 服务器已关闭");
		process.exit(0); // 正常退出进程
	});
};
// process.on("SIGINT", handleShutdown); // 监听中断信号（Ctrl+C）
process.on("SIGTERM", handleShutdown); // 监听终止信号（kill 命令）
