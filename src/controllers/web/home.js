//前台
const db = require("../../../config/db");
const { query, getConnection } = require("@config/db-util");

// 网站上线时间戳（秒级）
const ESTABLISHING_DATE = 1756111504; //2025/8/25 16:45:00

// 获取网站运转信息
exports.info = async (req, res) => {
	const sqlString = `
    SELECT 
      DATEDIFF(NOW(), FROM_UNIXTIME(?)) AS run_days,
      (SELECT COUNT(*) FROM web_account WHERE last_login_time >= CURDATE() AND last_login_time < CURDATE() + INTERVAL 1 DAY) AS today_visits,
      (SELECT SUM(visited_count) FROM web_account) AS total_visits,
      (SELECT COUNT(*) FROM article) AS article_count,
      (SELECT COUNT(*) FROM comment) AS comment_count,
      TIMESTAMPDIFF(DAY, (SELECT last_login_time FROM admin_account WHERE id = 1), NOW()) AS last_activity
    FROM DUAL;
  `;
	db.query(sqlString, [ESTABLISHING_DATE], (err, result) => {
		if (err) {
			return res.send({ status: 0, message: err.message });
		}
		// 对查询结果做简单格式化（如最后活动时间处理，若需要可转成更易读格式）
		const data = result[0];
		res.send({
			status: 1,
			message: "请求成功",
			data: {
				run_days: data.run_days,
				today_visits: data.today_visits,
				total_visits: data.total_visits,
				article_count: data.article_count,
				comment_count: data.comment_count,
				last_activity: data.last_activity,
			},
		});
	});
};

//获取网站主题相关信息
exports.theme = async (req, res) => {
	try {
		const sqlString1 = "SELECT * FROM admin WHERE id=1";
		const sqlString2 = "SELECT * FROM admin_saying WHERE user_id=1";
		const sqlString3 = "SELECT * FROM admin_url WHERE user_id=1";
		const sqlString4 = "SELECT * FROM web_bg_img";
		const queryPromises = [
			query(sqlString1),
			query(sqlString2),
			query(sqlString3),
			query(sqlString4),
		];
		const [result1, result2, result3, result4] = await Promise.all(
			queryPromises
		);
		let saying = [];
		let url = [];
		let bg_img = [];
		result2.forEach((element) => {
			saying.push(element.saying);
		});
		result3.forEach((element) => {
			url.push({ name: element.name, address: element.address });
		});
		result4.forEach((element) => {
			bg_img.push(element.img_url);
		});
		return res.json({
			code: 1,
			msg: "请求成功！",
			data: { ...result1[0], saying, url, bg_img },
		});
	} catch (err) {
		return res.json({ status: 0, message: err.message });
	}
};

//修改网站相关信息
exports.modifyTheme = async (req, res) => {
	//FIXME 数据库操作有待优化，使用事务+串行+并行效率最佳
	try {
		const { welcome, bg_img, nickname, motto, portrait, saying, url } =
			req.body;
		const _url = url.map((v) => [1, v.name, v.address]); //调整url的格式
		const _saying = saying.map((v) => [1, v]);
		const _bg_img = bg_img.map((img) => [img]);
		const delString1 = "DELETE FROM admin_saying;";
		const delString2 = "DELETE FROM admin_url;";
		const delString3 = "DELETE FROM web_bg_img;";
		await Promise.all([
			query(delString1),
			query(delString2),
			query(delString3),
		]);
		const sqlString1 =
			"UPDATE admin SET nickname = ?, portrait = ?, motto = ?, welcome = ? WHERE id = 1"; //更新user表
		const sqlString2 = "INSERT INTO admin_saying(user_id,saying) VALUES?; "; //批量更新user_saying表
		const sqlString3 = " INSERT INTO admin_url(user_id,name,address) VALUES?;"; //批量更新use_url表
		const sqlString4 = " INSERT INTO web_bg_img(img_url) VALUES?;"; //批量更新web_bg_img表
		await Promise.all([
			query(sqlString1, [nickname, portrait, motto, welcome]),
			query(sqlString2, [_saying]),
			query(sqlString3, [_url]),
			query(sqlString4, [_bg_img]),
		]);
		res.send({ status: 1, message: "修改成功" });
	} catch (error) {
		// 回滚事务
		console.error(error);
		res.send({
			code: 0,
			msg: "更新失败",
		});
	}
};

