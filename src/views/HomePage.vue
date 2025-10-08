<template>
  <div class="bg-white p-6 w-full min-h-screen">
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">
        ระบบติดตามความคืบหน้างาน (Scrum Board)
      </h2>
    </div>

    <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
      <n-space justify="end">
        <n-button type="info">เพิ่มข้อมูล</n-button>
      </n-space>
      <n-divider />
        <div class="grid lg:flex gap-2 w-full mb-4">
				<n-form-item label="ค้นหาแผนงาน" class="w-full" :show-feedback="false">
					<n-input size="large" type="text" placeholder="ค้นหา">
						<template #suffix>
							<n-icon>
								<Icon icon="bx:search-alt" />
							</n-icon>
						</template>
					</n-input>
				</n-form-item>
				<n-form-item label="หน่วยงาน" class="w-full" n-form-item :show-feedback="false">
					<n-select
						class="my-2 md:my-0"
						placeholder="กรุณาเลือก"
					/>
				</n-form-item>
				<n-form-item label="สถานะความคืบหน้า" class="w-full" n-form-item :show-feedback="false">
					<n-select
						class="my-2 md:my-0"
						placeholder="กรุณาเลือก"
					/>
				</n-form-item>
			</div>

			<div class="flex gap-2 justify-center w-full mb-4">
				<NButton size="large" class="flex items-center" type="error" ghost>
					ล้างการค้นหา
				</NButton>
				<NButton type="primary" size="large" class="flex items-center">
					<!-- <template #icon>
						<Icon icon="bx-search" class="text-2xl" />
					</template> -->
					ค้นหาข้อมูล
				</NButton>
			</div>
      <n-divider />

      <n-data-table
        :columns="columns"
        :data="rows"
        :row-key="rowKey"
        v-model:checked-row-keys="checkedRowKeys"
        size="small"
        :pagination="pagination"
        bordered
      />
    </n-card>

    <div class="mt-4">
      <n-space justify="center">
        <n-button type="error" @click="handleLogout">Logout</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import {
  NButton, NDivider, NDataTable, NTag, NSpace, NIcon, NCard, NDatePicker, NInput, NFormItem, NSelect,
  type DataTableColumns
} from "naive-ui";
import { EyeOutline, CreateOutline, TrashOutline, } from "@vicons/ionicons5";

interface RowData {
  id: number;
  project_name: { name: string };
  assigned_agency: string;
  responsible_person_name: string;
  period: [number, number] | null;
  is_active: boolean;
}

const router = useRouter();
const userStore = useUserStore();

// ✅ Mock data
const rows = reactive<RowData[]>([
  {
    id: 1,
    project_name: { name: "ยกระดับคุณภาพการศึกษาเชิงรุก" },
    assigned_agency: "สำนักงานการศึกษาขั้นพื้นฐาน",
    responsible_person_name: "สมชาย ใจดี",
    period: [1758906000000, 1759165200000],
    is_active: true
  },
  {
    id: 2,
    project_name: { name: "พัฒนาโครงสร้างพื้นฐานดิจิทัล" },
    assigned_agency: "สำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์",
    responsible_person_name: "สมปอง มีสุข",
    period: [1759200000000, 1759459200000],
    is_active: false
  }
]);

const checkedRowKeys = ref<number[]>([]);
const rowKey = (row: RowData) => row.id;

// ✅ auto pageSize ให้พอดีจอ
const pageSize = ref(8);
function recomputePageSize() {
  const headerHeight = 300; // px ใช้เวลากะคร่าว ๆ
  const rowHeight = 44;     // ความสูงของแถว size="small"
  const usable = window.innerHeight - headerHeight;
  pageSize.value = Math.max(3, Math.floor(usable / rowHeight));
}

onMounted(() => {
  recomputePageSize();
  window.addEventListener("resize", recomputePageSize);
});
onBeforeUnmount(() => window.removeEventListener("resize", recomputePageSize));

const pagination = reactive({
  page: 1,
  get pageSize() {
    return pageSize.value;
  },
  showSizePicker: false
});

const renderIndex = (_: RowData, index: number) =>
  h("span", {}, (pagination.page - 1) * pagination.pageSize + (index + 1));

const renderStatus = (row: RowData) =>
  row.is_active
    ? h(NTag, { type: "success", round: true, bordered: false }, { default: () => "Done" })
    : h(NTag, { type: "error", round: true, bordered: false }, { default: () => "To Do" });

const renderDateRange = (row: RowData) =>
  h(NDatePicker, {
    type: "daterange",
    value: row.period,
    size: "small",
    disabled: true,
    style: "width: 100%"
  });

const renderIcon = (IconComp: any) => h(NIcon, null, { default: () => h(IconComp) });

const renderActions = (row: RowData) =>
  h("div", { class: "flex items-center justify-center gap-2" }, [
    h(NButton, { circle: true, tertiary: true, type: "info", size: "small", onClick: () => console.log("view", row) }, { icon: () => renderIcon(EyeOutline) }),
    h(NButton, { circle: true, tertiary: true, type: "warning", size: "small", onClick: () => console.log("edit", row) }, { icon: () => renderIcon(CreateOutline) }),
    h(NButton, { circle: true, tertiary: true, type: "error", size: "small", onClick: () => console.log("delete", row) }, { icon: () => renderIcon(TrashOutline) })
  ]);

const columns: DataTableColumns<RowData> = [
  { 
    title: "ลำดับ", 
    key: "index", 
    align: "center", 
    width: 100,              // ✅ ขยายจาก 80 → 100
    render: renderIndex 
  },
  { 
    title: "ชื่อแผนงานที่รับผิดชอบ", 
    key: "strategy", 
    minWidth: 220,           // ✅ ขยายจาก 220 → 280
    render: (r) => r.project_name?.name 
  },
  { 
    title: "หน่วยงานที่มอบหมาย", 
    key: "agency", 
    minWidth: 240,           // เดิม 220 → 240
    render: (r) => r.assigned_agency 
  },
  { 
    title: "ผู้รับผิดชอบ", 
    key: "owner", 
    minWidth: 160,           // ✅ ขยายจาก 140 → 200
    render: (r) => r.responsible_person_name 
  },
  { 
    title: "ระยะเวลาที่ได้รับ", 
    key: "period", 
    width: 280, 
    align: "center", 
    render: renderDateRange 
  },
  { 
    title: "สถานะความคืบหน้า", 
    key: "is_active", 
    width: 150, 
    align: "center", 
    render: renderStatus 
  },
  { 
    title: "การจัดการ", 
    key: "action", 
    width: 200, 
    align: "center", 
    render: renderActions 
  }
];


const handleLogout = () => {
  userStore.logout();
  router.push("/");
};
</script>


<style scoped>
.gradient-text {
  background: linear-gradient(90deg, #5900ff, #00fffb, #b301ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
:deep(.n-input__input-el) {
  text-align: left;       /* ชิดซ้าย */
}

:deep(.n-input__placeholder) {
  text-align: left;       /* ชิดซ้าย */
}
</style>
