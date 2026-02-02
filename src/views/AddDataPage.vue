<template>
  <div class="bg-white min-h-screen w-full p-6">
    <div class="max-w-5xl mx-auto">
      <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="text-xl font-semibold">เพิ่มข้อมูลงาน</h3>
          <div class="grid grid-cols-2 gap-3 sm:flex">
            <n-button
              class="bg-white border border-black text-black w-full sm:w-auto"
              @click="handleCancel"
              size="large"
            >
              ยกเลิก
            </n-button>

            <n-button type="success" size="large" class="w-full sm:w-auto" @click="handleSubmit">
              บันทึก
            </n-button>
          </div>
        </div>

        <n-divider />

        <n-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          label-placement="top"
          :show-feedback="true"
          @submit.prevent="handleSubmit"
        >
          <n-form-item label="ชื่อแผนงาน" path="project_name">
            <n-input v-model:value="formValue.project_name" size="large" class="w-full" />
          </n-form-item>

          <n-form-item label="หน่วยงาน" path="assigned_agency">
            <n-input v-model:value="formValue.assigned_agency" size="large" class="w-full" />
          </n-form-item>

          <n-form-item label="ผู้รับผิดชอบ" path="responsible_person_name">
            <n-input
              v-model:value="formValue.responsible_person_name"
              size="large"
              class="w-full"
            />
          </n-form-item>

          <n-form-item label="ระยะเวลา" path="period">
            <n-date-picker
              v-model:value="formValue.period"
              type="daterange"
              size="large"
              class="w-full"
            />
          </n-form-item>

          <n-form-item label="สถานะงาน" path="status">
            <n-select
              v-model:value="formValue.status"
              :options="statusOptions"
              size="large"
              class="w-full"
              placeholder=""
            />
          </n-form-item>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NDivider,
  NCard,
  useMessage
} from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";
import { useDeptStore } from "@/stores/departmentStore";
import type { Status } from "@/stores/types";
import { useTasksStore } from "@/stores/tasks";

interface AddDataForm {
  project_name: string;
  assigned_agency: string;
  responsible_person_name: string;
  period: [number, number] | null;
  status: Status | null;
}

const router = useRouter();
const message = useMessage();
const tasksStore = useTasksStore();
const { from, deptKey } = useDeptStore();

const formValue = reactive<AddDataForm>({
  project_name: "",
  assigned_agency: "",
  responsible_person_name: "",
  period: null,
  status: null
});

const statusOptions = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" }
];

const formRef = ref<FormInst | null>(null);

const rules: FormRules = {
  project_name: [{ required: true, message: "กรุณากรอกชื่อแผนงาน", trigger: ["input", "blur"] }],
  assigned_agency: [{ required: true, message: "กรุณากรอกหน่วยงาน", trigger: ["input", "blur"] }],
  responsible_person_name: [{ required: true, message: "กรุณากรอกผู้รับผิดชอบ", trigger: ["input", "blur"] }],
  period: [
    {
      type: "array",
      required: true,
      trigger: ["change", "blur"],
      validator: (_rule, value: [number, number] | null) => {
        const ok =
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === "number" &&
          typeof value[1] === "number";

        if (!ok) return new Error("กรุณาเลือกช่วงระยะเวลา");
        return true;
      }
    }
  ],
  status: [{ required: true, message: "กรุณาเลือกสถานะงาน", trigger: ["change", "blur"] }]
};

const handleCancel = () => {
  router.push({ name: from.value });
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    await tasksStore.addTask(deptKey.value as "hr" | "iot", {
      board_id: await tasksStore.resolveBoardIdBySlug(deptKey.value as "hr" | "iot"),
      project_name: { name: formValue.project_name },
      assigned_agency: formValue.assigned_agency,
      responsible_person_name: formValue.responsible_person_name,
      period: formValue.period,
      status: formValue.status!
    });

    message.success(`บันทึกสำเร็จ (${deptKey.value.toUpperCase()})`);
    router.push({ name: from.value });
  } catch {
    // validate ไม่ผ่าน -> Naive แสดง error แล้ว
  }
};
</script>

<style scoped>
:deep(.n-input__input-el),
:deep(.n-input__placeholder) {
  text-align: left;
}
</style>
