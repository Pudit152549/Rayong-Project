<template>
    <div class="bg-gray-100 p-6 rounded-lg w-180">
    <!-- แสดงชื่อผู้ใช้จาก store หากมี ไม่เช่นนั้นแสดง "Login" -->
    <n-card size="huge" hoverable>
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">Register</h2>
      <n-divider />
  
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded mt-3">Firstname:</label>
        <input 
          type="text" 
          v-model="firstname" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          placeholder="Firstname"
          required 
        />
      </div>
  
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded mt-3">Lastname:</label>
        <input 
          type="text" 
          v-model="lastname" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          placeholder="Lastname"
          required 
        />
      </div>
  
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded mt-3">Email:</label>
        <input 
          type="email" 
          v-model="email" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          placeholder="Email"
          required 
        />
      </div>
  
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded mt-3">Password:</label>
        <input 
          type="password" 
          v-model="password" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          placeholder="Password"
          required 
        />
      </div>
  
      <div class="mb-4">
        <label class="block text-gray-700 text-left rounded mt-3">Confirm Password:</label>
        <input 
          type="password" 
          v-model="confirmPassword" 
          class="w-full p-2 border border-gray-300 rounded mt-1" 
          required 
        />
      </div>
  
      <button 
        type="button" 
        @click="handleRegister"
        :disabled="!isPasswordMatch"
        class="bg-red-500 text-green-700 px-4 py-2 rounded hover:bg-red-600">
        Register
      </button>
  
      <p v-if="!isPasswordMatch" class="text-red-500 mt-2">รหัสผ่านไม่ตรงกัน</p>
      <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
      <router-link to="/" class="text-blue-500 mt-4 block">
      <n-divider />
        <button class="text-blue-500 px-4 py-1 rounded">
          Already have an account? Login
        </button>
      </router-link>
    </div>
    </n-card>
</div>
  </template>
  
  <script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { NButton, NDivider, NInput, NCard } from "naive-ui"

export default {
  name: "RegisPage",
  components:{
    NButton,
    NDivider,
    NInput,
    NCard
  },

  setup() {
    const firstname = ref("");
    const lastname = ref("");
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const errorMessage = ref("");

    const router = useRouter();

    const isPasswordMatch = computed(() => password.value === confirmPassword.value);

    const handleRegister = () => {
      // ตรวจสอบว่ากรอกข้อมูลครบทุกช่องหรือไม่
      if (!firstname.value || !lastname.value || !email.value || !password.value || !confirmPassword.value) {
        errorMessage.value = "Please fill in the information.";
        return;
      }
      // ถ้าทุกช่องกรอกครบแล้วแต่รหัสผ่านไม่ตรงกัน
      if (!isPasswordMatch.value) {
        errorMessage.value = "";
        // (ข้อความรหัสผ่านไม่ตรงกันจะแสดงอยู่ใน p tag แล้ว)
        return;
      }
      
      // ถ้าทุกอย่างถูกต้อง ให้เคลียร์ errorMessage และไปหน้า Login
      errorMessage.value = "";
      alert("Register Successful");
      router.push("/");
    };

    return {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      isPasswordMatch,
      errorMessage,
      handleRegister
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
    margin-top: 10px;
  }
  .gradient-text {
  background: linear-gradient(90deg, #00ffff, #cc00ff);
  background-clip: text; /* แบบมาตรฐาน */
  -webkit-background-clip: text; /* สำหรับเว็บเบราว์เซอร์ที่ใช้ prefix */
  -webkit-text-fill-color: transparent;
}
  </style>