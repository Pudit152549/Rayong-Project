<template>
  <div class="bg-white min-h-screen w-full p-6">
    <div class="max-w-5xl mx-auto">
        <!-- แถวหัวข้อ + ปุ่ม -->
		 <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
			<div class="flex items-center justify-between">
			<h3 class="text-xl font-semibold">เพิ่มข้อมูลงาน</h3>
			<div class="flex gap-3">
				<n-button class="bg-white border border-black text-black" @click="handleCancel" size="large">
				ยกเลิก
				</n-button>
				<n-button type="success" size="large" @click="handleSubmit">
				บันทึก
				</n-button>
			</div>
			</div>

			<!-- เส้นคั่นดำ -->
			<n-divider />

			<!-- ฟอร์ม 5 ช่อง -->
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
				<n-input v-model:value="formValue.responsible_person_name" size="large" class="w-full" />
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

type Status = "todo" | "in_progress" | "done";

interface AddDataForm {
  project_name: string;
  assigned_agency: string;
  responsible_person_name: string;
  period: [number, number] | null;
  status: Status | null;
}

const router = useRouter();
const message = useMessage();

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
    period: [{ type: "array", required: true, trigger: ["change"],
				validator: (_rule, value: [number, number] | null) => {
					if (!value || !Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
					return new Error("กรุณาเลือกช่วงระยะเวลา");
					}
					return true;
				}
			}],
  status: [{ required: true, message: "กรุณาเลือกสถานะงาน", trigger: ["change", "blur"] }]
};

const handleCancel = () => {
  router.back();
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    // TODO: ส่งข้อมูลไป API ที่นี่
    message.success("บันทึกสำเร็จ");
    router.back();
  } catch {
    // ไม่ต้องทำอะไร เพิ่มเติมเมื่อ validate ไม่ผ่าน
  }
};
</script>

<style scoped>
/* ให้ตัวหนังสือใน Naive Input/Placeholder ชิดซ้าย */
:deep(.n-input__input-el),
:deep(.n-input__placeholder) {
  text-align: left;
}
</style>
