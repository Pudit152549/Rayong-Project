<template>
  <div class="bg-white p-6 w-160">
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">
        ระบบติดตามความคืบหน้างาน (Scrum Board)
      </h2>

    </div>
      <n-card size="huge" hoverable>
        <n-space justify="end">
          <n-button type="info">
            เพิ่มข้อมูล
          </n-button>
        </n-space>
      <n-divider />
    <div class="mt-4">
      <n-data-table
        :columns="columns"
        :data="rows"
        :row-key="rowKey"
        v-model:checked-row-keys="checkedRowKeys"
        size="small"
        :pagination="pagination"
        bordered
      />
    </div>
  </n-card>

    <div class="mt-4">
      <n-button type="error" @click="handleLogout">Logout</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import {
  NButton, NDivider, NDataTable, NTag, NSpace, NIcon, NCard,
  type DataTableColumns
} from "naive-ui";
import { EyeOutline, CreateOutline, TrashOutline } from "@vicons/ionicons5";

interface RowData {
  id: number;
  BudgetAllocationStrategy: { name: string };
  name_budget_allocation_plan_item: string;
  is_active: boolean;
}

const router = useRouter();
const userStore = useUserStore();

const rows = reactive<RowData[]>([
  { id: 1, BudgetAllocationStrategy: { name: "ยกระดับคุณภาพการศึกษาเชิงรุก" }, name_budget_allocation_plan_item: "แผนงานพัฒนาหลักสูตร & ครูแกนนำ", is_active: true },
  { id: 2, BudgetAllocationStrategy: { name: "พัฒนาโครงสร้างพื้นฐานดิจิทัล" }, name_budget_allocation_plan_item: "แผนงานระบบสารสนเทศโรงเรียนระยอง", is_active: false },
]);

const checkedRowKeys = ref<number[]>([]);
const rowKey = (row: RowData) => row.id;

const pagination = reactive({
  page: 1, pageSize: 5, showSizePicker: true, pageSizes: [5, 10, 20],
  onChange: (p: number) => { pagination.page = p; },
  onUpdatePageSize: (s: number) => { pagination.pageSize = s; pagination.page = 1; }
});

const renderIndex = (_: RowData, index: number) => {
  const { page, pageSize } = pagination;
  return h("span", {}, (page - 1) * pageSize + (index + 1));
};

const renderStatus = (row: RowData) =>
  row.is_active
    ? h(NTag, { type: "success", round: true, bordered: false }, { default: () => "Done" })
    : h(NTag, { type: "error", round: true, bordered: false }, { default: () => "To Do" });

const handleView = (row: RowData) => console.log("view", row);
const handleEdit = (row: RowData) => console.log("edit", row);
const handleDelete = (row: RowData) => console.log("delete", row);

const renderIcon = (IconComp: any) => h(NIcon, null, { default: () => h(IconComp) });

const renderActions = (row: RowData) =>
  h("div", { class: "flex items-center justify-center gap-2" }, [
    h(NButton, { circle: true, tertiary: true, type: "info", size: "small", onClick: () => handleView(row) }, { icon: () => renderIcon(EyeOutline) }),
    h(NButton, { circle: true, tertiary: true, type: "warning", size: "small", onClick: () => handleEdit(row) }, { icon: () => renderIcon(CreateOutline) }),
    h(NButton, { circle: true, tertiary: true, type: "error", size: "small", onClick: () => handleDelete(row) }, { icon: () => renderIcon(TrashOutline) })
  ]);

const columns: DataTableColumns<RowData> = [
  { title: "ลำดับ", key: "index", width: 80, align: "center", render: renderIndex },
  { title: "ชื่อแผนงานที่รับผิดชอบ", key: "strategy", width: 220, render: (r) => r.BudgetAllocationStrategy?.name },
  { title: "ผู้รับผิดชอบ", key: "plan", width: 220, render: (r) => r.name_budget_allocation_plan_item },
  { title: "ระยะเวลาที่ได้รับ", key: "plan", width: 240, render: (r) => r.name_budget_allocation_plan_item },
  { title: "สถานะความคืบหน้า", key: "is_active", width: 150, align: "center", render: renderStatus },
  { title: "การจัดการ", key: "action", width: 200, align: "center", render: renderActions }
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
</style>
