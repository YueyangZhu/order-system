const jwt = require('jsonwebtoken')

// Supabase JWT 的 secret = SUPABASE_ANON_KEY 去掉 header 和 payload 重新签名
// 但最简单的方式是直接验证 token 并解析出 user_id
function extractUserId(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.decode(token)
    if (!decoded || !decoded.sub) return null
    return decoded.sub
  } catch {
    return null
  }
}

// 鉴权中间件
function requireAuth(req, res, next) {
  const userId = extractUserId(req)
  if (!userId) {
    return res.status(401).json({ error: '请先登录' })
  }
  req.userId = userId
  next()
}

module.exports = { requireAuth, extractUserId }
