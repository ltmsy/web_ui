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
  background: var(--bg-darker);
  border-bottom: 1px solid var(--border-dark);
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
  color: var(--text-gold);
}

.login-btn, .logout-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.login-btn {
  background: var(--action-gold);
  color: white;
}

.logout-btn {
  background: var(--action-red);
  color: white;
}

:global(.el-message), :global(.el-message-box) {
  background: var(--message-bg) !important;
  border: 1px solid var(--message-border) !important;
  box-shadow: var(--message-shadow) !important;
  color: var(--text-primary) !important;
}

:global(.el-message__content) {
  color: var(--text-primary) !important;
}

@media (max-width: 768px) {
  .header {
    padding: 0 10px;
  }

  .welcome {
    font-size: 12px;
  }

  .login-btn, .logout-btn {
    padding: 4px 12px;
    font-size: 12px;
  }
}
</style> 