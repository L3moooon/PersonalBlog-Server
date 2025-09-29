const { query } = require('@config/db-util');

exports.getNumData = async (req, res) => {
  try {
    const sqlString = `
    SELECT 
      (SELECT CAST(SUM(visited_count) AS UNSIGNED) FROM web_account) AS total_visits,
      (SELECT COUNT(*) FROM article) AS article_count,
      (SELECT COUNT(*) FROM comment) AS comment_count,
      (SELECT CAST(SUM(star) AS UNSIGNED) FROM article) AS star_count
  `;
    const result = await query(sqlString)
    const data = result[0]
    return res.send({
      code: 1,
      msg: '请求成功',
      data: {
        total_visits: data.total_visits,
        article_count: data.article_count,
        comment_count: data.comment_count,
        star_count: data.star_count
      }
    });
  } catch (error) {
    return res.status(400).send({
      code: 0,
      msg: error.message,
    })
  }
}
//访客地图
exports.getGeoData = async (req, res) => {
  try {
    // const sqlString = 'SELECT address,visited_count from web_account'
    const sqlString = 'SELECT address from web_account'
    const result = await query(sqlString)
    const geo = {}
    result.map(item => {
      const addressObj = JSON.parse(item.address);
      const province = addressObj.province;
      if (province) {
        // geo[province] = (geo[province] || 0) + item.visited_count
        geo[province] = (geo[province] || 0) + 1
      }
    })
    const chinaProvinceData = Object.entries(geo).map(([name, value]) => ({
      name,
      value,
    }));
    return res.send({ code: 1, msg: '请求成功', data: chinaProvinceData })
  } catch (error) {
    return res.status(400).send({
      code: 0,
      msg: error.message,
    })
  }
}
exports.getLineData = async (req, res) => {
}
exports.getBarData = async (req, res) => {
}
exports.getPieData = async (req, res) => {
}