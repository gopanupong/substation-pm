// =====================================================
// Data Access Layer
// ทำหน้าที่เป็น facade ระหว่าง Supabase จริง และ Demo (mock) data
// ทุกฟังก์ชัน async คืนค่าเหมือนกัน
// =====================================================

"use client";

import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/config";
import { uid } from "@/lib/utils";
import {
  demoProfiles, demoProjects, demoSubprojects, demoTasks,
  demoReports, demoAttachments, demoComments, demoMilestones, demoActivityLogs,
} from "@/lib/demo/mock-data";
import type {
  Profile, Project, Subproject, Task, ProgressReport,
  Attachment, Comment, Milestone, ActivityLog,
  ProjectStatus, TaskStatus, TaskPriority, SubprojectPhase, Role,
} from "@/types/database";

// ===== mutable in-memory store สำหรับ demo =====
const store = {
  profiles: [...demoProfiles],
  projects: [...demoProjects],
  subprojects: [...demoSubprojects],
  tasks: [...demoTasks],
  reports: [...demoReports],
  attachments: [...demoAttachments],
  comments: [...demoComments],
  milestones: [...demoMilestones],
  logs: [...demoActivityLogs],
};

// ============ PROJECTS ============
export async function fetchProjects(): Promise<Project[]> {
  if (isDemoMode) return [...store.projects];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function fetchProject(id: string): Promise<Project | null> {
  if (isDemoMode) return store.projects.find((p) => p.id === id) ?? null;
  const supabase = createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Project;
}

export type ProjectInput = Partial<Omit<Project, "id" | "created_at" | "updated_at">>;

export async function createProject(input: ProjectInput, userId?: string): Promise<Project> {
  if (isDemoMode) {
    const now = new Date().toISOString();
    const project: Project = {
      id: uid("p"), name: input.name ?? "Untitled", code: input.code ?? null,
      description: input.description ?? null, location: input.location ?? null,
      latitude: input.latitude ?? null, longitude: input.longitude ?? null,
      voltage_level: input.voltage_level ?? null, capacity_mva: input.capacity_mva ?? null,
      owner: input.owner ?? null, contractor: input.contractor ?? null,
      status: input.status ?? "planning", progress: input.progress ?? 0,
      start_date: input.start_date ?? null, end_date: input.end_date ?? null,
      budget: input.budget ?? null, cover_image: input.cover_image ?? null,
      created_by: userId ?? null, created_at: now, updated_at: now,
    };
    store.projects.unshift(project);
    return project;
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects").insert({ ...input, created_by: userId }).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  if (isDemoMode) {
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("not found");
    store.projects[idx] = { ...store.projects[idx], ...input, updated_at: new Date().toISOString() };
    return store.projects[idx];
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("projects").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  if (isDemoMode) {
    store.projects = store.projects.filter((p) => p.id !== id);
    store.subprojects = store.subprojects.filter((s) => s.project_id !== id);
    store.tasks = store.tasks.filter((t) => t.project_id !== id);
    store.reports = store.reports.filter((r) => r.project_id !== id);
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ============ SUBPROJECTS ============
export async function fetchSubprojects(projectId: string): Promise<Subproject[]> {
  if (isDemoMode) return store.subprojects.filter((s) => s.project_id === projectId).sort((a, b) => a.sort_order - b.sort_order);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subprojects").select("*").eq("project_id", projectId).order("sort_order");
  if (error) throw error;
  return data as Subproject[];
}

export type SubprojectInput = Partial<Omit<Subproject, "id" | "created_at" | "updated_at"> & { phase: SubprojectPhase }>;

export async function createSubproject(projectId: string, input: SubprojectInput): Promise<Subproject> {
  if (isDemoMode) {
    const now = new Date().toISOString();
    const sp: Subproject = {
      id: uid("s"), project_id: projectId, name: input.name ?? "Untitled",
      phase: input.phase ?? "other", description: input.description ?? null,
      sort_order: input.sort_order ?? store.subprojects.filter((s) => s.project_id === projectId).length + 1,
      progress: input.progress ?? 0, start_date: input.start_date ?? null, end_date: input.end_date ?? null,
      created_at: now, updated_at: now,
    };
    store.subprojects.push(sp);
    return sp;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("subprojects").insert({ ...input, project_id: projectId }).select().single();
  if (error) throw error;
  return data as Subproject;
}

export async function updateSubproject(id: string, input: Partial<Subproject>): Promise<Subproject> {
  if (isDemoMode) {
    const idx = store.subprojects.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("not found");
    store.subprojects[idx] = { ...store.subprojects[idx], ...input, updated_at: new Date().toISOString() };
    return store.subprojects[idx];
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("subprojects").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Subproject;
}

export async function deleteSubproject(id: string): Promise<void> {
  if (isDemoMode) {
    store.subprojects = store.subprojects.filter((s) => s.id !== id);
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.from("subprojects").delete().eq("id", id);
  if (error) throw error;
}

// ============ TASKS ============
export async function fetchTasks(projectId?: string): Promise<Task[]> {
  if (isDemoMode) {
    return projectId
      ? store.tasks.filter((t) => t.project_id === projectId)
      : [...store.tasks];
  }
  const supabase = createClient();
  let query = supabase.from("tasks").select("*");
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as Task[];
}

export type TaskInput = Partial<Omit<Task, "id" | "created_at" | "updated_at">>;

export async function createTask(projectId: string, input: TaskInput, userId?: string): Promise<Task> {
  if (isDemoMode) {
    const now = new Date().toISOString();
    const task: Task = {
      id: uid("t"), project_id: projectId, subproject_id: input.subproject_id ?? null,
      title: input.title ?? "Untitled", description: input.description ?? null,
      status: input.status ?? "todo", priority: input.priority ?? "medium",
      progress: input.progress ?? 0, assignee_id: input.assignee_id ?? null,
      start_date: input.start_date ?? null, due_date: input.due_date ?? null,
      completed_at: input.completed_at ?? null, created_by: userId ?? null,
      created_at: now, updated_at: now,
    };
    store.tasks.unshift(task);
    return task;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("tasks").insert({ ...input, project_id: projectId, created_by: userId }).select().single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  if (isDemoMode) {
    const idx = store.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("not found");
    store.tasks[idx] = { ...store.tasks[idx], ...input, updated_at: new Date().toISOString() };
    if (input.status === "done" && !store.tasks[idx].completed_at) {
      store.tasks[idx].completed_at = new Date().toISOString();
      store.tasks[idx].progress = 100;
    }
    return store.tasks[idx];
  }
  const supabase = createClient();
  const payload: TaskInput = { ...input };
  if (input.status === "done") {
    payload.completed_at = new Date().toISOString();
    payload.progress = 100;
  }
  const { data, error } = await supabase.from("tasks").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  if (isDemoMode) {
    store.tasks = store.tasks.filter((t) => t.id !== id);
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ============ PROGRESS REPORTS ============
export async function fetchReports(projectId?: string): Promise<ProgressReport[]> {
  if (isDemoMode) {
    return projectId
      ? store.reports.filter((r) => r.project_id === projectId)
      : [...store.reports];
  }
  const supabase = createClient();
  let query = supabase.from("progress_reports").select("*");
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query.order("report_date", { ascending: false });
  if (error) throw error;
  return data as ProgressReport[];
}

export type ReportInput = Partial<Omit<ProgressReport, "id" | "created_at">>;

export async function createReport(projectId: string, input: ReportInput, userId?: string): Promise<ProgressReport> {
  if (isDemoMode) {
    const report: ProgressReport = {
      id: uid("r"), project_id: projectId, task_id: input.task_id ?? null,
      reported_by: userId ?? null, report_date: input.report_date ?? new Date().toISOString().slice(0, 10),
      work_done: input.work_done ?? "", issues: input.issues ?? null, next_steps: input.next_steps ?? null,
      location: input.location ?? null, weather: input.weather ?? null, progress_delta: input.progress_delta ?? null,
      created_at: new Date().toISOString(),
    };
    store.reports.unshift(report);
    return report;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("progress_reports").insert({ ...input, project_id: projectId, reported_by: userId }).select().single();
  if (error) throw error;
  return data as ProgressReport;
}

export async function deleteReport(id: string): Promise<void> {
  if (isDemoMode) {
    store.reports = store.reports.filter((r) => r.id !== id);
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.from("progress_reports").delete().eq("id", id);
  if (error) throw error;
}

// ============ ATTACHMENTS ============
export async function fetchAttachments(projectId?: string, reportId?: string): Promise<Attachment[]> {
  if (isDemoMode) {
    let items = [...store.attachments];
    if (projectId) items = items.filter((a) => a.project_id === projectId);
    if (reportId) items = items.filter((a) => a.report_id === reportId);
    return items;
  }
  const supabase = createClient();
  let query = supabase.from("attachments").select("*");
  if (reportId) query = query.eq("report_id", reportId);
  else if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as Attachment[];
}

/** อัปโหลดไฟล์ไป Supabase Storage (หรือเก็บ dataURL ใน demo) */
export async function uploadAttachment(
  file: File,
  opts: { projectId: string; reportId?: string; bucket: "report-images" | "project-files"; uploadedBy?: string },
  toDataUrl: (f: File) => Promise<string>
): Promise<Attachment> {
  const isImage = file.type.startsWith("image/");

  if (isDemoMode) {
    const dataUrl = await toDataUrl(file);
    const att: Attachment = {
      id: uid("a"), report_id: opts.reportId ?? null, project_id: opts.projectId,
      task_id: null, uploaded_by: opts.uploadedBy ?? null, file_url: dataUrl,
      file_path: `demo/${file.name}`, file_name: file.name, file_type: file.type,
      file_size: file.size, is_image: isImage, caption: null,
      latitude: null, longitude: null, taken_at: null, created_at: new Date().toISOString(),
    };
    store.attachments.unshift(att);
    return att;
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${opts.projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: upErr } = await supabase.storage.from(opts.bucket).upload(path, file, { upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from(opts.bucket).getPublicUrl(path);
  const { data, error } = await supabase.from("attachments").insert({
    report_id: opts.reportId ?? null, project_id: opts.projectId, uploaded_by: opts.uploadedBy,
    file_url: pub.publicUrl, file_path: path, file_name: file.name, file_type: file.type,
    file_size: file.size, is_image: isImage,
  }).select().single();
  if (error) throw error;
  return data as Attachment;
}

export async function deleteAttachment(id: string): Promise<void> {
  if (isDemoMode) {
    store.attachments = store.attachments.filter((a) => a.id !== id);
    return;
  }
  const supabase = createClient();
  // ดึง path ก่อนลบเพื่อลบใน storage ด้วย
  const { data: att } = await supabase.from("attachments").select("file_path").eq("id", id).single();
  if (att?.file_path) {
    await supabase.storage.from("report-images").remove([att.file_path]).catch(() => {});
    await supabase.storage.from("project-files").remove([att.file_path]).catch(() => {});
  }
  const { error } = await supabase.from("attachments").delete().eq("id", id);
  if (error) throw error;
}

// ============ COMMENTS ============
export async function fetchComments(taskId: string): Promise<Comment[]> {
  if (isDemoMode) return store.comments.filter((c) => c.task_id === taskId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const supabase = createClient();
  const { data, error } = await supabase.from("comments").select("*").eq("task_id", taskId).order("created_at");
  if (error) throw error;
  return data as Comment[];
}

export async function createComment(taskId: string, content: string, userId?: string): Promise<Comment> {
  if (isDemoMode) {
    const c: Comment = {
      id: uid("c"), task_id: taskId, user_id: userId ?? null,
      content, created_at: new Date().toISOString(),
    };
    store.comments.push(c);
    return c;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("comments").insert({ task_id: taskId, user_id: userId, content }).select().single();
  if (error) throw error;
  return data as Comment;
}

// ============ MILESTONES ============
export async function fetchMilestones(projectId: string): Promise<Milestone[]> {
  if (isDemoMode) return store.milestones.filter((m) => m.project_id === projectId).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const supabase = createClient();
  const { data, error } = await supabase.from("milestones").select("*").eq("project_id", projectId).order("due_date");
  if (error) throw error;
  return data as Milestone[];
}

export async function createMilestone(projectId: string, name: string, dueDate: string, description?: string): Promise<Milestone> {
  if (isDemoMode) {
    const m: Milestone = {
      id: uid("m"), project_id: projectId, name, description: description ?? null,
      due_date: dueDate, completed_at: null, created_at: new Date().toISOString(),
    };
    store.milestones.push(m);
    return m;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("milestones").insert({ project_id: projectId, name, description, due_date: dueDate }).select().single();
  if (error) throw error;
  return data as Milestone;
}

// ============ ACTIVITY LOGS ============
export async function fetchActivityLogs(limit = 10): Promise<ActivityLog[]> {
  if (isDemoMode) return [...store.logs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  const supabase = createClient();
  const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data as ActivityLog[];
}

// ============ PROFILES / USERS ============
export async function fetchProfiles(): Promise<Profile[]> {
  if (isDemoMode) return [...store.profiles];
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfileRole(id: string, role: Role): Promise<Profile> {
  if (isDemoMode) {
    const idx = store.profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("not found");
    store.profiles[idx] = { ...store.profiles[idx], role };
    return store.profiles[idx];
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", id).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, input: Partial<Profile>): Promise<Profile> {
  if (isDemoMode) {
    const idx = store.profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("not found");
    store.profiles[idx] = { ...store.profiles[idx], ...input };
    return store.profiles[idx];
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Profile;
}

// ============ DASHBOARD STATS ============
export interface DashboardError {
  /** ชื่อ query ที่ fail (projects / tasks / reports / logs) */
  key: "projects" | "tasks" | "reports" | "logs";
  /** error message ดิบจาก Supabase เพื่อให้วินิจฉัยได้ */
  message: string;
}

export interface DashboardStats {
  projects: Project[];
  tasks: Task[];
  reports: ProgressReport[];
  logs: ActivityLog[];
  activeProjects: number;
  openTasks: number;
  delayed: number;
  avgProgress: number;
  statusCount: Record<string, number>;
  /** query ที่ fail (ถ้ามี) — ว่าง = โหลดสำเร็จทุกตัว */
  errors: DashboardError[];
}

/**
 * โหลดข้อมูล dashboard แบบทนทาน: ใช้ Promise.allSettled
 * ถ้า query บางตัว fail (เช่นตารางยังไม่ถูกสร้าง) ส่วนที่สำเร็จยังคืนมาแสดงได้
 * ฟังก์ชันนี้จะไม่ throw (เว้นแต่เกิด error นอกเหนือจาก query) ผู้เรียกตรวจ `errors` แทน
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const entries = [
    { key: "projects" as const, fn: () => fetchProjects() },
    { key: "tasks" as const, fn: () => fetchTasks() },
    { key: "reports" as const, fn: () => fetchReports() },
    { key: "logs" as const, fn: () => fetchActivityLogs(6) },
  ];

  const settled = await Promise.allSettled(entries.map((e) => e.fn()));

  const projects: Project[] = [];
  const tasks: Task[] = [];
  const reports: ProgressReport[] = [];
  const logs: ActivityLog[] = [];
  const errors: DashboardError[] = [];

  settled.forEach((result, i) => {
    const { key } = entries[i];
    if (result.status === "fulfilled") {
      const value = result.value as typeof projects | typeof tasks | typeof reports | typeof logs;
      if (key === "projects") (projects as typeof value).push(...(value as Project[]));
      else if (key === "tasks") (tasks as typeof value).push(...(value as Task[]));
      else if (key === "reports") (reports as typeof value).push(...(value as ProgressReport[]));
      else (logs as typeof value).push(...(value as ActivityLog[]));
    } else {
      // ดึง message ที่อ่านง่าย: Supabase error จะมี .message, Error ทั่วไปใช้ .message
      const raw = result.reason;
      const message =
        (raw && typeof raw === "object" && "message" in raw && String((raw as { message: unknown }).message)) ||
        (typeof raw === "string" && raw) ||
        "Unknown error";
      errors.push({ key, message });
    }
  });

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const delayed = projects.filter((p) => p.status === "delayed").length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0;

  // นับงานตามสถานะ
  const statusCount: Record<string, number> = {};
  tasks.forEach((t) => { statusCount[t.status] = (statusCount[t.status] ?? 0) + 1; });

  return {
    projects, tasks, reports, logs,
    activeProjects, openTasks, delayed, avgProgress, statusCount,
    errors,
  };
}
