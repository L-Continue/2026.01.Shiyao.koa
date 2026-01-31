<template>
  <div class="manage-view">
    <div class="manage-header">
      <h2>照片管理</h2>
      <el-button type="danger" @click="handleLogout">退出管理</el-button>
    </div>

    <div class="manage-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <h3>上传照片</h3>
        <el-upload
          class="upload-demo"
          drag
          action="http://localhost:3000/api/photos"
          name="file"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-progress="handleUploadProgress"
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :limit="10"
          :file-list="fileList"
          :auto-upload="true"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖放文件到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              请上传 JPG、PNG、GIF 格式的图片，单张图片大小不超过 1GB
            </div>
          </template>
        </el-upload>

        <div v-if="uploading" class="upload-progress">
          <el-progress :percentage="uploadPercentage" :status="uploadStatus" />
          <p>{{ uploadMessage }}</p>
        </div>
      </div>

      <!-- 照片管理区域 -->
      <div class="photos-section">
        <h3>照片列表</h3>
        <el-input
          v-model="searchQuery"
          placeholder="搜索照片"
          clearable
          style="margin-bottom: 20px;"
        />

        <el-tabs v-model="activeCategory">
          <el-tab-pane label="全部照片" name="all">
            <el-table :data="filteredPhotos" style="width: 100%">
              <el-table-column prop="name" label="文件名" width="300">
                <template #default="scope">
                  <a href="javascript:void(0)" @click="openLargeImage(scope.row.largeUrl)">{{ scope.row.name }}</a>
                </template>
              </el-table-column>
              <el-table-column prop="path" label="路径" width="400" />
              <el-table-column prop="size" label="大小" width="100">
                <template #default="scope">
                  {{ formatSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleRename(scope.row)">
                    重命名
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane
            v-for="category in categories"
            :key="category"
            :label="category"
            :name="category"
          >
            <el-table :data="getPhotosByCategory(category)" style="width: 100%">
              <el-table-column prop="name" label="文件名" width="300">
                <template #default="scope">
                  <a href="javascript:void(0)" @click="openLargeImage(scope.row.largeUrl)">{{ scope.row.name }}</a>
                </template>
              </el-table-column>
              <el-table-column prop="path" label="路径" width="400" />
              <el-table-column prop="size" label="大小" width="100">
                <template #default="scope">
                  {{ formatSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleRename(scope.row)">
                    重命名
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 重命名弹窗 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名照片"
      width="400px"
    >
      <el-form
        :model="renameForm"
        :rules="renameRules"
        ref="renameFormRef"
        label-width="80px"
      >
        <el-form-item label="原文件名" disabled>
          <el-input v-model="renameForm.oldName" />
        </el-form-item>
        <el-form-item label="新文件名" prop="newName">
          <el-input v-model="renameForm.newName" placeholder="请输入新文件名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRename" :loading="renaming">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 上传相关
const fileList = ref([])
const uploading = ref(false)
const uploadPercentage = ref(0)
const uploadStatus = ref('')
const uploadMessage = ref('')

// 照片管理相关
const photos = ref([])
const categories = ref([])
const activeCategory = ref('all')
const searchQuery = ref('')

// 重命名相关
const renameDialogVisible = ref(false)
const renameForm = ref({ oldName: '', newName: '' })
const renameRules = {
  newName: [
    { required: true, message: '请输入新文件名', trigger: 'blur' }
  ]
}
const renameFormRef = ref(null)
const renaming = ref(false)
const currentPhoto = ref(null)

// 计算属性：过滤后的照片
const filteredPhotos = computed(() => {
  if (!searchQuery.value) return photos.value
  return photos.value.filter(photo =>
    photo.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 生命周期
onMounted(() => {
  fetchPhotos()
  fetchCategories()
})

// 获取照片列表
const fetchPhotos = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/photos')
    const result = await response.json()
    if (result.success) {
      // 扁平化照片列表
      const allPhotos = []
      result.data.forEach(category => {
        category.photos.forEach(photo => {
          allPhotos.push({
            ...photo,
            category: category.name
          })
        })
      })
      photos.value = allPhotos
    }
  } catch (error) {
    console.error('获取照片列表失败:', error)
    ElMessage.error('获取照片列表失败，请稍后重试')
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/categories')
    const result = await response.json()
    if (result.success) {
      categories.value = result.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败，请稍后重试')
  }
}

// 按分类获取照片
const getPhotosByCategory = (category) => {
  return photos.value.filter(photo => photo.category === category)
}

// 上传相关方法
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt1G = file.size / 1024 / 1024 / 1024 < 1

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt1G) {
    ElMessage.error('图片大小不能超过 1GB！')
    return false
  }

  return true
}

const handleFileChange = (file, files) => {
  fileList.value = files
}

const handleUploadProgress = (event, uploadFile, uploadFiles) => {
  uploadPercentage.value = Math.round((event.loaded / event.total) * 100)
}

const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  uploadPercentage.value = 100
  uploadStatus.value = 'success'
  uploadMessage.value = '上传成功！'

  if (uploadFiles.length === uploadFiles.filter(file => file.status === 'success').length) {
    setTimeout(() => {
      uploading.value = false
      fileList.value = []
      // 刷新照片列表
      fetchPhotos()
      fetchCategories()
    }, 1000)
  }
}

const handleUploadError = (error, uploadFile, uploadFiles) => {
  uploadStatus.value = 'exception'
  uploadMessage.value = '上传失败，请稍后重试'

  setTimeout(() => {
    uploading.value = false
  }, 1000)
}

// 删除照片
const handleDelete = async (photo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除照片 "${photo.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await fetch(`http://localhost:3000/api/photos/${encodeURIComponent(photo.path)}`, {
      method: 'DELETE'
    })

    const result = await response.json()
    if (result.success) {
      ElMessage.success('删除成功')
      // 刷新照片列表
      fetchPhotos()
      fetchCategories()
    } else {
      ElMessage.error('删除失败: ' + result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除照片失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 重命名照片
const handleRename = (photo) => {
  currentPhoto.value = photo
  renameForm.value = {
    oldName: photo.name,
    newName: photo.name
  }
  renameDialogVisible.value = true
}

const submitRename = async () => {
  if (!renameFormRef.value) return

  await renameFormRef.value.validate(async (valid) => {
    if (valid) {
      renaming.value = true
      try {
        const response = await fetch(`http://localhost:3000/api/photos/${encodeURIComponent(currentPhoto.value.path)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newName: renameForm.value.newName })
        })

        const result = await response.json()
        if (result.success) {
          ElMessage.success('重命名成功')
          renameDialogVisible.value = false
          // 刷新照片列表
          fetchPhotos()
        } else {
          ElMessage.error('重命名失败: ' + result.message)
        }
      } catch (error) {
        console.error('重命名照片失败:', error)
        ElMessage.error('重命名失败，请稍后重试')
      } finally {
        renaming.value = false
      }
    }
  })
}

// 退出管理
const handleLogout = () => {
  router.push('/')
}

// 工具方法：格式化文件大小
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 打开大图
const openLargeImage = (largeUrl) => {
  if (largeUrl) {
    window.open(largeUrl, '_blank')
  }
}

// 打开原图
const openOriginalImage = (originalUrl) => {
  if (originalUrl) {
    window.open(originalUrl, '_blank')
  }
}
</script>

<style scoped>
.manage-view {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.manage-header h2 {
  margin: 0;
  color: #333;
}

.manage-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.upload-section,
.photos-section {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-section h3,
.photos-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.upload-progress {
  margin-top: 20px;
}

.upload-progress p {
  margin-top: 10px;
  text-align: center;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>