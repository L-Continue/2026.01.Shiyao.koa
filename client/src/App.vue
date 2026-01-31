<template>
  <div class="app">
    <header class="app-header">
      <h1>相册墙</h1>
      <div class="header-actions">
        <el-button type="primary" @click="openPasswordDialog">管理相片</el-button>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <PasswordDialog ref="passwordDialogRef" @success="handleAuthSuccess" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PasswordDialog from './components/PasswordDialog.vue'

const router = useRouter()
const passwordDialogRef = ref(null)

const openPasswordDialog = () => {
  if (passwordDialogRef.value) {
    passwordDialogRef.value.open()
  }
}

const handleAuthSuccess = () => {
  // 密码验证成功，跳转到管理页面
  router.push('/manage')
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #fff;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.app-main {
  flex: 1;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>