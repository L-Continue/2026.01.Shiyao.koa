# 相册墙网站

一个基于 Vue 3 + Koa 2 的相册墙网站，集成阿里云 OSS 云存储，支持图片自动分类、EXIF 数据提取、多尺寸图片展示和安全的照片管理功能。

## 技术栈

### 前端
- Vue 3 + Vite
- Element Plus 组件库
- Vue Router
- Axios

### 后端
- Node.js + Koa 2
- @koa/router 路由管理
- @koa/multer 文件上传
- ali-oss 阿里云 OSS SDK
- exifr EXIF 数据提取
- dotenv 环境变量管理

### 云服务
- 阿里云 OSS（对象存储服务）

## 项目结构

```
.
├── client/            # 前端项目
│   ├── public/        # 静态资源
│   ├── src/           # 源代码
│   │   ├── assets/    # 资源文件
│   │   ├── components/ # 组件
│   │   ├── views/     # 页面视图
│   │   ├── api/       # API 调用
│   │   ├── router/    # 路由配置
│   │   └── main.js    # 入口文件
│   ├── index.html     # HTML 模板
│   └── package.json   # 前端依赖
├── server/            # 后端项目
│   ├── src/           # 源代码
│   │   ├── config/    # 配置文件
│   │   ├── controllers/ # 控制器
│   │   ├── services/  # 服务层
│   │   ├── utils/     # 工具函数
│   │   ├── routes/    # 路由配置
│   │   └── server.js  # 服务入口
│   ├── test/          # 测试文件
│   ├── .env           # 环境变量
│   └── package.json   # 后端依赖
└── README.md          # 项目说明
```

## 功能特性

1. **图片上传与分类**
   - 支持批量上传图片到阿里云 OSS
   - 自动提取 EXIF 数据获取拍摄日期
   - 根据拍摄日期自动分类到对应年份文件夹（S.PHOTO.YYYY）
   - 无 EXIF 数据的图片自动归类到 S.PHOTO.0000

2. **图片管理**
   - 密码保护的管理界面（默认密码：0000）
   - 支持删除和重命名图片
   - 批量操作支持

3. **多尺寸图片展示**
   - 缩略图（style/thumb）：列表展示
   - 大图（style/large）：点击查看
   - 原图：查看原始尺寸

4. **安全访问**
   - 使用阿里云 OSS 签名 URL 进行安全访问
   - 签名 URL 1小时过期，确保安全性
   - 无需将 OSS Bucket 设置为公共读

5. **响应式设计**
   - 适配不同屏幕尺寸
   - 移动端友好

## 安装和运行

### 前提条件
- Node.js 16.0+
- npm 7.0+
- 阿里云 OSS Bucket（已配置 CORS）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/album-wall.git
   cd album-wall
   ```

2. **配置环境变量**
   在 `server/.env` 文件中添加以下配置：
   ```
   # 服务器配置
   SERVER_PORT=3000
   SERVER_HOST=localhost

   # 阿里云 OSS 配置
   OSS_REGION=oss-cn-shenzhen
   OSS_ACCESS_KEY_ID=您的访问密钥ID
   OSS_ACCESS_KEY_SECRET=您的访问密钥Secret
   OSS_BUCKET=res-shiyao
   OSS_ENDPOINT=https://res-shiyao.oss-cn-shenzhen.aliyuncs.com
   OSS_EXPTIME=3600
   OSS_MAXSIZE=1048576000

   # 照片管理配置
   PHOTO_MANAGE_PASSWORD=0000
   ```

3. **安装依赖并启动服务**

   - **后端服务**
     ```bash
     cd server
     npm install
     npm run dev
     ```
     后端服务运行在 http://localhost:3000

   - **前端服务**
     ```bash
     cd client
     npm install
     npm run dev
     ```
     前端服务运行在 http://localhost:8080

### 构建生产版本

- **前端构建**
  ```bash
  cd client
  npm run build
  ```
  构建产物将生成在 `client/dist` 目录

- **后端部署**
  ```bash
  cd server
  npm run start
  ```

## 阿里云 OSS 配置

1. **创建 Bucket**
   - 登录阿里云控制台，创建一个 OSS Bucket
   - 建议设置为 **私有** 权限，通过签名 URL 访问

2. **配置 CORS**
   - 在 Bucket 权限管理中，配置 CORS 规则：
     ```json
     [
       {
         "AllowedOrigins": ["*"],
         "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
         "AllowedHeaders": ["*"],
         "ExposeHeaders": [],
         "MaxAgeSeconds": 3000
       }
     ]
     ```

3. **创建图片样式**
   - 在 Bucket 基础设置中，创建两个图片样式：
     - `thumb`：缩略图样式（建议宽度 200px）
     - `large`：大图样式（建议宽度 800px）

## API 接口

### 前端 API

- **获取分类列表**：`GET /api/categories`
- **获取照片列表**：`GET /api/photos?category=S.PHOTO.2024`
- **获取最新照片**：`GET /api/photos/recent`
- **上传照片**：`POST /api/photos`（form-data）
- **删除照片**：`DELETE /api/photos/{path}`
- **重命名照片**：`PUT /api/photos/{path}`（JSON）
- **验证管理密码**：`POST /api/auth/verify`（JSON）

## 开发指南

### 代码规范
- 前端：使用 ESLint + Prettier
- 后端：使用 ESLint

### 测试
- 运行 OSS 连接测试：`npm run test:oss`

### 常见问题

1. **图片上传失败**
   - 检查阿里云 OSS 配置是否正确
   - 确认 Bucket 权限和 CORS 配置

2. **图片不显示**
   - 检查签名 URL 是否过期
   - 确认阿里云 OSS 样式配置正确

3. **EXIF 数据提取失败**
   - 检查图片是否包含 EXIF 数据
   - 无 EXIF 数据的图片会自动归类到 S.PHOTO.0000

## 许可证

MIT License