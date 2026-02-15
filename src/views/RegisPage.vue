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
          <!-- ✅ 2 cols (2 inputs/row) = 4 rows -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <n-form-item path="firstname" label="Firstname:">
              <n-input 
              ref="r0" 
              v-model:value="form.firstname" 
              placeholder="Firstname" 
              class="w-full mt-1" 
              @keydown.enter.prevent="focusNext(1)"
              />
            </n-form-item>

            <n-form-item path="lastname" label="Lastname:">
              <n-input 
              ref="r1" 
              v-model:value="form.lastname" 
              placeholder="Lastname" 
              class="w-full mt-1" 
              @keydown.enter.prevent="focusNext(2)" 
              />
            </n-form-item>

            <n-form-item path="username" label="Username:">
              <n-input 
              ref="r2" 
              v-model:value="form.username" 
              placeholder="Username" 
              class="w-full mt-1" 
              @keydown.enter.prevent="focusNext(3)" 
              />
            </n-form-item>

            <n-form-item path="position" label="ตำแหน่ง:">
              <n-input 
              ref="r3" 
              v-model:value="form.position" 
              placeholder="ตำแหน่ง" 
              class="w-full mt-1" 
              @keydown.enter.prevent="focusNext(4)" 
              />
            </n-form-item>

            <n-form-item path="department" label="หน่วยงาน:">
              <n-input 
              ref="r4" 
              v-model:value="form.department" 
              placeholder="หน่วยงาน" 
              class="w-full mt-1" 
              @keydown.enter.prevent="focusNext(5)" 
              />
            </n-form-item>

            <n-form-item path="email" label="Email:">
              <n-input 
              ref="r5" 
              v-model:value="form.email" 
              type="text" 
              placeholder="Email" 
              class="w-full mt-1" 
              @keydown.enter.prevent="focusNext(6)" 
              />
            </n-form-item>

            <n-form-item path="password" label="Password:">
              <n-input
                ref="r6"
                v-model:value="form.password"
                type="password"
                show-password-on="click"
                placeholder="Password"
                class="w-full mt-1"
                @keydown.enter.prevent="focusNext(7)"
              />
            </n-form-item>

            <n-form-item path="confirmPassword" label="Confirm Password:">
              <n-input
                ref="r7"
                v-model:value="form.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="Confirm Password"
                class="w-full mt-1"
                @keydown.enter.prevent="handleRegister"
              />
            </n-form-item>
          </div>
            <n-button block type="primary" attr-type="submit" class="w-full md:w-72">
              Register
            </n-button>
          <n-divider class="my-4" />

          <!-- ✅ buttons align center -->
          <div class="flex flex-col items-center gap-3">


            <router-link to="/" class="w-full md:w-72">
              <n-button strong secondary round type="info" class="w-full">
                Already have an account? Login
              </n-button>
            </router-link>
          </div>
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

// auto ตั้ง username จาก email (ถ้ายังไม่พิมพ์)
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
const r0 = ref<any>(null);
const r1 = ref<any>(null);
const r2 = ref<any>(null);
const r3 = ref<any>(null);
const r4 = ref<any>(null);
const r5 = ref<any>(null);
const r6 = ref<any>(null);
const r7 = ref<any>(null);

const inputRefs = [r0, r1, r2, r3, r4, r5, r6, r7];

const focusNext = (nextIndex: number) => {
  inputRefs[nextIndex]?.value?.focus?.();
};
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

  // ✅ สำคัญ: register เป็น async ต้อง await
  const res = await userStore.register({
    email: form.email.trim(),
    password: form.password,

    username: form.username.trim() || form.email.split("@")[0],
    firstname: form.firstname.trim(),
    lastname: form.lastname.trim(),
    position: form.position.trim(),
    department: form.department.trim(),

    // (ถ้าใน store รองรับ avatarUrl ก็ส่งได้ ไม่งั้นลบทิ้ง)
    avatarUrl: ""
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
:deep(.n-input__input-el),
:deep(.n-input__placeholder) {
  text-align: left;
}
</style>
