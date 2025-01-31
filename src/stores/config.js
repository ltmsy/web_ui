import { defineStore } from 'pinia'
import { getHomeInfo, login as loginApi, logout } from '@/api/client'
import { useRouter } from 'vue-router'

export const useConfigStore = defineStore('config', {
  state: () => ({
    configs: {},
    userInfo: null,
    loading: false,
    error: null,
    token: localStorage.getItem('token')
  }),

  getters: {
    logoUrl: state => state.configs.LOGO_URL,
    courseImageUrl: state => state.configs.COURSE_IMAGE_URL,
    playerBgUrl: state => state.configs.PLAYER_BG_URL,
    teacherIntroUrl: state => state.configs.TEACHER_INTRO_URL,
    announcement: state => state.configs.ANNOUNCEMENT,
    allowVisitorChat: state => state.configs.ALLOW_VISITOR_CHAT === 'true',
    needAudit: state => state.configs.NEED_AUDIT === 'true',
    needLogin: state => state.configs.NEED_LOGIN === 'true',
    webPullUrl: state => state.configs.WEB_PULL_URL,
    h5PullUrl: state => state.configs.H5_PULL_URL,
    fakeOnlineCount: state => parseInt(state.configs.FAKE_ONLINE_COUNT || '0')
  },

  actions: {
    async fetchHomeInfo(groupNo = '1001') {
      this.loading = true
      try {
        const { data } = await getHomeInfo(groupNo)
        if (data.code === 200) {
          this.configs = data.data.configs.reduce((acc, curr) => {
            acc[curr.configKey] = curr.configValue
            return acc
          }, {})
          this.userInfo = data.data.userInfo
          
          if (this.needLogin && !this.token) {
            router.push('/login')
          }
        }
      } catch (error) {
        this.error = error.message
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },

    async login(username, password) {
      try {
        const { data } = await loginApi(username, password)
        if (data.code === 200) {
          this.token = data.data.token
          this.configs = data.data.configs.reduce((acc, curr) => {
            acc[curr.configKey] = curr.configValue
            return acc
          }, {})
          this.userInfo = data.data.userInfo
          
          localStorage.setItem('token', this.token)
        } else {
          throw new Error(data.message || '登录失败')
        }
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.token = null
        this.userInfo = null
        localStorage.removeItem('token')
        
        window.location.href = `${window.location.origin}/login`
      }
    }
  }
}) 