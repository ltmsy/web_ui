<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/config';
import { isMobile } from './utils/deviceDetect';

const router = useRouter();
const store = useConfigStore();

onMounted(async () => {
  // 获取配置信息
  await store.fetchHomeInfo();
  
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
});
</script> 