const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const glob = require('glob');
// const routeFiles = glob.sync('./routes/*.js');
const app = express()
const path = require('path');

const routeFiles = glob.sync(path.join(__dirname, 'routes/**/*.js'));
console.log(path.join(__dirname, 'routes/**/*.js'));

routeFiles.forEach((file) => {
  // console.log(file);
  // const route = require(file);
  // app.use('/', route);
  console.log(111, file);
  const route = require(file);
  const basePath = path.relative(path.join(__dirname, 'routes'), path.dirname(file));
  app.use(`/${basePath}`, route);
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors()) //解决跨域
// app.get('/', (req, res) => {
//   res.send('根路径');
// });
app.listen(3001, () => {
  console.log('serve is running on http://127.0.0.1:3001')
})
