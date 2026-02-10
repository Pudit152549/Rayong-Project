<template>
  <div class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-screen-xl mx-auto space-y-6">
      <div class="text-center mb-6 bg-white p-6 rounded-md shadow-md w-full max-w-screen-xl mx-auto">
        <h2 class="text-2xl font-bold gradient-text text-center">การจัดการผู้ใช้งาน</h2>
      </div>

      <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
        <!-- Summary -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-5">
          <n-card class="shadow-md py-3">
            <div class="text-xl font-bold text-[#059669]">User</div>
            <div class="text-[#4B5563] text-[14px]">{{ userCount }}</div>
          </n-card>

          <n-card class="shadow-md py-3">
            <div class="text-xl font-bold text-[#1100ff]">Admin</div>
            <div class="text-[#4B5563] text-[14px]">{{ adminCount }}</div>
          </n-card>
        </div>

        <!-- Table -->
        <div class="w-full overflow-x-auto mt-6">
          <n-card class="shadow-md py-3">
            <div class="flex items-center justify-between mb-3">
              <p class="font-semibold">ผู้ใช้งาน</p>

              <n-button secondary :loading="loading" @click="fetchUsers">
                รีเฟรช
              </n-button>
            </div>

            <div class="w-full overflow-x-auto">
              <n-data-table
                :columns="columns"
                :data="rows"
                :row-key="rowKey"
                size="small"
                bordered
                :pagination="pagination"
              />
            </div>
          </n-card>
        </div>
      </n-card>
    </div>

    <!-- View / Edit Modal -->
    <n-modal v-model:show="showModal" :mask-closable="false">
      <n-card
        style="width: 820px; max-width: calc(100vw - 32px);"
        :title="modalMode === 'view' ? 'ดูข้อมูลผู้ใช้งาน' : 'แก้ไขข้อมูลผู้ใช้งาน'"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form v-if="selected" label-placement="top" size="large">
          <div class="grid md:grid-cols-2 gap-4">
            <n-form-item label="Username">
              <n-input v-model:value="editForm.username" :disabled="modalMode === 'view'" />
            </n-form-item>

            <n-form-item label="Email">
              <n-input :value="selected.email" disabled />
            </n-form-item>

            <n-form-item label="Firstname">
              <n-input v-model:value="editForm.firstname" :disabled="modalMode === 'view'" />
            </n-form-item>

            <n-form-item label="Lastname">
              <n-input v-model:value="editForm.lastname" :disabled="modalMode === 'view'" />
            </n-form-item>

            <n-form-item label="Position">
              <n-input v-model:value="editForm.position" :disabled="modalMode === 'view'" />
            </n-form-item>

            <n-form-item label="Department">
              <n-input v-model:value="editForm.department" :disabled="modalMode === 'view'" />
            </n-form-item>

            <n-form-item label="App Role" class="md:col-span-2">
              <n-select
                v-model:value="editForm.app_role"
                :options="roleOptions"
                :disabled="modalMode === 'view' || isOwnerRow(selected)"
                placeholder="เลือกบทบาท"
              />
              <div v-if="isOwnerRow(selected)" class="text-xs text-gray-500 mt-1">
                Owner แก้ role ไม่ได้
              </div>
            </n-form-item>
          </div>
        </n-form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="closeModal">ปิด</n-button>
            <n-button
              v-if="modalMode === 'edit'"
              type="warning"
              :loading="saving"
              :disabled="!selected || isOwnerRow(selected)"
              @click="saveEdit"
            >
              บันทึก
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import {
  NCard,
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NTag,
  NIcon,
  useDialog,
  useMessage,
  type DataTableColumns
} from "naive-ui";
import { Icon } from "@iconify/vue";
import { supabase } from "@/lib/supabase";

type AppRole = "owner" | "admin" | "user";

type ProfileRow = {
  id: string;
  email: string;
  username: string;
  firstname: string | null;
  lastname: string | null;
  position: string | null;
  department: string | null;
  app_role: AppRole;
  created_at?: string;
};

const OWNER_ID = "73ecde50-4f49-4722-af94-27296a70cd1e";

const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const saving = ref(false);

const rows = ref<ProfileRow[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 5,
  showSizePicker: false,
  onChange: (page: number) => {
    pagination.page = page;
  }
});

const rowKey = (r: ProfileRow) => r.id;

const roleOptions = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" }
];

const userCount = computed(() => rows.value.filter(r => r.app_role === "user").length);

// ตามแบบคุณมีแค่ User/Admin -> นับ owner รวมเป็น admin ไปด้วย
const adminCount = computed(() =>
  rows.value.filter(r => r.app_role === "admin" || r.app_role === "owner").length
);

function isOwnerRow(r: ProfileRow) {
  return r.id === OWNER_ID || r.app_role === "owner";
}

async function fetchUsers() {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,username,firstname,lastname,position,department,app_role,created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    rows.value = (data ?? []) as ProfileRow[];
    // ถ้าหน้าปัจจุบันเกิน pageCount หลัง refresh ให้ดึงกลับ
    const pageCount = Math.max(1, Math.ceil(rows.value.length / pagination.pageSize));
    if (pagination.page > pageCount) pagination.page = pageCount;
  } catch (e: any) {
    message.error(e?.message ?? "โหลดผู้ใช้งานไม่สำเร็จ");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUsers);

