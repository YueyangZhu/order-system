import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import OrderList from '../views/OrderList.vue'

const routes = [
  {
    path: '/',
    redirect: '/orders'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('sb-session')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/orders')
  } else {
    next()
  }
})

export default router
