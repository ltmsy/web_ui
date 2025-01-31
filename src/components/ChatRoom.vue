<template>
  <div class="chat-room">
    <div class="chat-header">
      <span>在线人数：{{ onlineCount }}</span>
      <div class="scroll-control">
        <label>
          <input type="checkbox" v-model="autoScroll">
          自动滚动
        </label>
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in visibleMessages" :key="message.messageId || index" class="message">
        <div class="message-info">
          <img v-if="message.iconUrl" :src="message.iconUrl" class="level-icon" alt="等级">
          <span class="username">{{ message.userName || message.username }}：</span>
          <span v-if="message.timestamp" class="time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="content">
          {{ message.content }}
          <!-- 审核按钮 -->
          <div v-if="canAudit(message)" class="audit-actions">
            <!-- 只有在待审核状态时显示通过按钮 -->
            <button 
              v-if="message.status === MESSAGE_STATUS.PENDING"
              @click="handleAudit(message, MESSAGE_STATUS.APPROVED)" 
              class="audit-btn approve"
            >
              通过
            </button>
            <!-- 撤销按钮始终显示 -->
            <button 
              @click="handleAudit(message, MESSAGE_STATUS.REJECTED)" 
              class="audit-btn reject"
            >
              撤销
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <!-- 虚假身份选择器 -->
      <div v-if="configStore.canUseFakeIdentity" class="fake-identity-selector">
        <select v-model="selectedIdentity">
          <option :value="null">使用真实身份</option>
          <option 
            v-for="identity in configStore.fakeIdentities" 
            :key="identity.id"
            :value="identity"
          >
            {{ identity.identityName }}
          </option>
        </select>
      </div>

      <div class="emoji-panel" v-if="showEmoji">
        <span v-for="emoji in emojis" :key="emoji" @click="insertEmoji(emoji)">{{ emoji }}</span>
      </div>
      
      <div class="input-container">
        <button class="emoji-btn" @click="showEmoji = !showEmoji">😊</button>
        <input 
          v-model="messageInput"
          @keyup.enter="sendMessage"
          placeholder="请输入消息..."
          :disabled="!canSendMessage"
        >
        <button @click="sendMessage" :disabled="!canSendMessage || !messageInput.trim()">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/stores/config';
import { useChatStore } from '@/stores/chat';
import { USER_TYPES, MESSAGE_STATUS } from '@/constants/chat';

const configStore = useConfigStore();
const chatStore = useChatStore();
const { userInfo } = storeToRefs(configStore);

const messagesContainer = ref(null);
const messageInput = ref('');
const showEmoji = ref(false);
const onlineCount = ref(0);
const selectedIdentity = ref(configStore.currentFakeIdentity);
const autoScroll = ref(true);

const emojis = ['😊', '😂', '🤔', '👍', '❤️', '😎', '🎉', '👏'];

// 可见消息列表
const visibleMessages = computed(() => 
  chatStore.visibleMessages(
    userInfo.value?.id,
    userInfo.value?.userType,
    userInfo.value?.groupNo
  )
);

// 是否可以发送消息
const canSendMessage = computed(() => {
  if (!userInfo.value) return false;
  if (configStore.allowVisitorChat) return true;
  return userInfo.value.userType !== USER_TYPES.VISITOR;
});

// 是否可以审核消息
const canAudit = (message) => {
  if (!userInfo.value) return false;
  if (userInfo.value.userType === USER_TYPES.ADMIN) return true;
  return userInfo.value.userType === USER_TYPES.GROUP_LEADER && 
         message.groupCode === userInfo.value.groupNo;
};

// WebSocket消息处理
const handleWebSocketMessage = (message) => {
  console.log('收到WebSocket消息:', message);
  chatStore.handleMessage(message);
  // 消息处理完后滚动
  nextTick(() => {
    scrollToBottom();
  });
};

// WebSocket错误处理
const handleWebSocketError = (error) => {
  console.error('WebSocket错误:', error);
  chatStore.handleError(error);
};

// 监听身份选择变化
watch(selectedIdentity, (newIdentity) => {
  configStore.setCurrentFakeIdentity(newIdentity);
});

// 修改发送消息方法
const sendMessage = async () => {
  if (!messageInput.value.trim() || !userInfo.value) return;

  const needAudit = configStore.needAudit && 
    [USER_TYPES.VISITOR, USER_TYPES.MEMBER].includes(userInfo.value.userType);

  // 使用虚假身份或真实身份
  const identity = selectedIdentity.value || userInfo.value;

  const message = {
    messageId: Date.now().toString(),
    userId: userInfo.value.id, // 保留真实用户ID用于权限判断
    userName: identity.identityName || identity.userName, // 使用选择的身份名称
    userType: userInfo.value.userType, // 保留真实用户类型用于权限判断
    groupCode: identity.groupNo || userInfo.value.groupNo,
    content: messageInput.value.trim(),
    iconUrl: identity.levelIcon || userInfo.value.levelIcon,
    timestamp: Date.now(),
    status: needAudit ? MESSAGE_STATUS.PENDING : MESSAGE_STATUS.APPROVED
  };

  console.log('准备发送消息:', message);
  try {
    await chatStore.sendMessage(message);
    console.log('消息发送成功');
    messageInput.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('发送消息失败:', error);
  }
};

