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
      icon: renderIcon("material-symbols:dashboard-outline"),
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: "Home" } },
          { default: () => "Scrum Board" }
        ),
      key: "Home",
      icon: renderIcon("material-symbols:view-list-outline"),
    }
  ];
}
