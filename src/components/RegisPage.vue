<template>
  <!-- เต็มจอ + กึ่งกลางแนวนอน (และเผื่อพื้นที่ด้านบน) -->
  <div class="min-h-screen w-full bg-gray-100 flex justify-center items-start py-10">
    <!-- กล่องเนื้อหา: กว้างพอดีทุกหน้าจอ -->
    <div class="w-full max-w-xl px-4">
      <n-card size="huge" hoverable class="shadow">
        <div>
          <h2 class="gradient-text text-2xl font-bold mb-2 text-center">Register</h2>
          <n-divider />

          <n-form
            ref="formRef"
            :model="form"
            :rules="rules"
            @submit.prevent="handleRegister"
          >
            <n-form-item path="firstname" label="Firstname:" class="mb-2">
              <n-input
                v-model:value="form.firstname"
                placeholder="Firstname"
                class="w-full mt-1"
              />
            </n-form-item>

            <n-form-item path="lastname" label="Lastname:" class="mb-2">
              <n-input
                v-model:value="form.lastname"
                placeholder="Lastname"
                class="w-full mt-1"
              />
            </n-form-item>

            <n-form-item path="email" label="Email:" class="mb-2">
              <n-input
                v-model:value="form.email"
                type="text"
                placeholder="Email"
                class="w-full mt-1"
              />
            </n-form-item>

            <n-form-item path="password" label="Password:" class="mb-2">
              <n-input
                v-model:value="form.password"
                type="password"
                show-password-on="click"
                placeholder="Password"
                class="w-full mt-1"
              />
            </n-form-item>

            <n-form-item path="confirmPassword" label="Confirm Password:" class="mb-2">
              <n-input
                v-model:value="form.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="Confirm Password"
                class="w-full mt-1"
              />
            </n-form-item>
            <!-- ปุ่มเต็มความกว้าง -->
            <n-space justify="center">
              <n-button type="primary" attr-type="submit" class="mt-2 w-full">
                Register
              </n-button>
            </n-space>
            <n-divider />
            <!-- ลิงก์กลับหน้า Login จัดกลาง -->
            <router-link to="/" class="block text-center mt-2">
              <n-button strong secondary round type="info">
                Already have an account? Login
              </n-button>
            </router-link>
          </n-form>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  NButton, NDivider, NInput, NCard, NForm, NFormItem,
  useNotification, useDialog, NSpace
} from "naive-ui";
import type { FormInst, FormRules, NotificationType } from "naive-ui";

defineOptions({ name: "RegisPage" });

interface RegisterForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const router = useRouter();
const dialog = useDialog();
const notification = useNotification();

function notify(type: NotificationType, message: string, meta?: string) {
  notification[type]({
    content: message,
    meta,
    duration: 3500,
    keepAliveOnHover: true
  });
}

const form = reactive<RegisterForm>({
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: ""
});

const isPasswordMatch = computed(() => form.password === form.confirmPassword);
const formRef = ref<FormInst | null>(null);

const rules: FormRules = {
  firstname: [{ required: true, message: "Please enter firstname", trigger: ["input", "blur"] }],
  lastname: [{ required: true, message: "Please enter lastname", trigger: ["input", "blur"] }],
  email: [{ required: true, message: "Please enter email", trigger: ["input", "blur"] }],
  password: [{ required: true, message: "Please enter password", trigger: ["input", "blur"] }],
  confirmPassword: [{ required: true, message: "Please confirm password", trigger: ["input", "blur"] }]
};

const handleRegister = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!isPasswordMatch.value) {
    notify("error", "รหัสผ่านไม่ตรงกัน");
    return;
  }

  dialog.success({
    title: "Register Successful",
    content: "ลงทะเบียนสำเร็จ",
    positiveText: "ตกลง",
    onPositiveClick: () => {
      router.push("/");
    }
  });
};
</script>

<style scoped>
/* spacing เบา ๆ */
form div { margin-bottom: 10px; }
label { margin-bottom: 8px; }

/* ปุ่มมีระยะบนเล็กน้อย */
button { margin-top: 10px; }

/* หัวข้อไล่เฉดสี */
.gradient-text {
  background: linear-gradient(90deg, #00ffff, #cc00ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ให้ข้อความและ placeholder ใน n-input ชิดซ้าย */
:deep(.n-input__input-el),
:deep(.n-input__placeholder) {
  text-align: left;
}
</style>
