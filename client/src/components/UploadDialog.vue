<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传图片"
    width="600px"
  >
    <el-upload
      class="upload-demo"
      drag
      action="http://localhost:3000/api/photos"
      name="file"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :before-upload="beforeUpload"
      :on-change="handleChange"
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

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">
          开始上传
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const fileList = ref([])
const uploading = ref(false)
const uploadPercentage = ref(0)
const uploadStatus = ref('')
const uploadMessage = ref('')

const open = () => {
  dialogVisible.value = true
  fileList.value = []
  uploadPercentage.value = 0
  uploadStatus.value = ''
  uploadMessage.value = ''
}

const submitUpload = () => {
  // 由于已经设置为自动上传，此方法可以简化
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  // 上传会在选择文件后自动开始
  uploading.value = true
  uploadStatus.value = ''
  uploadMessage.value = '正在上传...'
}

const handleSuccess = (response, uploadFile, uploadFiles) => {
  uploadPercentage.value = 100
  uploadStatus.value = 'success'
  uploadMessage.value = '上传成功！'

  if (uploadFiles.length === uploadFiles.filter(file => file.status === 'success').length) {
    setTimeout(() => {
      dialogVisible.value = false
      uploading.value = false
      fileList.value = []
      // 刷新页面或通知父组件
      window.location.reload()
    }, 1000)
  }
}

const handleError = (error, uploadFile, uploadFiles) => {
  uploadStatus.value = 'exception'
  uploadMessage.value = '上传失败，请稍后重试'

  setTimeout(() => {
    uploading.value = false
  }, 1000)
}

const handleProgress = (event, uploadFile, uploadFiles) => {
  uploadPercentage.value = Math.round((event.loaded / event.total) * 100)
}

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

const handleChange = (file, files) => {
  fileList.value = files
}

defineExpose({
  open
})
</script>

<style scoped>
.upload-progress {
  margin-top: 20px;
}

.upload-progress p {
  margin-top: 10px;
  text-align: center;
  color: #666;
}
</style>