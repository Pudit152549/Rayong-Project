<template>
  <div class="page p-4 md:p-8 align-center">
    <n-card class="header" hoverable content-style="padding:0">
      <div class="user-info flex flex-col gap-4 p-4 md:p-10">
        <div class="propic flex justify-center items-center md:justify-start md:items-start">
          <n-avatar :size="160" :src="avatarUrl" />
        </div>

        <div class="info grow flex flex-col justify-center">
          <div class="name mb-2">
            <h1 class="text-2xl font-semibold">
              {{ userStore.fullName || `${userStore.firstname} ${userStore.lastname}` || "-" }}
            </h1>
          </div>

          <!-- โหมดแสดงผล -->
          <h4 v-if="!isEditing" class="details flex flex-col gap-4">
            <div class="item">
              <strong class="mr-2">ชื่อผู้ใช้:</strong>
              <span>{{ username }}</span>
            </div>

            <div class="item">
              <strong class="mr-2">ตำแหน่ง:</strong>
              <span>{{ position || "-" }}</span>
            </div>

            <div class="item">
              <strong class="mr-2">หน่วยงาน:</strong>
              <span>{{ department || "-" }}</span>
            </div>

            <div class="item">
              <strong class="mr-2">อีเมล:</strong>
              <span>{{ userStore.email || "-" }}</span>
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

              <!-- 2 ช่องนี้ mock ไปก่อน (ยังไม่อยู่ใน userStore) -->
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
import { NAvatar, NCard, NButton, NForm, NFormItem, NInput, useDialog, useMessage } from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";

// ✅ ถ้ามีรูปใน assets ก็ใส่ได้ (ไม่มีไม่เป็นไร)
const avatarUrl = ""; // เช่น import avatarUrl from "../assets/avatar.png"

const router = useRouter();
const userStore = useUserStore();
const dialog = useDialog();
const message = useMessage();

const isEditing = ref(false);
const formRef = ref<FormInst | null>(null);

// mock fields (เพราะ userStore ยังไม่มี position/department)
const position = ref("นักศึกษา");
const department = ref("สาขาเทคโนโลยีสารสนเทศ");

// ชื่อผู้ใช้: ใช้ email ก่อน ถ้าไม่มีค่อย fallback
const username = computed(() => userStore.email || "guest");

const form = reactive({
  firstname: userStore.firstname || "",
  lastname: userStore.lastname || "",
  position: position.value,
  department: department.value
});

const rules: FormRules = {
  firstname: [{ required: true, message: "กรุณากรอกชื่อ", trigger: ["input", "blur"] }],
  lastname: [{ required: true, message: "กรุณากรอกนามสกุล", trigger: ["input", "blur"] }]
};

function startEdit() {
  form.firstname = userStore.firstname || "";
  form.lastname = userStore.lastname || "";
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

    // ✅ อัปเดตข้อมูลที่ store มีอยู่จริง
    userStore.updateProfile({
      firstname: form.firstname,
      lastname: form.lastname,
      age: userStore.age ?? 19,       // ถ้าอยากแก้ age เพิ่มในฟอร์มได้
      gender: userStore.gender || "male"
    });

    // ✅ เก็บ mock fields ไว้ชั่วคราวในหน้า (ถ้าจะเก็บจริง ควรเพิ่ม field ใน userStore)
    position.value = form.position;
    department.value = form.department;

    message.success("บันทึกโปรไฟล์สำเร็จ");
    isEditing.value = false;
  } catch {
    // validate ไม่ผ่าน -> Naive แสดงแล้ว
  }
}

function goHome() {
  router.push({ name: "Home" });
}

function handleLogout() {
  dialog.warning({
    title: "ยืนยันออกจากระบบ",
    content: "ต้องการออกจากระบบใช่ไหม?",
    positiveText: "ออกจากระบบ",
    negativeText: "ยกเลิก",
    onPositiveClick: () => {
      userStore.logout();
      router.push({ name: "Login" }); // หรือ "/" แล้วแต่ router ของคุณ
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
