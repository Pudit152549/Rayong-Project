<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider
} from "naive-ui";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

onMounted(async () => {
  await userStore.initAuth();
});
</script>

<template>
  <n-config-provider>
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
          <router-view />
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>
