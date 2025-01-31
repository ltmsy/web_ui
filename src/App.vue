<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/config';
import { isMobile } from './utils/deviceDetect';

const router = useRouter();
const store = useConfigStore();

// 监听路由变化，确保用户登录状态
watch(() => router.currentRoute.value, (route) => {
  if (store.needLogin && !store.token && route.path !== '/login') {
    router.push('/login');
  }
}, { immediate: true });

onMounted(async () => {
  try {
    // 如果没有登录（没有token），或者有token但没有用户信息
    if (!store.token || (store.token && !store.userInfo)) {
      console.log('未登录或需要更新用户信息，获取主页信息...');
      await store.fetchHomeInfo();
    }
    
    // 根据设备类型自动跳转
    const currentRoute = router.currentRoute.value.path;
    if (isMobile()) {
      if (!currentRoute.includes('/mobile')) {
        router.push('/mobile/live');
      }
    } else {
      if (!currentRoute.includes('/pc')) {
        router.push('/pc/live');
      }
    }
  } catch (error) {
    console.error('初始化失败:', error);
  }
});
</script> 