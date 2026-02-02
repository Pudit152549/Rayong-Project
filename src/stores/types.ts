// src/stores/types.ts
export type Status = "todo" | "in_progress" | "done";

export type RowData = {
  id: string; // ✅ uuid
  board_id: string; // ✅ uuid
  project_name: { name: string };
  assigned_agency: string;
  responsible_person_name: string;
  period: [number, number] | null;
  status: Status;
  created_at?: string;
  updated_at?: string;
};
