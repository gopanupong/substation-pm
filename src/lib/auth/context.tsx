"use client";

import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/config";
import { demoProfiles } from "@/lib/demo/mock-data";
import type { Profile, Role } from "@/types/database";

interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** เข้าสู่ระบบด้วย demo role (เฉพาะ demo mode) */
  signInDemo: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== Demo mode: ใช้ mock profile =====
  const loadDemoProfile = useCallback((role: Role) => {
    const demo = demoProfiles.find((p) => p.role === role) ?? demoProfiles[0];
    setProfile(demo);
    setUser({
      id: demo.id,
      email: demo.email,
      full_name: demo.full_name,
      avatar_url: demo.avatar_url,
      role: demo.role,
    });
    setLoading(false);
  }, []);

  // ===== โหลด profile จาก Supabase =====
  const loadProfile = useCallback(async (u: User, session: Session | null) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    const profile = (data as unknown as Profile) ?? null;
    if (profile) {
      setProfile(profile);
      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      });
    } else {
      // fallback ถ้า profile ยังไม่ถูกสร้าง
      const meta = session?.user?.user_metadata ?? {};
      const fallback: Profile = {
        id: u.id,
        email: u.email ?? "",
        full_name: meta.full_name ?? meta.name ?? null,
        avatar_url: meta.avatar_url ?? null,
        role: "viewer",
        phone: null, position: null, department: null, region: null,
        created_at: new Date().toISOString(),
      };
      setProfile(fallback);
      setUser({
        id: fallback.id, email: fallback.email,
        full_name: fallback.full_name, avatar_url: fallback.avatar_url,
        role: "viewer",
      });
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      // โหมด demo — เช็คว่าเคยเลือก role ไว้ไหม
      const savedRole = (localStorage.getItem("demo-role") as Role) || null;
      if (savedRole) loadDemoProfile(savedRole);
      else setLoading(false); // ยังไม่ล็อกอินใน demo
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user, session);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) loadProfile(session.user, session);
        else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, loadDemoProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem("demo-role");
      setUser(null);
      setProfile(null);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const signInDemo = useCallback((role: Role) => {
    localStorage.setItem("demo-role", role);
    loadDemoProfile(role);
  }, [loadDemoProfile]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isDemo: isDemoMode, signInWithGoogle, signOut, signInDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
