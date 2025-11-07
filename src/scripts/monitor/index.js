//单独启动脚本需要注意 环境变量和路径别名会失效
require("module-alias/register"); //引入路径别名
require("dotenv").config(); //引入环境变量 由于数据库也使用了环境变量，所以必须要引入

const path = require("path");
const schedule = require("node-schedule");
const { exec } = require("child_process");
const { promisify } = require("util");
const { query } = require("@config/db-util");

const bashPath = path.join(__dirname, "checkStatus.sh"); // sh脚本路径

const rule = "0 * * * *"; // 定时规则：每小时执行一次
let job = null;

async function monitor() {
	try {
		console.log("开始执行服务器监控任务...");
		const cmd = `bash ${bashPath}`;
		const { stdout } = await promisify(exec)(cmd, { timeout: 10000 });
		const { cpu_usage, mem_usage, disk_usage, network_status } =
			JSON.parse(stdout);

		const sqlString = `
      INSERT INTO log_server ( cpu_usage, mem_usage, disk_usage, network_status, time)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
		await query(sqlString, [cpu_usage, mem_usage, disk_usage, network_status]);
		console.log(`监控脚本执行成功`);
	} catch (error) {
		console.error(`监控执行脚本失败: ${error.message}`);
	}
}

const startMonitorJob = () => {
	if (job) {
		console.log("监控任务已启动，无需重复启动");
		return;
	}
	console.log(`服务器状态监控已启用，执行规则：${rule}`);
	job = schedule.scheduleJob(rule, () => {
		monitor().catch((err) => console.error("监控失败:", err));
	});
};

const stopMonitorJob = () => {
	if (job) {
		job.cancel();
		job = null;
		// console.log("服务器监控任务已停止");
	}
};

// 立即执行一次
if (process.argv.includes("--immediate")) {
	monitor();
}

module.exports = {
	startMonitorJob,
	stopMonitorJob,
};
