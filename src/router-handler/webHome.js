//前台
const db = require('../../config/db');
const { query, getConnection } = require('@config/db-util')

// 网站上线时间戳（秒级）
const ESTABLISHING_DATE = 1756111504; //2025/8/25 16:45:00

// 获取网站运转信息
exports.info = async (req, res) => {
  const sqlString = `
    SELECT 
      DATEDIFF(NOW(), FROM_UNIXTIME(?)) AS run_days,
      (SELECT COUNT(*) FROM web_account WHERE DATE(create_time) = CURDATE()) AS today_visits,
      (SELECT COUNT(*) FROM web_account) AS total_visits,
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
    console.log(data);
    res.send({
      status: 1,
      message: '请求成功',
      data: {
        run_days: data.run_days,
        today_visits: data.today_visits,
        total_visits: data.total_visits,
        article_count: data.article_count,
        comment_count: data.comment_count,
        last_activity: data.last_activity
      }
    });
  });
};

//获取网站主题相关信息
exports.theme = async (req, res) => {
  try {
    console.log(11111);
    const sqlString1 = 'SELECT * FROM admin WHERE id=1';
    const sqlString2 = 'SELECT * FROM admin_saying WHERE user_id=1';
    const sqlString3 = 'SELECT * FROM admin_url WHERE user_id=1';
    const sqlString4 = 'SELECT * FROM web_bg_img';
    const queryPromises = [query(sqlString1), query(sqlString2), query(sqlString3), query(sqlString4)]
    const [result1, result2, result3, result4] = await Promise.all(queryPromises);
    let saying = []
    let url = []
    let bg_img = []
    result2.forEach(element => {
      saying.push(element.saying);
    });
    result3.forEach(element => {
      url.push({ 'name': element.name, 'address': element.address });
    });
    result4.forEach(element => {
      bg_img.push(element.img_url);
    });
    return res.json({
      status: 1,
      message: '请求成功！',
      data: { ...result1[0], saying, url, bg_img, }
    });
  } catch (err) {
    return res.json({ status: 0, message: err.message });
  }
};

//修改网站相关信息
exports.modifyTheme = async (req, res) => {
  //FIXME 数据库操作有待优化，使用事务+串行+并行效率最佳
  try {
    const { welcome, bg_img, nickname, motto, portrait, saying, url } = req.body
    const _url = url.map(v => [1, v.name, v.address])//调整url的格式
    const _saying = saying.map(v => [1, v])
    const _bg_img = bg_img.map(img => [img]);
    const delString1 = "DELETE FROM admin_saying;"
    const delString2 = "DELETE FROM admin_url;"
    const delString3 = "DELETE FROM web_bg_img;"
    await Promise.all([query(delString1), query(delString2), query(delString3)])
    const sqlString1 = "UPDATE admin SET nickname=?,portrait=?,motto=?,welcome=? WHERE id=1"//更新user表
    const sqlString2 = "INSERT INTO admin_saying(user_id,saying) VALUES?; "//批量更新user_saying表
    const sqlString3 = " INSERT INTO admin_url(user_id,name,address) VALUES?;"//批量更新use_url表
    const sqlString4 = " INSERT INTO web_bg_img(img_url) VALUES?;"//批量更新web_bg_img表
    await Promise.all([
      query(sqlString1, [nickname, portrait, motto, welcome]),
      query(sqlString2, [_saying]),
      query(sqlString3, [_url]),
      query(sqlString4, [_bg_img])
    ])
    res.send({ status: 1, message: '修改成功' })
  } catch (error) {
    // 回滚事务
    console.error(error);
    res.send({
      status: 0,
      message: '更新失败'
    });
  }
};

//获取首页文章列表
exports.getHomeArticle = async (req, res) => {
  try {
    const sqlString = "SELECT a.*, GROUP_CONCAT(t.id, ':', t.tag_name SEPARATOR ', ') AS tag,(SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) AS comment_count FROM article a LEFT JOIN article_tag_relation at ON a.id = at.article_id  LEFT JOIN tag t ON at.tag_id = t.id WHERE a.status = 1 GROUP BY a.id ORDER BY a.top DESC, a.publish_date DESC;"
    const result = await query(sqlString)
    if (result.length > 0) {
      result.forEach(v => {
        if (v.tag && v.tag.length > 0) {
          const tagArray = v.tag.split(',')
          // 转换为[{id,name}]格式
          v.tag = tagArray.map(tag => {
            const [id, name] = tag.split(':');
            return { id: parseInt(id), name };
          });
        }
      })
    }
    return res.json({ status: 1, message: '请求成功！', data: result })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}
//获取推荐文章
exports.getRecommendArticle = async (req, res) => {
  try {
    // 从请求参数获取页码和每页数量，默认第一页，每页5条
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const sqlString1 = `SELECT id, title, cover_img, publish_date 
       FROM article
       WHERE status = '1' 
       ORDER BY view DESC 
       LIMIT ?, ?`
    const sqlString2 = `SELECT COUNT(*) as total 
       FROM article
       WHERE status = '1'`
    // 查询当前页文章
    const articleRes = await query(sqlString1, [offset, limit])
    const moreRes = await query(sqlString2)
    const total = moreRes[0].total;
    return res.json({
      status: 1, message: '请求成功！', data: articleRes, hasMore: page * limit < total
    })
  } catch (error) {
    console.error('获取推荐文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取推荐文章失败'
    });
  }
};
