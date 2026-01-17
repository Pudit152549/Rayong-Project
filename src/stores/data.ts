import { defineStore } from "pinia";

export type Status = "todo" | "in_progress" | "done";

export interface RowData {
  id: number;
  project_name: { name: string };
  responsible_person_name: string;
  period: [number, number] | null;
  status: Status;
}

export const useDataStore = defineStore("data", {
  state: () => ({
    rows: [
      {
        id: 1,
        project_name: { name: "ยกระดับคุณภาพการศึกษาเชิงรุก" },
        responsible_person_name: "สมชาย ใจดี",
        period: [1758906000000, 1759165200000],
        status: "in_progress" as Status
      },
      {
        id: 2,
        project_name: { name: "พัฒนาโครงสร้างพื้นฐานดิจิทัล" },
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
          row.project_name.name
            .toLowerCase()
            .includes(state.searchKeyword.toLowerCase());

        const matchStatus =
          !state.statusFilter || row.status === state.statusFilter;

        return matchKeyword && matchStatus;
      });
    }
  },

  actions: {
    /** เพิ่มข้อมูลจากหน้า AddDataPage */
    addRow(payload: {
      project_name: { name: string };
      assigned_agency: string;
      responsible_person_name: string;
      period: [number, number] | null;
      status: Status;
    }) {
      const maxId = this.rows.reduce((m, r) => Math.max(m, r.id), 0);

      this.rows.push({
        id: maxId + 1,
        project_name: payload.project_name,
        responsible_person_name: payload.responsible_person_name,
        period: payload.period,
        status: payload.status
      });
    },

    updateRow(id: number, partial: Partial<RowData>) {
      const idx = this.rows.findIndex((r) => r.id === id);
      if (idx !== -1) {
        this.rows[idx] = { ...this.rows[idx], ...partial };
      }
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
