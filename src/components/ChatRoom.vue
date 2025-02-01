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
          <div 
            v-if="message.iconUrl" 
            class="level-icon" 
            :style="{ backgroundImage: `url(${message.iconUrl})` }"
          ></div>
          <span class="username">{{ message.userName || message.username }}</span>
          <span v-if="message.timestamp" class="time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content">
          <div class="content" v-html="formatContent(message.content)"></div>
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
        <div class="custom-select" @click="toggleSelect">
          <div class="select-value">
            <div 
              v-if="selectedIdentity?.levelIcon" 
              class="level-icon" 
              :style="{ backgroundImage: `url(${selectedIdentity.levelIcon})` }"
            ></div>
            {{ selectedIdentity?.identityName || '使用真实身份' }}
          </div>
          <div class="select-options" v-if="showOptions">
            <div 
              class="option" 
              :class="{ selected: !selectedIdentity }"
              @click="selectIdentity(null)"
            >
              使用真实身份
            </div>
            <div
              v-for="identity in configStore.fakeIdentities"
              :key="identity.id"
              class="option"
              :class="{ selected: selectedIdentity?.id === identity.id }"
              @click="selectIdentity(identity)"
            >
              <div 
                class="level-icon" 
                :style="{ backgroundImage: `url(${identity.levelIcon})` }"
              ></div>
              {{ identity.identityName }}
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义表情面板 -->
      <div class="emoji-panel" v-if="showEmoji">
        <div class="emoji-content">
          <!-- 普通表情和GIF混合显示 -->
          <span 
            v-for="emoji in emojis" 
            :key="emoji" 
            @click="insertEmoji(emoji)"
            class="emoji-item"
          >
            {{ emoji }}
          </span>
          <div 
            v-for="(gif, index) in gifs" 
            :key="gif.url" 
            class="gif-item"
            @click="insertGif(gif)"
          >
            <img :src="gif.url" :alt="gif.name">
          </div>
        </div>
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
import { showMessage } from '@/utils/message';  // PC端
import { showMobileMessage } from '@/utils/mobileMessage';  // 移动端

const configStore = useConfigStore();
const chatStore = useChatStore();
const { userInfo, allowVisitorChat } = storeToRefs(configStore);

const messagesContainer = ref(null);
const messageInput = ref('');
const showEmoji = ref(false);
const onlineCount = ref(0);
const onlineCountTimer = ref(null);
const selectedIdentity = ref(configStore.currentFakeIdentity);
const autoScroll = ref(true);
const showOptions = ref(false);

// 表情配置
const emojis = ['😊', '😂', '🤔', '👍', '❤️', '😎', '🎉', '👏', '😄', '🥰', '😍', '🤩', '😋', '🤗', '🤭', '🥳'];
const gifs = [
  { name: '1', url: '/emojis/1.gif' },
  { name: '2', url: '/emojis/2.gif' },
  { name: '3', url: '/emojis/3.gif' },
  { name: '4', url: '/emojis/4.gif' },
  { name: '5', url: '/emojis/5.gif' },
  { name: '7', url: '/emojis/7.gif' }
];

const currentEmojiTab = ref(0);

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
  if (allowVisitorChat.value) return true;
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

// 插入普通表情
const insertEmoji = (emoji) => {
  messageInput.value += emoji;
  showEmoji.value = false;
};

