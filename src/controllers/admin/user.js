const { query } = require('@config/db-util');

//获取管理员列表
exports.getAdminList = async (req, res) => {
  try {
    const sqlString = "SELECT id, account, create_time, last_login_time, ip, location,status FROM admin_account "
    const result = await query(sqlString)
    result.forEach(item => {
      if (item.location) {
        item.location = JSON.parse(item.location);
      }
    });
    res.json({ status: 1, data: result });
  } catch (error) {
    return res.send({ code: 0, msg: error.message });
  }
}
