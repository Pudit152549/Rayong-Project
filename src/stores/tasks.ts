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

  start_date: string | null; // "YYYY-MM-DD"
  end_date: string | null; // "YYYY-MM-DD"

  status: Status;

  created_by: string | null;

  created_at: string;
  updated_at?: string | null;
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

// ===== Notify helpers =====
async function notifyBoardMembers(params: {
  boardId: string;
  boardSlug: "hr" | "iot";
  event: "task_created" | "task_updated" | "task_deleted" | "task_due_soon";
  title: string;
  message: string;
  taskId?: string | null;
}) {
  // อย่าให้ notify ทำให้ flow หลักพัง (แต่ log ให้)
  try {
    const { error } = await supabase.rpc("notify_board_members", {
      p_board_id: params.boardId,
      p_board_slug: params.boardSlug,
      p_event: params.event,
      p_title: params.title,
      p_message: params.message,
      p_task_id: params.taskId ?? null
    });

    if (error) throw error;
  } catch (e) {
    console.warn("[notify_board_members] failed:", e);
  }
}

function statusToLabel(s: Status) {
  if (s === "todo") return "To Do";
  if (s === "in_progress") return "In Progress";
  return "Done";
}

function buildUpdateMessage(before: RowData, after: RowData) {
  const changes: string[] = [];

  if (before.project_name?.name !== after.project_name?.name) {
    changes.push(`ชื่อแผนงาน: "${before.project_name?.name}" → "${after.project_name?.name}"`);
  }
  if ((before.assigned_agency ?? "") !== (after.assigned_agency ?? "")) {
    changes.push(`ผู้มอบหมาย: "${before.assigned_agency ?? "-"}" → "${after.assigned_agency ?? "-"}"`);
  }
  if ((before.responsible_person_name ?? "") !== (after.responsible_person_name ?? "")) {
    changes.push(
      `ผู้รับผิดชอบ: "${before.responsible_person_name ?? "-"}" → "${after.responsible_person_name ?? "-"}"`
    );
  }
  if (before.status !== after.status) {
    changes.push(`สถานะ: "${statusToLabel(before.status)}" → "${statusToLabel(after.status)}"`);
  }

  const beforePeriod = before.period ? `${new Date(before.period[0]).toLocaleDateString()} - ${new Date(before.period[1]).toLocaleDateString()}` : "-";
  const afterPeriod = after.period ? `${new Date(after.period[0]).toLocaleDateString()} - ${new Date(after.period[1]).toLocaleDateString()}` : "-";
  if (beforePeriod !== afterPeriod) {
    changes.push(`ช่วงเวลา: "${beforePeriod}" → "${afterPeriod}"`);
  }

  if (changes.length === 0) return "มีการแก้ไขงาน (ไม่มี field เปลี่ยนแปลงชัดเจน)";
  return `แก้ไขงาน:\n- ${changes.join("\n- ")}`;
}

