// =====================================================
// Database types — mirror ของ SQL schema ใน supabase/migrations
// =====================================================

export type Role = "admin" | "manager" | "editor" | "viewer";

export type ProjectStatus =
  | "planning"   // วางแผน
  | "active"     // กำลังก่อสร้าง
  | "paused"     // หยุดชั่วคราว
  | "completed"  // แล้วเสร็จ
  | "delayed";   // ล่าช้า

export type TaskStatus =
  | "todo"        // ยังไม่เริ่ม
  | "in_progress" // กำลังทำ
  | "review"      // รอตรวจสอบ
  | "done"        // เสร็จแล้ว
  | "blocked";    // ติดขัด

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type SubprojectPhase =
  | "civil"          // งานโยธา
  | "electrical"     // งานไฟฟ้า
  | "equipment"      // ติดตั้งอุปกรณ์
  | "testing"        // ทดสอบ/สอบเทียบ
  | "commissioning"  // ส่งมอบ/Commissioning
  | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  phone: string | null;
  position: string | null;
  department: string | null;
  region: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  voltage_level: string | null;   // เช่น 115kV, 230kV
  capacity_mva: number | null;
  owner: string | null;            // ผู้ว่าจ้าง
  contractor: string | null;       // ผู้รับเหมา
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  cover_image: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subproject {
  id: string;
  project_id: string;
  name: string;
  phase: SubprojectPhase;
  description: string | null;
  sort_order: number;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  subproject_id: string | null;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  assignee_id: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressReport {
  id: string;
  task_id: string | null;
  project_id: string;
  reported_by: string | null;
  report_date: string;
  work_done: string;        // งานที่ทำแล้ว
  issues: string | null;    // ปัญหา/อุปสรรค
  next_steps: string | null;// แผนงานถัดไป
  location: string | null;  // พื้นที่/หน่วยงาน
  weather: string | null;   // สภาพอากาศ
  progress_delta: number | null; // % ที่เพิ่มขึ้นจากรายงานนี้
  created_at: string;
}

export interface Attachment {
  id: string;
  report_id: string | null;
  project_id: string | null;
  task_id: string | null;
  uploaded_by: string | null;
  file_url: string;          // public URL ใน Supabase Storage
  file_path: string;         // path ใน bucket
  file_name: string;
  file_type: string;         // mime type
  file_size: number | null;
  is_image: boolean;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  due_date: string;
  completed_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// ====== ประเภทที่ใช้ใน UI (รวม relation) ======
export interface ProjectWithStats extends Project {
  task_count?: number;
  open_task_count?: number;
  report_count?: number;
}

export interface TaskWithRelations extends Task {
  assignee?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  subproject?: Pick<Subproject, "id" | "name" | "phase"> | null;
  reports?: ProgressReport[];
}

// ====== Supabase Database type (สำหรับ typed client) ======
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      subprojects: { Row: Subproject; Insert: Partial<Subproject>; Update: Partial<Subproject> };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> };
      progress_reports: { Row: ProgressReport; Insert: Partial<ProgressReport>; Update: Partial<ProgressReport> };
      attachments: { Row: Attachment; Insert: Partial<Attachment>; Update: Partial<Attachment> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
      milestones: { Row: Milestone; Insert: Partial<Milestone>; Update: Partial<Milestone> };
      activity_logs: { Row: ActivityLog; Insert: Partial<ActivityLog>; Update: Partial<ActivityLog> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: Role;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      subproject_phase: SubprojectPhase;
    };
  };
}
