<template>
  <div class="p-6 w-full">
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">แก้ไขข้อมูลแผนงาน</h2>
    </div>

    <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
      <n-space justify="end">
        <n-button type="error" ghost @click="handleCancel">ย้อนกลับ</n-button>
        <n-button type="warning" @click="handleEdit">บันทึกการแก้ไข</n-button>
      </n-space>

      <n-divider />
      <n-card v-if="loading" title="กำลังโหลด..." class="shadow-md">
        กรุณารอสักครู่
      </n-card>
      <n-card v-if="!currentRow" title="ไม่พบข้อมูล" class="shadow-md">
        ไม่พบรายการที่ต้องการแก้ไข (id: {{ props.id }})
      </n-card>

      <n-form
        v-else
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-placement="top"
        size="large"
      >
        <div class="grid md:grid-cols-2 gap-4">
          <n-form-item label="ชื่อแผนงานที่รับผิดชอบ" path="projectName">
            <n-input v-model:value="editForm.projectName" placeholder="กรอกชื่อแผนงาน" />
          </n-form-item>

          <n-form-item label="ผู้มอบหมาย" path="assignedAgency">
            <n-input v-model:value="editForm.assignedAgency" placeholder="กรอกผู้มอบหมาย/หน่วยงาน" />
          </n-form-item>

          <n-form-item label="ผู้รับผิดชอบ" path="responsiblePerson">
            <n-input v-model:value="editForm.responsiblePerson" placeholder="กรอกชื่อผู้รับผิดชอบ" />
          </n-form-item>

          <n-form-item label="ระยะเวลาที่ได้รับ" path="period" class="md:col-span-2">
            <n-date-picker
              v-model:value="editForm.period"
              type="daterange"
              class="w-full"
              clearable
              @update:value="onPeriodUpdate"
            />
          </n-form-item>

          <n-form-item label="สถานะความคืบหน้า" path="status" class="md:col-span-2">
            <n-select
              v-model:value="editForm.status"
              :options="statusOptions"
              placeholder="เลือกสถานะ"
              clearable
              class="w-full"
            />
          </n-form-item>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { FormInst, FormItemRule } from "naive-ui";
import {
  useDialog,
  useMessage
} from "naive-ui";

import type { RowData, Status } from "@/stores/types";
import { useDeptStore } from "@/stores/departmentStore";
import { useTasksStore } from "@/stores/tasks";

const props = defineProps<{ id: string }>();

const router = useRouter();
const dialog = useDialog();
const message = useMessage();

const tasksStore = useTasksStore();
const { from } = useDeptStore(); // from ยังใช้สำหรับกลับหน้าเดิมได้

const loading = ref(false);
const currentRow = ref<RowData | null>(null);


const statusOptions = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" }
];

const editForm = reactive<{
  projectName: string;
  assignedAgency: string;
  responsiblePerson: string;
  period: [number, number] | null;
  status: Status | null;
}>({
  projectName: "",
  assignedAgency: "",
  responsiblePerson: "",
  period: null,
  status: null
});

const formRef = ref<FormInst | null>(null);

const onPeriodUpdate = () => {
  formRef.value?.restoreValidation();
};

const rules = {
  projectName: { required: true, message: "กรุณากรอกชื่อแผนงาน", trigger: ["input", "blur"] },
  assignedAgency: {
    required: true,
    message: "กรุณากรอกผู้มอบหมาย/หน่วยงาน",
    trigger: ["input", "blur"]
  },
  responsiblePerson: {
    required: true,
    message: "กรุณากรอกชื่อผู้รับผิดชอบ",
    trigger: ["input", "blur"]
  },
  period: {
    trigger: ["change", "blur", "input"],
    validator: (_rule: FormItemRule, value: any) => {
      const ok =
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "number" &&
        typeof value[1] === "number";
      if (!ok) return new Error("กรุณาเลือกช่วงเวลา");
      return true;
    }
  },
  status: { required: true, message: "กรุณาเลือกสถานะ", trigger: ["change", "blur"] }
};

// ✅ โหลด task ตาม uuid โดยตรง
onMounted(async () => {
  try {
    loading.value = true;

    const row = await tasksStore.fetchOneTask(props.id);
    currentRow.value = row;

    // เติมค่าเข้า form
    editForm.projectName = row.project_name?.name ?? "";
    editForm.assignedAgency = row.assigned_agency ?? "";
    editForm.responsiblePerson = row.responsible_person_name ?? "";
    editForm.period = row.period ?? null;
    editForm.status = row.status ?? null;
  } catch (e: any) {
    message.error(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
  } finally {
    loading.value = false;
  }
});

// ✅ หา deptKey จาก board_id จริง (แม้ query หายก็ไม่พัง)
async function resolveDeptKeyFromBoardId(boardId: string): Promise<"hr" | "iot"> {
  const hrId = await tasksStore.resolveBoardIdBySlug("hr");
  if (boardId === hrId) return "hr";
  return "iot";
}

const handleEdit = async () => {
  if (!currentRow.value) return;

  try {
    await formRef.value?.validate();

    dialog.warning({
      title: "Confirm",
      content: "ยืนยันการแก้ไขข้อมูลหรือไม่?",
      positiveText: "Confirm",
      negativeText: "Cancel",
      onPositiveClick: async () => {
        try {
          loading.value = true;

          const dept = await resolveDeptKeyFromBoardId(currentRow.value!.board_id);

          await tasksStore.updateTask(dept, props.id, {
            project_name: { name: editForm.projectName },
            assigned_agency: editForm.assignedAgency,
            responsible_person_name: editForm.responsiblePerson,
            period: editForm.period,
            status: editForm.status! // rules บังคับเลือกแล้ว
          });

          message.success("แก้ไขข้อมูลสำเร็จ");
          router.push({ name: from.value });
        } catch (e: any) {
          message.error(e?.message ?? "บันทึกไม่สำเร็จ");
        } finally {
          loading.value = false;
        }
      }
    });
  } catch {
    dialog.error({
      title: "Error",
      content: "กรุณากรอกข้อมูลให้ครบ",
      positiveText: "OK"
    });
  }
};

const handleCancel = () => {
  router.push({ name: from.value });
};
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(270deg, #ffc800, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
