<script setup lang="ts">
import { NMessageProvider, NDialogProvider, NNotificationProvider } from 'naive-ui'
</script>

<template>
  <n-notification-provider>
  <n-dialog-provider>
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-dialog-provider>
  </n-notification-provider>
</template>
