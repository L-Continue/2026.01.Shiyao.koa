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

// 获取指定分类的照片列表
export const getPhotosByCategory = async (category) => {
  try {
    const response = await apiClient.get('/photos', {
      params: { category }
    })
    return response.data
  } catch (error) {
    console.error('获取照片列表失败:', error)
    throw error
  }
}

// 获取最新上传的照片
export const getRecentPhotos = async () => {
  try {
    const response = await apiClient.get('/photos/recent')
    return response.data
  } catch (error) {
    console.error('获取最新照片失败:', error)
    throw error
  }
}

// 删除照片
export const deletePhoto = async (path) => {
  try {
    await apiClient.delete(`/photos/${encodeURIComponent(path)}`)
  } catch (error) {
    console.error('删除照片失败:', error)
    throw error
  }
}

// 重命名照片
export const renamePhoto = async (oldPath, newName) => {
  try {
    await apiClient.put(`/photos/${encodeURIComponent(oldPath)}`, {
      newName
    })
  } catch (error) {
    console.error('重命名照片失败:', error)
    throw error
  }
}

// 上传照片
// 注意：实际上传由 el-upload 组件处理，此函数仅作为参考
export const uploadPhoto = async (formData) => {
  try {
    const response = await apiClient.post('/photos', formData, {
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
    console.error('上传照片失败:', error)
    throw error
  }
}