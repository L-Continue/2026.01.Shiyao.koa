const Router = require('koa-router');
const router = new Router();

// 示例API端点
router.get('/hello', async (ctx) => {
  ctx.body = {
    message: 'Hello from API',
    data: {
      name: 'Koa API',
      version: '1.0.0'
    }
  };
});

router.get('/users', async (ctx) => {
  ctx.body = {
    users: [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
      { id: 3, name: 'User 3' }
    ]
  };
});

module.exports = router;