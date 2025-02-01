<template>
  <div class="mobile-live-room">
    <!-- 播放器区域 -->
    <div class="player-section">
      <LivePlayer :pull-url="pullUrl" />
    </div>

    <!-- 功能按钮区 -->
    <div class="action-bar">
  
      <div class="action-btn" @click="handleSignIn(this)">
        <span>签到</span>
      </div>
      <div class="action-btn" @click="showSchedule = true">
        <span>课程表</span>
      </div>
      <div class="action-btn" @click="showTeacherInfo = true">
        <span>老师简介</span>
      </div>
      <div 
        v-if="token"
        class="action-btn logout-btn" 
        @click="handleLogout"
      >
        <span>退出</span>
      </div>
      <div 
        v-if="!token"
        class="action-btn login-btn" 
        @click="$router.push('/mobile/login')"
      >
        <span>登录</span>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-section">
      <ChatRoom />
    </div>

    <!-- 弹窗组件 -->
    <div class="modal" v-if="showSchedule || showTeacherInfo" @click="closeModal">
      <div class="modal-content" @click.stop>
        <img :src="modalImage" alt="详情">
        <button class="close-btn" @click="closeModal">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/stores/config';
import LivePlayer from '@/components/LivePlayer.vue';
import ChatRoom from '@/components/ChatRoom.vue';
import { checkin } from '@/api/chat';

const store = useConfigStore();
const { 
  h5PullUrl: pullUrl,
  courseImageUrl,
  teacherIntroUrl,
  userInfo,
  token
} = storeToRefs(store);

const showSchedule = ref(false);
const showTeacherInfo = ref(false);

const modalImage = computed(() => {
  if (showSchedule.value) return courseImageUrl.value;
  if (showTeacherInfo.value) return teacherIntroUrl.value;
  return '';
});

const { proxy: currentInstance } = getCurrentInstance();

// 签到处理
const handleSignIn = async (currentInstance) => {
  if (!token.value) {
    currentInstance.$message('请先登录！', 'warning');
    return;
  }

  try {
    const { data } = await checkin();
    currentInstance.$message(data.message, 'success');
  } catch (error) {
    console.error('签到失败:', error);
    if (error.response?.status === 401) {
      currentInstance.$message('请先登录', 'error');
    } else if (error.response?.status === 400) {
      currentInstance.$message(error.response.data.message, 'error');
    } else {
      currentInstance.$message('签到失败，请稍后重试', 'error');
    }
  }
};

// 退出登录处理
const handleLogout = async () => {
  try {
    await store.logout();
  } catch (error) {
    console.error('退出失败:', error);
    alert('退出失败，请稍后重试');
  }
};

const closeModal = () => {
  showSchedule.value = false;
  showTeacherInfo.value = false;
};
</script>

<style scoped>
.mobile-live-room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-dark);
  color: var(--text-primary);
}

.player-section {
  width: 100%;
  padding-top: 56.25%;
  position: relative;
  background: var(--bg-darker);
  border-bottom: 1px solid var(--border-dark);
  margin-bottom: 1px;
}

.player-section :deep(.live-player) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.action-bar {
  display: flex;
  padding: 4px;
  gap: 8px;
  background: var(--bg-darker);
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid var(--border-dark);
  margin-bottom: 1px;
  position: relative;
}

.action-btn {
  flex: 0 0 auto;
  min-width: 70px;
  padding: 6px 12px;
  text-align: center;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  font-size: 14px;
  display: inline-block;
}

.action-btn:active {
  transform: scale(0.95);
  background: var(--glass-bg);
}

.login-btn,
.logout-btn {
  position: absolute;
  right: 4px;
  top: 4px;
  border: none;
}

.login-btn {
  background: var(--action-gold);
  color: white;
}

.login-btn:active {
  background: #096dd9;
}

.logout-btn {
  background: var(--action-red);
  color: white;
}

.logout-btn:active {
  background: #cf1322;
}

.chat-section {
  flex: 1;
  overflow: hidden;
  padding: 2px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 90%;
  max-height: 90vh;
  background: var(--bg-lighter);
  border-radius: 12px;
  border: 1px solid var(--border-dark);
  padding: 20px;
}

.modal-content img {
  width: 100%;
  height: auto;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-lighter);
  border: 1px solid var(--border-dark);
  color: var(--text-primary);
  font-size: 20px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
}

.action-bar::-webkit-scrollbar {
  display: none;
}

.action-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style> 