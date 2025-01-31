import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1'
})

// 获取历史消息
export const getHistoryMessages = (params) => {
  return api.post('/chat/history', params)
}

// 审核消息
export const auditMessage = (params) => {
  return api.post('/chat/audit', params)
} 