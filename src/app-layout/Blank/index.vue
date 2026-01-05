<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gray-100">
    <router-view />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BlankLayout" })
</script>
