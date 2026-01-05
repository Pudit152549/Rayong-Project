<template>
  <div class="min-h-screen w-full bg-gray-50 overflow-x-hidden">
    <!-- Top Navbar -->
    <header class="h-14 bg-white border-b flex items-center justify-between px-3 md:px-6 sticky top-0 z-10">
      <div class="flex items-center gap-2">
      <!-- Mobile -->
      <div class="md:hidden">
        <n-button quaternary circle @click="drawerOpen = true">
          <template #icon>
            <n-icon><Icon icon="mdi:menu" /></n-icon>
          </template>
        </n-button>
      </div>
      <!-- Desktop -->
      <div class="hidden md:block">
        <n-button quaternary circle @click="toggleSidebar">
          <template #icon>
            <n-icon><Icon icon="mdi:menu" /></n-icon>
          </template>
        </n-button>
      </div>
        <div class="font-bold text-sm md:text-base">
          การออกแบบและพัฒนาระบบติดตามความคืบหน้างาน
        </div>
      </div>
      <div class="ml-auto flex items-center gap-2 md:gap-3">
        <n-button text @click="goProfile">
          <template #icon><n-icon><Icon icon="mdi:account" /></n-icon></template>
          <span class="hidden sm:inline">โปรไฟล์</span>
        </n-button>
        <n-button type="error" ghost @click="logout">
          <template #icon><n-icon><Icon icon="mdi:logout" /></n-icon></template>
          <span class="hidden sm:inline">ออกจากระบบ</span>
        </n-button>
      </div>
    </header>

    <!-- Body -->
    <div class="flex flex-1 min-h-0">
      <!-- ✅ Desktop Sidebar เท่านั้น -->
      <aside class="hidden md:block shrink-0 border-r bg-white">
        <MenuBar :collapsed="collapsed" />
      </aside>

      <!-- Content -->
      <main class="flex-1 min-w-0 min-h-0 overflow-auto overflow-x-hidden bg-gray-100 p-3 md:p-6">
        <router-view />
      </main>
    </div>

    <!-- ✅ Mobile Drawer -->
    <n-drawer v-model:show="drawerOpen" placement="left" :width="260">
      <n-drawer-content title="เมนู" closable>
        <MenuBar :collapsed="false" @navigate="drawerOpen = false" />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NButton, NDrawer, NDrawerContent, NIcon } from "naive-ui";
import { Icon } from "@iconify/vue";
import MenuBar from "@/app-layout/MenuBar/index.vue";
import { useUserStore } from "@/stores/user";

const collapsed = ref(false);
const drawerOpen = ref(false);

const router = useRouter();
const userStore = useUserStore();

const toggleSidebar = () => (collapsed.value = !collapsed.value);
const goProfile = () => router.push({ name: "Profile" });

const logout = () => {
  userStore.logout();
  router.push({ name: "Login" });
};
</script>