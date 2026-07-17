"use client";

import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/i18n/context";
import { Sidebar } from "@/components/navigation/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, isDemo } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    // redirect to login จะถูก middleware จัดการ แต่ fallback
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Demo notice bar */}
        {isDemo && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 text-center">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              🔧 <strong>{t.demoNotice}</strong> — {t.demoNoticeDesc}
            </p>
          </div>
        )}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
