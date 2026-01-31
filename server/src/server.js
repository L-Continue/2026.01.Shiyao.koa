// 加载环境变量
require('dotenv').config()

// 加载 Koa 框架和中间件
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

// 加载路由、配置
const routes = require('./routes/routes')
const config = require('./config/config')

const app = new Koa()
const PORT = config.server.port
const HOST = config.server.host

// 加载中间件
app.use(cors())
app.use(bodyParser(config.bodyParser))

// 注册路由
app.use(routes.routes())
app.use(routes.allowedMethods())

// 启动服务器
app.listen(PORT, HOST, () => {
  console.log(`服务器运行在 http://${HOST}:${PORT}`)
})

module.exports = app