// 插入GIF动图
const insertGif = (gif) => {
  // 从 url 中提取数字 ID
  const gifId = gif.url.match(/\/(\d+)\.gif$/)[1];
  messageInput.value += `[gif:${gifId}]`;
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

// 生成随机在线人数
const generateOnlineCount = () => {
  const fakeCount = configStore.fakeOnlineCount;
  
  if (fakeCount === 0) {
    // 如果配置为0，随机生成1-15的数字
    onlineCount.value = Math.floor(Math.random() * 15) + 1;
  } else if (fakeCount >= 1000) {
    // 如果大于1000，上下浮动200
    const min = fakeCount - 200;
    const max = fakeCount + 200;
    onlineCount.value = Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    // 其他情况直接使用配置值
    onlineCount.value = fakeCount;
  }
};

// 启动在线人数更新定时器
const startOnlineCountTimer = () => {
  // 先生成一次初始值
  generateOnlineCount();
  
  // 设置5秒定时器
  onlineCountTimer.value = setInterval(() => {
    generateOnlineCount();
  }, 5000);
};

// 停止在线人数更新定时器
const stopOnlineCountTimer = () => {
  if (onlineCountTimer.value) {
    clearInterval(onlineCountTimer.value);
    onlineCountTimer.value = null;
  }
};

// 点击外部关闭表情选择框
const handleClickOutside = (event) => {
  const emojiPanel = document.querySelector('.emoji-panel');
  const emojiBtn = document.querySelector('.emoji-btn');
  
  if (showEmoji.value && 
      emojiPanel && 
      !emojiPanel.contains(event.target) && 
      !emojiBtn.contains(event.target)) {
    showEmoji.value = false;
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

    // 启动在线人数更新
    startOnlineCountTimer();

    // 点击外部关闭下拉框
    document.addEventListener('click', (e) => {
      const select = document.querySelector('.custom-select');
      if (select && !select.contains(e.target)) {
        showOptions.value = false;
      }
    });

    // 添加点击事件监听
    document.addEventListener('click', handleClickOutside);
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

  // 停止在线人数更新
  stopOnlineCountTimer();

  // 移除点击事件监听
  document.removeEventListener('click', handleClickOutside);
});

// 监听消息可见性变化
watchEffect(() => {
  console.log('可见消息列表更新:', visibleMessages.value);
});

// 监听发送权限变化
watchEffect(() => {
  console.log('发送消息权限状态:', canSendMessage.value);
});

// 监听配置变化，重新生成在线人数
watch(() => configStore.fakeOnlineCount, () => {
  generateOnlineCount();
});

const toggleSelect = () => {
  showOptions.value = !showOptions.value;
};

const selectIdentity = (identity) => {
  selectedIdentity.value = identity;
  showOptions.value = false;
};

// 判断是否为移动端
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const showToast = isMobile ? showMobileMessage : showMessage;

// 计算是否可以发言
const canChat = computed(() => {
  return configStore.token || allowVisitorChat.value;
});

// 输入框提示文字
const inputPlaceholder = computed(() => {
  if (!configStore.token && !allowVisitorChat.value) {
    return '请登录后发言';
  }
  return '请输入消息';
});

const handleSend = () => {
  if (!messageInput.value.trim()) return;
  
  if (!canChat.value) {
    showToast('请登录后发言', 'warning');
    return;
  }

  try {
    // ... 发送消息的逻辑保持不变 ...
    
    messageInput.value = '';  // 清空输入框
  } catch (error) {
    console.error('发送消息失败:', error);
    showToast('发送失败，请重试', 'error');
  }
};

// 格式化消息内容，将 [gif:x] 转换为图片标签
const formatContent = (content) => {
  if (!content) return '';
  
  // 替换 [gif:x] 格式的文本为对应的图片
  return content.replace(/\[gif:(\d+)\]/g, (match, gifId) => {
    const gifUrl = `/emojis/${gifId}.gif`;
    return `<img class="chat-gif" src="${gifUrl}" alt="gif${gifId}">`;
  });
};
</script>

<style scoped>
.chat-room {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  background: var(--bg-darker);
}

.chat-header {
  padding: 6px 10px;
  background: var(--bg-lighter);
  border-bottom: 1px solid var(--border-dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-gold);
  height: 32px;
}

.chat-header span {
  color: var(--text-gold);
  text-shadow: none;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

/* Webkit (Chrome, Safari, etc) */
.chat-messages::-webkit-scrollbar {
  display: none;
}

.message {
  margin-bottom: 6px;
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.message:hover {
  background: var(--bg-hover);
}

.message-info {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;  /* 设置固定高度，作为对齐基准 */
}

.username {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.85);  /* 稍微暗一点的白色 */
  text-shadow: none;
  line-height: 1;
  font-size: 14px;
}

.time {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
  display: flex;
  align-items: center;
}

.level-icon {
  width: 50px;  /* 稍微减小宽度 */
  height: 16px;  /* 比用户名略小 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  align-self: center;  /* 确保垂直居中 */
}

.chat-input {
  padding: 6px;
  border-top: 1px solid var(--border-dark);
  background: var(--bg-lighter);
  position: relative;
}

.emoji-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 300px;
  background: var(--bg-lighter);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  margin-bottom: 5px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;  /* 确保表情面板在最上层 */
}

.emoji-content {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  cursor: pointer;
  text-align: center;
  font-size: 20px;
  transition: transform 0.2s;
}

.emoji-item:hover {
  transform: scale(1.2);
}

.gif-item {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
}

.gif-item:hover {
  transform: scale(1.05);
}

.gif-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input-container {
  display: flex;
  gap: 10px;
}

.input-container input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  background: var(--bg-darker);
  color: var(--text-primary);
}

