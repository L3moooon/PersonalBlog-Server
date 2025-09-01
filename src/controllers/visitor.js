//游客
const { query } = require('@config/db-util/index');
const IP2Region = require('ip2region').default;
const IPquery = new IP2Region();

// 验证字符串是否为空或仅包含空白字符
const isEmptyString = (str) => {
  return !str || typeof str !== 'string' || str.trim() === '';
};

//发送游客数据进行统计
exports.visited = async (req, res) => {
  try {
    const { identify, agent } = req.body
    if (isEmptyString(agent) || isEmptyString(identify)) {
      return res.status(400).json({
        status: 0,
        message: '参数错误'
      });
    }
    //首先查询之前有无访问记录
    const sqlString = 'SELECT id, name, portrait,last_login_time,visited_count FROM web_account WHERE identify=?'
    //更新ip地址
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipAddress = JSON.stringify(IPquery.search(ip));

    let result = await query(sqlString, [identify])
    //有访问记录，直接更新数据库
    if (result && result.length > 0) {
      //判断上次登陆时间，若间隔时间大于1h，则访问次数visited_count加一
      const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
      const lastLoginTime = result[0].last_login_time;
      let count = lastLoginTime > oneHourAgo ? result[0].visited_count + 1 : result[0].visited_count
      const sqlString1 = "UPDATE web_account SET ip = ?, address = ?,agent = ?, visited_count = ? WHERE identify=?"
      await query(sqlString1, [ip, ipAddress, agent, count, identify])
    }
    //无访问记录，插入表中
    else {
      const sqlString2 = 'INSERT INTO web_account(identify,name,ip,address,agent,last_login_time) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)'
      const name = '游客 ' + identify
      const insertRes = await query(sqlString2, [identify, name, ip, ipAddress, agent])
      result = [{
        id: insertRes.insertId,
        name: identify,
        portrait: null
      }]
    }
    return res.json({ status: 1, message: '发送成功', data: result[0] })
  } catch (error) {
    return res.send({ status: 0, message: error.message })
  }
}

//更改游客数据
exports.modifyVisitor = async (req, res) => {
  try {
    const { name, portrait } = req.body
    res.send({ status: 1, message: '发送成功' })
  } catch (error) {
  }
}

//获取游客数据
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