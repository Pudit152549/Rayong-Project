<template>
  <div class="p-6 w-full">
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">
        แก้ไขข้อมูลแผนงาน
      </h2>
    </div>

    <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
      <n-space justify="end">
        <n-button type="error" ghost @click="handleCancel">ย้อนกลับ</n-button>
        <n-button type="warning" @click="handleEdit">บันทึกการแก้ไข</n-button>
      </n-space>

      <n-divider />

      <!-- ไม่พบข้อมูลตาม id -->
      <n-card v-if="!currentRow" title="ไม่พบข้อมูล" class="shadow-md">
        ไม่พบรายการที่ต้องการแก้ไข (id: {{ idNumber }})
      </n-card>

      <!-- ฟอร์มแก้ไข -->
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

          <n-form-item label="ผู้รับผิดชอบ" path="responsiblePerson">
            <n-input
              v-model:value="editForm.responsiblePerson"
              placeholder="กรอกชื่อผู้รับผิดชอบ"
            />
          </n-form-item>

          <n-form-item label="ระยะเวลาที่ได้รับ" path="period">
            <n-date-picker
              v-model:value="editForm.period"
              type="daterange"
              class="w-full"
              clearable
              @update:value="onPeriodUpdate"
            />
          </n-form-item>

          <n-form-item label="สถานะความคืบหน้า" path="status">
            <n-select
              v-model:value="editForm.status"
              :options="statusOptions"
              placeholder="เลือกสถานะ"
              clearable
            />
          </n-form-item>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import type { FormInst } from "naive-ui";
import type { FormItemRule, FormValidationError } from "naive-ui";
import {
  NCard,
  NDivider,
  NSpace,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  useDialog,
  useMessage
} from "naive-ui";
import { useDataStore } from "../stores/data";
import type { Status } from "../stores/data";

// router: { path: "edit/:id", props: true }
const props = defineProps<{ id: string | number }>();

const router = useRouter();
const dataStore = useDataStore();
const dialog = useDialog();
const message = useMessage();

const idNumber = computed(() => Number(props.id));

const statusOptions = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" }
];

const currentRow = computed(() => dataStore.rows.find((r) => r.id === idNumber.value));

const editForm = reactive<{
  projectName: string;
  responsiblePerson: string;
  period: [number, number] | null;
  status: Status | null;
}>({
  projectName: "",
  responsiblePerson: "",
  period: null,
  status: null
});

// เติมค่าจาก row ที่กดแก้ไข
watchEffect(() => {
  if (!currentRow.value) return;

  editForm.projectName = currentRow.value.project_name?.name ?? "";
  editForm.responsiblePerson = currentRow.value.responsible_person_name ?? "";
  editForm.period = currentRow.value.period ?? null;
  editForm.status = currentRow.value.status ?? null;
});

const onPeriodUpdate = () => {
  formRef.value?.restoreValidation();
};

const rules = {
  projectName: {
    required: true,
    message: "กรุณากรอกชื่อแผนงาน",
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
  status: {
    required: true,
    message: "กรุณาเลือกสถานะ",
    trigger: ["change", "blur"]
  }
};

const formRef = ref<FormInst | null>(null);

const handleEdit = async () => {
  if (!currentRow.value) return;

  try {
    await formRef.value?.validate();

    dialog.warning({
      title: "Confirm",
      content: "ยืนยันการแก้ไขข้อมูลหรือไม่?",
      positiveText: "Confirm",
      negativeText: "Cancel",
      onPositiveClick: () => {
        dataStore.updateRow(idNumber.value, {
          project_name: { name: editForm.projectName },
          responsible_person_name: editForm.responsiblePerson,
          period: editForm.period,
          status: editForm.status as Status
        });

        message.success("แก้ไขข้อมูลสำเร็จ");
        router.push({ name: "Board" });
      },
      onNegativeClick: () => {
        message.info("ยกเลิกการแก้ไข");
      }
    });
  } catch (errors) {
    // errors จะเป็น array ของ validation error
    dialog.error({
      title: "Error",
      content: "กรุณากรอกข้อมูลให้ครบ",
      positiveText: "OK"
    });
  }
};


const handleCancel = () => {
  router.push({ name: "Board" }); // <-- ถ้าหน้าตารางชื่ออื่น เปลี่ยนตรงนี้
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