.input-container input:focus,
.fake-identity-selector select:focus {
  outline: none;
  border-color: var(--action-gold);
  box-shadow: var(--input-focus-shadow);
}

button {
  padding: 8px 15px;
  background: var(--action-blue);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: var(--bg-lighter);
  color: var(--text-muted);
  cursor: not-allowed;
}

.emoji-btn {
  background: none;
  color: initial;
}

.message-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.content {
  color: var(--text-gold);
  font-size: 13px;
  word-break: break-word;
  flex: 1;
}

.audit-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.audit-btn {
  padding: 2px 6px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
  transition: all 0.3s;
}

.audit-btn.approve {
  background: var(--action-green);
  color: white;
}

.audit-btn.reject {
  background: var(--action-red);
  color: white;
}

.audit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.audit-btn:active {
  transform: translateY(1px);
  filter: brightness(0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.audit-btn.approve:hover {
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.audit-btn.reject:hover {
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

.fake-identity-selector {
  margin-bottom: 10px;
  position: relative;
}

.custom-select {
  position: relative;
  width: 200px;
}

.select-value {
  padding: 6px 12px;
  background: var(--bg-darker);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-options {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 4px;
  background: white;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.option {
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bg-darker);
}

.option:hover {
  background: #f5f5f5;
}

.option.selected {
  background: #e8e8e8;
}

.level-icon {
  width: 35px;
  height: 14px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
}

.scroll-control {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--text-muted);
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

@media (max-width: 768px) {
  .chat-header {
    padding: 5px 10px;
    height: 32px;  /* 移动端更小的高度 */
  }

  .chat-header span {
    font-size: 12px;  /* 更小的字体 */
  }

  .scroll-control {
    font-size: 12px;
    gap: 3px;
  }

  .scroll-control input[type="checkbox"] {
    width: 14px;
    height: 14px;
  }
}

.chat-input input:disabled {
  background: var(--bg-darker);
  cursor: not-allowed;
  color: var(--text-muted);
}

.send-btn:disabled {
  background: var(--bg-darker);
  cursor: not-allowed;
  color: var(--text-muted);
}

/* 消息中的 GIF 样式 */
:deep(.chat-gif) {
  width: 200px;  /* 增加宽度 */
  height: auto;
  vertical-align: middle;
  border-radius: 4px;
  margin: 4px 0;  /* 上下增加间距 */
  display: block;  /* 让图片独占一行 */
  max-height: 200px;  /* 限制最大高度 */
  object-fit: contain;  /* 保持宽高比 */
}
</style> 