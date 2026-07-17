"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ChevronRight, Plus, Trash2, MapPin, Zap, Building2, Calendar,
  DollarSign, Flag, Camera, Upload, FileText, X, AlertCircle,
  CheckCircle2, Clock, Eye, Cloud,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

import {
  fetchProject, fetchSubprojects, fetchTasks, fetchReports,
  fetchMilestones, fetchAttachments, fetchProfiles,
  updateProject, createSubproject, deleteSubproject,
  createTask, updateTask, deleteTask,
  createReport, uploadAttachment, createMilestone,
} from "@/lib/data";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { cn, pct, formatDate, fileToDataUrl } from "@/lib/utils";
import type {
  Project, Subproject, Task, ProgressReport, Milestone, Attachment,
  Profile, SubprojectPhase, TaskStatus, TaskPriority,
} from "@/types/database";

// ====== helpers ======
const statusBadgeClass: Record<string, string> = {
  planning: "border-border",
  active: "border-blue-500 text-blue-600 dark:text-blue-400",
  paused: "border-amber-500 text-amber-600 dark:text-amber-400",
  completed: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
  delayed: "border-destructive text-destructive",
};

const phaseBadgeClass: Record<string, string> = {
  civil: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  electrical: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  equipment: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  testing: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  commissioning: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  other: "bg-secondary text-secondary-foreground",
};

const taskStatusClass: Record<string, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  blocked: "bg-destructive/15 text-destructive",
};

