//单独启动脚本需要注意 环境变量和路径别名会失效
require("module-alias/register"); //引入路径别名
require("dotenv").config(); //引入环境变量 由于数据库也使用了环境变量，所以必须要引入

const fs = require("fs");
const path = require("path");
const schedule = require("node-schedule");
const { exec } = require("child_process");
const { promisify } = require("util");
const { query } = require("@config/db-util");

let job = null;
const rebootMark = path.join(__dirname, "logs", "server_reboot_mark");
const rule = "30 3 * * *"; //每天凌晨3点
// 确保 logs 目录存在（启动时检查）
if (!fs.existsSync(path.join(__dirname, "logs"))) {
	fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
}
async function logReboot(status, message) {
	try {
		const sql = `
      INSERT INTO log_reboot (time, action, status, message)
      VALUES (CURRENT_TIMESTAMP, '重启服务器', ?, ?)
    `;
		await query(sql, [status, message]);
		console.log(`重启日志记录成功：${status} - ${message}`);
	} catch (error) {
		console.error(`重启日志记录失败：${error.message}`);
	}
}
async function reboot() {
	try {
		fs.writeFileSync(rebootMark, ""); // 重启时创建标记
		const startTime = new Date().toLocaleString();
		await logReboot("执行中", `开始执行定时重启，当前时间：${startTime}`);
		console.log("即将执行服务器重启...");
		await promisify(exec)("reboot", { timeout: 5000 }); // 发送重启命令
	} catch (error) {
		if (fs.existsSync(rebootMark)) {
			fs.unlinkSync(rebootMark); // 重启失败清除标记
		}
		console.error(`定时重启任务失败：${error.message}`);
		await logReboot("失败", `重启过程出错：${error.message}`);
	}
}
function startRebootJob() {
	if (job) {
		console.log("定时重启任务已启动，无需重复启动");
		return;
	}
	console.log(`定时重启任务已启用，执行规则：${rule}`);
	job = schedule.scheduleJob(rule, () => {
		reboot().catch((err) => console.error("重启失败:", err));
	});
}
// 项目启动成功后，记录重启完成日志（仅执行一次）
async function afterRebootJob() {
	const finishTime = new Date().toLocaleString();
	//标记存在就存入数据
	if (fs.existsSync(rebootMark)) {
		await logReboot(
			"成功",
			`服务器已完成重启，项目重新启动，当前时间：${finishTime}`
		);
		fs.unlinkSync(rebootMark); // 然后删除标记
	} else {
		// console.log("非重启任务触发");
	}
}

//停止任务
function stopRebootJob() {
	if (job) {
		job.cancel();
		job = null;
		// console.log("定时重启任务已停止");
	}
}

// 立即执行一次
if (process.argv.includes("--immediate")) {
	reboot();
}

module.exports = { startRebootJob, stopRebootJob, afterRebootJob };
