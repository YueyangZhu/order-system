const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wlpvbuttucrozooilfoj.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SERVICE_ROLE_KEY) {
  console.warn('[警告] SUPABASE_SERVICE_ROLE_KEY 未设置，注册功能不可用')
}

// Admin 客户端（service_role，拥有全部权限）
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || '', {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Anon 客户端（用于验证 token）
const anonClient = createClient(SUPABASE_URL, ANON_KEY || '')

module.exports = { adminClient, anonClient, SUPABASE_URL, SERVICE_ROLE_KEY, ANON_KEY }
