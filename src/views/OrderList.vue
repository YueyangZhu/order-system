<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto">
    <h1 style="margin-bottom: 20px">📋 订单管理</h1>

    <!-- 新增订单按钮 -->
    <el-button type="primary" @click="showAddDialog" style="margin-bottom: 16px">+ 新增订单</el-button>

    <!-- 订单表格 -->
    <el-table :data="orders" border stripe style="width: 100%">
      <el-table-column prop="customer_name" label="客户名称" min-width="120" />
      <el-table-column prop="product_name" label="产品名称" min-width="160" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column label="单价" width="120">
        <template #default="{ row }">¥{{ row.unit_price?.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="总金额" width="120">
        <template #default="{ row }">¥{{ row.total_amount?.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑订单' : '新增订单'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="form.customer_name" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="form.product_name" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="form.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="form.unit_price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import apiHelper from '../lib/api'

const orders = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({ customer_name: '', product_name: '', quantity: 1, unit_price: 0, status: 'pending' })

function statusText(s) {
  return { pending: '待处理', completed: '已完成', cancelled: '已取消' }[s] || s
}
function statusTag(s) {
  return { pending: 'warning', completed: 'success', cancelled: 'danger' }[s] || 'info'
}
function formatTime(t) {
  if (!t) return '-'
  return new Date(t).toLocaleString('zh-CN')
}

async function fetchOrders() {
  try {
    const data = await apiHelper.api('/orders')
    orders.value = data
  } catch (e) {
    ElMessage.error(e.message)
  }
}

function showAddDialog() {
  isEdit.value = false
  editingId.value = null
  form.value = { customer_name: '', product_name: '', quantity: 1, unit_price: 0, status: 'pending' }
  dialogVisible.value = true
}

function showEditDialog(row) {
  isEdit.value = true
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.customer_name || !form.value.product_name) {
    ElMessage.warning('请填写客户名称和产品名称')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await apiHelper.api(`/orders/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(form.value)
      })
      ElMessage.success('编辑成功')
    } else {
      await apiHelper.api('/orders', {
        method: 'POST',
        body: JSON.stringify(form.value)
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await fetchOrders()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除 ${row.customer_name} 的订单吗？`, '确认删除', { type: 'warning' })
    await apiHelper.api(`/orders/${row.id}`, { method: 'DELETE' })
    ElMessage.success('删除成功')
    await fetchOrders()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message)
  }
}

onMounted(fetchOrders)
</script>
