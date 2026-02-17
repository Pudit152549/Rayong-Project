import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type NotiRow = {
  id: string;
  user_id: string;
  is_read: boolean;
};

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    unreadCount: 0,
    ready: false,
    channel: null as RealtimeChannel | null,

    // ✅ กันยิง refresh ถี่เกิน
    _syncTimer: null as ReturnType<typeof setTimeout> | null
  }),

  actions: {
    async refreshUnreadCount(userId: string) {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      this.unreadCount = count ?? 0;
      this.ready = true;
    },

    // ✅ debounce sync (เรียกหลัง mark/delete ได้)
    scheduleSync(userId: string, delayMs = 200) {
      if (!userId) return;

      if (this._syncTimer) clearTimeout(this._syncTimer);
      this._syncTimer = setTimeout(() => {
        this.refreshUnreadCount(userId).catch(() => {});
      }, delayMs);
    },

    async startRealtime(userId: string) {
      if (!userId) return;

      // กันซ้ำ
      if (this.channel) this.stopRealtime();

      // sync ค่าเริ่มต้น
      await this.refreshUnreadCount(userId);

      const ch = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const newRow = (payload.new ?? null) as NotiRow | null;
            const oldRow = (payload.old ?? null) as NotiRow | null;

            if (payload.eventType === "INSERT") {
              if (newRow && newRow.is_read === false) this.unreadCount += 1;
              return;
            }

            if (payload.eventType === "UPDATE") {
              const wasRead = oldRow?.is_read ?? true;
              const nowRead = newRow?.is_read ?? true;

              if (!wasRead && nowRead) this.unreadCount = Math.max(0, this.unreadCount - 1);
              else if (wasRead && !nowRead) this.unreadCount += 1;

              return;
            }

            if (payload.eventType === "DELETE") {
              if (oldRow && oldRow.is_read === false) {
                this.unreadCount = Math.max(0, this.unreadCount - 1);
              }
              return;
            }
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            this.scheduleSync(userId, 500);
          }
        });

      this.channel = ch;
    },

    stopRealtime() {
      if (this._syncTimer) {
        clearTimeout(this._syncTimer);
        this._syncTimer = null;
      }

      if (this.channel) {
        // ✅ ไม่ใช้ supabase.removeChannel เพื่อเลี่ยง type mismatch
        this.channel.unsubscribe();
        this.channel = null;
      }

      this.unreadCount = 0;
      this.ready = false;
    }
  }
});