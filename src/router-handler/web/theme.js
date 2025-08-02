const { query, getConnection } = require('../../../config/db-util')

//获取网站相关信息
exports.theme = async (req, res) => {
  try {
    const sqlString1 = 'SELECT * FROM user WHERE id=1';
    const sqlString2 = 'SELECT * FROM user_saying WHERE user_id=1';
    const sqlString3 = 'SELECT * FROM user_url WHERE user_id=1';
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
    const delString1 = "DELETE FROM user_saying;"
    const delString2 = "DELETE FROM user_url;"
    const delString3 = "DELETE FROM web_bg_img;"
    await Promise.all([query(delString1), query(delString2), query(delString3)])
    const sqlString1 = "UPDATE user SET nickname=?,portrait=?,motto=?,welcome=? WHERE id=1"//更新user表
    const sqlString2 = "INSERT INTO user_saying(user_id,saying) VALUES?; "//批量更新user_saying表
    const sqlString3 = " INSERT INTO user_url(user_id,name,address) VALUES?;"//批量更新use_url表
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
}
