<template>
  <div class="p-6 w-full">
    <div class="text-center mb-6 bg-white p-6 rounded-md shadow-md w-full max-w-screen-xl mx-auto">
      <h2 class="gradient-text text-2xl font-bold mb-2">
        ระบบติดตามความคืบหน้างาน (Scrum Board)
      </h2>
      <div class="text-lg font-bold text-[#111827]">
        ฝ่ายแผนก {{ Department }}
      </div>
    </div>

    <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
      <n-space justify="end">
        <n-button type="info" @click="addData">
          <Icon icon="ic:baseline-plus" class="text-xl mr-2" />
          เพิ่มข้อมูล
        </n-button>
      </n-space>
      <n-divider />
      <SummaryCards :rows="rows" />
      <n-divider />
        <div class="grid lg:flex gap-2 w-full mb-4">
				<n-form-item label="ค้นหาแผนงาน" class="w-full" :show-feedback="false">
					<n-input v-model:value="searchKeyword" size="large" type="text" placeholder="ค้นหา">
						<template #suffix>
							<n-icon>
								<Icon icon="bx:search-alt" />
							</n-icon>
						</template>
					</n-input>
				</n-form-item>
        <n-form-item label="สถานะความคืบหน้า" class="w-full" :show-feedback="false">
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            clearable
            class="my-2 md:my-0"
            placeholder="กรุณาเลือก"
            size="large"
          />
        </n-form-item>
			</div>

			<div class="flex gap-2 justify-center w-full mb-4">
        <NButton size="large" class="flex items-center" type="error" ghost @click="clearFilters">
          ล้างการค้นหา
        </NButton>
				<NButton type="primary" size="large" class="flex items-center">
					<template #icon>
						<Icon icon="bx-search" class="text-2xl" />
					</template>
					ค้นหาข้อมูล
				</NButton>
			</div>
      <n-divider />
      <div class="w-full overflow-x-auto">
        <n-card class="shadow-md py-3">
          <n-data-table
            :columns="columns"
            :data="filteredRows"
            :row-key="rowKey"
            v-model:checked-row-keys="checkedRowKeys"
            size="small"
            :pagination="pagination"
            bordered
          />
        </n-card>
      </div>
    </n-card>
    <n-modal v-model:show="showViewModal" :mask-closable="false">
      <n-card
        style="width: 820px; max-width: calc(100vw - 32px);"
        title="ดูรายละเอียดแผนงาน"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form v-if="selectedRow" label-placement="top" size="large">
          <div class="grid md:grid-cols-2 gap-4">
            <n-form-item label="ชื่อแผนงานที่รับผิดชอบ">
              <n-input :value="selectedRow.project_name?.name" disabled />
            </n-form-item>
            <n-form-item label="ผู้มอบหมาย">
              <n-input :value="selectedRow.assigned_agency" disabled />
            </n-form-item>
            <n-form-item label="ผู้รับผิดชอบ">
              <n-input :value="selectedRow.responsible_person_name" disabled />
            </n-form-item>
            <n-form-item label="สถานะความคืบหน้า">
              <n-select
                :value="selectedRow.status"
                :options="statusOptions"
                disabled
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="ระยะเวลาที่ได้รับ" class="md:col-span-2">
              <n-date-picker
                type="daterange"
                :value="selectedRow.period"
                disabled
                class="w-full"
                clearable
              />
            </n-form-item>
          </div>
        </n-form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="closeViewModal">ปิด</n-button>
            <!-- <n-button
              type="warning"
              @click="goEditFromModal"
              :disabled="!selectedRow"
            >
              แก้ไข
            </n-button> -->
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
// import { useUserStore } from "../stores/user";
import { useHrDataStore } from "@/stores/HumanResource/data";
import {
  NButton, 
  NDivider, 
  NDataTable, 
  NTag, 
  NSpace, 
  NIcon, 
  NCard, 
  NDatePicker, 
  NInput, 
  NForm,
  NFormItem, 
  NSelect,
  NModal,
  useDialog,
  type DataTableColumns
} from "naive-ui";
import { EyeOutline, CreateOutline, TrashOutline } from "@vicons/ionicons5";
import type { RowData, Status } from "@/stores/types";
import { Icon } from "@iconify/vue"
import SummaryCards from "@/components/SummaryCards.vue";
import { useTasksStore } from "@/stores/tasks";
const tasksStore = useTasksStore();

