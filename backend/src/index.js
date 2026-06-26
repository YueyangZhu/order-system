const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const orderRoutes = require('./routes/orders')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors({
  origin: ['https://order-system-xi-ten.vercel.app', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}))
app.use(express.json())

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[Unhandled]', err)
  res.status(500).json({ error: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`✅ 订单系统后端启动: http://localhost:${PORT}`)
})
