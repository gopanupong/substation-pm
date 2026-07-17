-- =====================================================
-- Row Level Security (RLS) + Policies
-- =====================================================
-- สิทธิ์: admin = ทั้งหมด, manager = จัดการได้, editor = สร้าง/แก้ไขได้, viewer = อ่านอย่างเดียว
-- =====================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.subprojects enable row level security;
alter table public.tasks enable row level security;
alter table public.progress_reports enable row level security;
alter table public.attachments enable row level security;
alter table public.comments enable row level security;
alter table public.milestones enable row level security;
alter table public.activity_logs enable row level security;

-- ===== helper: เช็ค role ของ user ปัจจุบัน =====
create or replace function public.current_role()
returns user_role language sql security definer set search_path = public as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'viewer'::user_role
  );
$$;

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public as $$
  select public.current_role() in ('admin','manager','editor');
$$;

-- ===== PROFILES =====
-- ทุกคนที่ login อ่าน profile ได้
create policy "profiles_read" on public.profiles for select
  to authenticated using (true);
-- user แก้ไข profile ตัวเองได้
create policy "profiles_self_update" on public.profiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- เฉพาะ admin เปลี่ยน role / จัดการ user อื่น
create policy "profiles_admin_update" on public.profiles for update
  to authenticated using (public.current_role() = 'admin')
  with check (true);
create policy "profiles_admin_delete" on public.profiles for delete
  to authenticated using (public.current_role() = 'admin');

-- ===== PROJECTS =====
create policy "projects_read" on public.projects for select
  to authenticated using (true);
create policy "projects_staff_insert" on public.projects for insert
  to authenticated with check (public.is_staff());
create policy "projects_staff_update" on public.projects for update
  to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "projects_admin_delete" on public.projects for delete
  to authenticated using (public.current_role() in ('admin','manager'));

-- ===== SUBPROJECTS =====
create policy "sub_read" on public.subprojects for select to authenticated using (true);
create policy "sub_staff_write" on public.subprojects for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- ===== TASKS =====
create policy "tasks_read" on public.tasks for select to authenticated using (true);
create policy "tasks_staff_write" on public.tasks for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- ===== PROGRESS REPORTS =====
create policy "reports_read" on public.progress_reports for select to authenticated using (true);
create policy "reports_staff_write" on public.progress_reports for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- ===== ATTACHMENTS =====
create policy "att_read" on public.attachments for select to authenticated using (true);
create policy "att_staff_write" on public.attachments for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- ===== COMMENTS =====
create policy "comments_read" on public.comments for select to authenticated using (true);
-- staff และตัว user เองสามารถโพสต์ความคิดเห็นได้
create policy "comments_insert" on public.comments for insert
  to authenticated with check (auth.uid() is not null);
create policy "comments_update_own" on public.comments for update
  to authenticated using (user_id = auth.uid());
create policy "comments_delete_own_or_admin" on public.comments for delete
  to authenticated using (user_id = auth.uid() or public.current_role() in ('admin','manager'));

-- ===== MILESTONES =====
create policy "ms_read" on public.milestones for select to authenticated using (true);
create policy "ms_staff_write" on public.milestones for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- ===== ACTIVITY LOGS =====
create policy "log_read" on public.activity_logs for select to authenticated using (true);
create policy "log_insert" on public.activity_logs for insert
  to authenticated with check (true);
