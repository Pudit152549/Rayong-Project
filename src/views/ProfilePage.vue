<template>
  <div class="page p-4 md:p-8 align-center">
    <n-card class="header" hoverable content-style="padding:0">
      <div class="user-info flex flex-col gap-4 p-4 md:p-10">
        <div class="propic flex justify-center items-center md:justify-start md:items-start">
          <n-avatar round :size="160" :src="displayAvatarUrl" />
        </div>

        <div class="info grow flex flex-col justify-center">
          <div class="name mb-2">
            <h1 class="text-2xl font-semibold">
              {{ profile.fullName || `${profile.firstname} ${profile.lastname}`.trim() || "-" }}
            </h1>
          </div>

          <!-- ✅ โหมดแสดงผล -->
          <h4 v-if="!isEditing" class="details flex flex-col gap-4">
            <div class="item">
              <div class="mr-2 font-semibold">ชื่อผู้ใช้: {{ profile.username || "-" }}</div>
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

          <!-- ✅ โหมดแก้ไข -->
          <n-form
            v-else
            ref="formRef"
            :model="form"
            :rules="rules"
            label-placement="top"
            class="mt-2"
          >
            <!-- avatar upload -->
            <div class="mb-4">
              <div class="font-semibold mb-2">รูปโปรไฟล์</div>

              <n-upload
                accept="image/*"
                :max="1"
                :show-file-list="false"
                @before-upload="handleBeforeUpload"
              >
                <n-button type="info">เลือกรูปใหม่</n-button>
              </n-upload>

              <div class="text-xs text-gray-500 mt-2">
                * ระบบจะเก็บรูปแบบ base64 (เหมาะกับงาน mock / demo)
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <n-form-item label="Username" path="username">
                <n-input v-model:value="form.username" placeholder="ตั้งชื่อผู้ใช้" />
              </n-form-item>

              <div class="hidden md:block"></div>

              <n-form-item label="Firstname" path="firstname">
                <n-input v-model:value="form.firstname" placeholder="Firstname" />
              </n-form-item>

              <n-form-item label="Lastname" path="lastname">
                <n-input v-model:value="form.lastname" placeholder="Lastname" />
              </n-form-item>

              <n-form-item label="ตำแหน่ง" path="position">
                <n-input v-model:value="form.position" placeholder="ตำแหน่ง" />
              </n-form-item>

              <n-form-item label="หน่วยงาน" path="department">
                <n-input v-model:value="form.department" placeholder="หน่วยงาน" />
              </n-form-item>
            </div>
          </n-form>

          <!-- ✅ ปุ่ม responsive: mobile = cols-1 -->
          <div class="mt-4 grid grid-cols-1 md:flex md:justify-end gap-2">
            <n-button secondary class="w-full md:w-auto" @click="goHome">
              กลับหน้า Home
            </n-button>

            <template v-if="!isEditing">
              <n-button class="w-full md:w-auto" type="primary" @click="startEdit">
                แก้ไขโปรไฟล์
              </n-button>
              <n-button class="w-full md:w-auto" type="error" secondary @click="handleLogout">
                Logout
              </n-button>
            </template>

            <template v-else>
              <n-button class="w-full md:w-auto" @click="cancelEdit">ยกเลิก</n-button>
              <n-button class="w-full md:w-auto" type="success" @click="saveProfile">
                บันทึก
              </n-button>
            </template>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  NAvatar,
  NCard,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NUpload,
  useDialog,
  useMessage
} from "naive-ui";
import type { FormInst, FormRules, UploadFileInfo } from "naive-ui";

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

// ✅ avatar preview ตอนแก้ไข (ยังไม่ save)
const tempAvatarUrl = ref<string>("");

// avatar ที่โชว์บนจอ: ถ้า edit ให้โชว์ temp ก่อน
const displayAvatarUrl = computed(() => {
  return tempAvatarUrl.value || profile.value.avatarUrl || "";
});

const form = reactive({
  username: profile.value.username || "",
  firstname: profile.value.firstname || "",
  lastname: profile.value.lastname || "",
  position: profile.value.position || "",
  department: profile.value.department || ""
});

const rules: FormRules = {
  username: [{ required: true, message: "กรุณาตั้งชื่อผู้ใช้", trigger: ["input", "blur"] }],
  firstname: [{ required: true, message: "กรุณากรอกชื่อ", trigger: ["input", "blur"] }],
  lastname: [{ required: true, message: "กรุณากรอกนามสกุล", trigger: ["input", "blur"] }]
};

function startEdit() {
  form.username = profile.value.username || profile.value.email?.split("@")[0] || "";
  form.firstname = profile.value.firstname || "";
  form.lastname = profile.value.lastname || "";
  form.position = position.value;
  form.department = department.value;

  tempAvatarUrl.value = profile.value.avatarUrl || "";
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  tempAvatarUrl.value = "";
  formRef.value?.restoreValidation();
}

// ✅ รับไฟล์รูป → แปลง base64 เพื่อ preview + เก็บลง store ตอนกด save
function handleBeforeUpload(options: { file: UploadFileInfo }) {
  const file = options.file.file;
  if (!file) return false;

  const reader = new FileReader();
  reader.onload = () => {
    tempAvatarUrl.value = String(reader.result || "");
  };
  reader.readAsDataURL(file);

  // กันไม่ให้อัปโหลดขึ้น server (เราใช้แค่ local preview / base64)
  return false;
}

async function saveProfile() {
  try {
    await formRef.value?.validate();

    userStore.updateProfile({
      username: form.username.trim(),
      avatarUrl: tempAvatarUrl.value || profile.value.avatarUrl || "",
      firstname: form.firstname,
      lastname: form.lastname,
      position: form.position.trim(),
      department: form.department.trim(),
      age: profile.value.age ?? 19,
      gender: profile.value.gender || "male"
    });

    // mock fields
    position.value = form.position;
    department.value = form.department;

    message.success("บันทึกโปรไฟล์สำเร็จ");
    isEditing.value = false;
    tempAvatarUrl.value = "";
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

<style scoped>
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
