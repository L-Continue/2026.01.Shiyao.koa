// 认证控制器
const config = require('../config/config')

class AuthController {
  /**
   * 验证管理密码
   * @param {Object} ctx - Koa 上下文
   * @returns {Object} 验证结果
   */
  static verifyPassword(ctx) {
    const { password } = ctx.request.body

    if (!password) {
      ctx.status = 400
      ctx.body = {
        valid: false,
        message: '密码不能为空'
      }
      return
    }

    // 验证密码是否正确
    const isValid = password === config.photo.managePassword

    ctx.status = 200
    ctx.body = {
      valid: isValid,
      message: isValid ? '密码验证成功' : '密码错误'
    }
  }
}

module.exports = AuthController