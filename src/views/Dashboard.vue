<template>
  <div class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-screen-xl mx-auto space-y-6">
      <h2 class="text-2xl font-bold gradient-text text-center">
        Dashboard
      </h2>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <n-card>
          <p class="text-gray-500">งานทั้งหมด</p>
          <h1 class="text-3xl font-bold">{{ total }}</h1>
        </n-card>

        <n-card>
          <p class="text-red-500">To Do</p>
          <h1 class="text-3xl font-bold">{{ todoCount }}</h1>
        </n-card>

        <n-card>
          <p class="text-yellow-500">In Progress</p>
          <h1 class="text-3xl font-bold">{{ inProgressCount }}</h1>
        </n-card>

        <n-card>
          <p class="text-green-600">Done</p>
          <h1 class="text-3xl font-bold">{{ doneCount }}</h1>
        </n-card>
      </div>

      <!-- Progress -->
      <n-card>
        <p class="mb-2 font-semibold">ความคืบหน้าโดยรวม</p>
        <n-progress
          type="line"
          :percentage="progressPercent"
          status="success"
        />
      </n-card>

      <!-- Recent Tasks -->
      <n-card>
        <p class="font-semibold mb-3">งานล่าสุด</p>
        <n-data-table
          :columns="columns"
          :data="recentRows"
          :row-key="rowKey"
          size="small"
          bordered
        />
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from "vue";
import { useDataStore, type RowData, type Status } from "../stores/data";
import {
  NCard,
  NProgress,
  NDataTable,
  NTag,
  type DataTableColumns
} from "naive-ui";

const dataStore = useDataStore();

const total = computed(() => dataStore.rows.length);
const todoCount = computed(() =>
  dataStore.rows.filter(r => r.status === "todo").length
);
const inProgressCount = computed(() =>
  dataStore.rows.filter(r => r.status === "in_progress").length
);
const doneCount = computed(() =>
  dataStore.rows.filter(r => r.status === "done").length
);

const progressPercent = computed(() => {
  if (total.value === 0) return 0;
  return Math.round((doneCount.value / total.value) * 100);
});

const recentRows = computed(() =>
  [...dataStore.rows].slice(-5).reverse()
);

const rowKey = (row: RowData) => row.id;

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

const columns: DataTableColumns<RowData> = [
  {
    title: "แผนงาน",
    key: "project",
    render: row => row.project_name.name
  },
  {
    title: "ผู้รับผิดชอบ",
    key: "owner",
    render: row => row.responsible_person_name
  },
  {
    title: "สถานะ",
    key: "status",
    align: "center",
    render: row =>
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
