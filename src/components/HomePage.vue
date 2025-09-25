<template>
  <div class="bg-white p-6 rounded-lg shadow-md w-160">
    <div class="text-center">
    <h2 class="gradient-text text-2xl font-bold mb-2">ระบบติดตามความคืบหน้างาน (Scrum Board)</h2>
  <n-divider />

    </div>
    <n-divider />
      <!-- ปุ่มไปหน้าโปรไฟล์ -->
     <div class="mx-4">
    <button 
      @click="goToProfile" 
      class="bg-blue-500 text-blue-700 px-4 py-2 rounded hover:bg-blue-600 mt-4">
      Edit Profile
    </button>

    <button 
      @click="goToData" 
      class="bg-blue-500 text-green-700 px-4 py-2 rounded hover:bg-blue-600 mt-4">
      Data
    </button>

    <!-- ปุ่มออกจากระบบ -->
    <button 
      @click="handleLogout" 
      class="bg-red-500 text-red-700 px-4 py-2 rounded hover:bg-red-600 mt-4">
      Logout
    </button>
      </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useUserStore } from '../stores/user'
import { 
  NButton,NTag,NCarousel,
  NCollapse,NCollapseItem,NDivider,
  NCard,NInput,NSpace,
  NTabs,NTabPane,NTable } from "naive-ui"
import { ref } from 'vue'

export default {
  name: "HomePage",
  components:{
    NButton,NTag,NCarousel,
    NCollapse,NCollapseItem,NDivider,
    NCard,NInput,NTable,
    NSpace,NTabs,NTabPane
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const goToProfile = () => {
      router.push("/profile");
    };
    const students = ref([
  { fullName: "Pudit Hengsiri", age: 19, gender: "ชาย", school: "Rayong Technical College" },
  { fullName: "Suda Kongsri", age: 19, gender: "หญิง", school: "Thammasat University" },
  { fullName: "Kittipong Niran", age: 21, gender: "ชาย", school: "Kasetsart University" },
  { fullName: "Malee Apichart", age: 22, gender: "หญิง", school: "Mahidol University" }
])

const goToData = () => {
      router.push("/data");
    };
      

    const handleLogout = () => {
      alert("User has logout"); // แจ้งเตือนว่าผู้ใช้ได้ออกจากระบบแล้ว
      userStore.logout();
      router.push("/");
    };

    const handleClose = () => {
      message.info('Card Close');
    };
    const test = ref()

    return { userStore, handleLogout, goToData, goToProfile, students, handleClose,value: ref(null),test };
  },
};
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(90deg, #5900ff, #00fffb,  #b301ff);
  background-clip: text; /* แบบมาตรฐาน */
  -webkit-background-clip: text; /* สำหรับเว็บเบราว์เซอร์ที่ใช้ prefix */
  -webkit-text-fill-color: transparent;
}
.carousel-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}
.n-card {
  max-width: 600px;
}
</style>
