"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { fetchDashboardStats } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project, Task, ActivityLog } from "@/types/database";
import { cn, pct, formatDate, progressColor } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FolderKanban, TrendingUp, ListTodo, Zap, Plus, ArrowRight,
  FileText, Camera, AlertCircle, CheckCircle2, Clock, Activity,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8", in_progress: "#3b82f6", review: "#f59e0b", done: "#22c55e", blocked: "#ef4444",
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchDashboardStats>> | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ---- pie data สถานะงาน ----
  const pieData = stats
    ? Object.entries(stats.statusCount).map(([key, value]) => ({ name: t[`task_${key}` as keyof typeof t] as string, value, key }))
    : [];

  // ---- bar data ความคืบหน้าโปรเจกต์ ----
  const barData = stats
    ? stats.projects.slice(0, 6).map((p) => ({
        name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name,
        progress: pct(p.progress),
        status: p.status,
      }))
    : [];

  // ---- activity icon ----
  const activityIcon = (action: string) => {
    if (action.includes("รายงาน") || action.includes("Report")) return <FileText className="size-4 text-blue-500" />;
    if (action.includes("รูป") || action.includes("Upload") || action.includes("ไฟล์")) return <Camera className="size-4 text-emerald-500" />;
    if (action.includes("สร้าง") || action.includes("Create")) return <Plus className="size-4 text-purple-500" />;
    return <Activity className="size-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{t.noData}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {locale === "th"
            ? "ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อระบบหรือลองเข้าสู่ระบบใหม่อีกครั้ง"
            : "Unable to load data. Please check your connection or try signing in again."}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {locale === "th" ? "ลองอีกครั้ง" : "Retry"}
        </Button>
      </div>
    );
  }

  const canCreate = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.dashboardTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.dashboardSubtitle}</p>
        </div>
        {canCreate && (
          <Link href="/projects/new">
            <Button><Plus className="size-4" /> {t.newProject}</Button>
          </Link>
        )}
      </div>

      {/* ====== STATS CARDS ====== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban className="size-5" />}
          value={stats.projects.length}
          label={t.totalProjects}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          value={stats.activeProjects}
          label={t.activeProjects}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<ListTodo className="size-5" />}
          value={stats.openTasks}
          label={t.openTasks}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={<Zap className="size-5" />}
          value={`${stats.avgProgress}%`}
          label={t.avgProgress}
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ====== CHARTS ====== */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Bar chart: project progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.projectsProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "ความคืบหน้า"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="progress" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {barData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.progress >= 75 ? "#22c55e" : entry.progress >= 40 ? "#3b82f6" : "#f59e0b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">{t.noData}</div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart: task status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.taskStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.key] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats.tasks.length}</p>
                    <p className="text-[11px] text-muted-foreground">{t.tasks}</p>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {pieData.map((entry) => (
                    <div key={entry.key} className="flex items-center gap-1.5 text-xs">
                      <div className="size-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.key] }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">{t.noData}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ====== PROJECTS PROGRESS ====== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{t.projectsProgress}</CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-xs">
                {t.all} <ArrowRight className="size-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.projects.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">{t.noProjects}</p>
          ) : (
            stats.projects.slice(0, 6).map((project) => (
              <div key={project.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${project.id}`} className="text-sm font-medium hover:text-primary truncate">
                      {project.name}
                    </Link>
                    {project.code && (
                      <span className="text-[11px] text-muted-foreground shrink-0">{project.code}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", project.status === "delayed" && "border-destructive text-destructive", project.status === "completed" && "border-emerald-500 text-emerald-600")}
                    >
                      {t[`status_${project.status}` as keyof typeof t] as string}
                    </Badge>
                  </div>
                </div>
                <div className="w-36 shrink-0">
                  <div className="flex items-center gap-2">
                    <Progress value={pct(project.progress)} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-9 text-right">{pct(project.progress)}%</span>
                  </div>
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="ghost" size="sm" className="text-xs shrink-0">{t.view}</Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ====== RECENT ACTIVITY ====== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t.recentActivity}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.logs.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">—</p>
          ) : (
            stats.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-muted p-1.5">{activityIcon(log.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{log.action}</p>
                  {log.details && (
                    <p className="text-xs text-muted-foreground truncate">
                      {typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details)}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDate(log.created_at, locale === "th" ? "th" : "en")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ====== Stat Card Component ======
function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", color)}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
