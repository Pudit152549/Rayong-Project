// src/stores/tasks.ts
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";
import type { RowData, Status } from "@/stores/types";

// ===== DB Row Shape (ตามตาราง public.tasks) =====
type DbTaskRow = {
  id: string;
  board_id: string;

  project_name: string;
  assigned_agency: string | null;
  responsible_person_name: string | null;

  start_date: string | null; // date -> "YYYY-MM-DD"
  end_date: string | null;   // date -> "YYYY-MM-DD"

  status: Status;

  created_by: string | null;

  created_at: string;
  updated_at?: string | null; // ถ้า DB ยังไม่มี ก็ optional
};

// ===== Helpers: Date conversion =====
function toDateOnly(ms: number): string {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateOnlyToMs(dateStr: string): number {
  // dateStr = "YYYY-MM-DD"
  // สร้างเป็น local date เพื่อลดปัญหา timezone
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
}

// ===== Mapping DB <-> UI =====
function toRowData(r: DbTaskRow): RowData {
  return {
    id: r.id,
    board_id: r.board_id,
    project_name: { name: r.project_name },
    assigned_agency: r.assigned_agency ?? "",
    responsible_person_name: r.responsible_person_name ?? "",
    period:
      r.start_date && r.end_date
        ? [dateOnlyToMs(r.start_date), dateOnlyToMs(r.end_date)]
        : null,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at ?? r.created_at
  };
}

type TaskCreateInput = Omit<RowData, "id">;

// payload สำหรับ insert/update (ไม่รวม created_by)
function toDbPayload(input: TaskCreateInput) {
  const [startMs, endMs] = input.period ?? [null, null];
  return {
    board_id: input.board_id,
    project_name: input.project_name.name,
    assigned_agency: input.assigned_agency,
    responsible_person_name: input.responsible_person_name,
    start_date: startMs ? toDateOnly(startMs) : null,
    end_date: endMs ? toDateOnly(endMs) : null,
    status: input.status
  };
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    byBoard: {} as Record<"hr" | "iot", RowData[]>,
    loading: false
  }),

  actions: {
    // ===== Boards =====
    async resolveBoardIdBySlug(slug: "hr" | "iot") {
      const { data, error } = await supabase
        .from("boards")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error(`Board not found: ${slug}`);

      return data.id as string;
    },

    // ===== Fetch list by board =====
    async fetchByBoardSlug(boardSlug: "hr" | "iot") {
      this.loading = true;
      try {
        const boardId = await this.resolveBoardIdBySlug(boardSlug);

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("board_id", boardId)
          .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        this.byBoard[boardSlug] = (data as DbTaskRow[]).map(toRowData);
      } finally {
        this.loading = false;
      }
    },

    // ===== Fetch one task =====
    async fetchOneTask(taskId: string) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Task not found");

      return toRowData(data as DbTaskRow);
    },

    // ===== Add task =====
    async addTask(boardSlug: "hr" | "iot", payload: Omit<RowData, "id">) {
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();

      if (userErr) throw new Error(userErr.message);
      if (!user) throw new Error("Not authenticated");

      // ✅ resolve board_id ให้ชัวร์ ไม่พึ่ง payload.board_id
      const boardId = await this.resolveBoardIdBySlug(boardSlug);

      const insertPayload = {
        ...toDbPayload({
          ...payload,
          board_id: boardId
        }),
        created_by: user.id
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(insertPayload)
        .select("*")
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) {
        // insert อาจสำเร็จ แต่ select คืน row ไม่ได้เพราะ RLS
        // ทางออกง่ายสุด: refetch board
        await this.fetchByBoardSlug(boardSlug);
        throw new Error("เพิ่มข้อมูลสำเร็จ แต่ระบบดึงแถวกลับมาไม่ได้ (RLS) — รีเฟรชข้อมูลแล้ว");
      }
      const row = toRowData(data as DbTaskRow);
      this.byBoard[boardSlug] = [row, ...(this.byBoard[boardSlug] ?? [])];
      return row;
    },

    // ===== Update task =====
    async updateTask(boardSlug: "hr" | "iot", id: string, partial: Partial<RowData>) {
      const patch: Partial<DbTaskRow> & Record<string, any> = {};

      if (partial.project_name) patch.project_name = partial.project_name.name;
      if (partial.assigned_agency !== undefined) patch.assigned_agency = partial.assigned_agency;
      if (partial.responsible_person_name !== undefined)
        patch.responsible_person_name = partial.responsible_person_name;
      if (partial.status !== undefined) patch.status = partial.status;

      if (partial.period !== undefined) {
        const [startMs, endMs] = partial.period ?? [null, null];
        patch.start_date = startMs ? toDateOnly(startMs) : null;
        patch.end_date = endMs ? toDateOnly(endMs) : null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw new Error(error.message);

      if (!data) {
        await this.fetchByBoardSlug(boardSlug);
        return null;
      }

      const updated = toRowData(data as DbTaskRow);

      const list = this.byBoard[boardSlug] ?? [];
      const idx = list.findIndex((x) => x.id === id);

      if (idx !== -1) list[idx] = updated;
      else list.unshift(updated);

      this.byBoard[boardSlug] = [...list];
      return updated;
    },

    // ===== Delete task =====
    async deleteTask(boardSlug: "hr" | "iot", id: string) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw new Error(error.message);

      this.byBoard[boardSlug] = (this.byBoard[boardSlug] ?? []).filter((x) => x.id !== id);
    }
  }
});
