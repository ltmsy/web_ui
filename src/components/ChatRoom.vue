<template>
  <div class="chat-room">
    <div class="chat-header">
      <span>在线人数：{{ onlineCount }}</span>
      <button @click="scrollToBottom">滚动到底部</button>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <span class="username">{{ message.username }}：</span>
        <span class="content">{{ message.content }}</span>
      </div>
    </div>
    
    <div class="chat-input">
      <div class="emoji-picker" v-if="showEmoji">
        <span v-for="emoji in emojis" 
              :key="emoji" 
              @click="insertEmoji(emoji)">
          {{ emoji }}
        </span>
      </div>
      <div class="input-container">
        <button class="emoji-btn" @click="showEmoji = !showEmoji">😊</button>
        <input 
          v-model="messageInput"
          @keyup.enter="sendMessage"
          placeholder="请输入消息..."
        >
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const messagesContainer = ref(null);
const messageInput = ref('');
const showEmoji = ref(false);
const onlineCount = ref(128);
const messages = ref([
  { username: '系统', content: '欢迎来到直播间！' }
]);

const emojis = ['😊', '😂', '🤔', '👍', '❤️', '😎', '🎉', '👏'];

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = () => {
  if (messageInput.value.trim()) {
    messages.value.push({
      username: '游客123',
      content: messageInput.value
    });
    messageInput.value = '';
    scrollToBottom();
  }
};

const insertEmoji = (emoji) => {
  messageInput.value += emoji;
  showEmoji.value = false;
};

onMounted(() => {
  scrollToBottom();
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

.emoji-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-bottom: 10px;
}

.emoji-picker span {
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
</style> 