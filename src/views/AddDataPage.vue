<template>
  <div class="pb-4">
    <!-- แถวหัวข้อ + ไอคอน + ปุ่ม -->
    <div class="flex flex-row justify-between items-center gap-2">
      <div class="flex flex-row items-center gap-2">
        <div class="bg-[#D7E3FF] p-2 rounded-lg">
          <Icon :icon="'bx-layer-plus'" class="text-2xl text-[#1D4CC2]" />
        </div>
        <h3>เพิ่มข้อมูลงาน</h3>
      </div>

      <div class="flex gap-3">
        <n-button class="bg-gray-200" @click="goBack" size="large">
          ยกเลิก
        </n-button>

        <n-button type="primary" attr-type="submit" size="large">
          <Icon icon="mdi:check-circle-outline" class="text-3xl pr-2" />
          บันทึก
        </n-button>
      </div>
    </div>

    <!-- เนื้อหา/การ์ดด้านล่าง แยกออกจากแถวปุ่ม -->
    <n-card hoverable class="mt-4">
      <div class="rounded-lg overflow-hidden">
        <!-- ใส่ฟอร์มหรือคอนเทนต์ของหน้าต่อจากนี้ -->
      </div>
    </n-card>
  </div>
</template>


<script lang="ts">
import {
	NButton,
	NCard,
	NForm,
	NFormItem,
	NInput,
	NDivider,
	NPagination,
	NDataTable,
	NTabs,
	NTabPane,
	NIcon,
	NSelect,
	NRadio,
	NRadioGroup,
	NSpace
} from "naive-ui"
import { useMessage } from "naive-ui"
import { defineComponent, reactive, ref } from "vue"
import type { FormInst } from "naive-ui"
import { useRoute, useRouter } from "vue-router"
export default defineComponent({
	name: "secondPlanDefault",
	components: {
		NButton,
		NCard,
		NForm,
		NFormItem,
		NInput,
		NDivider,
		NPagination,
		NDataTable,
		NTabs,
		NTabPane,
		NIcon,
		NSelect,
		NRadio,
		NRadioGroup,
		NSpace
	},
	setup() {
		const route = useRoute()
		const formRef = ref<FormInst | null>(null)
		const router = useRouter()
		const formState = reactive({
			title: "",
			issue: "",
			goal: "",
			developtitle: "",
			destination: ""
		})
		function goBack() {
			router.push({
				name: "secondPlan"
			})
		}
		return {
			formState,
			formRef,
			goBack
		}
	}
})
</script>
