import { createApp } from 'vue';

// 创建一个简单的消息组件
const MessageConstructor = {
  template: `
    <transition name="fade">
      <div v-if="visible" class="pc-message" :class="type">
        {{ message }}
      </div>
    </transition>
  `,
  data() {
    return {
      visible: false,
      message: '',
      type: 'info'
    };
  }
};

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .pc-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .pc-message.success { background-color: #52c41a; }
  .pc-message.warning { background-color: #faad14; }
  .pc-message.error { background-color: #ff4d4f; }
  .pc-message.info { background-color: #1890ff; }
  .fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
  .fade-enter-from, .fade-leave-to { 
    opacity: 0;
    transform: translate(-50%, -20px);
  }
`;
document.head.appendChild(style);

export function showMessage(message, type = 'info') {
  const div = document.createElement('div');
  document.body.appendChild(div);
  
  const app = createApp(MessageConstructor);
  const instance = app.mount(div);
  
  instance.message = message;
  instance.type = type;
  instance.visible = true;
  
  setTimeout(() => {
    instance.visible = false;
    setTimeout(() => {
      app.unmount();
      document.body.removeChild(div);
    }, 300);
  }, 2000);
} 