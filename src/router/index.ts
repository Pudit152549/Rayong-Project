import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import HomePage from '../components/HomePage.vue'
import RegisPage from '../components/RegisPage.vue'
import ProfilePage from '../components/ProfilePage.vue'
import DataPage from '../components/DataPage.vue'
import EditPage from '../components/EditPage.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/home', name: 'Home', component: HomePage },
  { path: '/register', name: 'Register', component:RegisPage},
  { path: '/profile', name: 'Profile', component:ProfilePage},
  { path: '/data', name: 'Data', component:DataPage},
  { path: '/edit', name: 'Edit', component:EditPage}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
