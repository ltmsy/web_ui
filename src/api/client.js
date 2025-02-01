import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api/client'
})

// 请求拦截器添加token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getHomeInfo = (groupNo) => {
  return api.get(`/${groupNo}`)
}

export function login(data) {
  return api.post('/login', data)
}

export const logout = () => {
  return api.post('/logout')
}

export const checkin = (userId) => {
  return api.post(`/checkin?userId=${userId}`)
} 