import { CHAT_CONFIG } from '@/constants/chat'

export class WebSocketManager {
  constructor(params, onMessage, onError) {
    this.params = params
    this.onMessage = onMessage
    this.onError = onError
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    // 确保参数都存在且转换为字符串
    const userId = this.params.userId?.toString() || '';
    const userType = this.params.userType?.toString() || '';
    const groupCode = this.params.groupCode?.toString() || '';

    // 构建 WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = '8085'; // WebSocket 服务器端口
    
    const url = `${wsProtocol}//${wsHost}:${wsPort}${CHAT_CONFIG.WS_URL}?userId=${userId}&userType=${userType}&groupCode=${groupCode}`;
    
    console.log('尝试连接WebSocket:', url);
    
    try {
      this.ws = new WebSocket(url);

      this.ws.onmessage = (event) => {
        try {
          console.log('WebSocket原始消息:', event.data);
          let data = event.data;
          
          // 如果是字符串，尝试解析JSON
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }

          // 验证消息格式
          if (!data || !data.messageId) {
            console.warn('收到无效消息格式:', data);
            return;
          }

          // 调用回调函数
          this.onMessage(data);
        } catch (error) {
          console.error('WebSocket消息处理错误:', error);
          console.error('原始消息:', event.data);
          this.onError(error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        this.onError(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket连接关闭，尝试重连');
        this.reconnect();
      };
    } catch (error) {
      console.error('WebSocket连接创建失败:', error);
      this.onError(error);
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect()
      }, 1000 * Math.pow(2, this.reconnectAttempts))
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
} 