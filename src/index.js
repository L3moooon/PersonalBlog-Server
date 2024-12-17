const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const glob = require('glob');
const app = express()
const path = require('path');

app.use(cors()) //解决跨域
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// 路由接口
const ROOT_PATH = path.join(__dirname, 'routes/**/*.js').replace(/\\/g, '/')
const routeFiles = glob.sync(ROOT_PATH);
routeFiles.forEach((file) => {
  // console.log(file);
  const route = require(file);
  const basePath = path.relative(path.join(__dirname, 'routes'), path.dirname(file));
  app.use(`/${basePath}`, route)
});

app.get('/', (req, res) => {
  res.send('根路径');
});

app.listen(3001, () => {
  console.log('serve is running on http://127.0.0.1:3001')
})