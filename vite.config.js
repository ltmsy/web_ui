import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: '/',
  server: {
    port: 5173,
    host: true,
    proxy: {
      // 客户端API代理
      '/api/client': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      // 聊天相关的API直接代理到8085
      '/api/chat': {
        target: 'http://localhost:8085',
        changeOrigin: true
      },
      // WebSocket代理
      '/api/ws': {
        target: 'ws://localhost:8085',
        ws: true,
        changeOrigin: true
      }
    }
  }
}) 