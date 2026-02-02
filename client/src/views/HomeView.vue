<template>
  <div class="home-view">
    <div class="layout-container">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- Logo -->
        <div class="logo">
          <h1>Shiyao'Photos</h1>
        </div>

        <!-- 分类标签 -->
        <div class="category-tabs">
          <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
            <el-tab-pane label="最新上传" name="recent"></el-tab-pane>
            <el-tab-pane
              v-for="category in categories"
              :key="category"
              :label="getCategoryYear(category) + '年'"
              :name="category"
            ></el-tab-pane>
          </el-tabs>
        </div>

        <!-- 管理入口 -->
        <div class="manage-entry">
          <el-button type="primary" @click="goToManage">管理照片</el-button>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="content">
        <!-- 排序功能 -->
        <div class="sort-control">
          <span>排序方式：</span>
          <el-select v-model="sortBy" size="small" @change="handleSortChange">
            <el-option label="名称升序" value="name-asc"></el-option>
            <el-option label="名称降序" value="name-desc"></el-option>
          </el-select>
        </div>

        <!-- 照片网格 -->
        <div class="photo-grid">
          <el-card
            v-for="photo in displayPhotos"
            :key="photo.path"
            class="photo-card"
          >
            <img
              :src="photo.thumbUrl"
              :alt="photo.name"
              class="photo-image"
              @click="openPhotoSwipe(photo, displayPhotos)"
              style="cursor: pointer;"
            />
            <div class="photo-info">
              <p class="photo-name">{{ photo.name }}</p>
              <p class="photo-date">{{ formatDate(photo.date) }}</p>
            </div>
          </el-card>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-if="error" class="error">
          <el-alert
            title="加载失败"
            type="error"
            description="无法加载数据，请稍后重试"
            show-icon
          />
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && displayPhotos.length === 0" class="empty">
          <el-empty description="暂无照片" />
        </div>
      </div>
    </div>

    <!-- PhotoSwipe 容器 -->
    <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter"></div>
            <button class="pswp__button pswp__button--close" title="Close"></button>
            <button class="pswp__button pswp__button--share" title="Share"></button>
            <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
            <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div class="pswp__share-tooltip"></div>
          </div>
          <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
          <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
          <div class="pswp__caption">
            <div class="pswp__caption__center"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { getCategories, getRecentFiles, getFilesByCategory } from '../api/photoApi'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'

const router = useRouter()
const categories = ref([])
const recentFiles = ref([])
const categoryFiles = ref({})
const activeCategory = ref('recent')
const sortBy = ref('name-asc')
const loading = ref(true)
const error = ref(false)

