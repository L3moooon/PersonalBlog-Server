const db = require('../../config/db');
const sqlString1 = 'SELECT * FROM user WHERE id=1';
const sqlString2 = 'SELECT * FROM user_saying WHERE user_id=1';
const sqlString3 = 'SELECT * FROM user_url WHERE user_id=1';

exports.info = async (req, res) => {
  const processData = {
    nickname: '',
    portrait: '',
    saying: [],
    url: []
  };
  try {
    const queryPromises = [
      new Promise((resolve, reject) => {
        db.query(sqlString1, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.query(sqlString2, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.query(sqlString3, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
    ];
    const [result1, result2, result3] = await Promise.all(queryPromises);

    if (result1.length > 0) {
      processData.nickname = result1[0].nickname;
      processData.portrait = result1[0].portrait;
    }
    if (result2.length > 0) {
      result2.forEach(element => {
        processData.saying.push(element.saying);
      });
    }
    if (result3.length > 0) {
      result3.forEach(element => {
        processData.url.push({ 'name': element.name, 'address': element.address });
      });
    }

    return res.json({ status: 0, message: '请求成功！', data: processData });
  } catch (err) {
    console.error(err);
    return res.json({ status: 1, message: err.message });
  }
};