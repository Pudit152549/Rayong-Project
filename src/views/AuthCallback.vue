<template>
  <div class="min-h-screen flex items-center justify-center">
    กำลังเข้าสู่ระบบ...
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  try {
    const url = window.location.href;
    const code = new URL(url).searchParams.get("code");

    // ✅ ถ้ามี code = กลับมาจาก Google จริง
    const cameFromOAuth = !!code;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        console.error("exchangeCodeForSession error:", error);
        return router.replace({ name: "Login" });
      }
    }

    // โหลด session + profile ผ่าน store จุดเดียว
    await userStore.initAuth();

    if (userStore.isLoggedIn) {
      // ✅ ยิงแจ้งเตือน login เฉพาะกรณีเพิ่งกลับจาก OAuth
      if (cameFromOAuth) {
        await userStore.notifyLogin();
      }

      return router.replace({ name: "Dashboard" });
    }

    return router.replace({ name: "Login" });
  } catch (e) {
    console.error("AuthCallback fatal:", e);
    return router.replace({ name: "Login" });
  }
});
</script>

