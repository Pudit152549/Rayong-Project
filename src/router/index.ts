import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import RegisPage from '../components/RegisPage.vue'
import HomePage from '../views/HomePage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import AddDataPage from '../views/AddDataPage.vue'
import EditPage from '../views/EditPage.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/home', name: 'Home', component: HomePage },
  { path: '/register', name: 'Register', component:RegisPage},
  { path: '/profile', name: 'Profile', component:ProfilePage},
  { path: '/add', name: 'AddData', component:AddDataPage},
  { path: '/edit', name: 'Edit', component:EditPage}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
