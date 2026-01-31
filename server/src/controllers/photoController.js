const multer = require('@koa/multer')
const path = require('path')
const os = require('os')
const fs = require('fs/promises')

const ossService = require('../services/ossService')
const exifUtils = require('../utils/exifUtils')

/**
 * 从文件名中提取日期
 * @param {string} fileName - 文件名
 * @returns {string} - 日期字符串
 */
function extractDateFromFileName(fileName) {
  // 文件名格式：YYYYMMDD_HHMMSS.ext
  const match = fileName.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)

  if (match) {
    const [, year, month, day, hour, minute, second] = match
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  return null
}

// 配置 multer 临时存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir())
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

class PhotoController {
  /**
   * 上传图片
   * @param {Object} ctx - Koa 上下文
   */
  async uploadPhoto(ctx) {
    try {
      // 使用 multer 处理文件上传
      const uploadMiddleware = upload.single('file')

      await new Promise((resolve, reject) => {
        uploadMiddleware(ctx, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })

      const file = ctx.file
      if (!file) {
        ctx.status = 400
        ctx.body = { error: '请选择要上传的文件' }
        return
      }

      // 生成 OSS 路径
      const ossPath = await exifUtils.generateOssPath(file.path)

      // 确保文件夹存在
      const folderPath = ossPath.split('/')[0]
      const folderExists = await ossService.doesFolderExist(folderPath)
      if (!folderExists) {
        await ossService.createFolder(folderPath)
      }

      // 上传到 OSS
      const url = await ossService.uploadFile(file.path, ossPath)

      // 清理临时文件
      await fs.unlink(file.path)

      ctx.status = 200
      ctx.body = {
        success: true,
        url,
        path: ossPath,
        name: path.basename(ossPath)
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      ctx.status = 500
      ctx.body = { error: '上传图片失败，请稍后重试' }
    }
  }

  /**
   * 获取照片列表
   * @param {Object} ctx - Koa 上下文
   */
  async getPhotos(ctx) {
    try {
      const { category } = ctx.query

      if (!category) {
        ctx.status = 400
        ctx.body = { error: '请指定分类' }
        return
      }

      // 获取该分类下的文件列表
      const files = await ossService.getFileList(`${category}/`)

      // 处理文件列表，生成签名 URL（返回多种样式的 URL）
      const photos = await Promise.all(files.map(async (file) => {
        const urls = await ossService.getSignedUrls(file.name)
        const name = path.basename(file.name)
        const date = extractDateFromFileName(name)

        return {
          path: file.name,
          thumbUrl: urls.thumb,  // 缩略图 URL
          largeUrl: urls.large,  // 大图 URL
          url: urls.original,  // 原图 URL
          name,
          date
        }
      }))

      ctx.status = 200
      ctx.body = photos
    } catch (error) {
      console.error('获取照片列表失败:', error)
      ctx.status = 500
      ctx.body = { error: '获取照片列表失败，请稍后重试' }
    }
  }

  /**
   * 获取最新上传的照片
   * @param {Object} ctx - Koa 上下文
   */
  async getRecentPhotos(ctx) {
    try {
      // 获取所有文件夹列表
      const folders = await ossService.getFolderList()

      // 过滤出 S.PHOTO.YYYY 格式的文件夹
      const photoFolders = folders.filter(folder => {
        return /^S\.PHOTO\.\d{4}\/$/.test(folder)
      })

      // 获取每个文件夹下的文件
      const allPhotos = []

      for (const folder of photoFolders) {
        const files = await ossService.getFileList(folder)

        for (const file of files) {
          const urls = await ossService.getSignedUrls(file.name)
          const name = path.basename(file.name)
          const date = extractDateFromFileName(name)

          allPhotos.push({
            path: file.name,
            thumbUrl: urls.thumb,  // 缩略图 URL
            largeUrl: urls.large,  // 大图 URL
            url: urls.original,  // 原图 URL
            name,
            date
          })
        }
      }

      // 按日期排序，取最新的 20 张
      allPhotos.sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })

      const recentPhotos = allPhotos.slice(0, 20)

      ctx.status = 200
      ctx.body = recentPhotos
    } catch (error) {
      console.error('获取最新照片失败:', error)
      ctx.status = 500
      ctx.body = { error: '获取最新照片失败，请稍后重试' }
    }
  }

  /**
   * 获取分类列表
   * @param {Object} ctx - Koa 上下文
   */
  async getCategories(ctx) {
    try {
      // 获取所有文件夹列表
      const folders = await ossService.getFolderList()

      // 过滤出 S.PHOTO.YYYY 格式的文件夹
      const categories = folders
        .filter(folder => /^S\.PHOTO\.\d{4}\/$/.test(folder))
        .map(folder => folder.replace('/', ''))

      ctx.status = 200
      ctx.body = categories
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ctx.status = 500
      ctx.body = { error: '获取分类列表失败，请稍后重试' }
    }
  }

  /**
   * 删除照片
   * @param {Object} ctx - Koa 上下文
   */
  async deletePhoto(ctx) {
    try {
      const { path: photoPath } = ctx.params

      if (!photoPath) {
        ctx.status = 400
        ctx.body = { error: '请指定要删除的照片' }
        return
      }

      // 删除 OSS 上的文件
      await ossService.deleteFile(photoPath)

      ctx.status = 200
      ctx.body = { success: true }
    } catch (error) {
      console.error('删除照片失败:', error)
      ctx.status = 500
      ctx.body = { error: '删除照片失败，请稍后重试' }
    }
  }

  /**
   * 重命名照片
   * @param {Object} ctx - Koa 上下文
   */
  async renamePhoto(ctx) {
    try {
      const { path: oldPath } = ctx.params
      const { newName } = ctx.request.body

      if (!oldPath || !newName) {
        ctx.status = 400
        ctx.body = { error: '请指定要重命名的照片和新文件名' }
        return
      }

      // 获取原文件的扩展名
      const extension = path.extname(oldPath)

      // 生成新路径
      const oldFolder = oldPath.split('/')[0]
      const newPath = `${oldFolder}/${newName}${extension}`

      // 重命名文件
      await ossService.renameFile(oldPath, newPath)

      ctx.status = 200
      ctx.body = { success: true }
    } catch (error) {
      console.error('重命名照片失败:', error)
      ctx.status = 500
      ctx.body = { error: '重命名照片失败，请稍后重试' }
    }
  }


}

module.exports = new PhotoController()