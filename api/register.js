// Vercel Serverless Function - 注册接口（绕过邮件）
// Node.js 运行时格式

module.exports = async (req, res) => {
  // 只允许 POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // 解析 body（Vercel Node.js 运行时不会自动解析）
  let body = ''
  req.on('data', chunk => { body += chunk })
  await new Promise(resolve => req.on('end', resolve))
  
  let email, password
  try {
    ({ email, password } = JSON.parse(body))
  } catch {
    res.status(400).json({ error: '请求格式错误' })
    return
  }

  if (!email || !password) {
    res.status(400).json({ error: '邮箱和密码不能为空' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: '密码至少需要6位' })
    return
  }

  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wlpvbuttucrozooilfoj.supabase.co'

  if (!SERVICE_ROLE_KEY) {
    res.status(500).json({ error: '服务器未配置，请联系管理员' })
    return
  }

  try {
    // 调用 Supabase Admin API 创建用户（完全不发邮件）
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true
      })
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.message && data.message.includes('already exists')) {
        res.status(409).json({ error: '该邮箱已注册，请直接登录' })
        return
      }
      res.status(response.status).json({ error: data.message || '注册失败' })
      return
    }

    // 注册成功，自动登录获取 session
    const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    const sessionData = await loginRes.json()

    res.status(200).json({
      success: true,
      message: '注册成功！',
      session: sessionData.session || null
    })

  } catch (err) {
    console.error('[register API] 错误:', err)
    res.status(500).json({ error: '服务器内部错误，请稍后再试' })
  }
}
