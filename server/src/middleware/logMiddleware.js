const logger = require('../utils/logger')

/**
 * 请求日志中间件
 * @param {Object} ctx - Koa 上下文
 * @param {Function} next - 下一个中间件
 */
async function requestLogger(ctx, next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  logger.info(`${ctx.method} ${ctx.url} ${ctx.status} ${ms}ms`, {
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    responseTime: ms,
    ip: ctx.ip,
    userAgent: ctx.headers['user-agent']
  })
}

/**
 * 错误处理中间件
 * @param {Object} ctx - Koa 上下文
 * @param {Function} next - 下一个中间件
 */
async function errorHandler(ctx, next) {
  try {
    await next()
  } catch (error) {
    logger.error('服务器错误', {
      error: error.message,
      stack: error.stack,
      url: ctx.url,
      method: ctx.method
    })
    ctx.status = error.status || 500
    ctx.body = {
      error: '服务器内部错误'
    }
  }
}

module.exports = {
  requestLogger,
  errorHandler
}