// 审核消息
const handleAudit = async (message, newStatus) => {
  console.log('准备审核消息:', { message, newStatus });
  try {
    await chatStore.auditMessage({
      ...message,
      status: newStatus,
      userType: userInfo.value.userType
    });
    console.log('消息审核成功');
  } catch (error) {
    console.error('审核消息失败:', error);
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const scrollToBottom = () => {
  if (autoScroll.value && messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const insertEmoji = (emoji) => {
  messageInput.value += emoji;
  showEmoji.value = false;
};

// 监听消息列表变化，自动滚动
watch(() => visibleMessages.value, () => {
  // 使用 nextTick 确保 DOM 更新后再滚动
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true, immediate: true });

// 监听手动滚动事件
const handleScroll = () => {
  if (!messagesContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 允许50px的误差
  
  // 如果用户手动滚动到底部，自动开启自动滚动
  if (isAtBottom && !autoScroll.value) {
    autoScroll.value = true;
  }
  // 如果用户向上滚动，关闭自动滚动
  else if (!isAtBottom && autoScroll.value) {
    autoScroll.value = false;
  }
};

// 初始化
onMounted(async () => {
  console.log('聊天室组件挂载, 用户信息:', userInfo.value);
  console.log('need_login状态:', configStore.needLogin);

  // 等待用户信息就绪
  await waitForUserInfo();

  try {
    // 加载历史消息
    console.log('准备加载历史消息，参数:', {
      userId: userInfo.value?.id,
      userType: userInfo.value?.userType,
      groupCode: userInfo.value?.groupNo
    });

    await chatStore.loadHistoryMessages({
      userId: userInfo.value?.id,
      userType: userInfo.value?.userType,
      groupCode: userInfo.value?.groupNo
    });

    // 初始化WebSocket连接
    console.log('开始初始化WebSocket连接');
    chatStore.initWebSocket({
      userId: userInfo.value?.id,
      userType: userInfo.value?.userType,
      groupCode: userInfo.value?.groupNo
    });
    console.log('WebSocket连接初始化完成');

    scrollToBottom();

    // 添加滚动事件监听
    messagesContainer.value?.addEventListener('scroll', handleScroll);
  } catch (error) {
    console.error('初始化聊天室失败:', error);
    console.error('错误详情:', error.response || error);
  }
});

// 等待用户信息就绪
const waitForUserInfo = () => {
  return new Promise((resolve) => {
    if (userInfo.value) {
      console.log('用户信息已就绪:', userInfo.value);
      resolve();
      return;
    }

    const unwatch = watch(userInfo, (newValue) => {
      if (newValue) {
        console.log('用户信息已更新:', newValue);
        unwatch();
        resolve();
      }
    });

    // 设置超时，防止无限等待
    setTimeout(() => {
      unwatch();
      console.warn('等待用户信息超时');
      resolve();
    }, 5000);
  });
};

// 清理
onUnmounted(() => {
  console.log('聊天室组件卸载，清理资源');
  chatStore.cleanup();

  // 移除滚动事件监听
  messagesContainer.value?.removeEventListener('scroll', handleScroll);
});

// 监听消息可见性变化
watchEffect(() => {
  console.log('可见消息列表更新:', visibleMessages.value);
});

// 监听发送权限变化
watchEffect(() => {
  console.log('发送消息权限状态:', canSendMessage.value);
});
</script>

<style scoped>
.chat-room {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.chat-header {
  padding: 10px;
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

/* Webkit (Chrome, Safari, etc) */
.chat-messages::-webkit-scrollbar {
  display: none;
}

.message {
  margin-bottom: 10px;
}

.username {
  font-weight: bold;
  color: #666;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}

.emoji-panel {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-bottom: 10px;
}

.emoji-panel span {
  cursor: pointer;
  text-align: center;
}

.input-container {
  display: flex;
  gap: 10px;
}

.input-container input {
  flex: 1;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

button {
  padding: 8px 15px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.emoji-btn {
  background: none;
  color: initial;
}

.level-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 4px;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time {
  font-size: 12px;
  color: #999;
}

.audit-actions {
  display: inline-flex;
  gap: 8px;
  margin-left: 8px;
}

.audit-btn {
  padding: 2px 6px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
}

.audit-btn.approve {
  background: #4caf50;
  color: white;
}

.audit-btn.reject {
  background: #f44336;
  color: white;
}

.fake-identity-selector {
  margin-bottom: 10px;
}

.fake-identity-selector select {
  width: 200px;
  padding: 5px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.scroll-control {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.scroll-control input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.scroll-control label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
</style> 