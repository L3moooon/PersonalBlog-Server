const db = require('../../../config/db');


exports.getAllUserList = async (req, res) => {
  const sqlString = "SELECT id, email, create_time, permission, last_login_time, ip, location FROM admin_account "
  db.query(sqlString, (err, rows) => {
    if (err) {
      res.send({ status: 0, message: err.message });
    }
    res.json({ status: 1, data: rows });
  })
}