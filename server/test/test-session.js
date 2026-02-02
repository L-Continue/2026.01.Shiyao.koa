// 测试session可用性
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'
const PASSWORD = '0000'
const WRONG_PASSWORD = '1234'

async function testSession() {
  console.log('开始测试session可用性...')

  // 使用一个共享的fetch实例来保持cookie
  const cookieJar = {} // 简单模拟cookie存储

  const fetchWithCookie = async (url, options = {}) => {
    const headers = { ...options.headers }
    if (Object.keys(cookieJar).length > 0) {
      headers.Cookie = Object.entries(cookieJar)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    // 保存cookie
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      setCookie.split('; ').forEach(cookie => {
        const [key, value] = cookie.split('=')
        cookieJar[key] = value
      })
    }

    return response
  }

  try {
    // 1. 测试错误密码
    console.log('步骤1: 测试错误密码...')
    let response = await fetchWithCookie(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: WRONG_PASSWORD })
    })

    let result = await response.json()
    console.log('错误密码测试结果:', result.valid ? '成功' : '失败 (预期)')

    // 2. 测试正确密码，应该设置session
    console.log('步骤2: 测试正确密码...')
    response = await fetchWithCookie(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: PASSWORD })
    })

    result = await response.json()
    console.log('正确密码测试结果:', result.valid ? '成功' : '失败')

    // 3. 测试使用session进行操作（无需再次提供密码）
    console.log('步骤3: 测试使用session进行操作...')
    response = await fetchWithCookie(`${BASE_URL}/api/categories`)
    const categories = await response.json()
    console.log('使用session获取分类成功，分类数量:', categories.length)

    console.log('Session测试完成!')

  } catch (error) {
    console.error('测试session时出错:', error)
  }
}

// 运行测试
testSession()