//获取首页文章列表
// 获取首页文章列表（带分页）
exports.getHomeArticle = async (req, res) => {
	try {
		// 1. 解析并校验分页参数（确保是正整数，避免异常值）
		let { tags = [], pageNo = 1, pageSize = 5 } = req.query;
		// 转换为整数，若转换失败或小于1，重置为默认值
		pageNo = parseInt(pageNo, 10);
		pageSize = parseInt(pageSize, 10);
		pageNo = isNaN(pageNo) || pageNo < 1 ? 1 : pageNo;
		pageSize = isNaN(pageSize) || pageSize < 1 ? 5 : pageSize;
		const offset = (pageNo - 1) * pageSize;
		let tagWhere = ""; // 标签筛选条件（默认空）
		const queryParams = []; // SQL 参数数组（避免注入）
		// 若 tags 数组有值，拼接 IN 条件
		if (tags.length > 0) {
			// 占位符：根据 tag 数量生成 ?,?,?（如 3个标签则 ?,,?）
			const placeholders = tags.map(() => "?").join(",");
			tagWhere = `AND at.tag_id IN (${placeholders})`;
			// 将 tagId 加入参数数组（顺序与占位符对应）
			queryParams.push(...tags);
		}
		queryParams.push(offset, pageSize);
		const getListSql = `
      SELECT 
        a.*, 
        GROUP_CONCAT(t.id, ':', t.tag_name SEPARATOR ', ') AS tag,
        (SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) AS comment_count 
      FROM article a 
      LEFT JOIN article_tag_relation at ON a.id = at.article_id  
      LEFT JOIN tag t ON at.tag_id = t.id 
      WHERE a.status = 1 ${tagWhere}
      GROUP BY a.id 
      ORDER BY a.top DESC, a.publish_date DESC 
      LIMIT ?, ?;
    `;
		let articleList = await query(getListSql, queryParams);

		const getTotalSql = `
      SELECT COUNT(DISTINCT a.id) AS total 
      FROM article a 
      LEFT JOIN article_tag_relation at ON a.id = at.article_id  
      LEFT JOIN tag t ON at.tag_id = t.id 
      WHERE a.status = 1 ${tagWhere};
    `;
		const totalQueryParams = tags.length > 0 ? tags : [];
		const totalResult = await query(getTotalSql, totalQueryParams);
		const total = totalResult[0]?.total || 0;

		// 5. 处理标签格式：转换为 [{id, name}] 数组（与原逻辑一致）
		if (articleList.length > 0) {
			articleList.forEach((item) => {
				if (item.tag && item.tag.trim().length > 0) {
					const tagArray = item.tag.split(",").map((tag) => tag.trim());
					item.tag = tagArray.map((tag) => {
						const [id, name] = tag.split(":");
						return {
							id: parseInt(id, 10) || 0, // 避免id解析失败
							name: name || "未知标签", // 兜底处理
						};
					});
				} else {
					item.tag = []; // 无标签时返回空数组，避免前端处理undefined
				}
			});
		}

		// 6. 返回分页数据：包含当前页列表、总条数、当前页码、每页条数
		return res.json({
			code: 1,
			msg: "请求成功！",
			data: articleList,
			pagination: {
				total,
				pageNo: pageNo,
				pageSize: pageSize,
			},
		});
	} catch (error) {
		console.error("获取首页文章列表失败：", error); // 打印错误日志，便于排查
		return res.status(500).json({
			// 服务器错误返回500状态码
			code: 0,
			msg: "获取文章列表失败，请稍后重试！", // 友好提示，避免暴露敏感信息
		});
	}
};
//获取推荐文章
exports.getRecommendArticle = async (req, res) => {
	try {
		// 从请求参数获取页码和每页数量，默认第一页，每页5条
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 5;
		const offset = (page - 1) * limit;
		const sqlString1 = `
      SELECT id, title, cover_img, publish_date 
        FROM article
        WHERE status = '1' 
        ORDER BY view DESC 
        LIMIT ?, ?
      `;
		const sqlString2 = `
      SELECT COUNT(*) as total 
        FROM article
        WHERE status = '1'
    `;
		// 查询当前页文章
		const articleRes = await query(sqlString1, [offset, limit]);
		const moreRes = await query(sqlString2);
		const total = moreRes[0].total;
		return res.json({
			status: 1,
			message: "请求成功！",
			data: articleRes,
			hasMore: page * limit < total,
		});
	} catch (error) {
		console.error("获取推荐文章失败:", error);
		res.status(500).json({
			success: false,
			message: "服务器错误，获取推荐文章失败",
		});
	}
};

exports.getTagCloud = async (req, res) => {
	try {
		const sqlString = `
      SELECT t.id, t.tag_name, COUNT(DISTINCT a.id) AS article_count
      FROM tag t
      LEFT JOIN article_tag_relation at ON t.id = at.tag_id
      LEFT JOIN article a ON at.article_id = a.id AND a.status = 1
      GROUP BY t.id, t.tag_name
      HAVING article_count > 0
      ORDER BY article_count DESC;
    `;
		const tags = await query(sqlString);
		return res.json({
			code: 1,
			msg: "请求成功！",
			data: tags,
		});
	} catch (error) {
		console.error("获取标签云失败:", error);
		return res.status(500).json({
			code: 0,
			msg: "服务器错误，获取标签云失败",
		});
	}
};
