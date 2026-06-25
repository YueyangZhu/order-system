<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5">
    <el-card style="width: 420px">
      <template #header>
        <h2 style="text-align: center; margin: 0">订单管理系统</h2>
        <p style="text-align: center; color: #909399; margin: 8px 0 0; font-size: 14px">{{ isLoginMode ? '请登录' : '注册新账号' }}</p>
      </template>

      <!-- 简单表单，不用 el-form 验证 -->
      <div style="margin-bottom: 16px">
        <label style="display: block; margin-bottom: 4px; font-size: 14px">邮箱</label>
        <el-input
          v-model="email"
          placeholder="输入你的邮箱地址"
          size="large"
          @keyup.enter="submit"
        />
      </div>

      <div style="margin-bottom: 20px">
        <label style="display: block; margin-bottom: 4px; font-size: 14px">密码（至少6位）</label>
        <el-input
          v-model="password"
          type="password"
          placeholder="输入密码"
          size="large"
          show-password
          @keyup.enter="submit"
        />
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg" style="margin-bottom: 12px; padding: 8px 12px; background: #fef0f0; border-radius: 4px; color: #f56c6c; font-size: 13px">
        {{ errorMsg }}
      </div>

      <!-- 成功提示 -->
      <div v-if="successMsg" style="margin-bottom: 12px; padding: 8px 12px; background: #f0f9eb; border-radius: 4px; color: #67c23a; font-size: 13px">
        {{ successMsg }}
      </div>

      <el-button
        type="primary"
        size="large"
        style="width: 100%"
        :loading="loading"
        @click="submit"
      >
        {{ isLoginMode ? '登 录' : '注 册' }}
      </el-button>

      <div style="text-align: center; margin-top: 16px; font-size: 14px">
        <span style="color: #606266">{{ isLoginMode ? '没有账号？' : '已有账号？' }}</span>
        <el-button type="text" @click="toggleMode" style="color: #409EFF; padding: 0; font-size: 14px">
          {{ isLoginMode ? '去注册' : '去登录' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

// 直接 import，不依赖动态环境变量
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wlpvbuttucrozooilfoj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscHZidXR0dWNyb3pvb2lsZm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzODAzNTEsImV4cCI6MjA5Nzk1NjM1MX0.-4P6rnlbO3ZrgNZcwvWl5KKcBC0ICE0lKhcTdEMhh9Y'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const isLoginMode = ref(true)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMsg.value = ''
  successMsg.value = ''
}

const submit = async () => {
  // 清除之前的消息
  errorMsg.value = ''
  successMsg.value = ''

  // 基础校验
  if (!email.value) {
    errorMsg.value = '请填写邮箱地址'
    return
  }
  if (!password.value || password.value.length < 6) {
    errorMsg.value = '密码至少需要6位字符'
    return
  }
  // 简单邮箱格式检查
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMsg.value = '邮箱格式不正确'
    return
  }

  loading.value = true

  try {
    if (isLoginMode.value) {
      // 登录
      console.log('[登录] 尝试登录:', email.value)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      localStorage.setItem('sb-session', JSON.stringify(data.session))
      ElMessage.success('登录成功！')
      router.push('/orders')
    } else {
      // 注册
      console.log('[注册] 尝试注册:', email.value)
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: { emailRedirectTo: window.location.origin }
      })
      if (error) throw error

      if (data.user && !data.session) {
        successMsg.value = '✅ 注册成功！请查看邮件确认后登录。开发模式下可直接点「去登录」按钮。'
        isLoginMode.value = true
      } else if (data.session) {
        localStorage.setItem('sb-session', JSON.stringify(data.session))
        ElMessage.success('注册并自动登录成功！')
        router.push('/orders')
      }
    }
  } catch (e) {
    console.error('[错误]', e)
    errorMsg.value = e.message || '操作失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>
