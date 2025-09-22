<template>
  <div class="bg-white p-6 rounded-lg shadow-md w-160">
    <div class="text-center">
      <h2 class="bg-green-400 text-white text-2xl font-bold text-center mb-3 pb-2 pt-2 rounded br-3">
        User Profile
      </h2>
  
      <div>
        <div class="bg-green-100 block text-green-700 text-left rounded my-3">
          Firstname :
        </div>
        <input type="text" v-model="firstname" class="border p-2 rounded w-full" />
      </div>
  
      <div>
        <div class="bg-green-100 block text-green-700 text-left rounded my-3">
          Lastname :
        </div>
        <input type="text" v-model="lastname" class="border p-2 rounded w-full" />
      </div>
  
      <!-- ฟิลด์ Age -->
      <div>
        <div class="bg-green-100 block text-green-700 text-left rounded my-3">
          Age :
        </div>
        <input type="number" v-model.number="age" class="border p-2 rounded w-full" />
      </div>
  
      <!-- ฟิลด์ Gender -->
      <div>
        <div class="bg-green-100 block text-green-700 text-left rounded my-3">
          Gender :
        </div>
        <select v-model="gender" class="border p-2 rounded w-full">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
  
      <!-- แสดงข้อความเมื่ออัปเดตข้อมูลสำเร็จ -->
      <div v-if="isUpdated" class="text-green-500 mt-4">
        Profile updated successfully!
      </div>
  
      <!-- ปุ่ม Update Profile จะ disable เมื่อฟิลด์ใดฟิลด์หนึ่งว่างเปล่า -->
      <button 
        @click="updateProfile" 
        class="bg-green-500 text-green-700 px-4 py-2 rounded hover:bg-green-600 mt-4"
        :disabled="!isFormValid">
        Update Profile
      </button>
  
      <div class="mt-4">
        <RouterLink to="/home" class="text-blue-500 hover:underline">
          Back to Home
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const firstname = ref('');
const lastname = ref('');
const age = ref<number | null>(null);
const gender = ref('');
const isUpdated = ref(false);

// computed property ตรวจสอบว่าข้อมูลครบทุกช่องหรือไม่
const isFormValid = computed(() => {
  return (
    firstname.value.trim() !== '' &&
    lastname.value.trim() !== '' &&
    age.value !== null &&
    gender.value.trim() !== ''
  );
});

const updateProfile = () => {
  if (!isFormValid.value) {
    // หากฟิลด์ใดว่าง ไม่ดำเนินการอัปเดต
    return;
  }
  userStore.updateProfile({
    firstname: firstname.value,
    lastname: lastname.value,
    age: age.value || 0,
    gender: gender.value,
  });
  isUpdated.value = true;
};

watch([firstname, lastname, age, gender], () => {
  isUpdated.value = false;
});

onMounted(() => {
  firstname.value = userStore.firstname;
  lastname.value = userStore.lastname;
  age.value = userStore.age;
  gender.value = userStore.gender;
});
</script>

<style scoped>

</style>
