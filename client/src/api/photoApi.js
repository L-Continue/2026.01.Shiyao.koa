import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000
})

// 获取分类列表
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories')
    return response.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    throw error
  }
}

// 获取指定分类的文件列表
export const getFilesByCategory = async (category) => {
  try {
    const response = await apiClient.get('/files', {
      params: { category }
    })
    return response.data
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

// 获取最新上传的文件
export const getRecentFiles = async () => {
  try {
    const response = await apiClient.get('/files/recent')
    return response.data
  } catch (error) {
    console.error('获取最新文件失败:', error)
    throw error
  }
}

// 删除文件
export const deleteFile = async (path) => {
  try {
    await apiClient.delete(`/files/${encodeURIComponent(path)}`)
  } catch (error) {
    console.error('删除文件失败:', error)
    throw error
  }
}

// 重命名文件
export const renameFile = async (oldPath, newName) => {
  try {
    await apiClient.put(`/files/${encodeURIComponent(oldPath)}`, {
      newName
    })
  } catch (error) {
    console.error('重命名文件失败:', error)
    throw error
  }
}

// 上传文件
// 注意：实际上传由 el-upload 组件处理，此函数仅作为参考
export const uploadFile = async (formData) => {
  try {
    const response = await apiClient.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log('上传进度:', percentCompleted)
      }
    })
    return response.data
  } catch (error) {
    console.error('上传文件失败:', error)
    throw error
  }
}

// 为了保持向后兼容性，保留旧的方法名
export const getPhotosByCategory = getFilesByCategory
export const getRecentPhotos = getRecentFiles
export const deletePhoto = deleteFile
export const renamePhoto = renameFile
export const uploadPhoto = uploadFile