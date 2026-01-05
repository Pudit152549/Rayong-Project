<template>
  <nav
    class="nav h-full border-r bg-white"
    :style="{ width: collapsed ? `${collapsedWidth}px` : `${expandedWidth}px` }"
  >
    <n-menu
      :options="menuOptions"
      :collapsed="collapsed"
      :collapsed-width="collapsedWidth"
      :collapsed-icon-size="22"
      :indent="18"
      :accordion="true"
      v-model:value="selectedKey"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { NMenu } from "naive-ui"
import type { MenuMixedOption } from "naive-ui/es/menu/src/interface"
import { getMenuItems } from "./item" // ✅ ชี้ path ให้ถูก

const props = defineProps<{
  collapsed: boolean
}>()

// ✅ ปรับได้ตามต้องการ
const collapsedWidth = 64
const expandedWidth = 220

const menuOptions = computed<MenuMixedOption[]>(() => getMenuItems())
</script>

<style scoped>
.nav {
  transition: width 0.2s ease;
  overflow: hidden;
}
</style>
