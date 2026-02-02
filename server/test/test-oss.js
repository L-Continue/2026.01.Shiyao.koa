const path = require('path');
// 加载.env文件，确保从项目根目录加载
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// 检查环境变量是否存在
function checkEnvVars() {
  const requiredVars = [
    'OSS_REGION',
    'OSS_ACCESS_KEY_ID',
    'OSS_ACCESS_KEY_SECRET',
    'OSS_BUCKET',
    'OSS_ENDPOINT'
  ];

  const missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('缺少必要的环境变量:');
    for (const varName of missingVars) {
      console.error(`  - ${varName}`);
    }
    console.error('\n请创建 .env 文件并配置正确的 OSS 凭证。');
    return false;
  }

  return true;
}

// 如果环境变量存在，才导入和测试 OSS
if (checkEnvVars()) {
  try {
    const { client } = require('../src/config/alioss');

    // 测试连接
    async function testOSS() {
      try {
        console.log('测试OSS连接...');
        // 尝试获取根目录列表
        const result = await client.list({ delimiter: '/' });
        console.log('连接成功!');
        console.log('根目录文件数:', result.objects.length);
        console.log('根目录文件夹数:', result.prefixes.length);
        console.log('文件夹列表:', result.prefixes);
      } catch (error) {
        console.error('连接失败:', error.message);
      }
    }

    testOSS();
  } catch (error) {
    console.error('初始化 OSS 客户端失败:', error.message);
  }
}