<template>
  <el-config-provider :locale="zhCn">
    <el-container style="height: 100vh">
      <el-header v-if="isLoggedIn" style="background: #409EFF; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; color: white">
        <h2 style="margin: 0">订单管理系统</h2>
        <div>
          <el-button type="text" style="color: white" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main style="padding: 20px">
        <router-view />
      </el-main>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { supabase } from './lib/supabase'

const router = useRouter()
const isLoggedIn = computed(() => !!localStorage.getItem('sb-session'))

const handleLogout = async () => {
  await supabase.auth.signOut()
  localStorage.removeItem('sb-session')
  router.push('/login')
}

onMounted(() => {
  // 初始化：检查 session 是否有效
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      localStorage.removeItem('sb-session')
      router.push('/login')
    }
  })
})
</script>
