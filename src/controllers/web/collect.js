const { query } = require("@config/db-util");

//收集前台性能信息
exports.performance = async (req, res) => {
	try {
		const performanceData = JSON.parse(req.body.toString());
		if (!performanceData.metrics || !performanceData.environment) {
			return res.status(400).send("无效的性能数据格式");
		}
		console.log(performanceData);
		// const sqlString = 'INSERT INTO performance (data, ip, server_receive_time) VALUES (?, ?, ?)';
	} catch (error) {
		return res.send({ status: 0, message: error.message });
	}
};
