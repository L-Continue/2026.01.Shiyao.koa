<template>
  <div class="home-view">
    <h2>分类浏览</h2>
    <div class="categories">
      <el-card
        v-for="category in categories"
        :key="category"
        class="category-card"
        @click="navigateToCategory(category)"
      >
        <div class="category-content">
          <h3>{{ category }}</h3>
          <p>{{ getCategoryYear(category) }}年相册</p>
        </div>
      </el-card>
    </div>

    <h2 v-if="recentPhotos.length > 0">最新上传</h2>
    <div class="photo-grid" v-if="recentPhotos.length > 0">
      <el-card
        v-for="photo in recentPhotos"
        :key="photo.path"
        class="photo-card"
      >
        <img
          :src="photo.thumbUrl"
          :alt="photo.name"
          class="photo-image"
          @click="openLargeImage(photo.largeUrl)"
          style="cursor: pointer;"
        />
        <div class="photo-info">
          <p class="photo-name">{{ photo.name }}</p>
          <p class="photo-date">{{ formatDate(photo.date) }}</p>
        </div>
      </el-card>
    </div>

    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-if="error" class="error">
      <el-alert
        title="加载失败"
        type="error"
        description="无法加载数据，请稍后重试"
        show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { getCategories, getRecentPhotos } from '../api/photoApi'

const router = useRouter()
const categories = ref([])
const recentPhotos = ref([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const [categoriesData, photosData] = await Promise.all([
      getCategories(),
      getRecentPhotos()
    ])
    categories.value = categoriesData
    recentPhotos.value = photosData
  } catch (err) {
    error.value = true
    console.error('加载数据失败:', err)
  } finally {
    loading.value = false
  }
})

const navigateToCategory = (category) => {
  const year = getCategoryYear(category)
  router.push(`/category/${year}`)
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

// 打开大图
const openLargeImage = (largeUrl) => {
  if (largeUrl) {
    window.open(largeUrl, '_blank')
  }
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.category-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.category-content {
  text-align: center;
  padding: 20px;
}

.category-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.category-content p {
  margin: 0;
  color: #666;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.photo-card {
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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

@media (max-width: 768px) {
  .categories {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>