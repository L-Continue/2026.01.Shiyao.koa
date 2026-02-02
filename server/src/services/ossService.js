const { client, config: ossConfig } = require('../config/alioss')
const logger = require('../utils/logger')

class OssService {
  /**
   * 上传文件到 OSS
   * @param {string} filePath - 文件本地路径
   * @param {string} ossPath - OSS 存储路径
   * @returns {Promise<string>} - 上传后的文件 URL
   */
  async uploadFile(filePath, ossPath) {
    try {
      const result = await client.put(ossPath, filePath)
      return result.url
    } catch (error) {
      logger.error('上传文件失败:', { error: error.message, stack: error.stack, ossPath })
      throw error
    }
  }

  /**
   * 通过 Buffer 上传文件
   * @param {Buffer} buffer - 文件 Buffer
   * @param {string} ossPath - OSS 存储路径
   * @returns {Promise<string>} - 上传后的文件 URL
   */
  async uploadBuffer(buffer, ossPath) {
    try {
      const result = await client.put(ossPath, buffer)
      return result.url
    } catch (error) {
      logger.error('上传文件失败:', { error: error.message, stack: error.stack, ossPath })
      throw error
    }
  }

  /**
   * 删除文件
   * @param {string} ossPath - OSS 存储路径
   * @returns {Promise<void>}
   */
  async deleteFile(ossPath) {
    try {
      await client.delete(ossPath)
    } catch (error) {
      logger.error('删除文件失败:', { error: error.message, stack: error.stack, ossPath })
      throw error
    }
  }

  /**
   * 重命名文件
   * @param {string} oldPath - 原文件路径
   * @param {string} newPath - 新文件路径
   * @returns {Promise<void>}
   */
  async renameFile(oldPath, newPath) {
    try {
      // 复制文件到新路径
      await client.copy(newPath, oldPath)
      // 删除原文件
      await client.delete(oldPath)
    } catch (error) {
      logger.error('重命名文件失败:', { error: error.message, stack: error.stack, oldPath, newPath })
      throw error
    }
  }

  /**
   * 获取文件列表
   * @param {string} prefix - 前缀路径
   * @returns {Promise<Array>} - 文件列表
   */
  async getFileList(prefix = '') {
    try {
      const result = await client.list({
        prefix,
        delimiter: '/'
      })
      return result.objects
    } catch (error) {
      logger.error('获取文件列表失败:', { error: error.message, stack: error.stack, prefix })
      throw error
    }
  }

  /**
   * 获取文件夹列表
   * @param {string} prefix - 前缀路径
   * @returns {Promise<Array>} - 文件夹列表
   */
  async getFolderList(prefix = '') {
    try {
      const result = await client.list({
        prefix,
        delimiter: '/'
      })
      return result.prefixes
    } catch (error) {
      logger.error('获取文件夹列表失败:', { error: error.message, stack: error.stack, prefix })
      throw error
    }
  }

  /**
   * 检查文件是否存在
   * @param {string} ossPath - OSS 存储路径
   * @returns {Promise<boolean>} - 文件是否存在
   */
  async doesFileExist(ossPath) {
    try {
      await client.head(ossPath)
      return true
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return false
      }
      throw error
    }
  }

  /**
   * 检查文件夹是否存在
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<boolean>} - 文件夹是否存在
   */
  async doesFolderExist(folderPath) {
    try {
      const result = await client.list({
        prefix: folderPath,
        delimiter: '/',
        maxKeys: 1
      })
      const hasObjects = result && result.objects && Array.isArray(result.objects) && result.objects.length > 0
      const hasPrefixes = result && result.prefixes && Array.isArray(result.prefixes) && result.prefixes.length > 0
      return hasObjects || hasPrefixes
    } catch (error) {
      logger.error('检查文件夹失败:', { error: error.message, stack: error.stack, folderPath })
      return false
    }
  }

  /**
   * 创建文件夹
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<void>}
   */
  async createFolder(folderPath) {
    try {
      // OSS 中创建文件夹需要以 / 结尾
      if (!folderPath.endsWith('/')) {
        folderPath += '/'
      }
      await client.put(folderPath, Buffer.from(''))
    } catch (error) {
      logger.error('创建文件夹失败:', { error: error.message, stack: error.stack, folderPath })
      throw error
    }
  }

  /**
   * 获取文件签名 URL
   * @param {string} ossPath - OSS 存储路径
   * @param {number} expires - 过期时间（秒）
   * @param {string} style - 图片样式名称
   * @returns {Promise<string>} - 签名 URL
   */
  async getSignedUrl(ossPath, expires = ossConfig.exptime, style = null) {
    try {
      const options = {
        expires
      }

      // 如果指定了样式，添加样式参数
      if (style) {
        options.process = `style/${style}`
      }

      const url = await client.signatureUrl(ossPath, options)
      return url
    } catch (error) {
      logger.error('获取签名 URL 失败:', { error: error.message, stack: error.stack, ossPath, style })
      throw error
    }
  }

  /**
   * 批量获取文件签名 URL
   * @param {string} ossPath - OSS 存储路径
   * @param {number} expires - 过期时间（秒）
   * @returns {Promise<Object>} - 包含不同样式签名 URL 的对象
   */
  async getSignedUrls(ossPath, expires = ossConfig.exptime) {
    try {
      const styles = ossConfig.styles
      const urls = {
        original: await this.getSignedUrl(ossPath, expires),
        thumb: await this.getSignedUrl(ossPath, expires, styles.thumb),
        large: await this.getSignedUrl(ossPath, expires, styles.large)
      }
      return urls
    } catch (error) {
      logger.error('批量获取签名 URL 失败:', { error: error.message, stack: error.stack, ossPath })
      throw error
    }
  }
}

module.exports = new OssService()