function isDueSoon(row: RowData, withinDays = 3) {
  if (!row.period) return false;
  const endMs = row.period[1];
  const now = Date.now();

  // เลี่ยง timezone: เทียบแบบวัน ๆ
  const diffMs = endMs - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= withinDays && row.status !== "done";
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

      // บางที insert ได้แต่ select คืนไม่ได้เพราะ RLS → refetch แล้วค่อย notify
      if (!data) {
        await this.fetchByBoardSlug(boardSlug);

        // ยิงแจ้งเตือนแบบไม่มี task_id (กัน FK ปัญหา)
        await notifyBoardMembers({
          boardId,
          boardSlug,
          event: "task_created",
          title: "เพิ่มงานใหม่",
          message: `เพิ่มงาน: ${payload.project_name.name}`,
          taskId: null
        });

        throw new Error("เพิ่มข้อมูลสำเร็จ แต่ระบบดึงแถวกลับมาไม่ได้ (RLS) — รีเฟรชข้อมูลแล้ว");
      }

      const row = toRowData(data as DbTaskRow);
      this.byBoard[boardSlug] = [row, ...(this.byBoard[boardSlug] ?? [])];

      // ✅ notify members
      await notifyBoardMembers({
        boardId,
        boardSlug,
        event: "task_created",
        title: "เพิ่มงานใหม่",
        message: `เพิ่มงาน: ${row.project_name.name}`,
        taskId: row.id
      });

      // (optional) ถ้างานใกล้ถึงกำหนดตั้งแต่ตอนสร้าง ก็ยิง due_soon เพิ่มได้
      if (isDueSoon(row, 3)) {
        await notifyBoardMembers({
          boardId,
          boardSlug,
          event: "task_due_soon",
          title: "งานใกล้ถึงกำหนดส่ง",
          message: `งาน "${row.project_name.name}" ใกล้ถึงกำหนดส่งภายใน 3 วัน`,
          taskId: row.id
        });
      }

      return row;
    },

    // ===== Update task =====
    async updateTask(boardSlug: "hr" | "iot", id: string, partial: Partial<RowData>) {
      const boardId = await this.resolveBoardIdBySlug(boardSlug);

      // หา before จาก store ก่อน (ถ้ามี)
      const before =
        (this.byBoard[boardSlug] ?? []).find((x) => x.id === id) ?? null;

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

      // update list
      const list = this.byBoard[boardSlug] ?? [];
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) list[idx] = updated;
      else list.unshift(updated);
      this.byBoard[boardSlug] = [...list];

      // ✅ notify members
      const message = before ? buildUpdateMessage(before, updated) : `แก้ไขงาน: ${updated.project_name.name}`;
      await notifyBoardMembers({
        boardId,
        boardSlug,
        event: "task_updated",
        title: "แก้ไขงาน",
        message,
        taskId: updated.id
      });

      // ✅ due soon notify (เงื่อนไข)
      if (isDueSoon(updated, 3)) {
        await notifyBoardMembers({
          boardId,
          boardSlug,
          event: "task_due_soon",
          title: "งานใกล้ถึงกำหนดส่ง",
          message: `งาน "${updated.project_name.name}" ใกล้ถึงกำหนดส่งภายใน 3 วัน`,
          taskId: updated.id
        });
      }

      return updated;
    },

    // ===== Delete task =====
    async deleteTask(boardSlug: "hr" | "iot", id: string) {
      const boardId = await this.resolveBoardIdBySlug(boardSlug);

      // ✅ ยิง notify ก่อนลบ (สำคัญมาก)
      const existing =
        (this.byBoard[boardSlug] ?? []).find((x) => x.id === id) ?? null;

      await notifyBoardMembers({
        boardId,
        boardSlug,
        event: "task_deleted",
        title: "ลบงาน",
        message: existing
          ? `ลบงาน: ${existing.project_name.name}`
          : `ลบงาน: ${id}`,
        taskId: id // ถ้า FK tasks(id) on delete cascade ที่ notifications → insert หลังลบจะพัง
      });

      // ลบจริง
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw new Error(error.message);

      // update local store
      this.byBoard[boardSlug] = (this.byBoard[boardSlug] ?? []).filter((x) => x.id !== id);
    },

    // ===== Due soon checker (เรียกจาก UI ได้เป็นครั้งคราว) =====
    // ใช้เพื่อยิงแจ้งเตือน "งานใกล้ถึงกำหนด" โดยไม่ต้องรอเพิ่ม/แก้ไข
    // แนะนำเรียก: ตอนเข้า board หรือ dashboard (วันละครั้ง/ครั้งต่อ session)
    async notifyDueSoon(boardSlug: "hr" | "iot", withinDays = 3) {
      const boardId = await this.resolveBoardIdBySlug(boardSlug);

      // ensure data
      if (!(this.byBoard[boardSlug] ?? []).length) {
        await this.fetchByBoardSlug(boardSlug);
      }

      const dueSoon = (this.byBoard[boardSlug] ?? []).filter((r) => isDueSoon(r, withinDays));

      // ยิงทีละงาน (ระวัง spam ถ้าเรียกบ่อย)
      for (const r of dueSoon) {
        await notifyBoardMembers({
          boardId,
          boardSlug,
          event: "task_due_soon",
          title: "งานใกล้ถึงกำหนดส่ง",
          message: `งาน "${r.project_name.name}" ใกล้ถึงกำหนดส่งภายใน ${withinDays} วัน`,
          taskId: r.id
        });
      }
    }
  }
});