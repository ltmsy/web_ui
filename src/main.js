import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import MessageBox from './components/MessageBox.vue'

import './style.css'
import './styles/theme.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)

// 全局提示方法
const showMessage = (message, type = 'info') => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  const app = createApp(MessageBox, {
    visible: true,
    message,
    type,
    onClose: () => {
      app.unmount()
      document.body.removeChild(div)
    }
  })

  app.mount(div)
}

app.config.globalProperties.$message = showMessage

app.mount('#app') 