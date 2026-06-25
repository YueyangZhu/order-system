<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="margin: 0">订单列表</h2>
      <el-button type="primary" @click="openDialog">新增订单</el-button>
    </div>

    <el-table :data="orders" border stripe style="width: 100%">
      <el-table-column prop="customer_name" label="客户名称" />
      <el-table-column prop="product_name" label="产品名称" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="unit_price" label="单价" width="100">
        <template #default="{ row }">¥{{ row.unit_price }}</template>
      </el-table-column>
      <el-table-column prop="total_amount" label="总金额" width="120">
        <template #default="{ row }">¥{{ row.total_amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="客户名称" prop="customer_name">
          <el-input v-model="form.customer_name" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="form.product_name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单价" prop="unit_price">
          <el-input-number v-model="form.unit_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="待处理" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { supabase } from '../lib/supabase'

const orders = ref([])
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = ref({
  customer_name: '',
  product_name: '',
  quantity: 1,
  unit_price: 0,
  status: 'pending'
})

const rules = {
  customer_name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  product_name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit_price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

const dialogTitle = computed(() => editingId.value ? '编辑订单' : '新增订单')

// 获取订单列表
const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) ElMessage.error(error.message)
  else orders.value = data
}

// 打开新增/编辑对话框
const openDialog = (row = null) => {
  if (row) {
    editingId.value = row.id
    form.value = {
      customer_name: row.customer_name,
      product_name: row.product_name,
      quantity: row.quantity,
      unit_price: row.unit_price,
      status: row.status
    }
  } else {
    editingId.value = null
    form.value = { customer_name: '', product_name: '', quantity: 1, unit_price: 0, status: 'pending' }
  }
  dialogVisible.value = true
}

// 保存订单
const handleSave = async () => {
  await formRef.value.validate()
  saving.value = true
  const payload = {
    ...form.value,
    total_amount: form.value.quantity * form.value.unit_price
  }
  try {
    if (editingId.value) {
      const { error } = await supabase.from('orders').update(payload).eq('id', editingId.value)
      if (error) throw error
      ElMessage.success('更新成功')
    } else {
      const { error } = await supabase.from('orders').insert([payload])
      if (error) throw error
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchOrders()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

// 删除订单
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该订单？', '提示', { type: 'warning' })
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) ElMessage.error(error.message)
  else {
    ElMessage.success('删除成功')
    fetchOrders()
  }
}

const statusType = (s) => ({ pending: 'warning', completed: 'success', cancelled: 'info' })[s] || 'info'
const statusText = (s) => ({ pending: '待处理', completed: '已完成', cancelled: '已取消' })[s] || s
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : ''

onMounted(fetchOrders)
</script>
