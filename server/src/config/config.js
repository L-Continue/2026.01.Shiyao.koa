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

  // 照片管理配置
  photo: {
    // 管理密码，默认0000，可通过环境变量覆盖
    managePassword: process.env.MANAGE_PASSWORD || '0000'
  },

  // bodyParser 配置
  bodyParser: {
    multipart: true,
    jsonLimit: '1gb',
    formLimit: '1gb'
  }
}

// 导出配置
module.exports = siteConfig