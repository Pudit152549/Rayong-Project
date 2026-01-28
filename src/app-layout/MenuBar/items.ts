// src/app-layout/MenuBar/items.ts
import type { MenuOption } from "naive-ui";
import { h } from "vue";
import { RouterLink } from "vue-router";
import { Icon } from "@iconify/vue";

function renderIcon(icon: string) {
  return () => h(Icon, { icon, class: "text-xl" });
}

export function getMenuItems(): MenuOption[] {
  return [
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: "Dashboard" } },
          { default: () => "Dashboard" }
        ),
      key: "Dashboard",
      icon: renderIcon("material-symbols:dashboard-outline")
    },

    // ✅ Expand Submenu: Scrum Board
    {
      label: "Scrum Board",
      key: "ScrumBoard", // key ของ "พ่อ" ไม่จำเป็นต้องเป็น route name
      icon: renderIcon("material-symbols:view-list-outline"),
      children: [
        {
          label: () =>
            h(
              RouterLink,
              { to: { name: "HrBoard" } },
              { default: () => "แผนก Human Resource" }
            ),
          key: "HrBoard"
        },
        {
          label: () =>
            h(
              RouterLink,
              { to: { name: "IotBoard" } },
              { default: () => "แผนก IOT" }
            ),
          key: "IotBoard"
        }
      ]
    }
  ];
}
