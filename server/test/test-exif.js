// 测试 exif 信息读取功能
const path = require('path');
const exifUtils = require('../src/utils/exifUtils');

async function testExifRead() {
  console.log('开始测试 exif 信息读取功能...');

  try {
    // 测试图片路径
    const testImagePath = path.join(__dirname, 'image.jpg');
    console.log(`测试图片路径: ${testImagePath}`);

    // 测试生成 OSS 路径
    console.log('\n1. 测试生成 OSS 路径:');
    const ossPath = await exifUtils.generateOssPath(testImagePath);
    console.log(`生成的 OSS 路径: ${ossPath}`);
    console.log('✓ 生成 OSS 路径成功');

    // 测试提取日期
    console.log('\n2. 测试提取日期:');
    const exif = await exifUtils.readExif(testImagePath);
    const date = exifUtils.extractDate(exif);
    console.log(`从 EXIF 提取的日期: ${date}`);
    console.log('✓ 提取日期成功');

    // 测试获取图片年份
    console.log('\n3. 测试获取图片年份:');
    const year = await exifUtils.getImageYear(testImagePath);
    console.log(`从 EXIF 提取的年份: ${year}`);
    console.log('✓ 获取图片年份成功');

    // 测试生成文件名
    console.log('\n4. 测试生成文件名:');
    const fileName = await exifUtils.generateFileName(testImagePath);
    console.log(`生成的文件名: ${fileName}`);
    console.log('✓ 生成文件名成功');

    console.log('\n✅ 所有 exif 信息读取测试通过!');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testExifRead();
