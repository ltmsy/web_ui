import { defineStore } from 'pinia'
import { getHomeInfo } from '@/api/client'

export const useConfigStore = defineStore('config', {
  state: () => ({
    configs: {},
    userInfo: null,
    loading: false,
    error: null
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
          // 将配置数组转换为对象格式
          this.configs = data.data.configs.reduce((acc, curr) => {
            acc[curr.configKey] = curr.configValue
            return acc
          }, {})
          this.userInfo = data.data.userInfo
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
}) 