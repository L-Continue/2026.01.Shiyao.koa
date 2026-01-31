# 相册墙项目说明（readme2）

## 项目概述

本项目是一个**相册墙网站**，前后端分离：前端使用 Vue 3 + Vite，后端使用 Koa 2，图片存储使用阿里云 OSS。支持按拍摄日期自动分类、EXIF 提取、多尺寸展示和密码保护的管理功能。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3、Vite、Vue Router、Pinia、Element Plus、Axios |
| **后端** | Node.js、Koa 2、@koa/router、@koa/multer、@koa/cors、koa-bodyparser |
| **存储与工具** | 阿里云 OSS（ali-oss）、exifr（EXIF 提取）、dotenv |

---

## 项目结构

```
.
├── client/                 # 前端（Vue 3 + Vite）
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js      # 开发时 /api 代理到 3000 端口
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── api/photoApi.js       # 照片相关 API 封装
│       ├── router/index.js      # 路由：首页、分类、管理
│       ├── components/          # PasswordDialog、UploadDialog
│       └── views/               # HomeView、CategoryView、ManageView
├── server/                 # 后端（Koa 2）
│   ├── package.json
│   ├── test-oss.js         # OSS 连接测试
│   └── src/
│       ├── server.js       # 入口
│       ├── config/         # config.js、alioss.js
│       ├── controllers/    # authController、photoController
│       ├── routes/routes.js
│       ├── services/ossService.js
│       └── utils/exifUtils.js
├── README.md
└── readme2.md              # 本文件
```

---

## 功能概览

- **浏览相册**：首页展示分类，按年份（如 S.PHOTO.2024）进入分类查看照片。
- **多尺寸展示**：缩略图（thumb）、大图（large）、原图，通过 OSS 签名 URL 访问。
- **管理相片**：点击「管理相片」输入密码（默认 `0000`）进入管理页，支持上传、删除、重命名。
- **上传与分类**：上传时提取 EXIF 拍摄日期，按年份存入 `S.PHOTO.YYYY`；无 EXIF 的归入 `S.PHOTO.0000`。
- **安全访问**：使用 OSS 签名 URL，无需将 Bucket 设为公共读。

---

## 本地运行

### 环境要求

- Node.js 16+
- npm 7+

### 1. 后端

```bash
cd server
cp .env.example .env   # 若无示例，则新建 .env
# 编辑 .env，填入 OSS 与服务器配置
npm install
npm run dev            # 开发：nodemon，默认 http://localhost:3000
# 或 npm run start     # 生产：node src/server.js
```

### 2. 前端

```bash
cd client
npm install
npm run dev            # 默认 http://localhost:8080，/api 代理到 3000
```

### 3. 生产构建

- 前端：`cd client && npm run build`，产物在 `client/dist`。
- 后端：`cd server && npm run start`。

---

## 环境变量（server/.env）

| 变量名 | 说明 |
|--------|------|
| `SERVER_PORT` | 服务端口，默认 3000 |
| `SERVER_HOST` | 监听地址，默认 localhost |
| `OSS_REGION` | OSS 区域，如 oss-cn-shenzhen |
| `OSS_ACCESS_KEY_ID` | 阿里云 AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |
| `OSS_BUCKET` | Bucket 名称 |
| `OSS_ENDPOINT` | OSS 端点 URL |
| `OSS_EXPTIME` | 签名 URL 有效期（秒），如 3600 |
| `OSS_MAXSIZE` | 单文件上传最大字节数 |
| `MANAGE_PASSWORD` | 管理后台密码，默认 0000 |

---

## API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 健康检查 |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/photos` | 照片列表（query: category） |
| GET | `/api/photos/recent` | 最新照片 |
| POST | `/api/photos` | 上传照片（form-data） |
| DELETE | `/api/photos/:path` | 删除照片 |
| PUT | `/api/photos/:path` | 重命名照片（JSON body） |
| POST | `/api/auth/verify` | 验证管理密码（JSON body） |

---

## 阿里云 OSS 准备

1. **Bucket**：建议私有，通过签名 URL 访问。
2. **CORS**：在 Bucket 中配置 CORS，允许前端域名或 `*`、GET/POST/PUT/DELETE、常用 Headers。
3. **图片样式**：在 Bucket 中配置 `thumb`（如缩略 200px）、`large`（如 800px），与 `server/src/config/alioss.js` 中的 `styles` 一致。

---

## 测试与排错

- 后端目录下运行 OSS 测试（若已配置脚本）：`npm run test:oss` 或 `node test-oss.js`。
- 上传失败：检查 `.env` 中 OSS 配置、Bucket 权限与 CORS。
- 图片不显示：确认签名 URL 未过期、OSS 样式名称与代码一致。
- 无 EXIF 的图片会归入 `S.PHOTO.0000`。

---

## 许可证

MIT License
