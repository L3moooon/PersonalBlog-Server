require('module-alias/register')//引入别名
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
  const route = require(file);
  const basePath = path.relative(path.join(__dirname, 'routes'), path.dirname(file)).replace(/\\/g, '/');
  app.use(`/${basePath}`, route)
});

app.listen(3001, () => {
  console.log('Server is running on http://127.0.0.1:3001')
})