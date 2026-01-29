<template>
  <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
    <!-- ทั้งหมด -->
    <n-card class="shadow-md py-3">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-2xl font-bold text-[#111827]">
            {{ total }}
          </div>
          <div class="text-[#4B5563]">ทั้งหมด</div>
        </div>
        <div class="bg-[#6B7280] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
          <Icon icon="lucide:users" width="27" height="27" />
        </div>
      </div>
    </n-card>

    <!-- To Do -->
    <n-card class="shadow-md py-3">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-2xl font-bold text-[#DC2626]">{{ todoCount }}</div>
          <div class="text-[#4B5563] text-[14px]">ยังไม่ดำเนินการ</div>
        </div>
        <div class="bg-[#EF4444] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
          <Icon icon="material-symbols:cancel-outline" width="28" height="28" />
        </div>
      </div>
    </n-card>

    <!-- In Progress -->
    <n-card class="shadow-md py-3">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-2xl font-bold text-[#CA8A04]">{{ inProgressCount }}</div>
          <div class="text-[#4B5563] text-[14px]">กำลังดำเนินการ</div>
        </div>
        <div class="bg-[#EAB308] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
          <Icon icon="mdi:clock-outline" width="28" height="28" />
        </div>
      </div>
    </n-card>

    <!-- Done -->
    <n-card class="shadow-md py-3">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-2xl font-bold text-[#059669]">{{ doneCount }}</div>
          <div class="text-[#4B5563] text-[14px]">เสร็จสิ้น</div>
        </div>
        <div class="bg-[#10B981] text-white w-[48px] h-[48px] rounded-xl flex items-center justify-center">
          <Icon icon="material-symbols:target" width="28" height="28" />
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NCard } from "naive-ui";
import { Icon } from "@iconify/vue";
import type { RowData } from "@/stores/types";

const props = defineProps<{
  rows: RowData[];
}>();

const total = computed(() => props.rows.length);

const todoCount = computed(() => props.rows.filter(r => r.status === "todo").length);
const inProgressCount = computed(() =>
  props.rows.filter(r => r.status === "in_progress").length
);
const doneCount = computed(() => props.rows.filter(r => r.status === "done").length);
</script>
