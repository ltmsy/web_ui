<template>
  <header class="header">
    <div class="logo">
      <img :src="logoUrl" alt="Logo">
    </div>
    <div class="user-section">
      <template v-if="token">
        <span class="welcome">欢迎用户：{{ username }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </template>
      <template v-else>
        <span class="welcome">欢迎游客：{{ username }}</span>
        <button class="login-btn" @click="handleLogin">登录</button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useConfigStore();
const { logoUrl, userInfo, token } = storeToRefs(store);

const username = computed(() => userInfo.value?.userName || '游客');

const handleLogin = () => {
  router.push('/login');
};

const handleLogout = () => {
  store.logout();
};
</script>

<style scoped>
.header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo img {
  height: 40px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.welcome {
  font-size: 14px;
  color: #666;
}

.login-btn, .logout-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.login-btn {
  background: #1890ff;
  color: white;
}

.login-btn:hover {
  background: #40a9ff;
}

.logout-btn {
  background: #f5f5f5;
  color: #666;
}

.logout-btn:hover {
  background: #e8e8e8;
}
</style> 