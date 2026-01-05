<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden">
    <!-- ✅ Top Navbar -->
    <header class="h-14 shrink-0 border-b bg-white flex items-center px-4">
      <div class="flex items-center gap-3">
        <!-- ปุ่มพับ sidebar (ถ้ามี) -->
        <n-button quaternary circle @click="toggleSidebar">
          <template #icon>
            <Icon icon="mdi:menu" />
          </template>
        </n-button>

        <div class="font-bold">
          การออกแบบและพัฒนาระบบติดตามความคืบหน้างาน
        </div>
      </div>

      <div class="ml-auto flex items-center gap-3">
        <n-button text @click="goProfile">
          <template #icon><Icon icon="mdi:account" /></template>
          โปรไฟล์
        </n-button>
        <n-button type="error" ghost @click="logout">
          <template #icon><Icon icon="mdi:logout" /></template>
          ออกจากระบบ
        </n-button>
      </div>
    </header>

    <!-- ✅ Body: Sidebar + Content (อยู่ใต้ navbar) -->
    <div class="flex flex-1 min-h-0">
      <!-- Sidebar -->
      <aside class="shrink-0 border-r bg-white">
        <MenuBar :collapsed="collapsed" />
      </aside>

      <!-- Content -->
      <main class="flex-1 min-w-0 min-h-0 overflow-auto bg-gray-100 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NButton } from "naive-ui";
import { Icon } from "@iconify/vue";
import MenuBar from "@/app-layout/MenuBar/index.vue";
import { useUserStore } from "@/stores/user";

const collapsed = ref(false);
const router = useRouter();
const userStore = useUserStore();

const toggleSidebar = () => (collapsed.value = !collapsed.value);

const goProfile = () => router.push({ name: "Profile" });

const logout = () => {
  userStore.logout();
  router.push("/login");
};
</script>