const priorityClass: Record<string, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-primary/15 text-primary",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  critical: "bg-destructive/15 text-destructive",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const canEdit = user?.role === "admin" || user?.role === "manager" || user?.role === "editor";
  const canManage = user?.role === "admin" || user?.role === "manager";

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [subprojects, setSubprojects] = useState<Subproject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Dialog states
  const [spOpen, setSpOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [msOpen, setMsOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // New item forms
  const [newSp, setNewSp] = useState({ name: "", phase: "civil" as SubprojectPhase, description: "" });
  const [newTask, setNewTask] = useState({ title: "", subproject_id: "", priority: "medium" as TaskPriority, due_date: "", description: "" });
  const [newReport, setNewReport] = useState({
    report_date: new Date().toISOString().slice(0, 10), task_id: "", work_done: "",
    issues: "", next_steps: "", weather: "แดดออก", location: "",
  });
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [newMs, setNewMs] = useState({ name: "", due_date: "", description: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const [p, sp, tk, rp, ms, att, pr] = await Promise.all([
        fetchProject(id), fetchSubprojects(id), fetchTasks(id),
        fetchReports(id), fetchMilestones(id), fetchAttachments(id), fetchProfiles(),
      ]);
      setProject(p); setSubprojects(sp); setTasks(tk);
      setReports(rp); setMilestones(ms); setAttachments(att); setProfiles(pr);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const getProfile = (uid: string | null) => profiles.find((p) => p.id === uid);
  const tasksBySubproject = (spId: string) => tasks.filter((tk) => tk.subproject_id === spId);
  const images = attachments.filter((a) => a.is_image);
  const docs = attachments.filter((a) => !a.is_image);
  const completedTasks = tasks.filter((tk) => tk.status === "done").length;

  // ====== handlers ======
  const handleCreateSp = async () => {
    if (!newSp.name) return;
    try {
      await createSubproject(id, newSp);
      toast.success(t.savedSuccess); setSpOpen(false);
      setNewSp({ name: "", phase: "civil", description: "" });
      loadData();
    } catch { toast.error(t.errorOccurred); }
  };

  const handleDeleteSp = async (spId: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try { await deleteSubproject(spId); toast.success(t.deletedSuccess); loadData(); }
    catch { toast.error(t.errorOccurred); }
  };

  const handleCreateTask = async () => {
    if (!newTask.title) return;
    try {
      await createTask(id, {
        title: newTask.title,
        subproject_id: newTask.subproject_id || undefined,
        priority: newTask.priority,
        due_date: newTask.due_date || undefined,
        description: newTask.description || undefined,
      }, user?.id);
      toast.success(t.savedSuccess); setTaskOpen(false);
      setNewTask({ title: "", subproject_id: "", priority: "medium", due_date: "", description: "" });
      loadData();
    } catch { toast.error(t.errorOccurred); }
  };

  const handleTaskStatusCycle = async (taskId: string, current: TaskStatus) => {
    if (!canEdit) return;
    const order: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    try { await updateTask(taskId, { status: next }); loadData(); }
    catch { toast.error(t.errorOccurred); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try { await deleteTask(taskId); toast.success(t.deletedSuccess); loadData(); }
    catch { toast.error(t.errorOccurred); }
  };

  const handleCreateReport = async () => {
    if (!newReport.work_done) return;
    try {
      const report = await createReport(id, newReport, user?.id);
      // อัปโหลดไฟล์ที่แนบ
      for (const file of reportFiles) {
        await uploadAttachment(file, {
          projectId: id, reportId: report.id, bucket: "report-images", uploadedBy: user?.id,
        }, fileToDataUrl);
      }
      toast.success(t.uploadSuccess); setReportOpen(false);
      setNewReport({ report_date: new Date().toISOString().slice(0, 10), task_id: "", work_done: "", issues: "", next_steps: "", weather: "แดดออก", location: "" });
      setReportFiles([]);
      loadData();
    } catch { toast.error(t.errorOccurred); }
  };

  const handleCreateMilestone = async () => {
    if (!newMs.name || !newMs.due_date) return;
    try {
      await createMilestone(id, newMs.name, newMs.due_date, newMs.description);
      toast.success(t.savedSuccess); setMsOpen(false);
      setNewMs({ name: "", due_date: "", description: "" });
      loadData();
    } catch { toast.error(t.errorOccurred); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="size-16 text-muted-foreground/30 mb-4" />
        <p className="text-lg">ไม่พบโปรเจกต์</p>
        <Link href="/projects"><Button variant="outline" className="mt-4">{t.back}</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">{t.dashboard}</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/projects" className="hover:text-foreground">{t.projects}</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground truncate">{project.name}</span>
      </nav>

      {/* ===== Project Header ===== */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn(statusBadgeClass[project.status])}>
                  {t[`status_${project.status}` as keyof typeof t] as string}
                </Badge>
                {project.code && <span className="text-sm text-muted-foreground">{project.code}</span>}
              </div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                {project.location && <span className="flex items-center gap-1"><MapPin className="size-4" />{project.location}</span>}
                {project.voltage_level && <span className="flex items-center gap-1"><Zap className="size-4" />{project.voltage_level}</span>}
                {project.capacity_mva && <span>{project.capacity_mva} MVA</span>}
                {project.owner && <span className="flex items-center gap-1"><Building2 className="size-4" />{project.owner}</span>}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{t.progress}</span>
              <span className="text-lg font-bold">{pct(project.progress)}%</span>
            </div>
            <Progress value={pct(project.progress)} className="h-2.5" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-xs text-muted-foreground">{t.totalTasks}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">{t.task_done}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
              <p className="text-xs text-muted-foreground">{t.reports}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Tabs ===== */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="subprojects">{t.subprojects}</TabsTrigger>
          <TabsTrigger value="tasks">{t.tasks}</TabsTrigger>
          <TabsTrigger value="reports">{t.reports}</TabsTrigger>
          <TabsTrigger value="files">{t.files}</TabsTrigger>
        </TabsList>

        {/* ====== TAB: OVERVIEW ====== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Details */}
            <Card>
              <CardHeader><CardTitle className="text-sm">{t.overview}</CardTitle></CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <DetailRow icon={<Building2 className="size-4" />} label={t.owner} value={project.owner} />
                <DetailRow icon={<Building2 className="size-4" />} label={t.contractor} value={project.contractor} />
                <DetailRow icon={<Calendar className="size-4" />} label={t.startDate} value={project.start_date ? formatDate(project.start_date, locale === "th" ? "th" : "en") : null} />
                <DetailRow icon={<Calendar className="size-4" />} label={t.endDate} value={project.end_date ? formatDate(project.end_date, locale === "th" ? "th" : "en") : null} />
                <DetailRow icon={<DollarSign className="size-4" />} label={t.budget} value={project.budget ? `${Number(project.budget).toLocaleString()} ฿` : null} />
                {project.description && <p className="text-muted-foreground pt-2 text-xs">{project.description}</p>}
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm flex items-center gap-2"><Flag className="size-4" />{t.milestones}</CardTitle>
                {canManage && (
                  <Dialog open={msOpen} onOpenChange={setMsOpen}>
                    <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="size-3.5" /></Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{t.milestones}</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div><Label>{t.projectName} *</Label><Input value={newMs.name} onChange={(e) => setNewMs({ ...newMs, name: e.target.value })} /></div>
                        <div><Label>{t.dueDate} *</Label><Input type="date" value={newMs.due_date} onChange={(e) => setNewMs({ ...newMs, due_date: e.target.value })} /></div>
                        <div><Label>{t.description}</Label><Textarea value={newMs.description} onChange={(e) => setNewMs({ ...newMs, description: e.target.value })} rows={2} /></div>
                      </div>
                      <DialogFooter><Button variant="outline" onClick={() => setMsOpen(false)}>{t.cancel}</Button><Button onClick={handleCreateMilestone}>{t.save}</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">—</p>
                ) : milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center gap-2.5 rounded-lg border p-2.5">
                    <div className={cn("size-2.5 rounded-full shrink-0", ms.completed_at ? "bg-emerald-500" : "bg-destructive")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ms.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(ms.due_date, locale === "th" ? "th" : "en")}</p>
                    </div>
                    {ms.completed_at ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px]">{t.task_done}</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">{t.task_todo}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====== TAB: SUBPROJECTS ====== */}
        <TabsContent value="subprojects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.subprojects}</h2>
            {canEdit && (
              <Dialog open={spOpen} onOpenChange={setSpOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="size-4" />{t.newSubproject}</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t.newSubproject}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>{t.projectName} *</Label><Input value={newSp.name} onChange={(e) => setNewSp({ ...newSp, name: e.target.value })} /></div>
                    <div>
                      <Label>{t.phase}</Label>
                      <Select value={newSp.phase} onValueChange={(v) => setNewSp({ ...newSp, phase: v as SubprojectPhase })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["civil", "electrical", "equipment", "testing", "commissioning", "other"] as SubprojectPhase[]).map((ph) => (
                            <SelectItem key={ph} value={ph}>{t[`phase_${ph}` as keyof typeof t] as string}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>{t.description}</Label><Textarea value={newSp.description} onChange={(e) => setNewSp({ ...newSp, description: e.target.value })} rows={2} /></div>
                  </div>
                  <DialogFooter><Button variant="outline" onClick={() => setSpOpen(false)}>{t.cancel}</Button><Button onClick={handleCreateSp}>{t.save}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {subprojects.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">{t.noData}</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {subprojects.map((sp) => {
                const spTasks = tasksBySubproject(sp.id);
                return (
                  <Card key={sp.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-[10px]", phaseBadgeClass[sp.phase])}>
                              {t[`phase_${sp.phase}` as keyof typeof t] as string}
                            </Badge>
                            <h3 className="font-medium truncate">{sp.name}</h3>
                          </div>
                          {sp.description && <p className="text-xs text-muted-foreground">{sp.description}</p>}
                        </div>
                        {canManage && (
                          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSp(sp.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={pct(sp.progress)} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium w-9 text-right">{pct(sp.progress)}%</span>
                        <Badge variant="secondary" className="text-[10px]">{spTasks.length} {t.tasks}</Badge>
                      </div>
                      {/* Tasks under this subproject */}
                      {spTasks.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                          {spTasks.map((tk) => (
                            <div key={tk.id} className="flex items-center gap-2 text-xs">
                              <span className={cn("size-1.5 rounded-full", taskStatusClass[tk.status].split(" ")[0])} />
                              <span className="flex-1 truncate">{tk.title}</span>
                              <span className="text-muted-foreground">{tk.progress}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ====== TAB: TASKS ====== */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.tasks}</h2>
            {canEdit && (
              <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="size-4" />{t.newTask}</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t.newTask}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>{t.taskTitle} *</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} /></div>
                    <div>
                      <Label>{t.subprojects}</Label>
                      <Select value={newTask.subproject_id} onValueChange={(v) => setNewTask({ ...newTask, subproject_id: v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          {subprojects.map((sp) => <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{t.priority}</Label>
                        <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(["low", "medium", "high", "critical"] as TaskPriority[]).map((pr) => (
                              <SelectItem key={pr} value={pr}>{t[`priority_${pr}` as keyof typeof t] as string}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>{t.dueDate}</Label><Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} /></div>
                    </div>
                    <div><Label>{t.description}</Label><Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={2} /></div>
                  </div>
                  <DialogFooter><Button variant="outline" onClick={() => setTaskOpen(false)}>{t.cancel}</Button><Button onClick={handleCreateTask}>{t.save}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">{t.noTasks}</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-xs">
                      <th className="px-4 py-2.5 text-left font-medium">{t.taskTitle}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t.subprojects}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t.status}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t.priority}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t.progress}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t.assignee}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t.dueDate}</th>
                      {canManage && <th className="px-4 py-2.5"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((tk) => {
                      const sp = subprojects.find((s) => s.id === tk.subproject_id);
                      const assignee = getProfile(tk.assignee_id);
                      return (
                        <tr key={tk.id} className="border-b hover:bg-accent/30">
                          <td className="px-4 py-2.5 font-medium">{tk.title}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{sp?.name ?? "—"}</td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => handleTaskStatusCycle(tk.id, tk.status)}>
                              <Badge className={cn("text-[10px] cursor-pointer", taskStatusClass[tk.status])}>
                                {t[`task_${tk.status}` as keyof typeof t] as string}
                              </Badge>
                            </button>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className={cn("text-[10px]", priorityClass[tk.priority])}>
                              {t[`priority_${tk.priority}` as keyof typeof t] as string}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 w-28">
                            <div className="flex items-center gap-1.5">
                              <Progress value={pct(tk.progress)} className="h-1.5 flex-1" />
                              <span className="text-[11px] w-7">{tk.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{assignee?.full_name ?? t.unassigned}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{tk.due_date ? formatDate(tk.due_date, locale === "th" ? "th" : "en") : "—"}</td>
                          {canManage && (
                            <td className="px-4 py-2.5">
                              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(tk.id)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TAB: REPORTS ====== */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.reports}</h2>
            {canEdit && (
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="size-4" />{t.newReport}</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t.newReport}</DialogTitle>
                    <DialogDescription>{t.reportTitle}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{t.reportDate}</Label>
                        <Input type="date" value={newReport.report_date} onChange={(e) => setNewReport({ ...newReport, report_date: e.target.value })} />
                      </div>
                      <div>
                        <Label>{t.tasks}</Label>
                        <Select value={newReport.task_id} onValueChange={(v) => setNewReport({ ...newReport, task_id: v })}>
                          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            {tasks.map((tk) => <SelectItem key={tk.id} value={tk.id}>{tk.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>{t.workDone} *</Label>
                      <Textarea value={newReport.work_done} onChange={(e) => setNewReport({ ...newReport, work_done: e.target.value })} rows={3} placeholder={t.workDonePlaceholder} />
                    </div>
                    <div>
                      <Label>{t.issues}</Label>
                      <Textarea value={newReport.issues} onChange={(e) => setNewReport({ ...newReport, issues: e.target.value })} rows={2} placeholder={t.issuesPlaceholder} />
                    </div>
                    <div>
                      <Label>{t.nextSteps}</Label>
                      <Textarea value={newReport.next_steps} onChange={(e) => setNewReport({ ...newReport, next_steps: e.target.value })} rows={2} placeholder={t.nextStepsPlaceholder} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{t.weather}</Label>
                        <Select value={newReport.weather} onValueChange={(v) => setNewReport({ ...newReport, weather: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="แดดออก">☀️ แดดออก</SelectItem>
                            <SelectItem value="มีเมฆมาก">☁️ มีเมฆมาก</SelectItem>
                            <SelectItem value="ฝนตก">🌧️ ฝนตก</SelectItem>
                            <SelectItem value="พายุ">⛈️ พายุ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t.siteLocation}</Label>
                        <Input value={newReport.location} onChange={(e) => setNewReport({ ...newReport, location: e.target.value })} />
                      </div>
                    </div>
                    {/* File upload */}
                    <div>
                      <Label>{t.attachedFiles}</Label>
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files);
                          setReportFiles((prev) => [...prev, ...files]);
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            setReportFiles((prev) => [...prev, ...files]);
                          }}
                        />
                        <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm">{t.dropFilesHere}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.supportedFiles}</p>
                      </div>
                      {reportFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {reportFiles.map((file, i) => (
                            <div key={i} className="relative size-16 rounded-lg border overflow-hidden group">
                              {file.type.startsWith("image/") ? (
                                <Image alt={file.name} fill className="object-cover" src={URL.createObjectURL(file)} unoptimized />
                              ) : (
                                <div className="size-full flex items-center justify-center bg-muted"><FileText className="size-5 text-muted-foreground" /></div>
                              )}
                              <button
                                onClick={() => setReportFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-0.5 right-0.5 size-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="size-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReportOpen(false)}>{t.cancel}</Button>
                    <Button onClick={handleCreateReport} disabled={!newReport.work_done}>{t.save}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {reports.length === 0 ? (
            <Card><CardContent className="py-12 text-center space-y-2">
              <FileText className="size-12 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t.noReportsDesc}</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const reporter = getProfile(report.reported_by);
                const imgs = attachments.filter((a) => a.report_id === report.id && a.is_image);
                return (
                  <Card key={report.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatDate(report.report_date, locale === "th" ? "th" : "en")}</span>
                          {reporter && <span className="text-xs text-muted-foreground">· {reporter.full_name}</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {report.location && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{report.location}</span>}
                          {report.weather && <span className="text-xs text-muted-foreground flex items-center gap-1"><Cloud className="size-3" />{report.weather}</span>}
                          {report.progress_delta != null && report.progress_delta > 0 && (
                            <Badge className="text-[10px]">+{report.progress_delta}%</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-line">{report.work_done}</p>
                      {report.issues && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2.5">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">⚠️ {t.issues}</p>
                          <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">{report.issues}</p>
                        </div>
                      )}
                      {report.next_steps && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">📋 {t.nextSteps}</p>
                          <p className="text-sm whitespace-pre-line">{report.next_steps}</p>
                        </div>
                      )}
                      {imgs.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {imgs.map((img) => (
                            <button key={img.id} onClick={() => setLightboxImg(img.file_url)} className="relative size-20 rounded-lg overflow-hidden border">
                              <Image src={img.file_url} alt={img.caption ?? img.file_name} fill className="object-cover" sizes="80px" />
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ====== TAB: FILES ====== */}
        <TabsContent value="files" className="space-y-4">
          <h2 className="text-lg font-semibold">{t.photos}</h2>
          {images.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">{t.noFiles}</CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => {
                const uploader = getProfile(img.uploaded_by);
                return (
                  <Card key={img.id} className="overflow-hidden group cursor-pointer" >
                    <div className="relative aspect-square" onClick={() => setLightboxImg(img.file_url)}>
                      <Image src={img.file_url} alt={img.caption ?? img.file_name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                    </div>
                    <CardContent className="p-2.5 space-y-0.5">
                      {img.caption && <p className="text-xs font-medium truncate">{img.caption}</p>}
                      <p className="text-[10px] text-muted-foreground truncate">
                        {uploader?.full_name ?? "—"} · {formatDate(img.created_at, locale === "th" ? "th" : "en")}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {docs.length > 0 && (
            <>
              <h3 className="text-sm font-semibold pt-2">{t.documents}</h3>
              <div className="space-y-2">
                {docs.map((doc) => {
                  const uploader = getProfile(doc.uploaded_by);
                  return (
                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                      <div className="size-9 rounded-lg bg-muted flex items-center justify-center"><FileText className="size-4 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">{uploader?.full_name ?? "—"} · {formatDate(doc.created_at, locale === "th" ? "th" : "en")}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ====== Lightbox ====== */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 no-print" onClick={() => setLightboxImg(null)}>
          <Button variant="secondary" size="icon" className="absolute top-4 right-4" onClick={() => setLightboxImg(null)}>
            <X className="size-4" />
          </Button>
          <div className="relative max-w-5xl max-h-full w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image src={lightboxImg} alt="" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Detail Row helper ======
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground w-24 shrink-0 text-xs">{label}</span>
      <span className="font-medium text-sm">{value ?? "—"}</span>
    </div>
  );
}
