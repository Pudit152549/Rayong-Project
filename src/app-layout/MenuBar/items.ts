// src/app-layout/MenuBar/items.ts
import type { MenuOption } from "naive-ui";
import { h } from "vue";
import { RouterLink } from "vue-router";
import { Icon } from "@iconify/vue";
import type { AppRole } from "@/stores/user";

function renderIcon(icon: string) {
  return () => h(Icon, { icon, class: "text-xl" });
}

type MenuWithRole = MenuOption & {
  roles?: AppRole[];
  children?: MenuWithRole[];
};

export function getMenuItems(role: AppRole): MenuOption[] {
  const items: MenuWithRole[] = [
    {
      label: () =>
        h(RouterLink, { to: { name: "Dashboard" } }, () => "Dashboard"),
      key: "Dashboard",
      icon: renderIcon("material-symbols:dashboard-outline"),
      roles: ["owner", "admin", "user"]
    },

    {
      label: "Scrum Board",
      key: "ScrumBoard",
      icon: renderIcon("material-symbols:view-list-outline"),
      roles: ["owner", "admin"],
      children: [
        {
          label: () =>
            h(RouterLink, { to: { name: "HrBoard" } }, () => "แผนก Human Resource"),
          key: "HrBoard",
          icon: renderIcon("material-symbols:group"),
          roles: ["owner", "admin"]
        },
        {
          label: () =>
            h(RouterLink, { to: { name: "IotBoard" } }, () => "แผนก IOT"),
          key: "IotBoard",
          icon: renderIcon("mdi:internet"),
          roles: ["owner", "admin"]
        }
      ]
    },

    {
      label: () =>
        h(
          RouterLink,
          { to: { name: "UserManagement" } },
          () => "การจัดการผู้ใช้งาน"
        ),
      key: "UserManagement",
      icon: renderIcon("material-symbols:group-outline"),
      roles: ["owner"]
    }
  ];

  // ✅ filter ตาม role (recursive)
  const filterByRole = (list: MenuWithRole[]): MenuOption[] =>
    list
      .filter(item => !item.roles || item.roles.includes(role))
      .map(item => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined
      }))
      .filter(item => !item.children || item.children.length > 0);

  return filterByRole(items);
}
