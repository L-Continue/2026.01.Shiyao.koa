// 测试文件删除功能
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')

const TEST_IMAGE = path.join(__dirname, 'image.jpg')
const BASE_URL = 'http://localhost:3000'
const PASSWORD = '0000'

async function testDeleteFile() {
  console.log('开始测试文件删除功能...')

  try {
    // 1. 先上传一张图片用于测试删除
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

    const filePath = uploadResult.path
    console.log('上传成功，文件路径:', filePath)

    // 2. 测试删除文件
    console.log('步骤2: 删除测试文件...')
    const deleteResponse = await axios.delete(`${BASE_URL}/api/files/${encodeURIComponent(filePath)}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ password: PASSWORD })
    })

    const deleteResult = deleteResponse.data
    if (deleteResult.success) {
      console.log('删除文件成功!')
    } else {
      console.error('删除文件失败:', deleteResult.error)
    }

  } catch (error) {
    console.error('测试文件删除功能时出错:', error)
  }
}

// 运行测试
testDeleteFile()
