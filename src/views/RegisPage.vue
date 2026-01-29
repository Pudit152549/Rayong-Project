<template>
  <div class="bg-gray-100 p-6 rounded-lg w-180">
    <n-card size="huge" hoverable>
      <div>
        <h2 class="gradient-text text-2xl font-bold mb-2">Register</h2>
        <n-divider />

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
          @submit.prevent="handleRegister"
        >
          <n-form-item path="firstname" label="Firstname:" class="mb-2">
            <n-input v-model:value="form.firstname" placeholder="Firstname" class="w-full mt-1" />
          </n-form-item>

          <n-form-item path="lastname" label="Lastname:" class="mb-2">
            <n-input v-model:value="form.lastname" placeholder="Lastname" class="w-full mt-1" />
          </n-form-item>

          <!-- ✅ เพิ่ม Username -->
          <n-form-item path="username" label="Username:" class="mb-2">
            <n-input v-model:value="form.username" placeholder="Username" class="w-full mt-1" />
          </n-form-item>

          <!-- ✅ เพิ่ม Position -->
          <n-form-item path="position" label="ตำแหน่ง:" class="mb-2">
            <n-input v-model:value="form.position" placeholder="ตำแหน่ง" class="w-full mt-1" />
          </n-form-item>

          <!-- ✅ เพิ่ม Department -->
          <n-form-item path="department" label="หน่วยงาน:" class="mb-2">
            <n-input v-model:value="form.department" placeholder="หน่วยงาน" class="w-full mt-1" />
          </n-form-item>

          <n-form-item path="email" label="Email:" class="mb-2">
            <n-input v-model:value="form.email" type="text" placeholder="Email" class="w-full mt-1" />
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

          <n-button type="primary" attr-type="submit" class="mt-2 w-full">
            Register
          </n-button>

          <n-divider />

          <router-link to="/" class="text-blue-500 mt-4 block">
            <n-button strong secondary round type="info" class="w-full">
              Already have an account? Login
            </n-button>
          </router-link>
        </n-form>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import {
  NButton,
  NDivider,
  NInput,
  NCard,
  NForm,
  NFormItem,
  useNotification,
  useDialog
} from "naive-ui";
import type { FormInst, FormRules, NotificationType } from "naive-ui";
import { useUserStore } from "@/stores/user";

defineOptions({ name: "RegisPage" });

interface RegisterForm {
  firstname: string;
  lastname: string;
  username: string;
  position: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const userStore = useUserStore();
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
  username: "",
  position: "",
  department: "",
  email: "",
  password: "",
  confirmPassword: ""
});

// ✅ auto ตั้ง username จาก email (ถ้ายังไม่พิมพ์)
watch(
  () => form.email,
  (val) => {
    if (!form.username.trim() && val.includes("@")) {
      form.username = val.split("@")[0];
    }
  }
);

const isPasswordMatch = computed(() => form.password === form.confirmPassword);
const formRef = ref<FormInst | null>(null);

const rules: FormRules = {
  firstname: [{ required: true, message: "Please enter firstname", trigger: ["input", "blur"] }],
  lastname: [{ required: true, message: "Please enter lastname", trigger: ["input", "blur"] }],
  username: [{ required: true, message: "Please enter username", trigger: ["input", "blur"] }],
  position: [{ required: true, message: "Please enter position", trigger: ["input", "blur"] }],
  department: [{ required: true, message: "Please enter department", trigger: ["input", "blur"] }],
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

  const res = userStore.register({
    firstname: form.firstname.trim(),
    lastname: form.lastname.trim(),
    email: form.email.trim(),
    password: form.password,

    username: form.username.trim(),     // ✅ required by type
    avatarUrl: "",                      // ✅ optional แต่ส่งไปเลย

    position: form.position.trim(),     // ✅ เก็บใน store
    department: form.department.trim(), // ✅ เก็บใน store

    age: null,
    gender: ""
  });

  if (!res.ok) {
    notify("error", "สมัครไม่สำเร็จ", res.message);
    return;
  }

  dialog.success({
    title: "Register Successful",
    content: "ลงทะเบียนสำเร็จ",
    positiveText: "ตกลง",
    onPositiveClick: () => router.push({ name: "Login" })
  });
};
</script>

<style scoped>
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
