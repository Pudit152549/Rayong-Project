import { createRouter, createWebHistory } from "vue-router";
import MainContainer from "@/app-layout/MainContainer.vue";
import BlankLayout from "@/app-layout/Blank/index.vue";
import { useUserStore } from "@/stores/user";
import type { AppRole } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // --------------------
    // DEFAULT
    // --------------------
    { path: "/", redirect: "/login" },

    // --------------------
    // AUTH (NO SIDEBAR)
    // --------------------
    {
      path: "/login",
      component: BlankLayout,
      children: [
        {
          path: "",
          name: "Login",
          component: () => import("@/views/LoginPage.vue")
        }
      ]
    },
    {
      path: "/register",
      component: BlankLayout,
      children: [
        {
          path: "",
          name: "Register",
          component: () => import("@/views/RegisPage.vue")
        }
      ]
    },
    {
      path: "/auth/callback",
      component: BlankLayout,
      children: [
        {
          path: "",
          name: "AuthCallback",
          component: () => import("@/views/AuthCallback.vue")
        }
      ]
    },

    // --------------------
    // MAIN APP (WITH SIDEBAR)
    // --------------------
{
  path: "/app",
  component: MainContainer,
  meta: { requiresAuth: true },
  children: [
    { path: "", redirect: { name: "Dashboard" } },

    { path: "dashboard", name: "Dashboard", component: () => import("@/views/Dashboard.vue") },

    // ✅ ทำ path รวมสำหรับ boards + redirect เข้า HR
    { path: "boards", redirect: { name: "HrBoard" }, meta: { roles: ["owner", "admin"] } },
    { path: "boards/hr", name: "HrBoard", component: () => import("@/views/HumanResource/HrBoardPage.vue"), meta: { roles: ["owner", "admin"] } },
    { path: "boards/iot", name: "IotBoard", component: () => import("@/views/IOT/IotBoardPage.vue"), meta: { roles: ["owner", "admin"] } },
    { path: "add", name: "AddData", component: () => import("@/views/AddDataPage.vue"), meta: { roles: ["owner", "admin"] } },
    { path: "edit/:id", name: "Edit", component: () => import("@/views/EditPage.vue"), props: true, meta: { roles: ["owner", "admin"] } },
    { path: "profile", name: "Profile", component: () => import("@/views/ProfilePage.vue") },
    { path: "user-management", name: "UserManagement", component: () => import("@/views/UserManagement.vue"), meta: { roles: ["owner"] } },
  ],
},


    // --------------------
    // NOT FOUND
    // --------------------
    { path: "/:pathMatch(.*)*", redirect: "/login" }
  ]
});
router.beforeEach(async (to) => {
  const userStore = useUserStore();

  if (!userStore.ready) {
    await userStore.initAuth();
  }

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth);

  const matchedRoles = to.matched
    .map(r => r.meta.roles as AppRole[] | undefined)
    .filter((r): r is AppRole[] => Array.isArray(r));

  const roles = matchedRoles.length
    ? matchedRoles[matchedRoles.length - 1]
    : undefined;

  // ไป login ทั้งที่ login แล้ว
  if ((to.name === "Login" || to.name === "Register") && userStore.isLoggedIn) {
    return { name: "Dashboard" };
  }

  // ต้อง login แต่ยังไม่ login
  if (requiresAuth && !userStore.isLoggedIn) {
    return { name: "Login" };
  }

  // เช็ค role
  if (requiresAuth && userStore.isLoggedIn && roles) {
    const userRole = userStore.profile.appRole;
    if (!roles.includes(userRole)) {
      return { name: "Dashboard" };
    }
  }

  return true;
});

export default router;
