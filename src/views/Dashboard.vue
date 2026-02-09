<template>
  <div class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-screen-xl mx-auto space-y-6">
      <div class="text-center mb-6 bg-white p-6 rounded-md shadow-md w-full max-w-screen-xl mx-auto">
        <h2 class="text-2xl font-bold gradient-text text-center">Dashboard</h2>
      </div>

      <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
        <!-- Summary Cards -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <n-card class="shadow-md py-3">
            <p class="text-gray-500">งานทั้งหมด</p>
            <h1 class="text-3xl font-bold">{{ total }}</h1>
          </n-card>

          <n-card class="shadow-md py-3">
            <p class="text-red-500">To Do</p>
            <h1 class="text-3xl font-bold">{{ todoCount }}</h1>
          </n-card>

          <n-card class="shadow-md py-3">
            <p class="text-yellow-500">In Progress</p>
            <h1 class="text-3xl font-bold">{{ inProgressCount }}</h1>
          </n-card>

          <n-card class="shadow-md py-3">
            <p class="text-green-600">Done</p>
            <h1 class="text-3xl font-bold">{{ doneCount }}</h1>
          </n-card>
        </div>

        <!-- Progress -->
        <div class="my-6">
          <n-card class="shadow-md py-3">
            <p class="mb-2 font-semibold">ความคืบหน้าโดยรวม</p>
            <n-progress type="line" :percentage="progressPercent" status="success" />
          </n-card>
        </div>

        <!-- Recent Tasks -->
        <div class="w-full overflow-x-auto">
          <n-card class="shadow-md py-3">
            <p class="font-semibold mb-3">งานล่าสุด</p>
            <div class="w-full overflow-x-auto">
              <n-data-table
                :columns="columns"
                :data="recentRows"
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
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive } from "vue";
import {
  NCard,
  NProgress,
  NDataTable,
  NTag,
  type DataTableColumns
} from "naive-ui";

import { useHrDataStore } from "@/stores/HumanResource/data";
import { useIotDataStore } from "@/stores/IOT/data";
import { useUserStore } from "@/stores/user";
import type { RowData, Status } from "@/stores/types";

// ✅ store แยก domain
const hrStore = useHrDataStore();
const iotStore = useIotDataStore();
const userStore = useUserStore();

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
})


onMounted(async () => {
  if (!userStore.isLoggedIn) return;

  const needHr = !hrStore.rows?.length;
  const needIot = !iotStore.rows?.length;

  const jobs: Promise<any>[] = [];
  if (needHr) jobs.push(hrStore.fetch());
  if (needIot) jobs.push(iotStore.fetch());

  if (jobs.length) await Promise.all(jobs);
});

// ✅ สร้างชนิดข้อมูลสำหรับหน้า dashboard (เพิ่ม department เฉพาะหน้า)
type DashboardRow = RowData & {
  department: "Human Resource" | "IOT";
};

// ✅ รวมข้อมูลทุกแผนก แล้วเติม department
const allRows = computed<DashboardRow[]>(() => [
  ...hrStore.rows.map((r) => ({ ...r, department: "Human Resource" as const })),
  ...iotStore.rows.map((r) => ({ ...r, department: "IOT" as const }))
]);

const total = computed(() => allRows.value.length);

const todoCount = computed(() => allRows.value.filter((r) => r.status === "todo").length);
const inProgressCount = computed(() =>
  allRows.value.filter((r) => r.status === "in_progress").length
);
const doneCount = computed(() => allRows.value.filter((r) => r.status === "done").length);

const progressPercent = computed(() => {
  if (total.value === 0) return 0;
  return Math.round((doneCount.value / total.value) * 100);
});

// ✅ งานล่าสุด (รวมทุกแผนก) — เรียงตาม id ล่าสุดก่อน
// หมายเหตุ: ตอนนี้ id แยก store -> อาจชนกันได้ (เช่น hr มี id=3, iot ก็มี id=3)
// ถ้าอยาก “ล่าสุดจริง” แนะนำให้มี createdAt ใน RowData ในอนาคต
const recentRows = computed(() => {
  return [...allRows.value]
    .sort((a, b) => {
      const bt = new Date(b.created_at ?? 0).getTime()
      const at = new Date(a.created_at ?? 0).getTime()
      return bt - at
    })
});

const rowKey = (row: DashboardRow) => `${row.department}-${row.id}`;

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

const columns: DataTableColumns<DashboardRow> = [
  {
    title: "แผนงาน",
    key: "project",
    minWidth: 220,
    render: (row) => row.project_name.name
  },
  {
    title: "ผู้รับผิดชอบ",
    key: "owner",
    minWidth: 120,
    render: (row) => row.responsible_person_name
  },
  {
    title: "แผนกที่รับผิดชอบ",
    key: "department",
    minWidth: 220,
    render: (row) => row.department
  },
  {
    title: "สถานะ",
    key: "status",
    width: 160,
    align: "center",
    render: (row) =>
      h(
        NTag,
        { type: statusTypeMap[row.status], round: true },
        { default: () => statusLabelMap[row.status] }
      )
  }
];
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(90deg, #00d9ff, #1100ff, #b301ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
