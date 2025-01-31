import { defineStore } from 'pinia'
import { WebSocketManager } from '@/utils/websocket'
import { getHistoryMessages, auditMessage } from '@/api/chat'
import { USER_TYPES, MESSAGE_STATUS } from '@/constants/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],  // 服务器消息
    myMessages: JSON.parse(localStorage.getItem('myMessages') || '[]'),  // 我的消息
    wsManager: null,
    loading: false,
    error: null
  }),

  getters: {
    allMessages: (state) => {
      // 先复制服务器消息
      const allMsgs = [...state.messages];
      
      // 添加我的消息（如果服务器消息中不存在）
      state.myMessages.forEach(myMsg => {
        const exists = allMsgs.some(msg => msg.messageId === myMsg.messageId);
        if (!exists) {
          allMsgs.push(myMsg);
        }
      });
      
      // 按时间排序
      return allMsgs.sort((a, b) => a.timestamp - b.timestamp);
    },

    visibleMessages: (state) => (userId, userType, groupCode) => {
      return state.allMessages.filter(msg => {
        // 1. 如果消息被撤销（REJECTED），只有发送者本人可见
        if (msg.status === MESSAGE_STATUS.REJECTED) {
          return msg.userId?.toString() === userId?.toString();
        }
        
        // 2. 如果是自己的消息，始终可见（除了已被撤销的情况）
        if (msg.userId?.toString() === userId?.toString()) {
          return true;
        }
        
        // 3. 如果消息已通过审核，所有人可见
        if (msg.status === MESSAGE_STATUS.APPROVED) {
          return true;
        }
        
        // 4. 超管和组长只能看到待审核的消息
        if (msg.status === MESSAGE_STATUS.PENDING) {
          // 超管可以看到所有待审核消息
          if (userType === USER_TYPES.ADMIN) return true;
          
          // 组长可以看到本组的待审核消息
          if (userType === USER_TYPES.GROUP_LEADER && msg.groupCode === groupCode) {
            return true;
          }
        }
        
        // 5. 其他情况不可见
        return false;
      });
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

    saveMyMessages() {
      localStorage.setItem('myMessages', JSON.stringify(this.myMessages));
    },

    async sendMessage(message) {
      console.log('发送消息:', message);
      // 1. 先添加到我的消息列表
      this.myMessages.push(message);
      this.saveMyMessages();
      console.log('消息已添加到我的消息列表');
      
      // 2. 发送到服务器
      this.wsManager?.sendMessage(message);
    },

    handleMessage(message) {
      // 1. 严格的消息格式验证
      if (!message) {
        console.warn('收到空消息');
        return;
      }

      // 2. 确保消息有必要的字段
      if (!message.messageId || !message.content || !message.userId) {
        console.warn('消息格式不完整:', message);
        return;
      }

      try {
        // 3. 初始化 messages 数组（如果为空）
        if (!this.messages) {
          this.messages = [];
        }

        // 4. 初始化 myMessages 数组（如果为空）
        if (!this.myMessages) {
          this.myMessages = [];
          this.saveMyMessages();
        }

        // 5. 检查是否是我的消息
        const myMsgIndex = this.myMessages.findIndex(msg => 
          msg && msg.messageId === message.messageId
        );
        
        if (myMsgIndex !== -1) {
          // 更新我的消息状态
          this.myMessages[myMsgIndex] = {
            ...this.myMessages[myMsgIndex],
            status: message.status
          };
          this.saveMyMessages();
          console.log('已更新我的消息状态:', message.status);
        }

        // 6. 更新或添加到服务器消息列表
        const serverMsgIndex = this.messages.findIndex(msg => 
          msg && msg.messageId === message.messageId
        );

        if (serverMsgIndex === -1) {
          this.messages.push({...message}); // 使用浅拷贝避免引用问题
          console.log('已添加新消息到服务器消息列表');
        } else {
          this.messages[serverMsgIndex] = {
            ...this.messages[serverMsgIndex],
            status: message.status
          };
          console.log('已更新服务器消息状态');
        }
      } catch (error) {
        console.error('处理消息时出错:', error);
        console.error('问题消息:', message);
      }
    },

    async loadHistoryMessages(params) {
      this.loading = true;
      try {
        const response = await getHistoryMessages(params);
        if (response.data.success) {
          this.messages = response.data.data;
          console.log('已加载历史消息');
          
          // 如果历史消息为空，清除本地存储的消息
          if (!response.data.data || response.data.data.length === 0) {
            console.log('历史消息为空，清除本地存储的消息');
            this.myMessages = [];
            this.saveMyMessages();
          } else {
            // 有历史消息时，保留本地消息
            console.log('保留我的消息数量:', this.myMessages.length);
          }
        }
      } catch (error) {
        console.error('加载历史消息失败:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    handleError(error) {
      console.error('处理错误:', error);
      this.error = error;
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
      this.wsManager?.close();
      this.messages = [];
      this.error = null;
      // 不清除我的消息
    }
  }
}) 