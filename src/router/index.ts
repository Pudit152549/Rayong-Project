import { createRouter, createWebHistory } from "vue-router";
import MainContainer from "@/app-layout/MainContainer.vue";
import BlankLayout from "@/app-layout/Blank/index.vue";

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

    // --------------------
    // MAIN APP (WITH SIDEBAR)
    // --------------------
{
  path: "/app",
  component: MainContainer,
  children: [
    { path: "", redirect: { name: "Dashboard" } },

    { path: "dashboard", name: "Dashboard", component: () => import("@/views/Dashboard.vue") },

    // ✅ ทำ path รวมสำหรับ boards + redirect เข้า HR
    { path: "boards", redirect: { name: "HrBoard" } },

    { path: "boards/hr", name: "HrBoard", component: () => import("@/views/HumanResource/HrBoardPage.vue") },
    { path: "boards/iot", name: "IotBoard", component: () => import("@/views/IOT/IotBoardPage.vue") },

    { path: "add", name: "AddData", component: () => import("@/views/AddDataPage.vue") },
    { path: "edit/:id", name: "Edit", component: () => import("@/views/EditPage.vue"), props: true },

    { path: "profile", name: "Profile", component: () => import("@/views/ProfilePage.vue") },
  ],
},


    // --------------------
    // NOT FOUND
    // --------------------
    { path: "/:pathMatch(.*)*", redirect: "/login" }
  ]
});

export default router;
