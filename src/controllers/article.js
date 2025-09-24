//后台文章管理
const db = require('@config/db');
const { query } = require('@config/db-util');
// 后台获取所有文章（支持分页、日期筛选和搜索）
exports.getArticleList = async (req, res) => {
  try {
    // 从请求参数中获取分页、日期范围和搜索关键词
    const {
      pageNo = 1,          // 页码，默认第1页
      pageSize = 10,       // 每页条数，默认10条
      dateRange,           // 日期范围，格式: [startDate, endDate]
      searchKey            // 搜索关键词
    } = req.query;
    const offset = (pageNo - 1) * pageSize;// 计算分页偏移量
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
        whereConditions.push('a.create_time >= ?');
        queryParams.push(startDate);
      }
      if (endDate) {
        whereConditions.push('a.create_time <= ?');
        queryParams.push(endDate);
      }
    }
    // 处理搜索关键词（搜索标题和内容）
    if (searchKey) {
      whereConditions.push('(a.title LIKE ? OR a.content LIKE ?)');
      const likeValue = `%${searchKey}%`;
      queryParams.push(likeValue, likeValue);
    }
    // 添加WHERE条件
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    // 分组
    sql += ' GROUP BY a.id';

    // 获取总条数（用于分页）
    const countSql = `SELECT COUNT(DISTINCT a.id) AS total FROM article a ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}`;
    const countResult = await query(countSql, queryParams);
    const total = countResult[0].total;

    // 添加分页
    sql += ' LIMIT ?, ?';
    queryParams.push(offset, parseInt(pageSize));

    // 执行查询
    const result = await query(sql, queryParams);
    console.log(result);
    // 处理标签格式
    if (result.length > 0) {
      result.forEach(v => {
        if (v.tag && v.tag.length > 0) {
          const tagArray = v.tag.split(', ');
          // v.tag = tagArray.map(tag => {
          //   const [id, name] = tag.split(':');
          //   return { id: parseInt(id), name };
          // });
          v.tag = tagArray.map(tag => parseInt(tag.split(':')[0]));
        } else {
          v.tag = []; // 统一处理空标签为数组
        }
      });
    }
    // 返回数据（包含分页信息）
    return res.json({
      code: 1,
      msg: '请求成功！',
      data: result,
      pagination: {
        total,
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return res.send({ status: 0, message: error.message })
  }
};
//新增文章
exports.addArticle = async (req, res) => {
  try {
    const { title, cover_img, abstract, content, status, tag } = req.body
    const sqlString1 = 'INSERT INTO article(title,cover_img,abstract,content,status) VALUES(?,?,?,?,?)'
    const addArticleResult = await query(sqlString1, [title, cover_img, abstract, content, status])
    const articleId = addArticleResult.insertId;
    if (tag && tag.length > 0) {
      const tagValues = tag.map(tagId => [articleId, tagId]);
      const sqlString2 = 'INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?';
      await query(sqlString2, [tagValues]);//批量插入
    }
    return res.send({ code: 1, msg: '添加成功！' });
  } catch (error) {
    return res.send({ code: 0, msg: error.message });
  }
}

//修改文章
// 修改文章（精简版-支持部分更新）
exports.updateArticle = async (req, res) => {
  try {
    const { id, tag, ...otherFields } = req.body;
    if (!id) {
      return res.send({ code: 0, msg: '文章ID不能为空' });
    }
    const allowFields = ['title', 'cover_img', 'abstract', 'content', 'status', 'top'];
    const [updateFields, updateValues] = Object.entries(otherFields)
      .filter(([key]) => allowFields.includes(key))
      .reduce(([fields, values], [key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
        return [fields, values];
      }, [[], []]);
    updateValues.push(id); // WHERE条件的id
    // 执行文章更新
    const sqlString1 = `UPDATE article SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(sqlString1, updateValues);
    // 处理标签更新
    if (tag !== undefined) {
      await query("DELETE FROM article_tag_relation WHERE article_id=?", [id]);
      if (tag.length > 0) {
        const tagValues = tag.map(tagId => [id, tagId]);
        await query('INSERT INTO article_tag_relation(article_id, tag_id) VALUES ?', [tagValues]);
      }
    }
    return res.send({ code: 1, msg: '修改成功！' });
  } catch (error) {
    return res.send({ code: 0, msg: error.message });
  }
};
//更改文章显隐状态
// exports.changeStatus = async (req, res) => {
//   try {
//     const { id, status } = req.body
//     const sqlString1 = 'UPDATE article SET status=? WHERE id=?'
//     await query(sqlString1, [status, id])
//     return res.send({ status: 1, message: '修改成功！' });
//   } catch (error) {
//     return res.send({ status: 0, message: error.message });
//   }
// }
//更改文章置顶状态
// exports.changeTop = async (req, res) => {
//   try {
//     const { id, top } = req.body
//     const sqlString1 = 'UPDATE article SET top=? WHERE id=?'
//     await query(sqlString1, [top, id])
//     return res.send({ status: 1, message: '修改成功！' });
//   } catch (error) {
//     return res.send({ status: 0, message: error.message });
//   }
// }
//删除文章，同时删除评论
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params
    const sqlString1 = 'DELETE FROM comment WHERE article_id=?'
    const sqlString2 = 'DELETE FROM article WHERE id=?'
    await query(sqlString1, [id])
    await query(sqlString2, [id])
    return res.send({ status: 1, message: '删除成功！' })
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
}

//根据id获取文章
exports.getArticle = async (req, res) => {
  const { id } = req.body
  const sqlString = 'SELECT * FROM article WHERE id=?'
  db.query(sqlString, [id], (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message })
    }
    if (result.length > 0) {
      return res.json({ status: 1, message: '请求成功！', data: result[0] })
    }
  })

}
//更新文章访问量
exports.view = async (req, res) => {
  try {
    const { id } = req.body
    const sqlString = 'UPDATE article SET view=view+1 WHERE id=?'
    await query(sqlString, [id])
    return res.json({ status: 1, message: '请求成功！' })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }

}
//更新文章点赞量
// exports.view = async (req, res) => {
//   //同一用户只能点赞一次
// }
