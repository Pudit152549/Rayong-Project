import { defineStore } from "pinia";
import type { Status } from "@/stores/types";
import { useTasksStore } from "@/stores/tasks";

export const useIotDataStore = defineStore("iotData", {
  state: () => ({
    searchKeyword: "",
    agencyFilter: null as string | null,
    statusFilter: null as Status | null
  }),

  getters: {
    rows(): any[] {
      const tasks = useTasksStore();
      return tasks.byBoard["iot"] ?? [];
    },

    filteredRows(): any[] {
      const rows = this.rows;
      return rows.filter((row) => {
        const matchKeyword =
          !this.searchKeyword ||
          row.project_name.name.toLowerCase().includes(this.searchKeyword.toLowerCase());
        const matchAgency = !this.agencyFilter || row.assigned_agency === this.agencyFilter;
        const matchStatus = !this.statusFilter || row.status === this.statusFilter;
        return matchKeyword && matchAgency && matchStatus;
      });
    }
  },

  actions: {
    async fetch() {
      const tasks = useTasksStore();
      await tasks.fetchByBoardSlug("iot");
    },

    clearFilters() {
      this.searchKeyword = "";
      this.agencyFilter = null;
      this.statusFilter = null;
    }
  }
});
