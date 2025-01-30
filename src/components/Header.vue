<template>
  <header class="header">
    <div class="logo">
      <img :src="logoUrl" alt="Logo">
    </div>
    <div class="welcome">
      欢迎用户：{{ username }}
    </div>
  </header>
</template>

<script setup>
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const store = useConfigStore();
const { logoUrl } = storeToRefs(store);
const { userInfo } = storeToRefs(store);

const username = computed(() => userInfo.value?.userName || '游客');
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

.welcome {
  font-size: 14px;
  color: #666;
}
</style> 