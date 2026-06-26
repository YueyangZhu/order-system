<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5">
    <el-card style="width: 420px">
      <template #header>
        <h2 style="text-align: center; margin: 0">订单管理系统</h2>
        <p style="text-align: center; color: #909399; margin: 8px 0 0; font-size: 14px">{{ isLoginMode ? '请登录' : '注册新账号' }}</p>
      </template>

      <el-input v-model="email" placeholder="邮箱地址" size="large" style="margin-bottom:16px" @keyup.enter="submit" />
      <el-input v-model="password" type="password" placeholder="密码（至少6位）" size="large" show-password style="margin-bottom:20px" @keyup.enter="submit" />

      <div v-if="errorMsg" style="margin-bottom:12px;padding:8px 12px;background:#fef0f0;border-radius:4px;color:#f56c6c;font-size:13px">{{ errorMsg }}</div>
      <div v-if="successMsg" style="margin-bottom:12px;padding:8px 12px;background:#f0f9eb;border-radius:4px;color:#67c23a;font-size:13px">{{ successMsg }}</div>

      <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="submit">
        {{ isLoginMode ? '登 录' : '注 册' }}
      </el-button>

      <div style="text-align:center;margin-top:16px;font-size:14px">
        <span style="color:#606266">{{ isLoginMode ? '没有账号？' : '已有账号？' }}</span>
        <el-button type="text" @click="toggleMode" style="color:#409EFF;padding:0;font-size:14px">{{ isLoginMode ? '去注册' : '去登录' }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createClient } from '@supabase/supabase-js'
import apiHelper from '../lib/api'

const SUPABASE_URL = 'https://wlpvbuttucrozooilfoj.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscHZidXR0dWNyb3pvb2lsZm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzODAzNTEsImV4cCI6MjA5Nzk1NjM1MX0.-4P6rnlbO3ZrgNZcwvWl5KKcBC0ICE0lKhcTdEMhh9Y'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const isLoginMode = ref(true)

const toggleMode = () => { isLoginMode.value = !isLoginMode.value; errorMsg.value = ''; successMsg.value = '' }

const submit = async () => {
  errorMsg.value = ''; successMsg.value = ''
  email.value = (email.value || '').trim()
  if (!password.value || password.value.length < 6) { errorMsg.value = '密码至少6位'; return }
  if (!email.value || !email.value.includes('@') || !email.value.includes('.')) { errorMsg.value = '邮箱格式不正确'; return }

  loading.value = true
  try {
    if (isLoginMode.value) {
      // 登录 - 直接调 Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error) throw new Error(error.message)
      localStorage.setItem('sb-session', JSON.stringify(data.session))
      ElMessage.success('登录成功！')
      router.push('/orders')
    } else {
      // 注册 - 调后端 API（不触发邮件）
      const result = await apiHelper.api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: email.value, password: password.value })
      })

      if (result.session) {
        localStorage.setItem('sb-session', JSON.stringify(result.session))
        ElMessage.success('注册成功！')
        router.push('/orders')
      } else {
        // 注册成功但没自动登录，直接登录一次
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.value, password: password.value
        })
        if (loginError) throw new Error(loginError.message)
        localStorage.setItem('sb-session', JSON.stringify(loginData.session))
        ElMessage.success('注册并登录成功！')
        router.push('/orders')
      }
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
