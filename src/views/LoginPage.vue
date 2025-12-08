<template>
  <div class="bg-gray-100 p-6 rounded-lg w-180">
    <!-- Logo -->
    <div class="flex justify-center mb-4">
      <img :src="logoUrl" alt="Stream Logo" class="h-20" />
    </div>
    <h3 class="text-1xl my-2 text-center">
      การออกแบบและพัฒนาระบบติดตามความคืบหน้างาน (Scrum Board)
    </h3>

    <n-card size="huge" hoverable>
      <h3 class="text-red-500 text-2xl font-bold mb-2">
        Login
      </h3>
      <n-divider />

      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <n-form-item path="email" label="Email :" class="mb-4">
          <n-input
            v-model:value="form.email"
            placeholder="E-mail"
            class="w-full mt-1 custom-input"
            type="text"
          />
        </n-form-item>

        <n-form-item path="password" label="Password :" class="mb-4">
          <n-input
            v-model:value="form.password"
            placeholder="Password"
            class="w-full mt-1 custom-input"
            type="password"
            show-password-on="click"
          />
        </n-form-item>

        <div>
          <n-button type="info" attr-type="submit">
            Login
          </n-button>
          <n-divider />
        </div>
      </n-form>

      <div class="text-right mt-4">
        <router-link
          to="/register"
          class="px-4 py-2 rounded hover:text-white hover:bg-indigo-700 mt-10"
        >
          Register
        </router-link>
      </div>
    </n-card>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import logoUrl from "../assets/Stream.png";
import {
  NButton,
  NDivider,
  NInput,
  NCard,
  NForm,
  NFormItem,
  useDialog
} from "naive-ui";

export default {
  name: "LoginPage",
  components: {
    NButton,
    NDivider,
    NInput,
    NCard,
    NForm,
    NFormItem
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const dialog = useDialog();

    const form = reactive({
      email: "",
      password: ""
    });

    const rules = {
      email: [
        { required: true, message: "Please enter your email", trigger: ["input", "blur"] }
      ],
      password: [
        { required: true, message: "Please enter your password", trigger: ["input", "blur"] }
      ]
    };

    const formRef = ref(null);

    const handleLogin = async () => {
      await formRef.value?.validate();
      userStore.login(form.email, form.password);

      if (userStore.isLoggedIn) {
        dialog.success({
          title: "Login Successful",
          content: `เข้าสู่ระบบสำเร็จ`,
          positiveText: "ตกลง",
          onPositiveClick: () => {
            router.push({ name: "Home" });
          }
        });
      } else {
        dialog.error({
          title: "Login Failed",
          content: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
          positiveText: "ยืนยัน"
        });
      }
    };

    return {
      form,
      rules,
      formRef,
      handleLogin,
      userStore,
      logoUrl
    };
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
