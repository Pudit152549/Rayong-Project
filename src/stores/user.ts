// src/stores/user.ts
import { defineStore } from "pinia";

export interface RegisteredUser {
  email: string;
  password: string;

  username: string;          // ✅ เพิ่ม
  avatarUrl?: string;        // ✅ เพิ่ม (base64 หรือ url)

  firstname: string;
  lastname: string;

  position: string;          // ✅ เพิ่ม
  department: string;        // ✅ เพิ่ม

  age?: number | null;
  gender?: string;
}

export interface UserProfile {
  email: string;

  username: string;          // ✅ เพิ่ม
  avatarUrl: string;         // ✅ เพิ่ม

  fullName: string;
  firstname: string;
  lastname: string;

  position: string;          // ✅ เพิ่ม
  department: string;        // ✅ เพิ่ม

  age: number | null;
  gender: string;
}

const STORAGE_KEY = "scrumboard_users";
const STORAGE_SESSION_KEY = "scrumboard_session_email";

function loadUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: RegisteredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadSessionEmail(): string | null {
  return localStorage.getItem(STORAGE_SESSION_KEY);
}

function saveSessionEmail(email: string) {
  localStorage.setItem(STORAGE_SESSION_KEY, email);
}

function clearSessionEmail() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

export const useUserStore = defineStore("user", {
  state: () => ({
    users: loadUsers() as RegisteredUser[],
    isLoggedIn: false,
    profile: {
      email: "",
      username: "",
      avatarUrl: "",
      fullName: "",
      firstname: "",
      lastname: "",
      position: "",
      department: "",
      age: null,
      gender: ""
    } as UserProfile
  }),

  getters: {
    currentUserEmail: (state) => state.profile.email
  },

  actions: {
    /** เรียกตอน app start เพื่อ restore session หลังรีเฟรช */
    initAuth() {
      const email = loadSessionEmail();
      if (!email) return;

      const u = this.users.find((x) => x.email === email);
      if (!u) return;

      this.isLoggedIn = true;
      this.profile = {
        email: u.email,
        username: u.username || u.email.split("@")[0],
        avatarUrl: u.avatarUrl ?? "",
        fullName: `${u.firstname} ${u.lastname}`.trim(),
        firstname: u.firstname,
        lastname: u.lastname,
        position: u.position ?? "",
        department: u.department ?? "",
        age: u.age ?? null,
        gender: u.gender ?? ""
      };
    },

    /** ✅ สมัครสมาชิก (Register) */
    register(payload: Omit<RegisteredUser, "email"> & { email: string }) {
      const email = payload.email.trim().toLowerCase();

      const exists = this.users.some((u) => u.email.toLowerCase() === email);
      if (exists) {
        return { ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว" } as const;
      }

      // ✅ กันข้อมูลกรอกว่าง: username fallback
      const username = payload.username?.trim() || email.split("@")[0];

      const user: RegisteredUser = {
        ...payload,
        email,
        username,
        avatarUrl: payload.avatarUrl ?? "",
        position: payload.position ?? "",
        department: payload.department ?? ""
      };

      this.users.push(user);
      saveUsers(this.users);

      return { ok: true } as const;
    },

    /** ✅ ล็อกอินจาก user ที่สมัครไว้ */
    login(email: string, password: string) {
      const e = email.trim().toLowerCase();
      const p = password;

      const u = this.users.find(
        (x) => x.email.toLowerCase() === e && x.password === p
      );

      if (!u) {
        this.logout();
        return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } as const;
      }

      this.isLoggedIn = true;
      this.profile = {
        email: u.email,
        username: u.username || u.email.split("@")[0],
        avatarUrl: u.avatarUrl ?? "",
        fullName: `${u.firstname} ${u.lastname}`.trim(),
        firstname: u.firstname,
        lastname: u.lastname,
        position: u.position ?? "",
        department: u.department ?? "",
        age: u.age ?? null,
        gender: u.gender ?? ""
      };

      saveSessionEmail(u.email);
      return { ok: true } as const;
    },

    logout() {
      this.isLoggedIn = false;
      this.profile = {
        email: "",
        username: "",
        avatarUrl: "",
        fullName: "",
        firstname: "",
        lastname: "",
        position: "",
        department: "",
        age: null,
        gender: ""
      };
      clearSessionEmail();
    },

    /** ✅ อัปเดตโปรไฟล์ current user + sync ลง users */
    updateProfile(update: {
      username: string;
      avatarUrl: string;
      firstname: string;
      lastname: string;
      position: string;     // ✅ เพิ่ม
      department: string;   // ✅ เพิ่ม
      age: number | null;
      gender: string;
    }) {
      if (!this.isLoggedIn || !this.profile.email) return;

      // update state profile
      this.profile.username = update.username;
      this.profile.avatarUrl = update.avatarUrl;
      this.profile.firstname = update.firstname;
      this.profile.lastname = update.lastname;
      this.profile.fullName = `${update.firstname} ${update.lastname}`.trim();
      this.profile.position = update.position;
      this.profile.department = update.department;
      this.profile.age = update.age;
      this.profile.gender = update.gender;

      // update in users list
      const idx = this.users.findIndex((u) => u.email === this.profile.email);
      if (idx !== -1) {
        this.users[idx] = {
          ...this.users[idx],
          username: update.username,
          avatarUrl: update.avatarUrl,
          firstname: update.firstname,
          lastname: update.lastname,
          position: update.position,
          department: update.department,
          age: update.age,
          gender: update.gender
        };
        saveUsers(this.users);
      }
    }
  }
});
