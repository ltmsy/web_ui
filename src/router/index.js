import { createRouter, createWebHistory } from 'vue-router'
import PCLiveRoom from '../views/PC/LiveRoom.vue'
import Login from '../views/Login.vue'
import MobileLogin from '../views/Mobile/Login.vue'

const routes = [
  {
    path: '/',
    redirect: '/pc/live'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: MobileLogin
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