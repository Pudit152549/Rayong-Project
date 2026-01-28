export type Status = "todo" | "in_progress" | "done";

export interface RowData {
  id: number;
  project_name: { name: string };
  assigned_agency: string;
  responsible_person_name: string;
  period: [number, number] | null;
  status: Status;
}
