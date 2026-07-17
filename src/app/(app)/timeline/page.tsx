"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { fetchProjects, fetchTasks, fetchMilestones } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project, Task, Milestone } from "@/types/database";
import { formatDate, pct, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, GanttChart, Flag } from "lucide-react";

/** คำนวณจำนวนวันระหว่าง 2 วัน */
function daysBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

/** เพิ่มวันให้ date string */
function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const phaseColors: Record<string, string> = {
  civil: "bg-amber-400",
  electrical: "bg-blue-500",
  equipment: "bg-purple-500",
  testing: "bg-emerald-500",
  commissioning: "bg-sky-500",
  other: "bg-zinc-400",
};

export default function TimelinePage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [offset, setOffset] = useState(0); // months offset for scrolling

  useEffect(() => {
    (async () => {
      try {
        const [p, tk, m] = await Promise.all([fetchProjects(), fetchTasks(), fetchMilestones("p-1").catch(() => [])]);
        setProjects(p); setTasks(tk);
        // fetch milestones for all projects
        const allMs: Milestone[] = [];
        for (const pr of p) {
          try {
            const ms = await fetchMilestones(pr.id);
            allMs.push(...ms);
          } catch {}
        }
        setMilestones(allMs);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filteredTasks = useMemo(() => {
    if (selectedProject === "all") return tasks.filter((t) => t.start_date && t.due_date);
    return tasks.filter((t) => t.project_id === selectedProject && t.start_date && t.due_date);
  }, [tasks, selectedProject]);

  const filteredMilestones = useMemo(() => {
    if (selectedProject === "all") return milestones;
    return milestones.filter((m) => m.project_id === selectedProject);
  }, [milestones, selectedProject]);

  // คำนวณ timeline range
  const timelineRange = useMemo(() => {
    if (filteredTasks.length === 0) return { start: new Date(), end: addDays(new Date().toISOString(), 90) };
    const allDates = filteredTasks.flatMap((t) => [t.start_date!, t.due_date!]);
    const minDate = new Date(Math.min(...allDates.map((d) => new Date(d).getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => new Date(d).getTime())));
    // เพิ่ม padding 15 วัน
    return {
      start: addDays(minDate.toISOString(), -15),
      end: addDays(maxDate.toISOString(), 15),
    };
  }, [filteredTasks]);

  const totalDays = daysBetween(timelineRange.start.toISOString(), timelineRange.end.toISOString());
  const months = MONTHS_TH; // use TH months
  const monthsEn = MONTHS_EN;

  const getProject = (id: string) => projects.find((p) => p.id === id);

  // Generate month columns
  const monthCols = useMemo(() => {
    const cols: { label: string; labelEn: string; startPct: number; widthPct: number }[] = [];
    const current = new Date(timelineRange.start);
    // เริ่มจากวันแรกของเดือน
    current.setDate(1);
    while (current <= timelineRange.end) {
      const monthStart = Math.max(0, daysBetween(timelineRange.start.toISOString(), current.toISOString()));
      const nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthEnd = Math.min(totalDays, daysBetween(timelineRange.start.toISOString(), nextMonth.toISOString()));
      const width = monthEnd - monthStart;
      cols.push({
        label: months[current.getMonth()],
        labelEn: monthsEn[current.getMonth()],
        startPct: (monthStart / totalDays) * 100,
        widthPct: (width / totalDays) * 100,
      });
      current.setMonth(current.getMonth() + 1);
    }
    return cols;
  }, [timelineRange, totalDays]);

  const todayPct = useMemo(() => {
    const now = new Date();
    const today = daysBetween(timelineRange.start.toISOString(), now.toISOString());
    return Math.min(100, Math.max(0, (today / totalDays) * 100));
  }, [timelineRange, totalDays]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GanttChart className="size-6" /> {t.timeline}
          </h1>
          <p className="text-sm text-muted-foreground">ไทม์ไลน์และแผนงานโครงการก่อสร้าง</p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t.all} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GanttChart className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">{t.noData}</h3>
            <p className="text-sm text-muted-foreground mt-1">ไม่มงานที่มีกำหนดเวลา</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Month header */}
              <div className="flex border-b bg-muted/50">
                <div className="w-56 shrink-0 px-3 py-2 text-xs font-medium border-r">
                  งาน
                </div>
                <div className="flex-1 relative">
                  {monthCols.map((col, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-border/50 flex items-center px-2"
                      style={{ left: `${col.startPct}%`, width: `${col.widthPct}%` }}
                    >
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {locale === "th" ? col.label : col.labelEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today line (only in header area) */}
              <div className="relative h-px">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-destructive"
                  style={{ left: `calc(14rem + (100% - 14rem) * ${todayPct / 100})` }}
                />
              </div>

              {/* Task rows */}
              <div className="divide-y">
                {filteredTasks.map((task) => {
                  const project = getProject(task.project_id);
                  const startDay = daysBetween(timelineRange.start.toISOString(), task.start_date!);
                  const duration = daysBetween(task.start_date!, task.due_date!);
                  const leftPct = (startDay / totalDays) * 100;
                  const widthPct = (duration / totalDays) * 100;

                  return (
                    <div key={task.id} className="flex items-center hover:bg-accent/30 group">
                      {/* Label */}
                      <div className="w-56 shrink-0 px-3 py-2 border-r space-y-0.5">
                        <p className="text-xs font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-1">
                          {project && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {project.code ?? project.name}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[9px] px-1 py-0 ml-auto">
                            {task.progress}%
                          </Badge>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="flex-1 relative h-10">
                        <div
                          className={cn(
                            "absolute top-2 h-5 rounded-md flex items-center overflow-hidden cursor-pointer transition-opacity group-hover:opacity-100",
                            phaseColors[project?.voltage_level ? "electrical" : "other"] ?? "bg-zinc-400",
                            task.status === "done" && "opacity-60"
                          )}
                          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.5)}%` }}
                          onClick={() => router.push(`/projects/${task.project_id}`)}
                          title={`${task.title} (${formatDate(task.start_date!, "th")} - ${formatDate(task.due_date!, "th")})`}
                        >
                          {/* Progress fill */}
                          <div
                            className="absolute inset-y-0 left-0 bg-black/20"
                            style={{ width: `${task.progress}%` }}
                          />
                          {widthPct > 3 && (
                            <span className="relative text-[9px] text-white font-medium px-1.5 truncate">
                              {task.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Milestone rows */}
                {filteredMilestones.map((ms) => {
                  const project = getProject(ms.project_id);
                  const msDay = daysBetween(timelineRange.start.toISOString(), ms.due_date);
                  const leftPct = (msDay / totalDays) * 100;

                  return (
                    <div key={ms.id} className="flex items-center hover:bg-accent/30">
                      <div className="w-56 shrink-0 px-3 py-2 border-r space-y-0.5">
                        <p className="text-xs font-medium truncate flex items-center gap-1">
                          <Flag className="size-3 text-destructive" /> {ms.name}
                        </p>
                        {project && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {project.name}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 relative h-10">
                        <div
                          className={cn(
                            "absolute top-2.5 size-4 rotate-45 transition-transform hover:scale-125",
                            ms.completed_at ? "bg-emerald-500" : "bg-destructive"
                          )}
                          style={{ left: `${leftPct}%` }}
                          title={`${ms.name} — ${formatDate(ms.due_date, "th")}${ms.completed_at ? " ✓" : ""}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Today marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-destructive/80 pointer-events-none z-10"
                style={{ left: `calc(14rem + (100% - 14rem) * ${todayPct / 100})` }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[9px] px-1 rounded">
                  วันนี้
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
