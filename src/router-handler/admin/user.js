const db = require('../../../config/db');
const { query } = require('../../../config/db-util/index')
exports.getAllUserList = async (req, res) => {
  try {
    const sqlString = "SELECT id, email, create_time, last_login_time, ip, location FROM admin_account "
    const result = await query(sqlString)
    result.forEach(item => {
      if (item.location) {
        item.location = JSON.parse(item.location);
      }
    });
    res.json({ status: 1, data: result });
  } catch (error) {
    res.send({ status: 0, message: error.message });
  }

}