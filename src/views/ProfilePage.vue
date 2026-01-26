<template>
  <div class="page p-4 md:p-8 align-center">
    <n-card class="header" hoverable content-style="padding:0">
      <div class="user-info flex flex-col gap-4 p-4 md:p-10">
        <div class="propic flex justify-center items-center md:justify-start md:items-start rounded-full">
          <n-avatar round :size="160" :src="avatarUrl" />
        </div>

        <div class="info grow flex flex-col justify-center">
          <div class="name mb-2">
            <h1 class="text-2xl font-semibold">
              {{ profile.fullName || `${profile.firstname} ${profile.lastname}`.trim() || "-" }}
            </h1>
          </div>

          <!-- โหมดแสดงผล -->
          <h4 v-if="!isEditing" class="details flex flex-col gap-4">
            <div class="item">
              <div class="mr-2 font-semibold">ชื่อผู้ใช้: {{ username }}</div>
            </div>

            <div class="item">
              <div class="mr-2 font-semibold">ตำแหน่ง: {{ position || "-" }}</div>
            </div>

            <div class="item">
              <div class="mr-2 font-semibold">หน่วยงาน: {{ department || "-" }}</div>
            </div>

            <div class="item">
              <div class="mr-2 font-semibold">อีเมล: {{ profile.email || "-" }}</div>
            </div>
          </h4>

          <!-- โหมดแก้ไข -->
          <n-form
            v-else
            ref="formRef"
            :model="form"
            :rules="rules"
            label-placement="top"
            class="mt-2"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <n-form-item label="Firstname" path="firstname">
                <n-input v-model:value="form.firstname" placeholder="Firstname" />
              </n-form-item>

              <n-form-item label="Lastname" path="lastname">
                <n-input v-model:value="form.lastname" placeholder="Lastname" />
              </n-form-item>

              <!-- mock fields -->
              <n-form-item label="ตำแหน่ง" path="position">
                <n-input v-model:value="form.position" placeholder="ตำแหน่ง" />
              </n-form-item>

              <n-form-item label="หน่วยงาน" path="department">
                <n-input v-model:value="form.department" placeholder="หน่วยงาน" />
              </n-form-item>
            </div>
          </n-form>

          <div class="mt-4 flex gap-2 justify-end">
            <n-button secondary @click="goHome">กลับหน้า Home</n-button>

            <template v-if="!isEditing">
              <n-button type="primary" @click="startEdit">แก้ไขโปรไฟล์</n-button>
              <n-button type="error" secondary @click="handleLogout">Logout</n-button>
            </template>

            <template v-else>
              <n-button @click="cancelEdit">ยกเลิก</n-button>
              <n-button type="success" @click="saveProfile">บันทึก</n-button>
            </template>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import {
  NAvatar,
  NCard,
  NButton,
  NForm,
  NFormItem,
  NInput,
  useDialog,
  useMessage
} from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";

const avatarUrl = "";

const router = useRouter();
const userStore = useUserStore();
const dialog = useDialog();
const message = useMessage();

const profile = computed(() => userStore.profile);

const isEditing = ref(false);
const formRef = ref<FormInst | null>(null);

// mock fields
const position = ref("นักศึกษา");
const department = ref("สาขาเทคโนโลยีสารสนเทศ");

// ชื่อผู้ใช้
const username = computed(() => profile.value.email || "guest");

const form = reactive({
  firstname: profile.value.firstname || "",
  lastname: profile.value.lastname || "",
  position: position.value,
  department: department.value
});

const rules: FormRules = {
  firstname: [{ required: true, message: "กรุณากรอกชื่อ", trigger: ["input", "blur"] }],
  lastname: [{ required: true, message: "กรุณากรอกนามสกุล", trigger: ["input", "blur"] }]
};

function startEdit() {
  form.firstname = profile.value.firstname || "";
  form.lastname = profile.value.lastname || "";
  form.position = position.value;
  form.department = department.value;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  formRef.value?.restoreValidation();
}

async function saveProfile() {
  try {
    await formRef.value?.validate();

    userStore.updateProfile({
      firstname: form.firstname,
      lastname: form.lastname,
      age: profile.value.age ?? 19,
      gender: profile.value.gender || "male"
    });

    // mock fields
    position.value = form.position;
    department.value = form.department;

    message.success("บันทึกโปรไฟล์สำเร็จ");
    isEditing.value = false;
  } catch {
    // validate ไม่ผ่าน -> Naive แสดงแล้ว
  }
}

function goHome() {
  router.push({ name: "Dashboard" });
}

function handleLogout() {
  dialog.warning({
    title: "ยืนยันออกจากระบบ",
    content: "ต้องการออกจากระบบใช่ไหม?",
    positiveText: "ออกจากระบบ",
    negativeText: "ยกเลิก",
    onPositiveClick: () => {
      userStore.logout();
      router.push({ name: "Login" });
    }
  });
}
</script>

<style lang="css" scoped>
.page {
  width: 100%;
  min-height: 100vh;
}
.header {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
</style>
