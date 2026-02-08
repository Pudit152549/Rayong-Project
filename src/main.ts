import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { createPinia } from 'pinia'
import { useUserStore } from "@/stores/user";

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
const userStore = useUserStore();
await userStore.initAuth();
app.mount('#app')
