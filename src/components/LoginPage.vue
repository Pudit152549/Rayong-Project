<template>
  <div class="bg-gray-100 p-6 rounded-lg w-180">
    <!-- แสดงชื่อผู้ใช้จาก store หากมี ไม่เช่นนั้นแสดง "Login" -->
    <n-card size="huge" hoverable>
    <h2 class="gradient-text text-2xl font-bold mb-2">
      Welcome to Scrum Board
    </h2>
    <n-divider />
    
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded mt-3">
          Email :
        </label>
        <input 
          type="email" 
          v-model="email" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          placeholder="E-mail"
          required 
        />
      </div>
  
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded">
          Password :
        </label>
        <input 
          type="password" 
          v-model="password" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          placeholder="Password"
          required 
        />
      </div>
  
      <div>
        <n-button type="info" @click="handleLogin">
          Login
        </n-button>
        <n-divider />
      </div>
    </form>
  
    <!-- Register link อยู่ด้านขวาสุด -->
    <div class="text-right mt-4">
      <router-link to="/register"
        class="px-4 py-2 rounded hover:text-white hover:bg-indigo-700 mt-10">
        Register
      </router-link>
    </div>
  </n-card>
    <!-- แสดงข้อความ Login Successful เมื่อเข้าสู่ระบบสำเร็จ -->
    <p v-if="userStore.isLoggedIn" class="text-green-700 font-bold text-sm mt-2 text-center">
      Login Successful
    </p>
    
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user"; // ตรวจสอบ path ให้ตรงกับโครงสร้างโปรเจ็กต์ของคุณ
import { NButton, NDivider, NInput, NCard, useDialog } from "naive-ui"
 
export default {
  name: "LoginPage",
  components:{
    NButton,
    NDivider, 
    NInput,
    NCard
  },
  setup() {
    const email = ref("");
    const password = ref("");
    const router = useRouter();
    const userStore = useUserStore();

    const handleLogin = () => {
      // เรียกใช้ action login ใน store พร้อมส่ง email กับ password
      userStore.login(email.value, password.value);
      // หากล็อกอินสำเร็จ ให้เปลี่ยนเส้นทางไปหน้า Home
      if (userStore.isLoggedIn) {
        alert("User has login");
        router.push({ name: "Home" });
      }
    };

    const handleClear = () => {
      email.value = "";
      password.value = "";
      userStore.logout();
    };

    return {
      email,
      password,
      handleLogin,
      handleClear,
      userStore
    };
  },
};
</script>

<style scoped>
form div {
  margin-bottom: 10px;
}

label {
  margin-bottom: 8px;
}

button {
  margin-top: 15px;
}
.gradient-text {
  background: linear-gradient(90deg, #d000ff, #9000ff, #001eff);
  background-clip: text; /* แบบมาตรฐาน */
  -webkit-background-clip: text; /* สำหรับเว็บเบราว์เซอร์ที่ใช้ prefix */
  -webkit-text-fill-color: transparent;
}
</style>
