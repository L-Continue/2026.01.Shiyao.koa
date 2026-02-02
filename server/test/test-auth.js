// 测试密码验证功能
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'
const PASSWORD = '0000'
const WRONG_PASSWORD = '1234'

async function testAuth() {
  console.log('开始测试密码验证功能...')

  try {
    // 1. 测试空密码
    console.log('步骤1: 测试空密码...')
    let response = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    let result = await response.json()
    console.log('空密码测试结果:', result.valid ? '成功' : '失败 (预期)')
    console.log('空密码测试消息:', result.message)

    // 2. 测试错误密码
    console.log('步骤2: 测试错误密码...')
    response = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: WRONG_PASSWORD })
    })

    result = await response.json()
    console.log('错误密码测试结果:', result.valid ? '成功' : '失败 (预期)')
    console.log('错误密码测试消息:', result.message)

    // 3. 测试正确密码
    console.log('步骤3: 测试正确密码...')
    response = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: PASSWORD })
    })

    result = await response.json()
    console.log('正确密码测试结果:', result.valid ? '成功' : '失败')
    console.log('正确密码测试消息:', result.message)

    // 4. 测试无权限操作（未验证密码）
    console.log('步骤4: 测试无权限操作...')
    response = await fetch(`${BASE_URL}/api/categories`, {
      method: 'GET'
    })

    const categories = await response.json()
    console.log('无权限获取分类测试结果:', Array.isArray(categories) ? '成功' : '失败')
    console.log('分类数量:', Array.isArray(categories) ? categories.length : 'N/A')

    console.log('密码验证测试完成!')

  } catch (error) {
    console.error('测试密码验证时出错:', error)
  }
}

// 运行测试
testAuth()
