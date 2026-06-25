<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5">
    <el-card style="width: 400px">
      <template #header>
        <h2 style="text-align: center; margin: 0">登录</h2>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱（如 test@example.com）" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
        <el-divider>或</el-divider>
        <el-form-item>
          <el-button style="width: 100%" @click="handleRegister">注册新账号</el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <div style="margin-top: 12px; padding: 10px; background: #f0f9eb; border-radius: 4px; font-size: 13px; color: #606266">
        <p style="margin: 0 0 6px">💡 首次使用请先注册：</p>
        <ol style="margin: 0; padding-left: 18px">
          <li>填写邮箱和密码</li>
          <li>点「注册新账号」</li>
          <li>注册成功后用相同账号登录</li>
        </ol>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { supabase } from '../lib/supabase'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  // 安全校验
  if (!form.email || !form.password) {
    ElMessage.warning('请先填写邮箱和密码')
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    if (error) throw error
    localStorage.setItem('sb-session', JSON.stringify(data.session))
    ElMessage.success('登录成功')
    router.push('/orders')
  } catch (e) {
    console.error('登录失败:', e)
    ElMessage.error(e.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  // 安全校验
  if (!form.email || !form.password) {
    ElMessage.warning('请先填写邮箱和密码')
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) throw error

    if (data.user && !data.session) {
      ElMessage.success('注册成功！请查收确认邮件后登录（开发模式可直接登录）')
    } else if (data.session) {
      localStorage.setItem('sb-session', JSON.stringify(data.session))
      ElMessage.success('注册并自动登录成功！')
      router.push('/orders')
    }
  } catch (e) {
    console.error('注册失败:', e)
    ElMessage.error(e.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>
