<template>
  <div class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-screen-xl mx-auto space-y-6">
      <div class="text-center mb-6 bg-white p-6 rounded-md shadow-md w-full max-w-screen-xl mx-auto">
        <h2 class="text-2xl font-bold gradient-text text-center">การจัดการผู้ใช้งาน</h2>
      </div>

      <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
        <div class="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-5">
          <n-card class="shadow-md py-3">
            <div class="text-xl font-bold text-[#1100ff]">User</div>
            <div class="text-[#4B5563] text-[14px]">5</div>
          </n-card>

          <n-card class="shadow-md py-3">
            <div class="text-xl font-bold text-[#059669]">Admin</div>
            <div class="text-[#4B5563] text-[14px]">2</div>
          </n-card>
        </div>

        <!-- Recent Tasks -->
        <div class="w-full overflow-x-auto mt-6">
          <n-card class="shadow-md py-3">
            <p class="font-semibold mb-3">ผู้ใช้งาน</p>
            <div class="w-full overflow-x-auto">
              <n-data-table
                :columns="columns"
                :data="data"
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
import { reactive } from "vue";
import {
  NCard,
  NDataTable,
  type DataTableColumns
} from "naive-ui";

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

const columns: DataTableColumns = [
  {
    title: "ลำดับ",
    key: "index",
    align: "center",
    minWidth: 60,
  },
  {
    title: "ชื่อผู้ใช้",
    key: "username",
    minWidth: 180,
  },
  {
    title: "อีเมล",
    key: "email",
    minWidth: 220,
  },
  {
    title: "ตำแหน่ง",
    key: "position",
    minWidth: 180,
  },
  {
    title: "แผนก",
    key: "department",
    minWidth: 100,
  },
  {
    title: "บทบาท",
    key: "role",
    align: "center",
    minWidth: 100,
  },
  {
    title: "การจัดการ",
    key: "actions",
    align: "center",
    minWidth: 220,
  },
];
const data = [
  {
    index: "1",
    username: "john_doe",
    email: "john.doe@example.com",
    position: "Software Engineer",
    department: "IT",
    role: "User",
  },
  {
    index: "2",
    username: "jane_smith",
    email: "jane.smith@example.com",
    position: "Product Manager",
    department: "Product",
    role: "Admin",
  },
];

</script>

<style scoped>
.gradient-text {
  background: linear-gradient(180deg, #ffd500, #ff0000, #ff9901);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
