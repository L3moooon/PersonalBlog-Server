const db = require('../../config/db');
// 网站上线时间戳（秒级，需与实际一致）
const ESTABLISHING_DATE = 1754707126;

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