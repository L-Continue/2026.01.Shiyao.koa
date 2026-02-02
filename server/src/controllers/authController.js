// 认证控制器
const config = require('../config/config')
const logger = require('../utils/logger')

class AuthController {
  /**
   * 验证管理密码
   * @param {Object} ctx - Koa 上下文
   * @returns {Object} 验证结果
   */
  static verifyPassword(ctx) {
    const { password } = ctx.request.body

    if (!password) {
      logger.warn('密码验证失败：密码不能为空', {
        ip: ctx.ip,
        userAgent: ctx.headers['user-agent']
      })
      ctx.status = 400
      ctx.body = {
        valid: false,
        message: '密码不能为空'
      }
      return
    }

    // 验证密码是否正确
    const isValid = password === config.manage.password

    // 如果密码正确，设置 session
    if (isValid) {
      ctx.session.isAuthenticated = true
      ctx.session.user = 'admin'
      logger.info('密码验证成功', {
        ip: ctx.ip,
        userAgent: ctx.headers['user-agent']
      })
    } else {
      logger.warn('密码验证失败：密码错误', {
        ip: ctx.ip,
        userAgent: ctx.headers['user-agent']
      })
    }

    ctx.status = 200
    ctx.body = {
      valid: isValid,
      message: isValid ? '密码验证成功' : '密码错误'
    }
  }

  /**
   * 验证 session 是否有效
   * @param {Object} ctx - Koa 上下文
   * @returns {boolean} 是否验证通过
   */
  static isAuthenticated(ctx) {
    return ctx.session && ctx.session.isAuthenticated === true
  }

  /**
   * 检查密码或 session 验证
   * @param {Object} ctx - Koa 上下文
   * @returns {boolean} 是否验证通过
   */
  static checkAuth(ctx) {
    // 首先检查 session 是否有效
    if (AuthController.isAuthenticated(ctx)) {
      console.log('Session 验证通过')
      return true
    }

    // 如果 session 无效，检查请求中的密码
    const { password: passwordFromRequest } = ctx.request.body || {}
    const { password: passwordFromBody } = ctx.body || {}
    const password = passwordFromRequest || passwordFromBody
    console.log('检查密码:', password)
    console.log('配置密码:', config.manage.password)
    const result = password === config.manage.password
    console.log('密码验证结果:', result)
    return result
  }
}

module.exports = AuthController