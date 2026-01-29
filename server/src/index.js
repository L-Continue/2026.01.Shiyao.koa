const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();

// 导入路由
const apiRoutes = require('../routes/api');

// 使用路由
router.use('/api', apiRoutes.routes(), apiRoutes.allowedMethods());

// 健康检查
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Server is running',
    timestamp: new Date().toISOString()
  };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;