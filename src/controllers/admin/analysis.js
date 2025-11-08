const { query } = require("@config/db-util");

//滚动数字屏
exports.getNumData = async (req, res) => {
	try {
		const sqlString = `
    SELECT 
      (SELECT CAST(SUM(visited_count) AS UNSIGNED) FROM web_account) AS total_visits,
      (SELECT COUNT(*) FROM article) AS article_count,
      (SELECT COUNT(*) FROM comment) AS comment_count,
      (SELECT CAST(SUM(star) AS UNSIGNED) FROM article) AS star_count
  `;
		const result = await query(sqlString);
		const data = result[0];
		return res.send({
			code: 1,
			msg: "请求成功",
			data: {
				total_visits: data.total_visits,
				article_count: data.article_count,
				comment_count: data.comment_count,
				star_count: data.star_count,
			},
		});
	} catch (error) {
		return res.status(400).send({
			code: 0,
			msg: error.message,
		});
	}
};
//直辖市等特殊情况
const specialLocation = ["北京", "天津", "上海", "香港", "澳门"];
//访客地图
exports.getGeoData = async (req, res) => {
	try {
		const sqlString = "SELECT address from web_account";
		const result = await query(sqlString);
		const geo = {};
		result.map((item) => {
			const addressObj = JSON.parse(item.address);
			const province = addressObj.province;
			if (province) {
				if (specialLocation.includes(province)) {
					const city = addressObj.city;
					geo[city] = (geo[city] || 0) + 1;
				} else {
					geo[province] = (geo[province] || 0) + 1;
				}
			}
		});
		const chinaProvinceData = Object.entries(geo).map(([name, value]) => ({
			name,
			value,
		}));
		return res.send({ code: 1, msg: "请求成功", data: chinaProvinceData });
	} catch (error) {
		return res.status(400).send({
			code: 0,
			msg: error.message,
		});
	}
};

// 按小时统计：当天数据和近7天合并数据
exports.getLineData = async (req, res) => {
	try {
		const today = new Date();
		const dateStr = today.toISOString().split("T")[0]; // 今日日期

		// ==================== 1. 当天按小时统计（6:00-23:00）====================
		const todayStart = new Date(today);
		todayStart.setHours(6, 0, 0, 0);
		const todayEnd = new Date(today);
		todayEnd.setHours(23, 59, 59, 999);

		// 生成当天小时模板
		const todayHourTemplate = [];
		for (let hour = 6; hour <= 23; hour++) {
			todayHourTemplate.push({
				hour: hour,
				display: `${hour}:00`,
				count: 0,
			});
		}

		// 查询当天小时数据
		const todayResult = await query(
			`
      SELECT 
        HOUR(last_login_time) AS hour,
        COUNT(*) AS count
      FROM 
        web_account
      WHERE 
        last_login_time BETWEEN ? AND ?
      GROUP BY 
        hour
      ORDER BY 
        hour
    `,
			[todayStart, todayEnd]
		);

		// 合并当天数据
		const todayData = todayHourTemplate.map((template) => {
			const matched = todayResult.find((item) => item.hour === template.hour);
			return [template.display, matched ? matched.count : 0];
		});

		// ==================== 2. 最近7天按小时合并统计（同一小时数据相加）====================
		const sevenDaysHourTemplate = [];
		// 生成6:00-23:00的小时模板（共18小时）
		for (let hour = 6; hour <= 23; hour++) {
			sevenDaysHourTemplate.push({
				hour: hour,
				display: `${hour}:00`,
				count: 0,
			});
		}

		// 计算近7天的时间范围（从7天前的6:00到今天的23:59）
		const sevenDaysAgo = new Date(today);
		sevenDaysAgo.setDate(today.getDate() - 6); // 7天前（含今天）
		sevenDaysAgo.setHours(6, 0, 0, 0);
		const sevenDaysEnd = new Date(todayEnd);

		// 查询近7天的小时数据（按小时分组求和）
		const sevenDaysResult = await query(
			`
      SELECT 
        HOUR(last_login_time) AS hour,
        COUNT(*) AS count
      FROM 
        web_account
      WHERE 
        last_login_time BETWEEN ? AND ?
      GROUP BY 
        hour
      ORDER BY 
        hour
    `,
			[sevenDaysAgo, sevenDaysEnd]
		);

		// 合并近7天数据（同一小时累加）
		const sevenDaysData = sevenDaysHourTemplate.map((template) => {
			const matched = sevenDaysResult.find(
				(item) => item.hour === template.hour
			);
			return [template.display, matched ? matched.count : 0];
		});

		// 返回结果
		res.json({
			code: 1,
			data: {
				day: todayData,
				week: sevenDaysData,
			},
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ code: 0, message: "服务器错误" });
	}
};

// 最近12个月访问量统计（返回["YYYY-MM-1 00:00:00", count]，无数据补0）
exports.getBarData = async (req, res) => {
	try {
		const today = new Date();
		const monthTemplate = [];

		// 生成最近12个月的模板（从11个月前到当前月，每月1日0点）
		for (let i = 11; i >= 0; i--) {
			const targetDate = new Date(today);
			targetDate.setMonth(today.getMonth() - i);
			const year = targetDate.getFullYear();
			const month = (targetDate.getMonth() + 1).toString().padStart(2, "0");
			const dateStr = `${year}-${month}-01 00:00:00`;
			monthTemplate.push({
				date: dateStr,
				count: 0,
			});
		}

		// 计算查询时间范围（11个月前的1日0点 至 当前月最后一天23:59:59）
		const startDate = new Date(monthTemplate[0].date);
		const endDate = new Date(
			today.getFullYear(),
			today.getMonth() + 1,
			0,
			23,
			59,
			59
		);

		// 修正SQL：使用DATE_FORMAT格式化到年月，且确保时间范围包含所有月份
		const queryResult = await query(
			`
      SELECT 
        DATE_FORMAT(DATE_FORMAT(create_time, '%Y-%m-01 00:00:00'), '%Y-%m-%d %H:%i:%s') AS date,
        COUNT(*) AS count
      FROM 
        web_account
      WHERE 
        DATE_FORMAT(create_time, '%Y-%m') BETWEEN DATE_FORMAT(?, '%Y-%m') AND DATE_FORMAT(?, '%Y-%m')
      GROUP BY 
        DATE_FORMAT(create_time, '%Y-%m-01 00:00:00')
      ORDER BY 
        DATE_FORMAT(create_time, '%Y-%m-01 00:00:00')
    `,
			[startDate, endDate]
		);

		// 合并模板与实际数据（补0）
		const mergedData = monthTemplate.map((template) => {
			const matched = queryResult.find((item) => item.date === template.date);
			return [template.date, matched ? matched.count : 0];
		});

		res.json({ code: 1, data: mergedData });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ code: 0, message: "服务器错误" });
	}
};
exports.getPieData = async (req, res) => {};