// 计算属性：当前显示的文件
const displayPhotos = computed(() => {
  let photos = []
  if (activeCategory.value === 'recent') {
    photos = recentFiles.value
  } else if (categoryFiles.value[activeCategory.value]) {
    photos = categoryFiles.value[activeCategory.value]
  }

  // 排序处理
  return [...photos].sort((a, b) => {
    if (sortBy.value === 'name-asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })
})

onMounted(async () => {
  try {
    const categoriesData = await getCategories()
    categories.value = categoriesData

    // 加载最新文件
    const recentData = await getRecentFiles()
    recentFiles.value = recentData

    // 初始化分类文件数据
    categoryFiles.value = {}
    for (const category of categoriesData) {
      try {
        const photos = await getFilesByCategory(category)
        categoryFiles.value[category] = photos
      } catch (err) {
        console.error(`加载分类 ${category} 文件失败:`, err)
        categoryFiles.value[category] = []
      }
    }
  } catch (err) {
    error.value = true
    console.error('加载数据失败:', err)
  } finally {
    loading.value = false
  }
})

// 分类切换处理
const handleCategoryChange = (tab) => {
  activeCategory.value = tab.props.name
}

// 排序变更处理
const handleSortChange = () => {
  // 排序逻辑在computed属性中处理
}

// 打开PhotoSwipe
const openPhotoSwipe = (currentPhoto, allPhotos) => {
  const items = allPhotos.map(photo => ({
    src: photo.largeUrl,
    w: 1200, // 假设宽度，实际使用时可以从API获取
    h: 800,  // 假设高度，实际使用时可以从API获取
    title: photo.name,
    originalUrl: photo.url // 原图链接
  }))

  const index = allPhotos.findIndex(photo => photo.path === currentPhoto.path)

  const options = {
    index: index,
    history: false,
    focus: false,
    showAnimationDuration: 0,
    hideAnimationDuration: 0,
    // 自定义UI
    UI: {
      // 自定义按钮
      buttons: [
        'close',
        'share',
        'fullscreen',
        'zoom',
        // 自定义下载按钮
        {
          name: 'download',
          label: 'Download image',
          url: '{{originalUrl}}',
          download: true,
          type: 'button'
        },
        'counter'
      ]
    }
  }

  const pswpElement = document.querySelectorAll('.pswp')[0]
  const gallery = new PhotoSwipe(pswpElement, undefined, items, options)

  // 初始化
  gallery.init()
}

// 前往管理页面
const goToManage = () => {
  router.push('/manage')
}

const getCategoryYear = (category) => {
  const match = category.match(/S\.PHOTO\.(\d{4})/)
  return match ? match[1] : '0000'
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.layout-container {
  display: flex;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* 左侧边栏 */
.sidebar {
  width: 280px;
  background-color: #2c3e50;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.logo {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.category-tabs {
  flex: 1;
  margin-bottom: 30px;
}

.category-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.category-tabs :deep(.el-tabs__nav) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-tabs :deep(.el-tabs__active-bar) {
  background-color: #3498db;
}

.category-tabs :deep(.el-tab-pane) {
  padding: 0;
}

.category-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  padding: 12px 0;
}

.category-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
  font-weight: 500;
}

.manage-entry {
  margin-top: auto;
  text-align: center;
}

.manage-entry .el-button {
  width: 100%;
}

/* 右侧内容区 */
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.sort-control {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-control span {
  font-size: 14px;
  color: #666;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.photo-card {
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.photo-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.photo-info {
  padding: 10px;
}

.photo-name {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.photo-date {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 10px;
}

.error {
  margin: 20px 0;
}

.empty {
  margin: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 15px;
  }

  .logo {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .logo h1 {
    font-size: 20px;
  }

  .category-tabs {
    margin-bottom: 20px;
  }

  .content {
    padding: 20px;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}

/* PhotoSwipe 样式 */
:global(.pswp) {
  --pswp-bg: rgba(0, 0, 0, 0.9);
  --pswp-placeholder-bg: #222;
  --pswp-root-z-index: 200000;
  --pswp-preloader-color: rgba(255, 255, 255, 0.7);
  --pswp-icon-color: #fff;
  --pswp-icon-color-secondary: rgba(255, 255, 255, 0.7);
  --pswp-icon-stroke-color: rgba(0, 0, 0, 0.3);
  --pswp-icon-stroke-width: 1.5px;
  --pswp-caption-color: #fff;
  --pswp-counter-color: rgba(255, 255, 255, 0.7);
  --pswp-shared-transition: opacity 0.25s ease, transform 0.25s ease;
  --pswp-error-text-color: var(--pswp-caption-color);
  --pswp-error-placeholder-bg: var(--pswp-placeholder-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: var(--pswp-root-z-index);
  display: none;
  touch-action: none;
  outline: 0;
  opacity: 0.001;
  contain: layout style size;
  -webkit-tap-highlight-color: transparent;
}

:global(.pswp--open) {
  display: block;
}

:global(.pswp__bg) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: var(--pswp-bg);
  opacity: 0.001;
  will-change: opacity;
  transform: translateZ(0);
  contain: strict;
}

:global(.pswp__scroll-wrap) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: layout style size;
}

:global(.pswp__container) {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  contain: strict;
}

:global(.pswp__item) {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  display: none;
  contain: layout style size;
}

:global(.pswp__item--active) {
  display: block;
}

:global(.pswp__img) {
  position: absolute;
  width: auto;
  height: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  contain: strict;
}

:global(.pswp__img--placeholder) {
  background: var(--pswp-placeholder-bg);
}

:global(.pswp__img--error) {
  background: var(--pswp-error-placeholder-bg);
}

:global(.pswp__error-msg) {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 14px;
  line-height: 16px;
  color: var(--pswp-error-text-color);
}

:global(.pswp__preloader) {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -20px;
  margin-left: -20px;
  width: 40px;
  height: 40px;
}

:global(.pswp__preloader__icn) {
  width: 20px;
  height: 20px;
  margin: 10px;
}

:global(.pswp__preloader__cut) {
  position: relative;
  width: 10px;
  height: 20px;
  overflow: hidden;
}

:global(.pswp__preloader__donut) {
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 2px solid var(--pswp-preloader-color);
  border-left-color: transparent;
  border-radius: 50%;
  animation: pswp-spin 1s linear infinite;
  position: absolute;
  top: 0;
  left: 0;
}

@keyframes pswp-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

:global(.pswp__button) {
  position: relative;
  display: block;
  width: 44px;
  height: 44px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  cursor: pointer;
  background: none;
  border: 0;
  box-shadow: none;
  opacity: 0.8;
  transition: opacity 0.2s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pswp-icon-color);
}

:global(.pswp__button:hover) {
  opacity: 1;
}

:global(.pswp__button--close) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E") center center no-repeat;
}

:global(.pswp__button--share) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'%3E%3C/circle%3E%3Ccircle cx='6' cy='12' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='19' r='3'%3E%3C/circle%3E%3Cline x1='8.59' y1='13.51' x2='15.42' y2='17.49'%3E%3C/line%3E%3Cline x1='15.41' y1='6.51' x2='8.59' y2='10.49'%3E%3C/line%3E%3C/svg%3E") center center no-repeat;
}

:global(.pswp__button--fs) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='8' y1='3' x2='8' y2='3'%3E%3C/line%3E%3Cline x1='16' y1='3' x2='16' y2='3'%3E%3C/line%3E%3Cline x1='3' y1='8' x2='3' y2='8'%3E%3C/line%3E%3Cline x1='3' y1='16' x2='3' y2='16'%3E%3C/line%3E%3Cline x1='21' y1='8' x2='21' y2='8'%3E%3C/line%3E%3Cline x1='21' y1='16' x2='21' y2='16'%3E%3C/line%3E%3Cline x1='16' y1='21' x2='16' y2='21'%3E%3C/line%3E%3Cline x1='8' y1='21' x2='8' y2='21'%3E%3C/line%3E%3C/svg%3E") center center no-repeat;
}

:global(.pswp__button--zoom) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") center center no-repeat;
}

:global(.pswp__button--arrow--left) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='15 18 9 12 15 6'%3E%3C/polyline%3E%3C/svg%3E") center center no-repeat;
  left: 0;
}

:global(.pswp__button--arrow--right) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'%3E%3C/polyline%3E%3C/svg%3E") center center no-repeat;
  right: 0;
}

:global(.pswp__ui) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

:global(.pswp__top-bar) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  z-index: 1;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}

:global(.pswp__counter) {
  color: var(--pswp-counter-color);
  font-size: 14px;
  line-height: 44px;
  padding: 0 10px;
}

:global(.pswp__caption) {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  color: var(--pswp-caption-color);
  font-size: 14px;
}

:global(.pswp__caption__center) {
  max-width: 90%;
  margin: 0 auto;
}

:global(.pswp__share-modal) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

:global(.pswp__share-tooltip) {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  max-width: 300px;
  text-align: center;
}

:global(.pswp__button--download) {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'%3E%3C/path%3E%3Cpath d='M12 12V17'%3E%3C/path%3E%3Cpath d='M9 15L12 12L15 15'%3E%3C/path%3E%3C/svg%3E") center center no-repeat;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    padding: 15px;
  }

  .content {
    padding: 20px;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>