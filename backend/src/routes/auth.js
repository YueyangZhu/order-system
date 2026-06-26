const express = require('express')
const router = express.Router()
const { adminClient, anonClient } = require('../lib/supabase')

// 注册（不发送邮件）
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6位' })
  }

  try {
    // 用 Admin API 创建用户（不触发邮件）
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: '该邮箱已注册' })
      }
      return res.status(400).json({ error: error.message })
    }

    // 注册成功后自动登录
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      return res.status(200).json({
        success: true,
        message: '注册成功，请登录',
        user: { id: data.user.id, email: data.user.email }
      })
    }

    res.status(200).json({
      success: true,
      message: '注册成功',
      session: loginData.session,
      user: { id: data.user.id, email: data.user.email }
    })

  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

module.exports = router
