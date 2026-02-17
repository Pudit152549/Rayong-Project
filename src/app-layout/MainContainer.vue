<template>
  <div class="min-h-screen w-full bg-gray-50 overflow-x-hidden">
    <!-- Top Navbar -->
    <header
      class="h-14 bg-white border-b flex items-center justify-between px-3 md:px-6 sticky top-0 z-10"
    >
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

        <div class="font-bold text-sm md:text-md md:sticky md:top-0 px-2">
          การออกแบบและพัฒนาระบบติดตามความคืบหน้างาน
        </div>
      </div>

      <div class="ml-auto flex items-center gap-2 md:gap-5">
        <n-tooltip placement="bottom" trigger="hover">
          <template #trigger>
            <span class="inline-flex items-center gap-2">
              <n-button text @click="goProfile">
                <template #icon>
                  <Icon icon="mdi:account" />
                </template>
                <span class="hidden sm:inline">{{ userStore.profile.email }}</span>
              </n-button>
            </span>
          </template>
          ชื่อผู้ใช้ : {{ userStore.profile.username }} <br />
          บทบาท : {{ userStore.profile.appRole }}
        </n-tooltip>

        <!-- 🔔 badge realtime -->
        <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0">
          <n-button text @click="goNotification">
            <template #icon>
              <Icon icon="mdi:bell" />
            </template>
          </n-button>
        </n-badge>

        <n-button type="error" ghost @click="logout">
          <template #icon>
            <Icon icon="mdi:logout" />
          </template>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { NButton, NDrawer, NDrawerContent, NIcon, NTooltip, NBadge } from "naive-ui";
import { Icon } from "@iconify/vue";
import MenuBar from "@/app-layout/MenuBar/index.vue";
import { useUserStore } from "@/stores/user";
import { useNotificationsStore } from "@/stores/notifications";

const collapsed = ref(false);
const drawerOpen = ref(false);

const router = useRouter();
const userStore = useUserStore();
const notiStore = useNotificationsStore();

const toggleSidebar = () => (collapsed.value = !collapsed.value);
const goProfile = () => router.push({ name: "Profile" });
const goNotification = () => router.push({ name: "Notification" });

// ✅ ใช้ count จาก store
const unreadCount = computed(() => notiStore.unreadCount);

// ✅ start realtime ตลอด session (โปรสุด ไม่ตัดต่อ)
async function bootNoti() {
  // สำคัญ: รอ auth พร้อมก่อน
  if (!userStore.ready) {
    await userStore.initAuth();
  }

  const uid = userStore.profile.id;

  if (userStore.isLoggedIn && uid) {
    await notiStore.startRealtime(uid);
  } else {
    notiStore.stopRealtime();
  }
}

onMounted(bootNoti);

// ✅ ถ้า login/logout หรือ uid เปลี่ยน ให้ rebind realtime
watch(
  () => [userStore.isLoggedIn, userStore.profile.id] as const,
  async () => {
    await bootNoti();
  }
);

const logout = async () => {
  await userStore.logout();
  notiStore.stopRealtime();
  await router.replace({ name: "Login" });
};
</script>