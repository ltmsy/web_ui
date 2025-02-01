<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <div class="input-group">
        <input type="text" v-model="username" placeholder="用户名">
      </div>
      <div class="input-group">
        <input type="password" v-model="password" placeholder="密码">
      </div>
      <button @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/config';

const router = useRouter();
const store = useConfigStore();
const username = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('请输入用户名和密码');
    return;
  }

  loading.value = true;
  try {
    await store.login(username.value, password.value);
    router.push('/pc/live');
  } catch (error) {
    alert(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-dark);
}

.login-box {
  background: var(--bg-lighter);
  padding: 30px;
  border-radius: 8px;
  box-shadow: none;
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border-dark);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: var(--text-gold);
}

.input-group {
  margin-bottom: 16px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  font-size: 14px;
  background: var(--bg-darker);
  color: var(--text-primary);
}

input:focus {
  outline: none;
  border-color: var(--action-gold);
}

button {
  width: 100%;
  padding: 12px;
  background: var(--action-gold);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background: var(--bg-lighter);
  color: var(--text-muted);
  cursor: not-allowed;
}
</style> 