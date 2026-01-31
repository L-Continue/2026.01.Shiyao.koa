<template>
  <el-dialog
    v-model="dialogVisible"
    title="验证管理密码"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
    >
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入管理密码"
          @keyup.enter="handleVerify"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleVerify" :loading="loading">
          验证
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const form = ref({ password: '' })
const loading = ref(false)
const formRef = ref(null)

const emit = defineEmits(['success', 'close'])

const rules = {
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    }
  ]
}

const open = () => {
  dialogVisible.value = true
  form.value.password = ''
  loading.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleVerify = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: form.value.password })
        })

        const result = await response.json()

        if (result.valid) {
          ElMessage.success('密码验证成功')
          dialogVisible.value = false
          emit('success')
        } else {
          ElMessage.error('密码错误')
          dialogVisible.value = false
          emit('close')
        }
      } catch (error) {
        console.error('验证密码失败:', error)
        ElMessage.error('验证失败，请稍后重试')
        dialogVisible.value = false
        emit('close')
      } finally {
        loading.value = false
      }
    }
  })
}

defineExpose({
  open
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>