onMounted(async () => {
  await tasksStore.fetchByBoardSlug("hr");
});

const rows = computed(() => tasksStore.byBoard["hr"] ?? []);
const searchKeyword = ref("");

const router = useRouter();
// const userStore = useUserStore();
const dataStore = useHrDataStore();

const Department = "Human Resource";

const statusOptions = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" }
];

const statusFilter = computed({
  get: () => dataStore.statusFilter,
  set: (val) => {
    dataStore.statusFilter = val as Status | null;
  }
});

const filteredRows = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase();
  const st = statusFilter.value;

  return (tasksStore.byBoard["hr"] ?? []).filter((r) => {
    const matchKw =
      !kw ||
      r.project_name?.name?.toLowerCase().includes(kw) ||
      r.assigned_agency?.toLowerCase().includes(kw) ||
      r.responsible_person_name?.toLowerCase().includes(kw);

    const matchStatus = !st || r.status === st;
    return matchKw && matchStatus;
  });
});


const clearFilters = () => {
  searchKeyword.value = "";
  statusFilter.value = null;
};

const checkedRowKeys = ref<number[]>([]);
const rowKey = (row: RowData) => row.id;

const pagination = reactive({
  page: 1,
  pageSize: 5,
  showSizePicker: false,
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
});

const renderIndex = (_: RowData, index: number) =>
  h("span", {}, (pagination.page - 1) * pagination.pageSize + (index + 1));

const statusLabelMap: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done"
};
const statusTypeMap: Record<Status, "error" | "warning" | "success"> = {
  todo: "error",
  in_progress: "warning",
  done: "success"
};
const renderStatus = (row: RowData) =>
  h(
    NTag,
    { type: statusTypeMap[row.status], round: true, bordered: false },
    { default: () => statusLabelMap[row.status] }
  );

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
    h(
      NButton,
      { circle: true, tertiary: true, type: "info", size: "small", onClick: () => openViewModal(row) },
      { icon: () => renderIcon(EyeOutline) }
    ),
    h(
      NButton,
      { circle: true, tertiary: true, type: "warning", size: "small", 
      onClick: () =>
        router.push({
          name: "Edit",
          params: { id: row.id },
          query: { from: "HrBoard", deptKey: "hr" }
        })
      },
      { icon: () => renderIcon(CreateOutline) }
    ),
    h(
      NButton,
      { circle: true, tertiary: true, type: "error", size: "small", onClick: () => confirmDelete(row) },
      { icon: () => renderIcon(TrashOutline) }
    )
  ]);

const showViewModal = ref(false);
const selectedRow = ref<RowData | null>(null);

const openViewModal = (row: RowData) => {
  selectedRow.value = row;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedRow.value = null;
};

// const goEditFromModal = () => {
//   if (!selectedRow.value) return;
//   showViewModal.value = false;
//   router.push({ name: "Edit", params: { id: selectedRow.value.id } });
// };

const dialog = useDialog();

const confirmDelete = (row: RowData) => {
  dialog.error({
    title: "ยืนยันการลบ",
    content: "แน่ใจหรือไม่ว่าจะลบข้อมูลนี้?",
    positiveText: "ยืนยัน",
    negativeText: "ยกเลิก",
    onPositiveClick: async () => {
      // ✅ ตรงนี้ค่อยผูกกับ store/api จริงตอนพร้อม
      // ตัวอย่าง:
      await tasksStore.deleteTask("hr", row.id);
      console.log("confirm delete:", row);
    }
  });
};

const columns: DataTableColumns<RowData> = [
  { title: "ลำดับ", key: "index", align: "center", width: 100, render: renderIndex },
  { title: "ชื่อแผนงานที่รับผิดชอบ", key: "strategy", minWidth: 220, render: (row) => row.project_name?.name },
  { title: "ผู้มอบหมาย", key: "agency", minWidth: 240, render: (row) => row.assigned_agency },
  { title: "ผู้รับผิดชอบ", key: "owner", minWidth: 120, render: (row) => row.responsible_person_name },
  { title: "ระยะเวลาที่ได้รับ", key: "period", width: 280, align: "center", render: renderDateRange },
  { title: "สถานะความคืบหน้า", key: "status", width: 160, align: "center", render: renderStatus },
  { title: "การจัดการ", key: "action", width: 200, align: "center", render: renderActions }
];

const addData = () => {
  router.push({ name: "AddData", query: { from: "HrBoard", deptKey: "hr" } });
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
