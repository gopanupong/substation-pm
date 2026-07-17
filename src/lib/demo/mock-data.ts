// =====================================================
// Mock data สำหรับ Demo mode (เมื่อยังไม่ได้ตั้งค่า Supabase)
// ข้อมูลตัวอย่างเป็นสถานีไฟฟ้าย่อยจริง เพื่อให้เห็นภาพการใช้งาน
// =====================================================

import type {
  Profile, Project, Subproject, Task, ProgressReport,
  Attachment, Comment, Milestone, ActivityLog,
} from "@/types/database";

// ---- ผู้ใช้ตัวอย่าง ----
export const demoProfiles: Profile[] = [
  {
    id: "u-admin", email: "admin@egat.co.th", full_name: "คุณสมชาย บริหารดี",
    avatar_url: null, role: "admin", phone: "081-111-1111",
    position: "ผู้จัดการโครงการ", department: "ฝ่ายก่อสร้าง", region: "ภาคกลาง",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "u-manager", email: "manager@egat.co.th", full_name: "คุณวิภา จันทร์เพ็ญ",
    avatar_url: null, role: "manager", phone: "082-222-2222",
    position: "วิศวกรโยธา", department: "ฝ่ายวิศวกรรม", region: "ภาคกลาง",
    created_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "u-editor", email: "site@egat.co.th", full_name: "คุณประเสริฐ หน้างาน",
    avatar_url: null, role: "editor", phone: "083-333-3333",
    position: "หัวหน้าหน้างาน", department: "หน่วยงานก่อสร้าง", region: "ภาคเหนือ",
    created_at: "2025-01-03T00:00:00Z",
  },
  {
    id: "u-viewer", email: "inspect@egat.co.th", full_name: "คุณมานี ตรวจสอบ",
    avatar_url: null, role: "viewer", phone: "084-444-4444",
    position: "เจ้าหน้าที่ตรวจสอบ", department: "ฝ่ายควบคุมคุณภาพ", region: "ภาคใต้",
    created_at: "2025-01-04T00:00:00Z",
  },
];

// ---- โปรเจกต์ตัวอย่าง: สถานีไฟฟ้าย่อย ----
export const demoProjects: Project[] = [
  {
    id: "p-1", name: "สถานีไฟฟ้าย่อย บางบัวทอง 2", code: "BBL-230/115",
    description: "สถานีไฟฟ้าย่อย 230/115 kV เพื่อรองรับการขยายตัวของพื้นที่นิคมอุตสาหกรรมบางบัวทอง",
    location: "จ.นนทบุรี", latitude: 13.8133, longitude: 100.4025,
    voltage_level: "230/115 kV", capacity_mva: 500, owner: "การไฟฟ้าฝ่ายผลิต",
    contractor: "บริษัท ก่อสร้างไฟฟ้า จำกัด", status: "active", progress: 62,
    start_date: "2025-02-01", end_date: "2026-06-30", budget: 850000000,
    cover_image: null, created_by: "u-admin",
    created_at: "2025-02-01T00:00:00Z", updated_at: "2025-07-10T00:00:00Z",
  },
  {
    id: "p-2", name: "สถานีไฟฟ้าย่อย เชียงราย 3", code: "CEI-115",
    description: "สถานีไฟฟ้าย่อย 115 kV สำหรับเสริมความมั่นคงของระบบในภาคเหนือตอนบน",
    location: "จ.เชียงราย", latitude: 19.9105, longitude: 99.8406,
    voltage_level: "115 kV", capacity_mva: 200, owner: "การไฟฟ้าฝ่ายผลิต",
    contractor: "บริษัท วิศวกรรมไฟฟ้าเหนือ จำกัด", status: "active", progress: 38,
    start_date: "2025-03-15", end_date: "2026-09-30", budget: 420000000,
    cover_image: null, created_by: "u-admin",
    created_at: "2025-03-15T00:00:00Z", updated_at: "2025-07-08T00:00:00Z",
  },
  {
    id: "p-3", name: "สถานีไฟฟ้าย่อย หาดใหญ่ 4", code: "HDY-230",
    description: "สถานงานไฟฟ้าย่อย 230 kV รองรับพื้นที่นิคมอุตสาหกรรมภาคใต้",
    location: "จ.สงขลา", latitude: 7.0085, longitude: 100.4817,
    voltage_level: "230 kV", capacity_mva: 300, owner: "การไฟฟ้าฝ่ายผลิต",
    contractor: "บริษัท ก่อสร้างภาคใต้ จำกัด", status: "planning", progress: 12,
    start_date: "2025-06-01", end_date: "2027-03-31", budget: 680000000,
    cover_image: null, created_by: "u-admin",
    created_at: "2025-06-01T00:00:00Z", updated_at: "2025-07-01T00:00:00Z",
  },
  {
    id: "p-4", name: "สถานีไฟฟ้าย่อย ระยอง 5", code: "RYG-500/230",
    description: "สถานงานไฟฟ้าย่อย 500/230 kV รองรับ EEC พื้นที่นิคมอุตสาหกรรมตะวันออก",
    location: "จ.ระยอง", latitude: 12.6806, longitude: 101.2567,
    voltage_level: "500/230 kV", capacity_mva: 1500, owner: "การไฟฟ้าฝ่ายผลิต",
    contractor: "บริษัท พลังงานตะวันออก จำกัด", status: "delayed", progress: 45,
    start_date: "2024-11-01", end_date: "2026-04-30", budget: 1200000000,
    cover_image: null, created_by: "u-admin",
    created_at: "2024-11-01T00:00:00Z", updated_at: "2025-07-12T00:00:00Z",
  },
];

