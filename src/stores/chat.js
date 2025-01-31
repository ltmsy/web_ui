import { defineStore } from 'pinia'
import { WebSocketManager } from '@/utils/websocket'
import { getHistoryMessages, auditMessage } from '@/api/chat'
import { USER_TYPES, MESSAGE_STATUS } from '@/constants/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    wsManager: null,
    loading: false,
    error: null
  }),

  getters: {
    visibleMessages: (state) => (userId, userType, groupCode) => {
      return state.messages.filter(msg => {
        // 发送者可以看到自己的所有消息
        if (msg.userId === userId) return true
        
        // 超管可以看到所有消息
        if (userType === USER_TYPES.ADMIN) return true
        
        // 组长可以看到本组的所有消息
        if (userType === USER_TYPES.GROUP_LEADER && msg.groupCode === groupCode) return true
        
        // 其他人只能看到已通过的消息
        return msg.status === MESSAGE_STATUS.APPROVED
      })
    }
  },

  actions: {
    initWebSocket(params) {
      console.log('初始化WebSocket, 参数:', params);
      this.wsManager = new WebSocketManager(
        params,
        (msg) => {
          console.log('WebSocket收到消息:', msg);
          this.handleMessage(msg);
        },
        (err) => {
          console.error('WebSocket错误:', err);
          this.handleError(err);
        }
      );
      this.wsManager.connect();
    },

    async loadHistoryMessages(params) {
      console.log('开始加载历史消息, 参数:', params);
      this.loading = true;
      try {
        const { data } = await getHistoryMessages(params);
        console.log('历史消息加载结果:', data);
        if (data.success) {
          this.messages = data.data;
        }
      } catch (error) {
        console.error('加载历史消息失败:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    handleMessage(message) {
      console.log('处理新消息:', message);
      this.messages.push(message);
    },

    handleError(error) {
      console.error('处理错误:', error);
      this.error = error;
    },

    async sendMessage(message) {
      console.log('发送消息:', message);
      this.wsManager?.sendMessage(message);
    },

    async auditMessage(params) {
      console.log('审核消息, 参数:', params);
      try {
        const { data } = await auditMessage(params);
        console.log('审核结果:', data);
        if (data.success) {
          const index = this.messages.findIndex(m => m.messageId === params.messageId);
          if (index !== -1) {
            this.messages[index].status = params.status;
            console.log('本地消息状态已更新');
          }
        }
        return data;
      } catch (error) {
        console.error('审核消息失败:', error);
        throw error;
      }
    },

    cleanup() {
      this.wsManager?.close()
      this.messages = []
      this.error = null
    }
  }
}) 