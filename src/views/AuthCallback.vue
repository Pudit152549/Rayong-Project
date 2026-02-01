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
  // สำคัญ: ให้ supabase ประมวลผล token ใน URL
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (session?.user) {
    userStore.isLoggedIn = true;
    await userStore.fetchProfile(session.user.id, session.user.email ?? "");
    router.replace({ name: "Dashboard" }); // หรือ Profile
  } else {
    router.replace({ name: "Login" });
  }
});
</script>
