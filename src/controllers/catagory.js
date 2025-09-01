//前台路由内容获取
const { query } = require('@config/db-util');

//前台获取主页所有文章
exports.getHomeArticle = async (req, res) => {
  try {
    const sqlString = "SELECT a.*, GROUP_CONCAT(t.id, ':', t.tag_name SEPARATOR ', ') AS tag,(SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) AS comment_count FROM article a LEFT JOIN article_tag_relation at ON a.id = at.article_id  LEFT JOIN tag t ON at.tag_id = t.id GROUP BY a.id;"
    const result = await query(sqlString)
    if (result.length > 0) {
      result.forEach(v => {
        if (v.tag && v.tag.length > 0) {
          const tagArray = v.tag.split(',')
          // 转换为[{id,name}]格式
          v.tag = tagArray.map(tag => {
            const [id, name] = tag.split(':');
            return { id: parseInt(id), name };
          });
        }
      })
    }
    return res.json({ status: 1, message: '请求成功！', data: result })
  } catch (error) {
    return res.send({ status: 0, message: err.message })
  }
}
// expoers.getHomeArticle = async (req, res) => { }//获取程序设计文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取学习笔记文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取生活爱好文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取随想录文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取建站日志文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取关于我文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取留言板文章/内容
// expoers.getHomeArticle = async (req, res) => { }//获取友情链接文章/内容

//根据标签获取筛选文章内容
