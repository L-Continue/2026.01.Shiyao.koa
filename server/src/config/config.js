// 站点配置
const siteConfig = {
  // 站点基本信息
  site: {
    name: '相册墙',
    description: '个人相册管理系统',
    version: '1.0.0',
    author: 'Shiyao'
  },

  // 服务器配置
  server: {
    port: process.env.SERVER_PORT || 3000,
    host: process.env.SERVER_HOST || 'localhost'
  },

  // 管理配置
  manage: {
    password: process.env.MANAGE_PASSWORD || '0000'
  },

  // session 配置
  session: {
    key: 'koa:sess',
    maxAge: 1000 * 60 * 30,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true,
    renew: false
  },

  // bodyParser 配置
  bodyParser: {
    multipart: true,
    jsonLimit: '1gb',
    formLimit: '1gb'
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    maxFiles: 14,
    maxsize: 5242880 // 5MB
  }
}

// 导出配置
module.exports = siteConfig