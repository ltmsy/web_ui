import { createApp } from 'vue';
import MessageBox from '@/components/MessageBox.vue';

let messageInstance = null;
let messageApp = null;  // 添加这个变量来保存 app 实例

export function showMobileMessage(message, type = 'info') {
  // 如果已经有实例，先移除
  if (messageInstance) {
    if (messageApp) {
      messageApp.unmount();
    }
    document.body.removeChild(messageInstance.$el);
    messageInstance = null;
    messageApp = null;
  }

  // 创建新的消息实例
  const mountNode = document.createElement('div');
  document.body.appendChild(mountNode);
  
  messageApp = createApp(MessageBox);
  messageInstance = messageApp.mount(mountNode);
  messageInstance.show(message, type);

  // 监听动画结束后清理DOM
  setTimeout(() => {
    if (messageInstance) {
      if (messageApp) {
        messageApp.unmount();
      }
      document.body.removeChild(mountNode);
      messageInstance = null;
      messageApp = null;
    }
  }, 3000);
} 