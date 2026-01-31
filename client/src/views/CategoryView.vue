<template>
  <div class="category-view">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item><router-link to="/">首页</router-link></el-breadcrumb-item>
      <el-breadcrumb-item>{{ categoryYear }}年相册</el-breadcrumb-item>
    </el-breadcrumb>

    <h2>{{ categoryYear }}年相册</h2>

    <div class="photo-grid">
      <el-card
        v-for="photo in photos"
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
          <div class="photo-actions">
            <el-button
              type="info"
              size="small"
              @click="openOriginalImage(photo.url)"
              round
            >
              查看原图
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deletePhotoHandler(photo.path)"
              round
            >
              删除
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="renamePhotoHandler(photo)"
              round
            >
              重命名
            </el-button>
          </div>
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

    <div v-if="photos.length === 0 && !loading" class="empty">
      <el-empty description="暂无照片" />
    </div>

    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名照片"
      width="500px"
    >
      <el-form :model="renameForm" label-width="80px">
        <el-form-item label="新文件名">
          <el-input v-model="renameForm.newName" placeholder="请输入新文件名（无需扩展名）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { getPhotosByCategory, deletePhoto as apiDeletePhoto, renamePhoto as apiRenamePhoto } from '../api/photoApi'
import { ElMessage } from 'element-plus'

const route = useRoute()
const categoryYear = computed(() => route.params.year || '0000')
const photos = ref([])
const loading = ref(true)
const error = ref(false)

// 重命名相关
const renameDialogVisible = ref(false)
const renameForm = ref({ newName: '' })
const currentPhoto = ref(null)

onMounted(async () => {
  await loadPhotos()
})

const loadPhotos = async () => {
  loading.value = true
  error.value = false

  try {
    const category = `S.PHOTO.${categoryYear.value}`
    photos.value = await getPhotosByCategory(category)
  } catch (err) {
    error.value = true
    console.error('加载照片失败:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const deletePhotoHandler = async (path) => {
  try {
    await apiDeletePhoto(path)
    await loadPhotos()
    ElMessage.success('删除成功')
  } catch (err) {
    ElMessage.error('删除失败，请稍后重试')
    console.error('删除照片失败:', err)
  }
}

const renamePhotoHandler = (photo) => {
  currentPhoto.value = photo
  const fileName = photo.name.split('.')[0]
  renameForm.value.newName = fileName
  renameDialogVisible.value = true
}

const confirmRename = async () => {
  if (!renameForm.value.newName) {
    ElMessage.warning('请输入新文件名')
    return
  }

  try {
    await apiRenamePhoto(currentPhoto.value.path, renameForm.value.newName)
    await loadPhotos()
    renameDialogVisible.value = false
    ElMessage.success('重命名成功')
  } catch (err) {
    ElMessage.error('重命名失败，请稍后重试')
    console.error('重命名照片失败:', err)
  }
}

// 打开大图
const openLargeImage = (largeUrl) => {
  if (largeUrl) {
    window.open(largeUrl, '_blank')
  }
}

// 打开原图
const openOriginalImage = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.category-view {
  max-width: 1200px;
  margin: 0 auto;
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
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #666;
}

.photo-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>