const exifr = require('exifr')

class ExifUtils {
  /**
   * 读取图片的 EXIF 信息
   * @param {string} filePath - 图片文件路径
   * @returns {Promise<Object>} - EXIF 信息
   */
  async readExif(filePath) {
    try {
      const exif = await exifr.parse(filePath, {
        tags: ['DateTimeOriginal', 'CreateDate', 'ModifyDate']
      })
      return exif
    } catch (error) {
      console.error('读取 EXIF 信息失败:', error)
      return null
    }
  }

  /**
   * 从 EXIF 信息中提取拍摄日期
   * @param {Object} exif - EXIF 信息
   * @returns {Date|null} - 拍摄日期
   */
  extractDate(exif) {
    if (!exif) return null

    // 优先使用拍摄日期
    if (exif.DateTimeOriginal) {
      return new Date(exif.DateTimeOriginal)
    }

    // 其次使用创建日期
    if (exif.CreateDate) {
      return new Date(exif.CreateDate)
    }

    // 最后使用修改日期
    if (exif.ModifyDate) {
      return new Date(exif.ModifyDate)
    }

    return null
  }

  /**
   * 获取图片的年份
   * @param {string} filePath - 图片文件路径
   * @returns {Promise<string>} - 年份（格式：YYYY），如果无法获取则返回 '0000'
   */
  async getImageYear(filePath) {
    try {
      const exif = await this.readExif(filePath)
      const date = this.extractDate(exif)

      if (date) {
        return date.getFullYear().toString()
      }

      // 如果无法从 EXIF 获取日期，返回 '0000'
      return '0000'
    } catch (error) {
      console.error('获取图片年份失败:', error)
      return '0000'
    }
  }

  /**
   * 生成文件命名（基于日期时间）
   * @param {string} filePath - 图片文件路径
   * @returns {Promise<string>} - 文件名（格式：YYYYMMDD_HHMMSS）
   */
  async generateFileName(filePath) {
    try {
      const exif = await this.readExif(filePath)
      const date = this.extractDate(exif)

      if (date) {
        const year = date.getFullYear().toString().padStart(4, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')

        return `${year}${month}${day}_${hours}${minutes}${seconds}`
      }

      // 如果无法从 EXIF 获取日期，使用当前时间
      const now = new Date()
      const year = now.getFullYear().toString().padStart(4, '0')
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')

      return `${year}${month}${day}_${hours}${minutes}${seconds}`
    } catch (error) {
      console.error('生成文件名失败:', error)
      // 生成随机文件名
      const timestamp = Date.now()
      return `img_${timestamp}`
    }
  }

  /**
   * 获取文件扩展名
   * @param {string} filePath - 文件路径
   * @returns {string} - 扩展名（不含点）
   */
  getFileExtension(filePath) {
    const parts = filePath.split('.')
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase()
    }
    return 'jpg'
  }

  /**
   * 生成完整的 OSS 路径
   * @param {string} filePath - 图片文件路径
   * @returns {Promise<string>} - OSS 路径
   */
  async generateOssPath(filePath) {
    try {
      const year = await this.getImageYear(filePath)
      const fileName = await this.generateFileName(filePath)
      const extension = this.getFileExtension(filePath)

      // 生成 OSS 路径：S.PHOTO.YYYY/YYYYMMDD_HHMMSS.ext
      const folder = `S.PHOTO.${year}`
      const fullFileName = `${fileName}.${extension}`

      return `${folder}/${fullFileName}`
    } catch (error) {
      console.error('生成 OSS 路径失败:', error)
      // 生成默认路径
      const timestamp = Date.now()
      const extension = this.getFileExtension(filePath)
      return `S.PHOTO.0000/img_${timestamp}.${extension}`
    }
  }
}

module.exports = new ExifUtils()