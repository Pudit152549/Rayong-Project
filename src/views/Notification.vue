<template>
  <div class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-screen-xl mx-auto space-y-6">
      <div class="text-center mb-6 bg-white p-6 rounded-md shadow-md w-full max-w-screen-xl mx-auto">
        <h2 class="text-2xl font-bold gradient-text text-center">การแจ้งเตือน</h2>
      </div>

      <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  NCard,
} from "naive-ui";
// import { Icon } from "@iconify/vue";


const pagination = reactive({
  page: 1,
  pageSize: 5,
  showSizePicker: false,
  onChange: (page: number) => {
    pagination.page = page;
  }
});

</script>

<style scoped>
.gradient-text {
  background: linear-gradient(180deg, #a200ff, #ff00f2, #3c01ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
