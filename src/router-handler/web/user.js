const { query } = require('../../../config/db-util')

exports.info = async (req, res) => {
  try {
    const sqlString1 = 'SELECT * FROM user WHERE id=1';
    const sqlString2 = 'SELECT * FROM user_saying WHERE user_id=1';
    const sqlString3 = 'SELECT * FROM user_url WHERE user_id=1';
    const queryPromises = [query(sqlString1), query(sqlString2), query(sqlString3)]
    const [result1, result2, result3] = await Promise.all(queryPromises);
    let saying = []
    let url = []
    result2.forEach(element => {
      saying.push(element.saying);
    });
    result3.forEach(element => {
      url.push({ 'name': element.name, 'address': element.address });
    });
    return res.json({ status: 1, message: '请求成功！', data: { ...result1[0], saying, url } });
  } catch (err) {
    console.error(err);
    return res.json({ status: 0, message: err.message });
  }
};