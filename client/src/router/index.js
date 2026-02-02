import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PasswordDialog from '../components/PasswordDialog.vue'
import { createApp, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/category/:year',
      name: 'category',
      component: () => import('../views/CategoryView.vue')
    },
    {
      path: '/manage',
      name: 'manage',
      component: () => import('../views/ManageView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 密码验证状态
let isAuthenticated = false

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // 创建密码验证对话框
      const div = document.createElement('div')
      document.body.appendChild(div)

      const app = createApp({
        components: {
          PasswordDialog
        },
        setup() {
          const dialogRef = ref(null)

          onMounted(() => {
            if (dialogRef.value) {
              dialogRef.value.open()
            }
          })

          const handleSuccess = () => {
            isAuthenticated = true
            app.unmount(div)
            document.body.removeChild(div)
            next()
          }

          const handleClose = () => {
            app.unmount(div)
            document.body.removeChild(div)
            next(false)
          }

          return {
            dialogRef,
            handleSuccess,
            handleClose
          }
        },
        template: `
          <PasswordDialog
            ref="dialogRef"
            @success="handleSuccess"
            @close="handleClose"
          />
        `
      })

      // 添加必要的依赖
      app.config.globalProperties.$message = ElMessage

      app.mount(div)
    } else {
      next()
    }
  } else {
    next()
  }
})

// 导出路由实例
export default router

// 导出认证状态管理
export { isAuthenticated }