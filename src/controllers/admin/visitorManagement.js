const { query } = require('@config/db-util/index');

//获取游客列表
exports.getVisitorList = async (req, res) => {
  try {
    const sqlString = 'SELECT * FROM web_account'
    const result = await query(sqlString)
    result.forEach(item => {
      if (item.address) {
        item.address = JSON.parse(item.address);
      }
    });
    return res.json({ status: 1, message: '获取成功', data: result })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}