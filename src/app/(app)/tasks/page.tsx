"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { fetchTasks, fetchProjects, updateTask, createTask, fetchProfiles } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Task, Project, TaskStatus, TaskPriority, Profile } from "@/types/database";
import { cn, pct, formatDate } from "@/lib/utils";
import {
  LayoutGrid, List, Plus, GripVertical, ChevronRight,
  AlertCircle, Clock, CheckCircle2, CircleDot, Ban,
} from "lucide-react";
import Link from "next/link";

const statusConfig: { key: TaskStatus; icon: React.ReactNode; color: string }[] = [
  { key: "todo", icon: <CircleDot className="size-4" />, color: "bg-secondary" },
  { key: "in_progress", icon: <Clock className="size-4" />, color: "bg-blue-500" },
  { key: "review", icon: <AlertCircle className="size-4" />, color: "bg-amber-500" },
  { key: "done", icon: <CheckCircle2 className="size-4" />, color: "bg-emerald-500" },
  { key: "blocked", icon: <Ban className="size-4" />, color: "bg-destructive" },
];

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-primary text-primary-foreground",
  high: "bg-amber-500 text-white",
  critical: "bg-destructive text-white",
};

export default function TasksPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", project_id: "", subproject_id: "", priority: "medium" as TaskPriority,
    due_date: "", description: "",
  });

  const loadData = async () => {
    try {
      const [t, p, pr] = await Promise.all([fetchTasks(), fetchProjects(), fetchProfiles()]);
      setTasks(t); setProjects(p); setProfiles(pr);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredTasks = useMemo(() => {
    let items = [...tasks];
    if (filterProject !== "all") items = items.filter((t) => t.project_id === filterProject);
    return items;
  }, [tasks, filterProject]);

  const columns = useMemo(() => {
    const cols: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], review: [], done: [], blocked: [] };
    filteredTasks.forEach((t) => { if (cols[t.status]) cols[t.status].push(t); });
    return cols;
  }, [filteredTasks]);

  const getProfile = (id: string | null) => profiles.find((p) => p.id === id);
  const getProject = (id: string) => projects.find((p) => p.id === id);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
    loadData();
  };

  const handleCreate = async () => {
    if (!newTask.title || !newTask.project_id) return;
    await createTask(newTask.project_id, {
      title: newTask.title,
      subproject_id: newTask.subproject_id || undefined,
      priority: newTask.priority,
      due_date: newTask.due_date || undefined,
      description: newTask.description || undefined,
    }, user?.id);
    setCreateOpen(false);
    setNewTask({ title: "", project_id: "", subproject_id: "", priority: "medium", due_date: "", description: "" });
    loadData();
  };

  const canEdit = user?.role === "admin" || user?.role === "manager" || user?.role === "editor";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.tasks}</h1>
          <p className="text-sm text-muted-foreground">{filteredTasks.length} {t.noData === "ไม่มีข้อมูล" ? "งาน" : "tasks"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.all} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant={view === "board" ? "default" : "outline"} size="sm" onClick={() => setView("board")}>
            <LayoutGrid className="size-4" /> {t.boardView}
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            <List className="size-4" /> {t.listView}
          </Button>
          {canEdit && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="size-4" /> {t.newTask}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t.newTask}</DialogTitle>
                  <DialogDescription>สร้างงานใหม่ในโปรเจกต์</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t.projectName} *</Label>
                    <Select value={newTask.project_id} onValueChange={(v) => setNewTask({ ...newTask, project_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.taskTitle} *</Label>
                    <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t.description}</Label>
                    <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.priority}</Label>
                      <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["low", "medium", "high", "critical"] as TaskPriority[]).map((p) => (
                            <SelectItem key={p} value={p}>{t[`priority_${p}` as keyof typeof t] as string}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.dueDate}</Label>
                      <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>{t.cancel}</Button>
                  <Button onClick={handleCreate} disabled={!newTask.title || !newTask.project_id}>{t.create}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Board View (Kanban) */}
      {view === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statusConfig.map((col) => (
            <div key={col.key} className="space-y-3">
              {/* Column header */}
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className={cn("size-2.5 rounded-full", col.color)} />
                {t[`task_${col.key}` as keyof typeof t] as string}
                <Badge variant="secondary" className="ml-auto text-[11px] px-1.5">
                  {columns[col.key].length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[200px]">
                {columns[col.key].map((task) => {
                  const project = getProject(task.project_id);
                  const assignee = getProfile(task.assignee_id);
                  return (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/projects/${task.project_id}`)}>
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-medium leading-tight">{task.title}</p>
                        {project && (
                          <p className="text-[11px] text-muted-foreground truncate">{project.name}</p>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Badge className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                            {t[`priority_${task.priority}` as keyof typeof t] as string}
                          </Badge>
                          {task.due_date && (
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {formatDate(task.due_date, locale === "th" ? "th" : "en")}
                            </span>
                          )}
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                        {assignee && (
                          <div className="flex items-center gap-1">
                            <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                              {(assignee.full_name ?? "U").charAt(0)}
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {assignee.full_name}
                            </span>
                          </div>
                        )}
                        {/* Quick status buttons */}
                        {canEdit && (
                          <div className="flex gap-1 pt-1 border-t border-border/50">
                            {statusConfig.map((s) => (
                              <button
                                key={s.key}
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, s.key); }}
                                className={cn("size-6 rounded flex items-center justify-center transition-colors", task.status === s.key ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}
                                title={t[`task_${s.key}` as keyof typeof t] as string}
                              >
                                {s.icon}
                              </button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {columns[col.key].length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <p className="text-xs text-muted-foreground">—</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">{t.taskTitle}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.projects}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.status}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.priority}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.progress}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.assignee}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.dueDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const project = getProject(task.project_id);
                    const assignee = getProfile(task.assignee_id);
                    return (
                      <tr key={task.id} className="border-b hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => router.push(`/projects/${task.project_id}`)}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{task.title}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{project?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[11px]">
                            {t[`task_${task.status}` as keyof typeof t] as string}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                            {t[`priority_${task.priority}` as keyof typeof t] as string}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 w-28">
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="h-1.5 flex-1" />
                            <span className="text-[11px] text-muted-foreground w-8 text-right">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{assignee?.full_name ?? t.unassigned}</td>
                        <td className="px-4 py-3 text-muted-foreground">{task.due_date ? formatDate(task.due_date, locale === "th" ? "th" : "en") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTasks.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">{t.noTasks}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
