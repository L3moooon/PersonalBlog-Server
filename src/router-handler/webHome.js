const db = require('../../config/db');
const { query, getConnection } = require('@config/db-util')

// 网站上线时间戳（秒级）
const ESTABLISHING_DATE = 1756111504;

// 获取网站运转信息
exports.info = async (req, res) => {
  // 拼接复杂查询 SQL，一次查询出所有需要的数据
  const sqlString = `
    SELECT 
      -- 运行时间：当前时间戳 - 上线时间戳，转换为天数
      DATEDIFF(NOW(), FROM_UNIXTIME(?)) AS run_days,
      -- 今日访问：统计今日有登录/访问行为的账户数（根据业务逻辑调整条件，这里以 web_account 表为例，也可结合 admin_account 表，按需修改）
      (SELECT COUNT(*) FROM web_account 
       WHERE DATE(create_time) = CURDATE()) AS today_visits,
      -- 总计访问：统计 web_account 表总记录数（代表总访问数，按需调整，也可统计 admin_account 表，看业务需求）
      (SELECT COUNT(*) FROM web_account) AS total_visits,
      -- 文章数目：统计 article 表总记录数 
      (SELECT COUNT(*) FROM article) AS article_count,
      -- 评论数目：统计 comment 表总记录数 
      (SELECT COUNT(*) FROM comment) AS comment_count,
      -- 最后活动：取 admin_account 表中 id = 1 的用户的 last_login_time
      (SELECT last_login_time FROM admin_account WHERE id = 1) AS last_activity
    FROM DUAL; -- DUAL 虚拟表，适配单值查询语法
  `;

  db.query(sqlString, [ESTABLISHING_DATE], (err, result) => {
    if (err) {
      return res.send({ status: 0, message: err.message });
    }
    // 对查询结果做简单格式化（如最后活动时间处理，若需要可转成更易读格式）
    const data = result[0];
    if (data.last_activity) {
      // 这里可根据需求进一步格式化时间，比如转成指定字符串格式
      // 示例：保持数据库查询出来的时间格式直接返回，也可用 moment 等库处理
    } else {
      data.last_activity = '无记录';
    }
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
    const sqlString = "SELECT a.*, GROUP_CONCAT(t.id, ':', t.tag_name SEPARATOR ', ') AS tag,(SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) AS comment_count FROM article a LEFT JOIN article_tag_relation at ON a.id = at.article_id  LEFT JOIN tag t ON at.tag_id = t.id WHERE a.status = 1 GROUP BY a.id ORDER BY a.top DESC, a.last_edit_date DESC;"
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
exports.getRecommendArticle = async (req, res) => { }

