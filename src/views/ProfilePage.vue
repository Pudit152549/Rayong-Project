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

          <!-- โหมดแสดงผล -->
          <h4 v-if="!isEditing" class="details flex flex-col gap-4">
            <div class="item">
              <div class="mr-2 font-semibold">ชื่อผู้ใช้: {{ profile.username || "-" }}</div>
            </div>

            <div class="item">
              <div class="mr-2 font-semibold">ตำแหน่ง: {{ profile.position || "-" }}</div>
            </div>

            <div class="item">
              <div class="mr-2 font-semibold">หน่วยงาน: {{ profile.department || "-" }}</div>
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
              <n-button class="w-full md:w-auto" type="success" :loading="saving" @click="saveProfile">
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
import { computed, reactive, ref, watch } from "vue";
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
const displayAvatarUrl = computed(() => tempAvatarUrl.value || profile.value.avatarUrl || "");

const isEditing = ref(false);
const saving = ref(false);
const formRef = ref<FormInst | null>(null);

const tempAvatarUrl = ref<string>("");

// form สำหรับแก้ไข
const form = reactive({
  username: "",
  firstname: "",
  lastname: "",
  position: "",
  department: ""
});

const rules: FormRules = {
  username: [{ required: true, message: "กรุณาตั้งชื่อผู้ใช้", trigger: ["input", "blur"] }],
  firstname: [{ required: true, message: "กรุณากรอกชื่อ", trigger: ["input", "blur"] }],
  lastname: [{ required: true, message: "กรุณากรอกนามสกุล", trigger: ["input", "blur"] }]
};

// sync form เมื่อ profile เปลี่ยน (เช่น login ใหม่/รีเฟรช)
watch(
  () => profile.value,
  (p) => {
    if (!isEditing.value) {
      form.username = p.username || p.email?.split("@")[0] || "";
      form.firstname = p.firstname || "";
      form.lastname = p.lastname || "";
      form.position = p.position || "";
      form.department = p.department || "";
      tempAvatarUrl.value = "";
    }
  },
  { immediate: true, deep: true }
);

function startEdit() {
  form.username = profile.value.username || profile.value.email?.split("@")[0] || "";
  form.firstname = profile.value.firstname || "";
  form.lastname = profile.value.lastname || "";
  form.position = profile.value.position || "";
  form.department = profile.value.department || "";
  tempAvatarUrl.value = profile.value.avatarUrl || "";
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  tempAvatarUrl.value = "";
  formRef.value?.restoreValidation();
}

async function compressImageToBase64(
  file: File,
  opts?: {
    maxWidth?: number;   // จำกัดกว้าง/สูงสุด
    maxHeight?: number;
    quality?: number;    // 0-1 (ยิ่งต่ำยิ่งเล็ก)
    mimeType?: "image/jpeg" | "image/webp"; // แนะนำ jpeg/webp
  }
): Promise<string> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.7,
    mimeType = "image/jpeg"
  } = opts ?? {};

  // อ่านไฟล์เป็น DataURL เพื่อโหลดเข้า Image
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("โหลดรูปไม่สำเร็จ"));
    im.src = dataUrl;
  });

  // คำนวณสัดส่วนให้ไม่เกิน maxWidth/maxHeight
  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context ไม่พร้อมใช้งาน");

  // วาดรูปลง canvas
  ctx.drawImage(img, 0, 0, width, height);

  // แปลงเป็น base64 (ลดคุณภาพ)
  const compressed = canvas.toDataURL(mimeType, quality);
  return compressed;
}

async function handleBeforeUpload(options: { file: UploadFileInfo }) {
  const file = options.file.file;
  if (!file) return false;

  // กันไฟล์ที่ใหญ่แบบโหดๆ (กัน browser หน่วง)
  const maxInputMb = 6;
  if (file.size > maxInputMb * 1024 * 1024) {
    message.error(`รูปใหญ่เกินไป (เกิน ${maxInputMb}MB)`);
    return false;
  }

  try {
    // 👇 ปรับค่าตรงนี้ได้ตามใจ
    tempAvatarUrl.value = await compressImageToBase64(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.7,
      mimeType: "image/jpeg"
    });

    message.success("บีบอัดรูปเรียบร้อย");
  } catch (e: any) {
    message.error(e?.message ?? "บีบอัดรูปไม่สำเร็จ");
  }

  return false; // ไม่อัปโหลดขึ้น server
}


async function saveProfile() {
  try {
    await formRef.value?.validate()

    saving.value = true

    await userStore.updateProfile({
      username: form.username.trim(),
      avatarUrl: tempAvatarUrl.value || profile.value.avatarUrl || "",
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      position: form.position.trim(),
      department: form.department.trim()
    })

    message.success("บันทึกโปรไฟล์สำเร็จ")
    isEditing.value = false
    tempAvatarUrl.value = ""
  } catch (err: any) {
    message.error(err?.message ?? "บันทึกไม่สำเร็จ")
  } finally {
    saving.value = false
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
    onPositiveClick: async () => {
      await userStore.logout();
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
