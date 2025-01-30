<template>
  <div class="live-room">
    <Header />
    <div class="main-content">
      <div class="left-section">
        <SideMenu />
        <LivePlayer />
      </div>
      <div class="right-section">
        <ChatRoom />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import LivePlayer from '@/components/LivePlayer.vue';
import SideMenu from '@/components/SideMenu.vue';
import ChatRoom from '@/components/ChatRoom.vue';
</script>

<style scoped>
.live-room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  min-height: 0; /* 重要：允许内容在flex容器中收缩 */
  overflow: hidden; /* 防止内容溢出 */
}

.left-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0; /* 重要：允许内容在flex容器中收缩 */
  overflow: hidden; /* 防止内容溢出 */
}

.right-section {
  flex: 1;
  min-width: 300px;
  overflow: hidden; /* 防止内容溢出 */
}
</style> 