// ---------- View/Edit Modal ----------
const showModal = ref(false);
const modalMode = ref<"view" | "edit">("view");
const selected = ref<ProfileRow | null>(null);

const editForm = reactive({
  username: "",
  firstname: "",
  lastname: "",
  position: "",
  department: "",
  app_role: "user" as AppRole
});

function openView(r: ProfileRow) {
  selected.value = r;
  modalMode.value = "view";
  fillEditForm(r);
  showModal.value = true;
}

function openEdit(r: ProfileRow) {
  selected.value = r;
  modalMode.value = "edit";
  fillEditForm(r);
  showModal.value = true;
}

function fillEditForm(r: ProfileRow) {
  editForm.username = r.username ?? "";
  editForm.firstname = r.firstname ?? "";
  editForm.lastname = r.lastname ?? "";
  editForm.position = r.position ?? "";
  editForm.department = r.department ?? "";
  editForm.app_role = r.app_role ?? "user";
}

function closeModal() {
  showModal.value = false;
  selected.value = null;
}

async function saveEdit() {
  if (!selected.value) return;

  // กันแก้ owner
  if (isOwnerRow(selected.value)) {
    message.warning("Owner แก้ไข role ไม่ได้");
    return;
  }

  saving.value = true;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        username: editForm.username,
        firstname: editForm.firstname,
        lastname: editForm.lastname,
        position: editForm.position,
        department: editForm.department,
        app_role: editForm.app_role,
        updated_at: new Date().toISOString()
      })
      .eq("id", selected.value.id);

    if (error) throw new Error(error.message);

    message.success("บันทึกสำเร็จ");
    closeModal();
    await fetchUsers();
  } catch (e: any) {
    message.error(e?.message ?? "บันทึกไม่สำเร็จ");
  } finally {
    saving.value = false;
  }
}

// ---------- Delete ----------
function confirmDelete(r: ProfileRow) {
  if (isOwnerRow(r)) {
    message.warning("Owner ลบไม่ได้");
    return;
  }

  dialog.error({
    title: "ยืนยันการลบ",
    content: "ต้องการลบผู้ใช้งานรายนี้หรือไม่? (จะลบเฉพาะโปรไฟล์ในตาราง profiles)",
    positiveText: "ลบ",
    negativeText: "ยกเลิก",
    onPositiveClick: async () => {
      try {
        const { error } = await supabase.from("profiles").delete().eq("id", r.id);
        if (error) throw new Error(error.message);
        message.success("ลบสำเร็จ");
        await fetchUsers();
      } catch (e: any) {
        message.error(e?.message ?? "ลบไม่สำเร็จ");
      }
    }
  });
}

// ---------- Table Columns ----------
function renderRoleTag(r: ProfileRow) {
  const role = r.app_role;
  if (role === "owner") {
    return h(NTag, { type: "warning", round: true }, { default: () => "Owner" });
  }
  if (role === "admin") {
    return h(NTag, { type: "info", round: true }, { default: () => "Admin" });
  }
  return h(NTag, { type: "success", round: true }, { default: () => "User" });
}

function renderActions(r: ProfileRow) {
  return h("div", { class: "flex items-center justify-center gap-2" }, [
    h(
      NButton,
      { circle: true, tertiary: true, type: "info", size: "small", onClick: () => openView(r) },
      { icon: () => h(NIcon, null, { default: () => h(Icon, { icon: "mdi:eye" }) }) }
    ),
    h(
      NButton,
      { circle: true, tertiary: true, type: "warning", size: "small", onClick: () => openEdit(r) },
      { icon: () => h(NIcon, null, { default: () => h(Icon, { icon: "mdi:pencil" }) }) }
    ),
    h(
      NButton,
      { circle: true, tertiary: true, type: "error", size: "small", onClick: () => confirmDelete(r) },
      { icon: () => h(NIcon, null, { default: () => h(Icon, { icon: "mdi:trash-can" }) }) }
    )
  ]);
}

// index แบบ running ตาม pagination
const renderIndex = (_: ProfileRow, index: number) =>
  h("span", {}, String((pagination.page - 1) * pagination.pageSize + (index + 1)));

const columns: DataTableColumns<ProfileRow> = [
  { title: "ลำดับ", key: "index", align: "center", minWidth: 80, render: renderIndex },
  { title: "ชื่อผู้ใช้", key: "username", minWidth: 180 },
  { title: "อีเมล", key: "email", minWidth: 240 },
  { title: "ตำแหน่ง", key: "position", minWidth: 160, render: (r) => r.position ?? "-" },
  { title: "แผนก", key: "department", minWidth: 100, render: (r) => r.department ?? "-" },
  { title: "บทบาท", key: "app_role", align: "center", minWidth: 120, render: renderRoleTag },
  { title: "การจัดการ", key: "actions", align: "center", minWidth: 180, render: renderActions }
];
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(180deg, #ffd500, #ff0000, #ff9901);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
