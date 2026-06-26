const express = require('express')
const router = express.Router()
const { adminClient, anonClient } = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')

// 所有订单接口都需要登录
router.use(requireAuth)

// 获取订单列表
router.get('/', async (req, res) => {
  try {
    const { data, error } = await anonClient
      .from('orders')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[GET /orders]', err)
    res.status(500).json({ error: '查询订单失败' })
  }
})

// 新增订单
router.post('/', async (req, res) => {
  const { customer_name, product_name, quantity, unit_price, status } = req.body

  if (!customer_name || !product_name || !quantity || !unit_price) {
    return res.status(400).json({ error: '客户名、产品名、数量、单价不能为空' })
  }

  const total_amount = quantity * unit_price

  try {
    const { data, error } = await adminClient
      .from('orders')
      .insert([{
        customer_name,
        product_name,
        quantity,
        unit_price,
        total_amount,
        status: status || 'pending',
        user_id: req.userId
      }])
      .select()

    if (error) throw error
    res.status(201).json(data[0])
  } catch (err) {
    console.error('[POST /orders]', err)
    res.status(500).json({ error: '新增订单失败' })
  }
})

// 更新订单
router.put('/:id', async (req, res) => {
  const { customer_name, product_name, quantity, unit_price, status } = req.body

  try {
    const updates = {}
    if (customer_name !== undefined) updates.customer_name = customer_name
    if (product_name !== undefined) updates.product_name = product_name
    if (quantity !== undefined) updates.quantity = quantity
    if (unit_price !== undefined) updates.unit_price = unit_price
    if (quantity !== undefined || unit_price !== undefined) {
      const q = quantity || 0
      const p = unit_price || 0
      updates.total_amount = q * p
    }
    if (status !== undefined) updates.status = status

    const { data, error } = await adminClient
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return res.status(404).json({ error: '订单不存在或无权修改' })
    }
    res.json(data[0])
  } catch (err) {
    console.error('[PUT /orders/:id]', err)
    res.status(500).json({ error: '更新订单失败' })
  }
})

// 删除订单
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await adminClient
      .from('orders')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)

    if (error) throw error
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    console.error('[DELETE /orders/:id]', err)
    res.status(500).json({ error: '删除订单失败' })
  }
})

module.exports = router
