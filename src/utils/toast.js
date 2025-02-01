let toastTimer = null;

export function showToast(message, type = 'info') {
  console.log('showToast called with:', { message, type });

  // 如果已经有toast，先移除
  if (document.querySelector('.toast')) {
    console.log('Removing existing toast');
    document.body.removeChild(document.querySelector('.toast'));
    clearTimeout(toastTimer);
  }

  // 创建toast元素
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  console.log('Toast element created:', toast);

  // 添加样式
  if (!document.querySelector('#toast-style')) {
    console.log('Adding toast styles');
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      .toast {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        transition: opacity 0.3s;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }
      .toast.success { background: rgba(82, 196, 26, 0.9); }
      .toast.warning { background: rgba(250, 173, 20, 0.9); }
      .toast.error { background: rgba(245, 34, 45, 0.9); }
    `;
    document.head.appendChild(style);
  }

  // 添加到页面
  console.log('Appending toast to body');
  document.body.appendChild(toast);

  // 2秒后移除
  toastTimer = setTimeout(() => {
    console.log('Toast timeout triggered');
    if (toast.parentNode) {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          console.log('Removing toast from DOM');
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, 2000);
} 