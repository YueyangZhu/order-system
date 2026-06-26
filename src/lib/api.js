// 后端 API 配置
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// 获取存储的 session
function getSession() {
  try {
    const raw = localStorage.getItem('sb-session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// 通用请求方法
async function api(path, options = {}) {
  const session = getSession()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`)
  }
  return data
}

export default { api, getSession }
