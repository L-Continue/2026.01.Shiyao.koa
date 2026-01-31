// 引入 OSS 模块
const OSS = require('ali-oss')

// OSS 配置
const config = {
  region: process.env.OSS_REGION, // OSS 区域
  accessKeyId: process.env.OSS_ACCESS_KEY_ID, // 访问密钥 ID
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET, // 访问密钥 Secret
  bucket: process.env.OSS_BUCKET, // 存储桶名称
  cname: true, // 是否使用自定义域名
  endpoint: process.env.OSS_ENDPOINT, // OSS 访问端点
  exptime: Number(process.env.OSS_EXPTIME), // 签名 URL 过期时间（秒）
  maxsize: Number(process.env.OSS_MAXSIZE), // 上传文件最大大小（字节）
  styles: { thumb: 'thumb', large: 'large' } // 图片样式配置（缩略图和大图）
}

// 创建 OSS 客户端实例
const client = new OSS(config)

// 导出 OSS 客户端和配置
module.exports = { client, config }