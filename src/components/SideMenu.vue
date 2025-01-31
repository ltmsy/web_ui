<template>
  <div class="side-menu">
    <div class="menu-items">
      <div class="menu-item" @click="handleSignIn">
        <span>签到</span>
      </div>
      <div class="menu-item" @click="showSchedule = true">
        <span>课程表</span>
      </div>
      <div class="menu-item" @click="showTeacherInfo = true">
        <span>老师简介</span>
      </div>
      <div class="announcement">
        <span class="announcement-text">{{ announcement }}</span>
      </div>
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
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { checkin } from '@/api/chat';

const store = useConfigStore();
const { courseImageUrl, teacherIntroUrl, userInfo, token, announcement } = storeToRefs(store);

const showSchedule = ref(false);
const showTeacherInfo = ref(false);

const modalImage = computed(() => {
  if (showSchedule.value) return courseImageUrl.value;
  if (showTeacherInfo.value) return teacherIntroUrl.value;
  return '';
});

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

const closeModal = () => {
  showSchedule.value = false;
  showTeacherInfo.value = false;
};
</script>

<style scoped>
.side-menu {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
}

.menu-items {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-item {
  padding: 8px 15px;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.menu-item:hover {
  background: #e0e0e0;
}

.announcement {
  flex: 1;
  background: #fff;
  padding: 8px 15px;
  border-radius: 4px;
  overflow: hidden;
}

.announcement-text {
  display: block;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
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
  max-width: 80%;
  max-height: 80%;
}

.modal-content img {
  max-width: 100%;
  max-height: 100%;
}

.close-btn {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
}
</style> 