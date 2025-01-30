import { createRouter, createWebHistory } from 'vue-router'
import PCLiveRoom from '../views/PC/LiveRoom.vue'

const routes = [
  {
    path: '/',
    redirect: '/pc/live'
  },
  {
    path: '/pc/live',
    name: 'PCLive',
    component: PCLiveRoom
  },
  {
    path: '/mobile/live',
    name: 'MobileLive',
    component: () => import('../views/Mobile/LiveRoom.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 