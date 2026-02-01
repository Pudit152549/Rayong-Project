<template>
  <!-- เต็มหน้าจอ + จัดกลาง -->
  <div class="min-h-screen w-full bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <h3 class="text-sm md:text-base my-2 text-center text-gray-800">
        การออกแบบและพัฒนาระบบติดตามความคืบหน้างาน (Scrum Board)
      </h3>

      <n-card size="huge" hoverable class="w-full">
        <h3 class="text-red-500 text-2xl font-bold text-center">Login</h3>
        <n-divider />

        <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
          <n-form-item path="email" label="Email :" class="mb-2">
            <n-input
              v-model:value="form.email"
              placeholder="E-mail"
              class="w-full mt-1 custom-input"
              type="text"
            />
          </n-form-item>

          <n-form-item path="password" label="Password :" class="mb-2">
            <n-input
              v-model:value="form.password"
              placeholder="Password"
              class="w-full mt-1 custom-input"
              type="password"
              show-password-on="click"
            />
          </n-form-item>

          <div class="flex justify-center items-center px-6">
            <n-button block type="info" attr-type="submit" class="w-full md:w-auto" :loading="loading">
              Login
            </n-button>
          </div>

          <div class="flex justify-center my-2">หรือ</div>

          <div class="flex justify-center items-center px-6">
            <n-button
              block
              class="w-full md:w-auto"
              @click="handleGoogleLogin"
              :loading="googleLoading"
            >
              <Icon icon="logos:google-icon" class="text-xl mr-2" />
              เข้าสู่ระบบด้วย Google
            </n-button>
          </div>

          <n-divider />
        </n-form>

        <div class="text-right">
          <router-link to="/register" class="px-4 py-2 rounded hover:text-white hover:bg-indigo-700">
            Register
          </router-link>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { Icon } from "@iconify/vue";
import {
  NButton,
  NDivider,
  NInput,
  NCard,
  NForm,
  NFormItem,
  useDialog
} from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";

const router = useRouter();
const userStore = useUserStore();
const dialog = useDialog();

const loading = ref(false);
const googleLoading = ref(false);

const form = reactive({
  email: "",
  password: ""
});

const rules: FormRules = {
  email: [{ required: true, message: "Please enter your email", trigger: ["input", "blur"] }],
  password: [{ required: true, message: "Please enter your password", trigger: ["input", "blur"] }]
};

const formRef = ref<FormInst | null>(null);

const handleLogin = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const res = await userStore.login(form.email, form.password);

    if (res.ok) {
      dialog.success({
        title: "Login Successful",
        content: "เข้าสู่ระบบสำเร็จ",
        positiveText: "ตกลง",
        onPositiveClick: () => router.push({ name: "Dashboard" })
      });
    } else {
      dialog.error({
        title: "Login Failed",
        content: res.message,
        positiveText: "ยืนยัน"
      });
    }
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  googleLoading.value = true;
  try {
    const res = await userStore.loginWithGoogle();
    if (!res.ok) {
      dialog.error({
        title: "Google Login Failed",
        content: res.message,
        positiveText: "ตกลง"
      });
    }
    // ถ้าสำเร็จ browser จะ redirect ไป Google แล้วกลับมาที่ /auth/callback เอง
  } finally {
    googleLoading.value = false;
  }
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
:deep(.n-input__input-el),
:deep(.n-input__placeholder) {
  text-align: left;
}
</style>
