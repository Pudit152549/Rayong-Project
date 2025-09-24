<template>
  <div class="bg-gray-100 p-6 rounded-lg w-180">
    <n-card size="huge" hoverable>
      <h2 class="gradient-text text-2xl font-bold mb-2">
        Welcome to Scrum Board
      </h2>
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

    <p
      v-if="userStore.isLoggedIn"
      class="text-green-700 font-bold text-sm mt-2 text-center"
    >
      Login Successful
    </p>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import {
  NButton,
  NDivider,
  NInput,
  NCard,
  NForm,
  NFormItem
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
        alert("User has login");
        router.push({ name: "Home" });
      }
    };

    return {
      form,
      rules,
      formRef,
      handleLogin,
      userStore
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
