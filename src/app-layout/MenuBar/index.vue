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
      @update:value="handleSelect"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NMenu } from "naive-ui";
import type { MenuMixedOption } from "naive-ui/es/menu/src/interface";
import { getMenuItems } from "./items";

const props = defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ (e: "navigate"): void }>();

const route = useRoute();
const router = useRouter();

const selectedKey = ref<string>((route.name as string) || "");

const collapsedWidth = 64;
const expandedWidth = 220;

const menuOptions = computed<MenuMixedOption[]>(() => getMenuItems());

// ✅ highlight ตาม route
watch(
  () => route.name,
  (name) => {
    if (typeof name === "string") selectedKey.value = name;
  },
  { immediate: true }
);

const handleSelect = (key: string) => {
  selectedKey.value = key;
  router.push({ name: key });
  emit("navigate"); // ✅ ถ้าอยู่ใน Drawer จะปิด
};
</script>

<style scoped>
.nav {
  transition: width 0.2s ease;
  overflow: hidden;
}
</style>
