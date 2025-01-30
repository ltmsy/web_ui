import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api/client'
})

export const getHomeInfo = (groupNo) => {
  return api.get(`/${groupNo}`)
}

export const login = (username, password) => {
  return api.post('/login', { username, password })
}

export const logout = () => {
  return api.post('/logout')
}

export const checkin = (userId) => {
  return api.post(`/checkin?userId=${userId}`)
} 