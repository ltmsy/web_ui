<template>
  <div class="mobile-login">
    <div class="login-header">
      <img :src="logoUrl" alt="Logo" class="logo" v-if="logoUrl">
      <h2 v-else>用户登录</h2>
    </div>

    <div class="login-form">
      <div class="form-item">
        <input 
          type="text" 
          v-model="username" 
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
        >
      </div>
      <div class="form-item">
        <input 
          type="password" 
          v-model="password" 
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        >
      </div>
      <div class="form-item">
        <button 
          class="login-btn" 
          @click="handleLogin"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
      <div class="back-btn" @click="$router.push('/mobile/live')">
        返回直播间
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { showMobileMessage } from '@/utils/mobileMessage.js';

const router = useRouter();
const store = useConfigStore();
const { logoUrl } = storeToRefs(store);

const username = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    showMobileMessage('请填写完整的登录信息', 'warning');
    return;
  }

  loading.value = true;
  try {
    await store.login(username.value, password.value);
    showMobileMessage('登录成功', 'success');
    router.push('/mobile/live');
  } catch (error) {
    console.error('登录失败:', error);
    if (error.message === '用户名或密码错误') {
      showMobileMessage('账号或密码不正确', 'error');
    } else if (error.message) {
      showMobileMessage(error.message, 'error');
    } else {
      showMobileMessage('网络异常，请稍后重试', 'error');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.mobile-login {
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-header {
  margin: 40px 0;
  text-align: center;
  color: var(--text-gold);
}

.logo {
  max-width: 200px;
  height: auto;
}

.login-form {
  width: 100%;
  max-width: 300px;
  padding: 20px;
  background: var(--bg-lighter);
  border: 1px solid var(--border-dark);
  border-radius: 8px;
}

.form-item {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  font-size: 16px;
  background: var(--bg-darker);
  color: var(--text-primary);
}

input:focus {
  outline: none;
  border-color: var(--action-blue);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: var(--action-gold);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.login-btn:disabled {
  background: var(--bg-lighter);
  color: var(--text-muted);
  cursor: not-allowed;
}

.back-btn {
  text-align: center;
  color: var(--text-muted);
  margin-top: 20px;
  cursor: pointer;
}

.back-btn:active {
  opacity: 0.7;
}
</style> 