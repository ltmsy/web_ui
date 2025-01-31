import axios from 'axios'

const api = axios.create({
  baseURL: '/api/chat',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 获取历史消息
export const getHistoryMessages = async (params) => {
  console.log('发送历史消息请求, URL:', '/history', '完整URL:', '/api/chat/history');
  console.log('请求参数:', params);
  try {
    const response = await api.post('/history', params);
    console.log('历史消息响应:', response);
    return response;
  } catch (error) {
    console.error('历史消息请求失败:', error);
    console.error('请求配置:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      headers: error.config?.headers
    });
    console.error('响应状态:', error.response?.status);
    console.error('响应数据:', error.response?.data);
    throw error;
  }
}

// 审核消息
export const auditMessage = async (params) => {
  console.log('发送审核请求, URL:', '/audit', '完整URL:', '/api/chat/audit');
  console.log('审核参数:', params);
  try {
    const response = await api.post('/audit', params);
    console.log('审核响应:', response);
    return response;
  } catch (error) {
    console.error('审核请求失败:', error);
    throw error;
  }
} 