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
  background: #f5f5f5;
}

.login-box {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.input-group {
  margin-bottom: 16px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 