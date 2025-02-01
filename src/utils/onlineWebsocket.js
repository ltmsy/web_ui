export class OnlineWebSocketManager {
  constructor(params) {
    const { userId, source, browser, deviceInfo } = params;
    
    // 处理浏览器信息
    const getBrowserInfo = (ua) => {
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
      return 'Unknown';
    };
    
    // 处理设备信息
    const getDeviceInfo = (platform, resolution) => {
      const os = platform.includes('Win') ? 'Windows' :
                platform.includes('Mac') ? 'Mac' :
                platform.includes('Linux') ? 'Linux' : 'Other';
      return `${os}10m`;  // 统一使用 10m 后缀
    };

    const browserName = getBrowserInfo(browser);
    const deviceString = getDeviceInfo(deviceInfo.split('|')[0], deviceInfo.split('|')[1]);

    // 对参数进行编码，防止特殊字符导致连接失败
    this.url = `ws://${window.location.host}/api/websocket/user/${encodeURIComponent(userId)}/${encodeURIComponent(source)}/${encodeURIComponent(browserName)}/${encodeURIComponent(deviceString)}`;
    this.ws = null;
  }

  connect() {
    // 如果已有连接，先关闭
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('开始建立在线状态连接:', this.url);
    this.ws = new WebSocket(this.url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('在线状态连接成功');
    };

    this.ws.onclose = () => {
      console.log('在线状态连接断开');
    };

    this.ws.onerror = (error) => {
      console.error('在线状态连接错误:', error);
    };
  }

  close() {
    if (this.ws) {
      console.log('主动关闭在线状态连接');
      this.ws.close();
      this.ws = null;
    }
  }
} 