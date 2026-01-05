<template>
  <div class="p-6 w-full">
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">
        ระบบติดตามความคืบหน้างาน (Scrum Board)
      </h2>
    </div>

    <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
      <n-space justify="end">
        <n-button type="info" @click="addData">เพิ่มข้อมูล</n-button>
      </n-space>
      <n-divider />
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <n-card class="shadow-md py-3">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-2xl font-bold text-[#111827]">
                    6
                  </div>
                  <div class="text-[#4B5563]">ทั้งหมด</div>
                </div>
                <div class="bg-[#6B7280] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
                  <Icon icon="lucide:users" width="27" height="27" />
                </div>
              </div>
            </n-card>
            <n-card class="shadow-md py-3">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-2xl font-bold text-[#DC2626]">1</div>
                  <div class="text-[#4B5563] text-[14px]">ยังไม่ดำเนินการ</div>
                </div>
                <div class="bg-[#EF4444] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
                  <Icon icon="material-symbols:cancel-outline" width="28" height="28" />
                </div>
              </div>
            </n-card>
            <n-card class="shadow-md py-3">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-2xl font-bold text-[#CA8A04]">3</div>
                  <div class="text-[#4B5563] text-[14px]">กำลังดำเนินการ</div>
                </div>
                <div class="bg-[#EAB308] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:clock-outline" width="28" height="28" />
                </div>
              </div>
            </n-card>
            <n-card class="shadow-md py-3">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-2xl font-bold text-[#059669]">1</div>
                  <div class="text-[#4B5563] text-[14px]">เสร็จสิ้น</div>
                </div>
                <div class="bg-[#10B981] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
                  <Icon icon="material-symbols:target" width="28" height="28" />
                </div>
              </div>
            </n-card>
          </div>
        <n-divider />
        <div class="grid lg:flex gap-2 w-full mb-4">
				<n-form-item label="ค้นหาแผนงาน" class="w-full" :show-feedback="false">
					<n-input v-model:value="dataStore.searchKeyword" size="large" type="text" placeholder="ค้นหา">
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
        <n-form-item label="สถานะความคืบหน้า" class="w-full" :show-feedback="false">
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            clearable
            class="my-2 md:my-0"
            placeholder="กรุณาเลือก"
          />
        </n-form-item>
			</div>

			<div class="flex gap-2 justify-center w-full mb-4">
        <NButton size="large" class="flex items-center" type="error" ghost @click="clearFilters">
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
      <div class="w-full overflow-x-auto">
        <n-data-table
          :columns="columns"
          :data="filteredRows"
          :row-key="rowKey"
          v-model:checked-row-keys="checkedRowKeys"
          size="small"
          :pagination="pagination"
          bordered
        />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useDataStore } from "../stores/data";
import {
  NButton, NDivider, NDataTable, NTag, NSpace, NIcon, NCard, NDatePicker, NInput, NFormItem, NSelect,
  type DataTableColumns
} from "naive-ui";
import { EyeOutline, CreateOutline, TrashOutline } from "@vicons/ionicons5";
import type { RowData, Status } from "../stores/data";
import { Icon } from "@iconify/vue"

const router = useRouter();
const userStore = useUserStore();
const dataStore = useDataStore();

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

const filteredRows = computed(() => dataStore.filteredRows);

const clearFilters = () => {
  dataStore.clearFilters();
};

const checkedRowKeys = ref<number[]>([]);
const rowKey = (row: RowData) => row.id;

const pageSize = ref(8);
function recomputePageSize() {
  const headerHeight = 300;
  const rowHeight = 44;
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
      { circle: true, tertiary: true, type: "info", size: "small", onClick: () => console.log("view", row) },
      { icon: () => renderIcon(EyeOutline) }
    ),
    h(
      NButton,
      { circle: true, tertiary: true, type: "warning", size: "small", onClick: () => console.log("edit", row) },
      { icon: () => renderIcon(CreateOutline) }
    ),
    h(
      NButton,
      { circle: true, tertiary: true, type: "error", size: "small", onClick: () => console.log("delete", row) },
      { icon: () => renderIcon(TrashOutline) }
    )
  ]);

const columns: DataTableColumns<RowData> = [
  { title: "ลำดับ", key: "index", align: "center", width: 100, render: renderIndex },
  { title: "ชื่อแผนงานที่รับผิดชอบ", key: "strategy", minWidth: 220, render: (r) => r.project_name?.name },
  { title: "ผู้มอบหมาย", key: "agency", minWidth: 240, render: (r) => r.assigned_agency },
  { title: "ผู้รับผิดชอบ", key: "owner", minWidth: 160, render: (r) => r.responsible_person_name },
  { title: "ระยะเวลาที่ได้รับ", key: "period", width: 280, align: "center", render: renderDateRange },
  { title: "สถานะความคืบหน้า", key: "status", width: 160, align: "center", render: renderStatus },
  { title: "การจัดการ", key: "action", width: 200, align: "center", render: renderActions }
];

const addData = () => {
  router.push({ name: "AddData" });
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
