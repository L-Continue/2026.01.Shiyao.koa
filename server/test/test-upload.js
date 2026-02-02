// 测试文件上传功能
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  console.log('开始测试文件上传功能...');

  try {
    // 测试图片路径
    const testImagePath = path.join(__dirname, 'image.jpg');
    console.log(`测试图片路径: ${testImagePath}`);

    // 检查图片是否存在
    if (!fs.existsSync(testImagePath)) {
      throw new Error('测试图片不存在');
    }

    // 创建 FormData
    const formData = new FormData();
    const fileStream = fs.createReadStream(testImagePath);

    // 添加文件和密码
    formData.append('file', fileStream, 'test-image.jpg');
    formData.append('password', '0000'); // 默认密码

    // 发送上传请求
    console.log('\n发送上传请求...');
    const response = await axios.post('http://localhost:3000/api/files', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('上传响应:', response.data);

    if (response.data.success) {
      console.log('✓ 文件上传成功');
      console.log(`上传的文件路径: ${response.data.path}`);
      console.log(`上传的文件URL: ${response.data.url}`);

      // 保存上传的文件路径，用于后续测试
      fs.writeFileSync(path.join(__dirname, 'uploaded-image.json'), JSON.stringify({
        path: response.data.path,
        name: response.data.name,
        url: response.data.url
      }, null, 2));

      console.log('\n✅ 文件上传测试通过!');
    } else {
      throw new Error('上传失败: ' + response.data.error);
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testUpload();
