import { defineStore } from "pinia";
import type { RowData, Status } from "@/stores/types";

export const useHrDataStore = defineStore("hrData", {
  state: () => ({
    rows: [
      {
        id: 1,
        project_name: { name: "ยกระดับคุณภาพการศึกษาเชิงรุก" },
        assigned_agency: "สำนักงานการศึกษาขั้นพื้นฐาน",
        responsible_person_name: "สมชาย ใจดี",
        period: [1758906000000, 1759165200000],
        status: "in_progress" as Status
      },
      {
        id: 2,
        project_name: { name: "สัมภาษณ์ผู้สมัครงาน" },
        assigned_agency: "สำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์",
        responsible_person_name: "สมปอง มีสุข",
        period: [1759200000000, 1759459200000],
        status: "todo" as Status
      }
    ] as RowData[],
    searchKeyword: "",
    agencyFilter: null as string | null,
    statusFilter: null as Status | null
  }),
  getters: {
    filteredRows(state): RowData[] {
      return state.rows.filter((row) => {
        const matchKeyword =
          !state.searchKeyword ||
          row.project_name.name.toLowerCase().includes(state.searchKeyword.toLowerCase());
        const matchAgency = !state.agencyFilter || row.assigned_agency === state.agencyFilter;
        const matchStatus = !state.statusFilter || row.status === state.statusFilter;
        return matchKeyword && matchAgency && matchStatus;
      });
    }
  },
  actions: {
    addRow(payload: Omit<RowData, "id">) {
      const maxId = this.rows.reduce((m, r) => Math.max(m, r.id), 0);
      this.rows.push({ id: maxId + 1, ...payload });
    },
    updateRow(id: number, partial: Partial<RowData>) {
      const idx = this.rows.findIndex((r) => r.id === id);
      if (idx !== -1) this.rows[idx] = { ...this.rows[idx], ...partial };
    },
    deleteRow(id: number) {
      this.rows = this.rows.filter((r) => r.id !== id);
    },
    clearFilters() {
      this.searchKeyword = "";
      this.agencyFilter = null;
      this.statusFilter = null;
    }
  }
});
