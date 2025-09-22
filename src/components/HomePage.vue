<template>
  <div class="bg-white p-6 rounded-lg shadow-md w-160">
    <div class="text-center">
    <h2 class="gradient-text text-2xl font-bold mb-2">Welcome to Home Page</h2>
    <n-divider />
    <p class="my-2">คุณเข้าสู่ระบบสำเร็จแล้ว</p>
    <n-button strong secondary round type="info">
      Info
    </n-button>
    <n-divider />
    <n-card title="Don't Press (ห้ามกดเรียงตามตัวเลข!!)" style="margin-bottom: 16px" hoverable>
    <n-tabs type="segment" animated>
      <n-tab-pane name="oasis" tab="1">
        Hey!
      </n-tab-pane>
      <n-tab-pane name="the beatles" tab="2">
        อย่ากดอันถัดไปนะ!!
      </n-tab-pane>
      <n-tab-pane name="alert!" tab="3">
        ผมเตือนแล้วนะ!!!
      </n-tab-pane>
      <n-tab-pane name="test" tab="4">
        <img src="https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif">
      </n-tab-pane>
      <n-tab-pane name="haha" tab="5">
        <img src="https://i.kym-cdn.com/photos/images/newsfeed/003/016/688/455.jpg">
      </n-tab-pane>
    </n-tabs>
  </n-card>

    <n-collapse>
    <n-collapse-item title="User" name="2">
    
    <div class="bg-blue-50 p-6 rounded-lg shadow-md w-100 mx-auto 
    flex flex-col space-y-2 grid-cols-2 mt-2">
      <p class="font-bold mb-5 text-blue-600">Profile</p>
      <div class="font-bold text-blue-700 bg-blue-100">Firstname : {{ userStore.firstname }}</div>
      <div class="font-bold text-blue-700 bg-blue-100">Lastname : {{ userStore.lastname }}</div>
      <div class="font-bold text-blue-700 bg-blue-100">Age : {{ userStore.age }}</div>
      <div class="font-bold text-blue-700 bg-blue-100">Gender : {{ userStore.gender }}</div>
    </div><br>
    <n-space vertical>
      <n-input 
      :value="value" 
      @update:value="val => value = val" 
      type="text" 
      placeholder="Basic Input" 
      />
      <n-input 
      :value="value" 
      @update:value="val => value = val" 
      type="textarea" 
      placeholder="Basic Textarea" 
      />
  </n-space>
  </n-collapse-item>
  </n-collapse>
  <n-divider />
<br>
      <n-space vertical>
        <n-carousel autoplay>
    <img
      class="carousel-img"
      src="https://www.technicrayong.ac.th/assets/img/profile.jpg"
    >
    <img
      class="carousel-img"
      src="https://technicrayong.ac.th/events/401232095_821986856391710_5704346721387249705_n.jpg"
    >
    <img
      class="carousel-img"
      src="https://www.technicrayong.ac.th/old-website/wp-content/uploads/2022/04/080465-01-1024x576.jpg"
    >
    <img 
    class="carousel-img" 
    src="https://online.hitpaw.com/images/topics/face-animator/who-is-gigachad.webp" >
  </n-carousel><br>
  <n-collapse>
    <n-collapse-item title="Info" name="1">
      <div v-for="(student, index) in students" :key="index" class="mb-4">
        <n-card :title="student.fullName" size="small" hoverable closable @close="handleClose">
          <div class="text-left bg-blue-50 mx-4 p-2">
            <div class="font-bold text-blue-700">ชื่อ-นามสกุล : {{ student.fullName }}</div>
            <div class="font-bold text-blue-700">อายุ : {{ student.age }} ปี</div>
            <div class="font-bold text-blue-700">เพศ : {{ student.gender }}</div>
            <div class="font-bold text-blue-700">สถานศึกษา : {{ student.school }}</div>
          </div>
        </n-card>
      </div>
    </n-collapse-item>
  </n-collapse>
      </n-space>

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
