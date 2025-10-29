const { query } = require("@config/db-util");
// 后台获取所有文章（支持分页、日期筛选和搜索）
exports.getArticleList = async (req, res) => {
	try {
		// 从请求参数中获取分页、日期范围和搜索关键词
		const {
			pageNo = 1, // 页码，默认第1页
			pageSize = 10, // 每页条数，默认10条
			dateRange, // 日期范围，格式: [startDate, endDate]
			searchKey, // 搜索关键词
		} = req.query;
		const offset = (pageNo - 1) * pageSize; // 计算分页偏移量
		// 基础SQL
		let sql = `
      SELECT a.*, 
             GROUP_CONCAT(t.id, ':', t.tag_name SEPARATOR ', ') AS tag,
             (SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) AS comment_count 
      FROM article a 
      LEFT JOIN article_tag_relation at ON a.id = at.article_id  
      LEFT JOIN tag t ON at.tag_id = t.id 
    `;

		// 条件部分
		const whereConditions = [];
		const queryParams = [];

		// 处理日期范围筛选
		if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
			const [startDate, endDate] = dateRange;
			if (startDate) {
				whereConditions.push("a.create_time >= ?");
				queryParams.push(startDate);
			}
			if (endDate) {
				whereConditions.push("a.create_time <= ?");
				queryParams.push(endDate);
			}
		}
		// 处理搜索关键词（搜索标题和内容）
		if (searchKey) {
			whereConditions.push("(a.title LIKE ? OR a.content LIKE ?)");
			const likeValue = `%${searchKey}%`;
			queryParams.push(likeValue, likeValue);
		}
		// 添加WHERE条件
		if (whereConditions.length > 0) {
			sql += ` WHERE ${whereConditions.join(" AND ")}`;
		}
		// 分组
		sql += " GROUP BY a.id";

		// 获取总条数（用于分页）
		const countSql = `SELECT COUNT(DISTINCT a.id) AS total FROM article a ${
			whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
		}`;
		const countResult = await query(countSql, queryParams);
		const total = countResult[0].total;

		// 添加分页
		sql += " LIMIT ?, ?";
		queryParams.push(offset, parseInt(pageSize));

		// 执行查询
		const result = await query(sql, queryParams);
		// console.log(result);
		// 处理标签格式
		if (result.length > 0) {
			result.forEach((v) => {
				if (v.tag && v.tag.length > 0) {
					const tagArray = v.tag.split(", ");
					// v.tag = tagArray.map(tag => {
					//   const [id, name] = tag.split(':');
					//   return { id: parseInt(id), name };
					// });
					v.tag = tagArray.map((tag) => parseInt(tag.split(":")[0]));
				} else {
					v.tag = []; // 统一处理空标签为数组
				}
			});
		}
		// 返回数据（包含分页信息）
		return res.json({
			code: 1,
			msg: "请求成功！",
			data: result,
			pagination: {
				total,
				pageNo: parseInt(pageNo),
				pageSize: parseInt(pageSize),
			},
		});
	} catch (error) {
		console.error("获取文章列表失败:", error);
		return res.send({ status: 0, message: error.message });
	}
};
//新增文章
exports.addArticle = async (req, res) => {
	try {
		const { title, cover_img, abstract, content, tag } = req.body;
		const sqlString1 =
			"INSERT INTO article(title,cover_img,abstract,content) VALUES(?,?,?,?)";
		const addArticleResult = await query(sqlString1, [
			title,
			cover_img,
			abstract,
			content,
		]);
		const articleId = addArticleResult.insertId;
		if (tag && tag.length > 0) {
			const tagValues = tag.map((tagId) => [articleId, tagId]);
			const sqlString2 =
				"INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?";
			await query(sqlString2, [tagValues]); //批量插入
		}
		return res.send({ code: 1, msg: "添加成功！" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};
//修改文章
exports.updateArticle = async (req, res) => {
	try {
		const { id, tag, ...otherFields } = req.body;
		if (!id) {
			return res.status(400).send({ code: 0, msg: "文章ID不能为空" });
		}
		const allowFields = [
			"title",
			"cover_img",
			"abstract",
			"content",
			"status",
			"top",
		];
		const [updateFields, updateValues] = Object.entries(otherFields)
			.filter(([key]) => allowFields.includes(key))
			.reduce(
				([fields, values], [key, value]) => {
					fields.push(`${key} = ?`);
					values.push(value);
					return [fields, values];
				},
				[[], []]
			);
		updateValues.push(id); // WHERE条件的id
		if ("content" in otherFields) {
			updateFields.push("last_edit_date = CURRENT_TIMESTAMP");
		}
		// 执行文章更新
		const sqlString1 = `UPDATE article SET ${updateFields.join(
			", "
		)} WHERE id = ?`;
		console.log(sqlString1);
		console.log(updateFields, updateValues);

		await query(sqlString1, updateValues);

		// 处理标签更新
		if (tag !== undefined) {
			await query("DELETE FROM article_tag_relation WHERE article_id=?", [id]);
			if (tag.length > 0) {
				const tagValues = tag.map((tagId) => [id, tagId]);
				await query(
					"INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?",
					[tagValues]
				);
			}
		}
		return res.send({ code: 1, msg: "修改成功！" });
	} catch (error) {
		return res.send({ code: 0, msg: error.message });
	}
};
//删除文章，同时删除评论
exports.deleteArticle = async (req, res) => {
	try {
		const { id } = req.params;
		const sqlString1 = "DELETE FROM comment WHERE article_id=?";
		const sqlString2 = "DELETE FROM article WHERE id=?";
		await query(sqlString1, [id]);
		await query(sqlString2, [id]);
		return res.send({ code: 1, msg: "删除成功！" });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};

//新增标签
exports.addTag = async (req, res) => {
	try {
		const { name } = req.body;
		const sqlString = "INSERT INTO tag(tag_name) VALUES (?) ";
		await query(sqlString, [name]);
		return res.send({ code: 1, msg: "添加成功" });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};
//删除标签
exports.deleteTag = async (req, res) => {
	try {
		const { id } = req.params;
		const sqlString = "DELETE FROM tag WHERE id=?";
		await query(sqlString, [id]);
		return res.json({ code: 1, msg: "删除成功" });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};

//获取标签列表
exports.getTagList = async (req, res) => {
	try {
		const sqlString = "SELECT * FROM tag";
		const data = await query(sqlString);
		return res.send({ code: 0, msg: "请求成功", data });
	} catch (error) {
		return res.status(400).send({ code: 0, msg: error.message });
	}
};
