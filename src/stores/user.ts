import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type RegisterPayload = {
  firstname: string;
  lastname: string;
  username: string;
  position: string;
  department: string;
  email: string;
  password: string;
  avatarUrl?: string;
};

export type ProfileUpdate = {
  username: string;
  avatarUrl: string;
  firstname: string;
  lastname: string;
  position: string;
  department: string;
};

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  firstname: string;
  lastname: string;
  position: string;
  department: string;
  fullName: string;
}

/** ✅ ดึงรูป/ชื่อจาก Google metadata (Supabase จะเก็บไว้ใน user_metadata) */
function getAuthMeta(user: User | null) {
  const meta = (user?.user_metadata ?? {}) as Record<string, any>;

  const avatarUrl: string =
    meta.avatar_url ||
    meta.picture ||
    "";

  // Google มักมี name/full_name, given_name, family_name
  const firstname: string =
    meta.given_name ||
    meta.first_name ||
    "";

  const lastname: string =
    meta.family_name ||
    meta.last_name ||
    "";

  // บางทีจะมี full_name / name
  const fullName: string =
    meta.full_name ||
    meta.name ||
    `${firstname} ${lastname}`.trim();

  return { avatarUrl, firstname, lastname, fullName };
}

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    profile: {
      id: "",
      email: "",
      username: "",
      avatarUrl: "",
      firstname: "",
      lastname: "",
      position: "",
      department: "",
      fullName: ""
    } as UserProfile
  }),

  actions: {
    /** เรียกใน main.ts / App.vue ตอนเริ่มแอป */
    async initAuth() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session?.user) return;

      this.isLoggedIn = true;

      // ✅ สำคัญ: ส่ง user เข้าไปด้วย เพื่อเอารูป/ชื่อจาก metadata
      await this.fetchProfile(session.user.id, session.user.email ?? "", session.user);

      // (แนะนำ) ฟัง auth state change เพื่อ refresh profile หลัง OAuth callback
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!newSession?.user) return;

        this.isLoggedIn = true;
        await this.fetchProfile(
          newSession.user.id,
          newSession.user.email ?? "",
          newSession.user
        );
      });
    },

    async register(payload: RegisterPayload) {
      const email = payload.email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email,
        password: payload.password
      });

      if (error) return { ok: false, message: error.message } as const;
      if (!data.user) return { ok: false, message: "No user returned" } as const;

      const { error: pErr } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        username: payload.username || email.split("@")[0],
        firstname: payload.firstname,
        lastname: payload.lastname,
        position: payload.position,
        department: payload.department,
        avatar_url: payload.avatarUrl ?? ""
      });

      if (pErr) return { ok: false, message: pErr.message } as const;

      return { ok: true } as const;
    },

    async login(email: string, password: string) {
      const e = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: e,
        password
      });

      if (error) return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } as const;

      this.isLoggedIn = true;
      await this.fetchProfile(data.user.id, data.user.email ?? e, data.user);

      return { ok: true } as const;
    },

    async loginWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    /** ✅ fetch profile + เติมข้อมูลจาก auth metadata (สำคัญกับ Google) */
    async fetchProfile(userId: string, fallbackEmail: string, user?: User) {
      const { avatarUrl, firstname, lastname, fullName } = getAuthMeta(user ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // 1) ถ้าไม่มี row → สร้างจาก metadata (รวมรูป)
      if (error || !data) {
        const email = (user?.email ?? fallbackEmail).toLowerCase();
        const username = (fullName || email.split("@")[0]).toString() || email.split("@")[0];

        await supabase.from("profiles").upsert({
          id: userId,
          email,
          username,
          firstname: firstname ?? "",
          lastname: lastname ?? "",
          position: "",
          department: "",
          avatar_url: avatarUrl ?? ""
        });

        const again = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (again.data) this.applyProfile(again.data);
        return;
      }

      // 2) ถ้ามี row แล้ว แต่ avatar_url ว่าง และ Google มีรูป → เติมให้
      const rowAvatar = (data as any).avatar_url ?? "";
      if (!rowAvatar && avatarUrl) {
        await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            // ถ้าโปรไฟล์ยังว่าง ก็เติมชื่อเบา ๆ ให้ด้วย (ไม่ทับของเดิม)
            firstname: (data as any).firstname ? undefined : firstname,
            lastname: (data as any).lastname ? undefined : lastname,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);

        // โหลดใหม่ให้ state ชัวร์ ๆ
        const refreshed = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (refreshed.data) {
          this.applyProfile(refreshed.data);
          return;
        }
      }

      this.applyProfile(data);
    },

    applyProfile(row: any) {
      this.profile = {
        id: row.id,
        email: row.email ?? "",
        username: row.username ?? "",
        avatarUrl: row.avatar_url ?? "",
        firstname: row.firstname ?? "",
        lastname: row.lastname ?? "",
        position: row.position ?? "",
        department: row.department ?? "",
        fullName: `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim()
      };
    },

    async updateProfile(update: ProfileUpdate) {
      if (!this.isLoggedIn || !this.profile.id) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          username: update.username,
          avatar_url: update.avatarUrl,
          firstname: update.firstname,
          lastname: update.lastname,
          position: update.position,
          department: update.department,
          updated_at: new Date().toISOString()
        })
        .eq("id", this.profile.id);

      if (error) throw new Error(error.message);

      this.profile.username = update.username;
      this.profile.avatarUrl = update.avatarUrl;
      this.profile.firstname = update.firstname;
      this.profile.lastname = update.lastname;
      this.profile.position = update.position;
      this.profile.department = update.department;
      this.profile.fullName = `${update.firstname} ${update.lastname}`.trim();
    },

    async logout() {
      await supabase.auth.signOut();
      this.isLoggedIn = false;
      this.applyProfile({
        id: "",
        email: "",
        username: "",
        avatar_url: "",
        firstname: "",
        lastname: "",
        position: "",
        department: ""
      });
    }
  }
});
