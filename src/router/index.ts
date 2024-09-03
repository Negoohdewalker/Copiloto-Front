import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'home', component: Home },
      ]
    },
  ]
})

export default router