// ---- งานย่อย/ระบบ ----
export const demoSubprojects: Subproject[] = [
  // Project 1
  { id: "s-1", project_id: "p-1", name: "งานเตรียมพื้นที่และฐานราก", phase: "civil", description: "การเตรียมพื้นที่ ขุดดิน และฐานรากคอนกรีต", sort_order: 1, progress: 100, start_date: "2025-02-01", end_date: "2025-04-30", created_at: "2025-02-01T00:00:00Z", updated_at: "2025-05-01T00:00:00Z" },
  { id: "s-2", project_id: "p-1", name: "งานอาคารควบคุม", phase: "civil", description: "สร้างอาคารควบคุม (Control Building)", sort_order: 2, progress: 85, start_date: "2025-03-15", end_date: "2025-07-31", created_at: "2025-03-15T00:00:00Z", updated_at: "2025-07-10T00:00:00Z" },
  { id: "s-3", project_id: "p-1", name: "งานติดตั้งหม้อแปลง", phase: "equipment", description: "ติดตั้งหม้อแปลงไฟฟ้า 230/115 kV", sort_order: 3, progress: 40, start_date: "2025-06-01", end_date: "2025-09-30", created_at: "2025-06-01T00:00:00Z", updated_at: "2025-07-09T00:00:00Z" },
  { id: "s-4", project_id: "p-1", name: "งานระบบเคเบิลและบัสบาร์", phase: "electrical", description: "ติดตั้งระบบบัสบาร์และสายเคเบิล", sort_order: 4, progress: 25, start_date: "2025-07-01", end_date: "2025-11-30", created_at: "2025-07-01T00:00:00Z", updated_at: "2025-07-11T00:00:00Z" },
  { id: "s-5", project_id: "p-1", name: "งานระบบป้องกันและ SCADA", phase: "electrical", description: "ติดตั้งระบบป้องกันรีเลย์และ SCADA", sort_order: 5, progress: 10, start_date: "2025-08-01", end_date: "2025-12-31", created_at: "2025-08-01T00:00:00Z", updated_at: "2025-07-05T00:00:00Z" },
  { id: "s-6", project_id: "p-1", name: "งานทดสอบและ Commissioning", phase: "commissioning", description: "ทดสอบการทำงาน FAT/SAT และส่งมอบ", sort_order: 6, progress: 0, start_date: "2026-01-01", end_date: "2026-06-30", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  // Project 2
  { id: "s-7", project_id: "p-2", name: "งานฐานรากและโครงสร้าง", phase: "civil", description: "ฐานรากและโครงสร้างสถานี", sort_order: 1, progress: 70, start_date: "2025-03-15", end_date: "2025-08-31", created_at: "2025-03-15T00:00:00Z", updated_at: "2025-07-08T00:00:00Z" },
  { id: "s-8", project_id: "p-2", name: "งานติดตั้งอุปกรณ์", phase: "equipment", description: "ติดตั้งเบรกเกอร์และ DS", sort_order: 2, progress: 20, start_date: "2025-07-01", end_date: "2025-11-30", created_at: "2025-07-01T00:00:00Z", updated_at: "2025-07-09T00:00:00Z" },
  { id: "s-9", project_id: "p-2", name: "งานทดสอบระบบ", phase: "testing", description: "ทดสอบการทำงาน", sort_order: 3, progress: 0, start_date: "2025-12-01", end_date: "2026-09-30", created_at: "2025-12-01T00:00:00Z", updated_at: "2025-12-01T00:00:00Z" },
  // Project 3
  { id: "s-10", project_id: "p-3", name: "งานสำรวจและออกแบบ", phase: "other", description: "สำรวจพื้นที่และออกแบบระบบ", sort_order: 1, progress: 35, start_date: "2025-06-01", end_date: "2025-10-31", created_at: "2025-06-01T00:00:00Z", updated_at: "2025-07-01T00:00:00Z" },
  // Project 4
  { id: "s-11", project_id: "p-4", name: "งานโยธาและฐานราก", phase: "civil", description: "งานโยธา 500 kV", sort_order: 1, progress: 90, start_date: "2024-11-01", end_date: "2025-05-31", created_at: "2024-11-01T00:00:00Z", updated_at: "2025-05-15T00:00:00Z" },
  { id: "s-12", project_id: "p-4", name: "งานหม้อแปลง 500 kV", phase: "equipment", description: "ติดตั้งหม้อแปลง 500 MVA", sort_order: 2, progress: 30, start_date: "2025-04-01", end_date: "2025-10-31", created_at: "2025-04-01T00:00:00Z", updated_at: "2025-07-12T00:00:00Z" },
];

// ---- Tasks ----
export const demoTasks: Task[] = [
  { id: "t-1", project_id: "p-1", subproject_id: "s-1", title: "สำรวจพื้นที่และทำแผนผัง", description: "สำรวจและทำสำรวจ topography", status: "done", priority: "high", progress: 100, assignee_id: "u-manager", start_date: "2025-02-01", due_date: "2025-02-15", completed_at: "2025-02-14T00:00:00Z", created_by: "u-admin", created_at: "2025-02-01T00:00:00Z", updated_at: "2025-02-14T00:00:00Z" },
  { id: "t-2", project_id: "p-1", subproject_id: "s-1", title: "ขุดดินและเทคอนกรีตฐานราก", description: "งานขุดดินและฐานราก", status: "done", priority: "high", progress: 100, assignee_id: "u-editor", start_date: "2025-02-16", due_date: "2025-04-30", completed_at: "2025-04-28T00:00:00Z", created_by: "u-admin", created_at: "2025-02-16T00:00:00Z", updated_at: "2025-04-28T00:00:00Z" },
  { id: "t-3", project_id: "p-1", subproject_id: "s-2", title: "ก่อสร้างโครงสร้างอาคารควบคุม", description: "โครงสร้างและหลังคา", status: "in_progress", priority: "high", progress: 85, assignee_id: "u-manager", start_date: "2025-03-15", due_date: "2025-07-31", completed_at: null, created_by: "u-admin", created_at: "2025-03-15T00:00:00Z", updated_at: "2025-07-10T00:00:00Z" },
  { id: "t-4", project_id: "p-1", subproject_id: "s-2", title: "ติดตั้งระบบปรับอากาศและไฟฟ้าใช้งาน", description: "AC, lighting, พัดลมระบายอากาศ", status: "in_progress", priority: "medium", progress: 60, assignee_id: "u-editor", start_date: "2025-06-01", due_date: "2025-07-31", completed_at: null, created_by: "u-manager", created_at: "2025-06-01T00:00:00Z", updated_at: "2025-07-09T00:00:00Z" },
  { id: "t-5", project_id: "p-1", subproject_id: "s-3", title: "ขนส่งและยกติดตั้งหม้อแปลง T1", description: "หม้อแปลง 230/115 kV 300 MVA", status: "in_progress", priority: "critical", progress: 40, assignee_id: "u-editor", start_date: "2025-06-15", due_date: "2025-08-15", completed_at: null, created_by: "u-manager", created_at: "2025-06-15T00:00:00Z", updated_at: "2025-07-11T00:00:00Z" },
  { id: "t-6", project_id: "p-1", subproject_id: "s-3", title: "ติดตั้งหม้อแปลง T2", description: "หม้อแปลงเครื่องที่ 2", status: "todo", priority: "high", progress: 0, assignee_id: null, start_date: "2025-08-16", due_date: "2025-09-30", completed_at: null, created_by: "u-manager", created_at: "2025-07-01T00:00:00Z", updated_at: "2025-07-01T00:00:00Z" },
  { id: "t-7", project_id: "p-1", subproject_id: "s-4", title: "ติดตั้งบัสบาร์หลัก 230kV", description: "Main bus 230kV", status: "in_progress", priority: "high", progress: 25, assignee_id: "u-editor", start_date: "2025-07-01", due_date: "2025-09-30", completed_at: null, created_by: "u-manager", created_at: "2025-07-01T00:00:00Z", updated_at: "2025-07-10T00:00:00Z" },
  { id: "t-8", project_id: "p-1", subproject_id: "s-5", title: "ติดตั้งระบบ SCADA", description: "ระบบควบคุมและเฝ้าระวัง", status: "todo", priority: "medium", progress: 10, assignee_id: "u-manager", start_date: "2025-08-15", due_date: "2025-11-30", completed_at: null, created_by: "u-admin", created_at: "2025-08-01T00:00:00Z", updated_at: "2025-08-01T00:00:00Z" },
  { id: "t-9", project_id: "p-1", subproject_id: "s-6", title: "ทดสอบ FAT หม้อแปลง", description: "Factory Acceptance Test", status: "blocked", priority: "critical", progress: 0, assignee_id: null, start_date: "2026-01-15", due_date: "2026-02-28", completed_at: null, created_by: "u-admin", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "t-10", project_id: "p-2", subproject_id: "s-7", title: "เทคอนกรีตฐานราก", description: "ฐานรากอาคารควบคุม", status: "in_progress", priority: "high", progress: 70, assignee_id: "u-editor", start_date: "2025-04-01", due_date: "2025-08-31", completed_at: null, created_by: "u-manager", created_at: "2025-04-01T00:00:00Z", updated_at: "2025-07-08T00:00:00Z" },
  { id: "t-11", project_id: "p-2", subproject_id: "s-8", title: "ติดตั้ง Circuit Breaker", description: "GIS breaker 115kV", status: "in_progress", priority: "high", progress: 20, assignee_id: "u-editor", start_date: "2025-07-01", due_date: "2025-10-31", completed_at: null, created_by: "u-manager", created_at: "2025-07-01T00:00:00Z", updated_at: "2025-07-09T00:00:00Z" },
  { id: "t-12", project_id: "p-4", subproject_id: "s-12", title: "ยกติดตั้งหม้อแปลง 500 MVA", description: "หม้อแปลง 3 ชุด", status: "in_progress", priority: "critical", progress: 30, assignee_id: "u-editor", start_date: "2025-04-15", due_date: "2025-09-30", completed_at: null, created_by: "u-admin", created_at: "2025-04-15T00:00:00Z", updated_at: "2025-07-12T00:00:00Z" },
];

// ---- Progress reports ----
export const demoReports: ProgressReport[] = [
  { id: "r-1", project_id: "p-1", task_id: "t-3", reported_by: "u-manager", report_date: "2025-07-10", work_done: "ก่อสร้างผนังอาคารควบคุมครบทุกด้าน เหลืองานฝ้าเพดานและงานสี", issues: "ฝนตกหนักทำให้งานหน้างานหยุด 2 วัน", next_steps: "เริ่มงานฝ้าและระบบ AC", location: "อาคารควบคุม", weather: "มีพายุฝน", progress_delta: 15, created_at: "2025-07-10T16:00:00Z" },
  { id: "r-2", project_id: "p-1", task_id: "t-5", reported_by: "u-editor", report_date: "2025-07-11", work_done: "ยกติดตั้งหม้อแปลง T1 บนฐานรองเรียบร้อย กำลังเชื่อมต่อบัสดuct", issues: "รออะไหล่ bushing 2 ตัว", next_steps: "ต่อบัสดuctและทดสอบค่าความต้านทาน", location: "พื้นที่หม้อแปลง T1", weather: "แดดออก", progress_delta: 20, created_at: "2025-07-11T17:30:00Z" },
  { id: "r-3", project_id: "p-2", task_id: "t-10", reported_by: "u-editor", report_date: "2025-07-08", work_done: "เทคอนกรีตฐานรากด้านที่ 2 เสร็จ 70%", issues: "ปูนส่งช้ากว่ากำหนด", next_steps: "เทคอนกรีตส่วนที่เหลือภายในสัปดาห์นี้", location: "พื้นที่ฐานราก", weather: "มีเมฆมาก", progress_delta: 10, created_at: "2025-07-08T15:00:00Z" },
  { id: "r-4", project_id: "p-4", task_id: "t-12", reported_by: "u-editor", report_date: "2025-07-12", work_done: "ติดตั้งหม้อแปลง 500 MVA เครื่องที่ 1 เสร็จ", issues: "ล่าช้าเนื่องจากขนส่งผ่านถนนคับแคบ", next_steps: "ติดตั้งเครื่องที่ 2", location: "พื้นที่หม้อแปลง 500kV", weather: "แดดจัด", progress_delta: 10, created_at: "2025-07-12T18:00:00Z" },
];

// ---- Attachments (placeholder images) ----
export const demoAttachments: Attachment[] = [
  { id: "a-1", report_id: "r-1", project_id: "p-1", task_id: "t-3", uploaded_by: "u-manager", file_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800", file_path: "demo/control-building-1.jpg", file_name: "control-building-progress.jpg", file_type: "image/jpeg", file_size: 245000, is_image: true, caption: "ผนังอาคารควบคุมก่อสร้างเสร็จ", latitude: 13.8133, longitude: 100.4025, taken_at: "2025-07-10T15:00:00Z", created_at: "2025-07-10T16:00:00Z" },
  { id: "a-2", report_id: "r-1", project_id: "p-1", task_id: "t-3", uploaded_by: "u-manager", file_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800", file_path: "demo/site-overview.jpg", file_name: "site-overview.jpg", file_type: "image/jpeg", file_size: 310000, is_image: true, caption: "ภาพรวมหน้างาน", latitude: 13.8133, longitude: 100.4025, taken_at: "2025-07-10T15:10:00Z", created_at: "2025-07-10T16:00:00Z" },
  { id: "a-3", report_id: "r-2", project_id: "p-1", task_id: "t-5", uploaded_by: "u-editor", file_url: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800", file_path: "demo/transformer.jpg", file_name: "transformer-T1-install.jpg", file_type: "image/jpeg", file_size: 425000, is_image: true, caption: "ยกติดตั้งหม้อแปลง T1", latitude: 13.8133, longitude: 100.4025, taken_at: "2025-07-11T16:00:00Z", created_at: "2025-07-11T17:30:00Z" },
  { id: "a-4", report_id: "r-3", project_id: "p-2", task_id: "t-10", uploaded_by: "u-editor", file_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800", file_path: "demo/foundation.jpg", file_name: "foundation-concrete.jpg", file_type: "image/jpeg", file_size: 290000, is_image: true, caption: "เทคอนกรีตฐานราก", latitude: 19.9105, longitude: 99.8406, taken_at: "2025-07-08T14:00:00Z", created_at: "2025-07-08T15:00:00Z" },
];

// ---- Comments ----
export const demoComments: Comment[] = [
  { id: "c-1", task_id: "t-5", user_id: "u-admin", content: "รบกวนเร่งจัดหา bushing ด่วน เพราะกระทบ timeline", created_at: "2025-07-11T18:00:00Z" },
  { id: "c-2", task_id: "t-5", user_id: "u-editor", content: "ได้ครับ สั่งซื้อแล้วคาดว่าจะมาถึงภายใน 7 วัน", created_at: "2025-07-12T09:00:00Z" },
  { id: "c-3", task_id: "t-9", user_id: "u-manager", content: "ต้องประสานโรงงานเพื่อจองคิว FAT ล่วงหน้า", created_at: "2025-07-01T10:00:00Z" },
];

// ---- Milestones ----
export const demoMilestones: Milestone[] = [
  { id: "m-1", project_id: "p-1", name: "ส่งมอบงานโยธา", description: "Handover งานโยธา", due_date: "2025-05-31", completed_at: "2025-05-28T00:00:00Z", created_at: "2025-02-01T00:00:00Z" },
  { id: "m-2", project_id: "p-1", name: "Energization หม้อแปลง T1", description: "จ่ายไฟเข้าระบบ T1", due_date: "2025-12-15", completed_at: null, created_at: "2025-02-01T00:00:00Z" },
  { id: "m-3", project_id: "p-1", name: "ส่งมอบโครงการ", description: "Final handover", due_date: "2026-06-30", completed_at: null, created_at: "2025-02-01T00:00:00Z" },
  { id: "m-4", project_id: "p-2", name: "Energization สถานี", description: "จ่ายไฟเข้าระบบ", due_date: "2026-08-31", completed_at: null, created_at: "2025-03-15T00:00:00Z" },
];

// ---- Activity logs ----
export const demoActivityLogs: ActivityLog[] = [
  { id: "l-1", user_id: "u-manager", action: "สร้างรายงานผล", entity_type: "progress_report", entity_id: "r-1", details: { task: "ก่อสร้างผนังอาคารควบคุม" }, created_at: "2025-07-10T16:00:00Z" },
  { id: "l-2", user_id: "u-editor", action: "อัปโหลดรูปภาพ", entity_type: "attachment", entity_id: "a-3", details: { file: "transformer-T1-install.jpg" }, created_at: "2025-07-11T17:30:00Z" },
  { id: "l-3", user_id: "u-admin", action: "เปลี่ยนสถานะงาน", entity_type: "task", entity_id: "t-2", details: { from: "in_progress", to: "done" }, created_at: "2025-04-28T10:00:00Z" },
  { id: "l-4", user_id: "u-editor", action: "สร้างรายงานผล", entity_type: "progress_report", entity_id: "r-4", details: { task: "ยกติดตั้งหม้อแปลง 500 MVA" }, created_at: "2025-07-12T18:00:00Z" },
];
