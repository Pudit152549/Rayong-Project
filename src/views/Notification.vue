<template>
  <div class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-screen-xl mx-auto space-y-6">
      <div
        class="text-center mb-6 bg-white p-6 rounded-md shadow-md w-full max-w-screen-xl mx-auto"
      >
        <h2 class="text-2xl font-bold gradient-text text-center">การแจ้งเตือน</h2>
      </div>

      <n-card size="huge" hoverable class="w-full max-w-screen-xl mx-auto">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="text-sm text-gray-600">
            ทั้งหมด: <b>{{ total }}</b> รายการ
          </div>

          <div class="flex gap-2">
            <n-button size="small" secondary @click="fetchNotifications" :loading="loading">
              รีเฟรช
            </n-button>

            <n-button
              size="small"
              type="primary"
              ghost
              @click="markAllAsRead"
              :disabled="loading || unreadCount === 0"
            >
              อ่านทั้งหมด ({{ unreadCount }})
            </n-button>
          </div>
        </div>

        <div v-if="loading" class="space-y-3">
          <n-skeleton text :repeat="4" />
          <n-skeleton text :repeat="3" />
        </div>

        <n-empty v-else-if="rows.length === 0" description="ยังไม่มีการแจ้งเตือน" />

        <n-list v-else bordered>
          <n-list-item v-for="item in rows" :key="item.id">
            <div class="flex items-start justify-between gap-4">
              <n-thing>
                <template #header>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-semibold">{{ item.title }}</span>

                    <n-tag v-if="!item.is_read" type="error" size="small" round>ใหม่</n-tag>
                    <n-tag v-else type="success" size="small" round>อ่านแล้ว</n-tag>

                    <n-tag v-if="item.event" size="small" round>{{ item.event }}</n-tag>

                    <n-tag v-if="item.board_slug" size="small" round type="info">
                      {{ item.board_slug }}
                    </n-tag>
                  </div>
                </template>

                <template #description>
                  <div class="text-gray-700 whitespace-pre-wrap">{{ item.message }}</div>
                </template>

                <template #footer>
                  <div class="text-xs text-gray-500 mt-2">
                    {{ formatDate(item.created_at) }}
                  </div>
                </template>
              </n-thing>

              <div class="flex flex-col items-end gap-2 min-w-[150px]">
                <n-button
                  v-if="!item.is_read"
                  size="small"
                  type="primary"
                  @click="markAsRead(item)"
                  :loading="busyId === item.id"
                >
                  Mark as read
                </n-button>

                <n-button
                  v-else
                  size="small"
                  type="error"
                  secondary
                  @click="confirmDelete(item)"
                  :loading="busyId === item.id"
                >
                  ลบ
                </n-button>
              </div>
            </div>
          </n-list-item>
        </n-list>

        <div class="flex justify-center mt-5" v-if="total > pageSize">
          <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="total"
            :page-slot="7"
            @update:page="onChangePage"
          />
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  NCard,
  NList,
  NListItem,
  NThing,
  NButton,
  NTag,
  NPagination,
  NSkeleton,
  NEmpty,
  useDialog,
  useMessage
} from "naive-ui";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/user";
import { useNotificationsStore } from "@/stores/notifications";

type NotiRow = {
  id: string;
  user_id: string;

  board_id: string | null;
  board_slug: string | null;
  task_id: string | null;

  event: string;
  title: string;
  message: string;

  is_read: boolean;
  created_at: string;
};

const userStore = useUserStore();
const notiStore = useNotificationsStore();

const dialog = useDialog();
const message = useMessage();

const loading = ref(false);
const busyId = ref<string | null>(null);

const rows = ref<NotiRow[]>([]);
const total = ref(0);

const page = ref(1);
const pageSize = 5;

// ✅ อ่าน unread จาก store (realtime มาจาก MainContainer)
const unreadCount = computed(() => notiStore.unreadCount);

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

async function fetchNotifications() {
  if (!userStore.isLoggedIn || !userStore.profile.id) return;

  loading.value = true;
  try {
    const from = (page.value - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userStore.profile.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    rows.value = (data ?? []) as NotiRow[];
    total.value = count ?? 0;
  } catch (e: any) {
    console.error(e);
    message.error(e?.message ?? "โหลดแจ้งเตือนไม่สำเร็จ");
  } finally {
    loading.value = false;
  }
}

async function markAsRead(item: NotiRow) {
  busyId.value = item.id;
  try {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", item.id);
    if (error) throw error;

    const idx = rows.value.findIndex((r) => r.id === item.id);
    if (idx !== -1) rows.value[idx] = { ...rows.value[idx], is_read: true };

    // ✅ sync badge (กัน event มาช้า/หลุด)
    notiStore.scheduleSync(userStore.profile.id);

    message.success("ทำเครื่องหมายว่าอ่านแล้ว");
  } catch (e: any) {
    console.error(e);
    message.error(e?.message ?? "Mark as read ไม่สำเร็จ");
  } finally {
    busyId.value = null;
  }
}

async function markAllAsRead() {
  if (!userStore.isLoggedIn || !userStore.profile.id) return;

  loading.value = true;
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userStore.profile.id)
      .eq("is_read", false);

    if (error) throw error;

    await fetchNotifications();

    // ✅ sync badge
    notiStore.scheduleSync(userStore.profile.id);

    message.success("อ่านทั้งหมดแล้ว");
  } catch (e: any) {
    console.error(e);
    message.error(e?.message ?? "ทำรายการอ่านทั้งหมดไม่สำเร็จ");
  } finally {
    loading.value = false;
  }
}

function confirmDelete(item: NotiRow) {
  dialog.warning({
    title: "ยืนยันการลบ",
    content: "ต้องการลบการแจ้งเตือนนี้ใช่ไหม?",
    positiveText: "ลบ",
    negativeText: "ยกเลิก",
    onPositiveClick: () => deleteNotification(item)
  });
}

async function deleteNotification(item: NotiRow) {
  busyId.value = item.id;
  try {
    const { error } = await supabase.from("notifications").delete().eq("id", item.id);
    if (error) throw error;

    rows.value = rows.value.filter((r) => r.id !== item.id);
    total.value = Math.max(0, total.value - 1);

    if (rows.value.length === 0 && page.value > 1) {
      page.value -= 1;
      await fetchNotifications();
    }

    // ✅ sync badge
    notiStore.scheduleSync(userStore.profile.id);

    message.success("ลบแล้ว");
  } catch (e: any) {
    console.error(e);
    message.error(e?.message ?? "ลบไม่สำเร็จ (เช็ค policy delete)");
  } finally {
    busyId.value = null;
  }
}

async function onChangePage(p: number) {
  page.value = p;
  await fetchNotifications();
}

onMounted(fetchNotifications);

// ✅ list เด้งเอง: เมื่อ unread เปลี่ยน (realtime) ให้ reload list
watch(
  () => notiStore.unreadCount,
  async () => {
    if (!userStore.isLoggedIn || !userStore.profile.id) return;
    await fetchNotifications();
  }
);
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(180deg, #a200ff, #ff00f2, #3c01ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>