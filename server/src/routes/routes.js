// 加载路由、配置
const Router = require('@koa/router')
const fileController = require('../controllers/fileController')
const authController = require('../controllers/authController')

// 主路由
const router = new Router()

// 健康检查路由 - GET /
router.get('/', async (ctx) => {
  ctx.status = 200
  ctx.body = {
    message: '相册墙 API 服务运行正常',
    timestamp: new Date().toISOString()
  }
})

// 认证相关路由（/api 前缀）
const authRouter = new Router({ prefix: '/api/auth' })

// 验证管理密码 - POST /api/auth/verify
authRouter.post('/verify', (ctx) => authController.verifyPassword(ctx))

// 文件相关路由（/api 前缀）
const fileRouter = new Router({ prefix: '/api' })

// 上传文件 - POST /api/files
fileRouter.post('/files', (ctx) => fileController.uploadFile(ctx))

// 获取文件列表 - GET /api/files
fileRouter.get('/files', (ctx) => fileController.getFiles(ctx))

// 获取最新上传的文件 - GET /api/files/recent
fileRouter.get('/files/recent', (ctx) => fileController.getRecentFiles(ctx))

// 删除文件 - DELETE /api/files/:path
fileRouter.delete('/files/:path', (ctx) => fileController.deleteFile(ctx))

// 重命名文件 - PUT /api/files/:path
fileRouter.put('/files/:path', (ctx) => fileController.renameFile(ctx))

// 获取分类列表 - GET /api/categories
fileRouter.get('/categories', (ctx) => fileController.getCategories(ctx))

// 注册认证路由
router.use(authRouter.routes())

// 注册文件路由
router.use(fileRouter.routes())

module.exports = router