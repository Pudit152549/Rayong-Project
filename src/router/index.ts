import { createRouter, createWebHistory } from "vue-router";
import MainContainer from "@/app-layout/MainContainer.vue";
import BlankLayout from "@/app-layout/Blank/index.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ✅ เข้าเว็บปุ๊บ ไป login ก่อน
    { path: "/", redirect: "/login" },

    // 🔹 Layout เปล่า (Login / Register)
    {
      path: "/login",
      component: BlankLayout,
      children: [
        {
          path: "",
          name: "Login",
          component: () => import("@/views/LoginPage.vue"),
        },
      ],
    },

    // 🔹 Layout หลัก (มี sidebar)
    {
      path: "/app",
      component: MainContainer,
      children: [
        { path: "", redirect: "/app/dashboard" },
        { path: "dashboard", name: "Dashboard", component: () => import("@/views/Dashboard.vue") },
        { path: "home", name: "Home", component: () => import("@/views/HomePage.vue") },
        { path: "add", name: "AddData", component: () => import("@/views/AddDataPage.vue") },
        { path: "edit/:id", name: "Edit", component: () => import("@/views/EditPage.vue"), props: true },
        { path: "profile", name: "Profile", component: () => import("@/views/ProfilePage.vue") },
      ],
    },

    // (option) not found
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});

export default router;
