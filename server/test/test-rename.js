// 测试文件重命名功能
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')

const TEST_IMAGE = path.join(__dirname, 'image.jpg')
const BASE_URL = 'http://localhost:3000'
const PASSWORD = '0000'

async function testRenameFile() {
  console.log('开始测试文件重命名功能...')

  try {
    // 1. 先上传一张图片用于测试重命名
    console.log('步骤1: 上传测试文件...')
    const formData = new FormData()
    formData.append('file', fs.createReadStream(TEST_IMAGE))
    formData.append('password', PASSWORD)

    const uploadResponse = await axios.post(`${BASE_URL}/api/files`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    })

    const uploadResult = uploadResponse.data
    if (!uploadResult.success) {
      console.error('上传文件失败:', uploadResult.error)
      return
    }

    const oldPath = uploadResult.path
    console.log('上传成功，原始文件路径:', oldPath)

    // 2. 测试重命名文件
    console.log('步骤2: 重命名测试文件...')
    const newName = 'test_rename_' + Date.now()
    const renameResponse = await axios.put(`${BASE_URL}/api/files/${encodeURIComponent(oldPath)}`, {
      newName: newName,
      password: PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const renameResult = renameResponse.data
    if (renameResult.success) {
      console.log('重命名文件成功!')
      console.log('新文件名:', newName + path.extname(oldPath))
    } else {
      console.error('重命名文件失败:', renameResult.error)
    }

    // 3. 清理：删除测试文件
    console.log('步骤3: 清理测试文件...')
    const newPath = oldPath.replace(path.basename(oldPath, path.extname(oldPath)), newName)
    await axios.delete(`${BASE_URL}/api/files/${encodeURIComponent(newPath)}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: { password: PASSWORD }
    })

  } catch (error) {
    console.error('测试文件重命名功能时出错:', error)
  }
}

// 运行测试
testRenameFile()
