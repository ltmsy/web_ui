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
    const url = `${CHAT_CONFIG.WS_URL}?userId=${this.params.userId}&userType=${this.params.userType}&groupCode=${this.params.groupCode}`
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.onMessage(data)
    }

    this.ws.onerror = (error) => {
      this.onError(error)
    }

    this.ws.onclose = () => {
      this.reconnect()
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