const db = require('../../config/db');
const sqlString = 'SELECT * FROM website_info';

exports.info = async (req, res) => {

  // const processData = {
  //   create_time: String,
  //   today_page_view: Number,
  //   total_page_view: Number,
  //   article_num: Number,
  //   common_num: Number,
  //   last_activate: String
  // }
  db.query(sqlString, (err, result) => {
    if (err) {
      return res.send({ status: 1, message: err.message })
    }
    if (result.length > 0) {
      // const dateObj = new Date(dateStr);
      // const timestamp = dateObj.getTime();
      // console.log(timestamp);
      return res.send({ status: 1, message: '请求成功', data: result })
    }
  })
}