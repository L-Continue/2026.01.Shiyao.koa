require('dotenv').config();

console.log('OSS_ACCESS_KEY_ID', process.env.OSS_ACCESS_KEY_ID);

const { client, config } = require('./src/config/alioss')

console.log('OSS 配置:', config);

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
    console.error('连接失败:', error);
  }
}

testOSS();