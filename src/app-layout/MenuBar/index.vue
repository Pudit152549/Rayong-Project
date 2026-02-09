<template>
  <nav
    class="nav h-full border-r bg-white"
    :style="{ width: collapsed ? `${collapsedWidth}px` : `${expandedWidth}px` }"
  >
    <n-menu
      :options="menuOptions"
      :style="{ width: props.collapsed ? `${collapsedWidth}px` : `${expandedWidth}px` }"
      :collapsed="props.collapsed"
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
import { useUserStore } from "@/stores/user";

const props = defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ (e: "navigate"): void }>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const selectedKey = ref<string>((route.name as string) || "");

const collapsedWidth = 64;
const expandedWidth = 220;

// ✅ ส่ง role เข้าไป
const menuOptions = computed<MenuMixedOption[]>(() =>
  getMenuItems(userStore.profile.appRole)
);

watch(
  () => route.name,
  (name) => {
    if (typeof name === "string") selectedKey.value = name;
  },
  { immediate: true }
);

const handleSelect = (key: string) => {
  const resolved = router.resolve({ name: key });
  if (resolved.matched.length > 0) {
    router.push({ name: key });
    emit("navigate");
  }
};
</script>

<style scoped>
.nav {
  transition: width 0.2s ease;
  overflow: hidden;
}
</style>
