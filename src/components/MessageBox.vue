<template>
  <transition name="fade">
    <div v-if="isVisible" class="mobile-message" :class="messageType">
      {{ messageText }}
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
      messageText: '',
      messageType: 'info'
    }
  },
  methods: {
    show(message, type = 'info') {
      this.messageText = message;
      this.messageType = type;
      this.isVisible = true;
      
      // 自动隐藏
      setTimeout(() => {
        this.isVisible = false;
      }, 2000);
    }
  }
}
</script>

<style scoped>
.mobile-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  z-index: 10000;
  text-align: center;
  min-width: 120px;
  max-width: 80%;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.success {
  background: rgba(82, 196, 26, 0.9);
}

.warning {
  background: rgba(250, 173, 20, 0.9);
}

.error {
  background: rgba(245, 34, 45, 0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
</style> 