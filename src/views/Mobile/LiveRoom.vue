<template>
  <div class="mobile-live-room">
    <!-- 播放器区域 -->
    <div class="player-section">
      <LivePlayer :pull-url="pullUrl" />
    </div>

    <!-- 功能按钮区 -->
    <div class="action-bar">
  
      <div class="action-btn" @click="handleSignIn">
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
import { ref, computed } from 'vue';
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

// 签到处理
const handleSignIn = async () => {
  if (!token.value) {
    alert('请先登录！');
    return;
  }

  try {
    const { data } = await checkin();
    alert(data.message);
  } catch (error) {
    console.error('签到失败:', error);
    if (error.response?.status === 401) {
      alert('请先登录');
    } else if (error.response?.status === 400) {
      alert(error.response.data.message);
    } else {
      alert('签到失败，请稍后重试');
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
  background: #f5f5f5;
}

.player-section {
  width: 100%;
  /* 16:9 比例 */
  padding-top: 56.25%;
  position: relative;
  background: #000;
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
  padding: 10px;
  gap: 10px;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.action-btn {
  flex: 0 0 auto;
  min-width: 70px;
  padding: 8px 0;
  text-align: center;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
  display: inline-block;
}

.action-btn:last-child {
  margin-right: 0;
}

.login-btn {
  background: #1890ff;
  color: white;
  margin-left: auto;
}

.login-btn:active {
  background: #096dd9;
}

.logout-btn {
  background: #ff4d4f;
  color: white;
  margin-left: auto;
}

.logout-btn:active {
  background: #cf1322;
}

.chat-section {
  flex: 1;
  overflow: hidden;
  padding: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 90%;
  max-height: 90vh;
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
  background: #fff;
  border: none;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
}

.action-bar::-webkit-scrollbar {
  display: none;
}

.action-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style> 