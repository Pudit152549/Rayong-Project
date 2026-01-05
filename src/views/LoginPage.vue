<template>
  <!-- เต็มหน้าจอ + จัดกลาง -->
  <div class="min-h-screen w-full bg-gray-100 flex items-center justify-center px-4">
    <!-- กล่องคุมความกว้างแบบ responsive -->
    <div class="w-full max-w-md">
      <!-- Logo
      <div class="flex justify-center mb-3">
        <img
          :src="logoUrl"
          alt="Stream Logo"
          class="h-24 md:h-28 w-auto object-contain"
        />
      </div> -->
      <h3 class="text-sm md:text-base my-2 text-center text-gray-800">
        การออกแบบและพัฒนาระบบติดตามความคืบหน้างาน (Scrum Board)
      </h3>

      <n-card size="huge" hoverable class="w-full">
        <h3 class="text-red-500 text-2xl font-bold text-center">
          Login
        </h3>
        <n-divider />

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleLogin"
        >
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
            <n-button block type="info" attr-type="submit" class="w-full md:w-auto">
              Login
            </n-button>
          </div>
          <div class="flex justify-center">
            หรือ
          </div>
          <div class="flex justify-center items-center px-6">
            <n-button block class="w-full md:w-auto">
              <Icon icon="logos:google-icon" class="text-xl mr-2" />
              เข้าสู่ระบบด้วย Google
            </n-button>
          </div>

          <n-divider />
        </n-form>

        <div class="text-right">
          <router-link
            to="/register"
            class="px-4 py-2 rounded hover:text-white hover:bg-indigo-700"
          >
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
import { useUserStore } from "../stores/user";
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

/* router / store / dialog */
const router = useRouter();
const userStore = useUserStore();
const dialog = useDialog();

/* form state */
const form = reactive({
  email: "",
  password: ""
});

/* form rules */
const rules: FormRules = {
  email: [
    { required: true, message: "Please enter your email", trigger: ["input", "blur"] }
  ],
  password: [
    { required: true, message: "Please enter your password", trigger: ["input", "blur"] }
  ]
};

/* form ref */
const formRef = ref<FormInst | null>(null);

const handleLogin = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

const res = userStore.login(form.email, form.password);

  if (res.ok) {
    dialog.success({
      title: "Login Successful",
      content: "เข้าสู่ระบบสำเร็จ",
      positiveText: "ตกลง",
      onPositiveClick: () => router.push({ name: "Dashboard" }) // หรือ "/app/dashboard"
    });
  } else {
    dialog.error({
      title: "Login Failed",
      content: res.message,
      positiveText: "ยืนยัน"
    });
  }
};
</script>

<style scoped>
/* space เดิม */
form div {
  margin-bottom: 10px;
}
label {
  margin-bottom: 8px;
}
button {
  margin-top: 15px;
}
/* gradient เดิม */
.gradient-text {
  background: linear-gradient(90deg, #d000ff, #9000ff, #001eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
:deep(.n-input__input-el) {
  text-align: left;       /* ชิดซ้าย */
}

:deep(.n-input__placeholder) {
  text-align: left;       /* ชิดซ้าย */
}
</style>
