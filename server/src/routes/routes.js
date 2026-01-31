// 路由配置文件
const Router = require('@koa/router')
const photoController = require('../controllers/photoController')
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

// 照片相关路由（/api 前缀）
const photoRouter = new Router({ prefix: '/api' })

// 上传图片 - POST /api/photos
photoRouter.post('/photos', (ctx) => photoController.uploadPhoto(ctx))

// 获取照片列表 - GET /api/photos
photoRouter.get('/photos', (ctx) => photoController.getPhotos(ctx))

// 获取最新上传的照片 - GET /api/photos/recent
photoRouter.get('/photos/recent', (ctx) => photoController.getRecentPhotos(ctx))

// 删除照片 - DELETE /api/photos/:path
photoRouter.delete('/photos/:path', (ctx) => photoController.deletePhoto(ctx))

// 重命名照片 - PUT /api/photos/:path
photoRouter.put('/photos/:path', (ctx) => photoController.renamePhoto(ctx))

// 获取分类列表 - GET /api/categories
photoRouter.get('/categories', (ctx) => photoController.getCategories(ctx))

// 注册认证路由
router.use(authRouter.routes())

// 注册照片路由
router.use(photoRouter.routes())

module.exports = router