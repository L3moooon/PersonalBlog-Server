const { query } = require('../../../config/db-util/index');
const IP2Region = require('ip2region').default;
const IPquery = new IP2Region();
//发送游客数据进行统计
exports.visited = async (req, res) => {
  try {
    const { identify, agent } = req.body
    //首先查询之前有无访问记录
    const sqlString = 'SELECT name, portrait FROM web_account WHERE identify=?'
    //更新ip地址
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipAddress = JSON.stringify(IPquery.search(ip));

    const result = await query(sqlString, [identify])
    //有访问记录，直接更新数据库
    if (result && result.length > 0) {
      //判断上次登陆时间，若间隔时间大于1h，则访问次数visited_count加一
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      let count = lastVisitTime < oneHourAgo ? result[0].visited_count + 1 : result[0].visited_count
      const sqlString1 = "UPDATE web_account SET ip=?,address=?,agent=?,visited_count=?"
      await query(sqlString1, [ip, ipAddress, agent, count])
    }
    //无访问记录，插入表中
    else {
      const sqlString2 = 'INSERT INTO web_account(identify,name,ip,address,agent) VALUES(?,?,?,?,?)'
      await query(sqlString2, [identify, identify, ip, ipAddress, agent])
      //应返回游客姓名，头像
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