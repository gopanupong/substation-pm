-- =====================================================
-- Schema หลัก: ระบบติดตามงานก่อสร้างสถานีไฟฟ้า (Substation PM)
-- =====================================================
-- รันใน Supabase Dashboard > SQL Editor
-- =====================================================

create extension if not exists "pgcrypto";

-- ===== Enums =====
do $$ begin
  create type user_role as enum ('admin', 'manager', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('planning', 'active', 'paused', 'completed', 'delayed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'review', 'done', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subproject_phase as enum ('civil', 'electrical', 'equipment', 'testing', 'commissioning', 'other');
exception when duplicate_object then null; end $$;

-- ===== profiles =====
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'viewer',
  phone text,
  position text,
  department text,
  region text,
  created_at timestamptz not null default now()
);

-- ===== projects =====
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  description text,
  location text,
  latitude double precision,
  longitude double precision,
  voltage_level text,
  capacity_mva numeric,
  owner text,
  contractor text,
  status project_status not null default 'planning',
  progress numeric not null default 0 check (progress between 0 and 100),
  start_date date,
  end_date date,
  budget numeric,
  cover_image text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===== subprojects =====
create table if not exists public.subprojects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  phase subproject_phase not null default 'other',
  description text,
  sort_order int not null default 0,
  progress numeric not null default 0 check (progress between 0 and 100),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subprojects_project on public.subprojects(project_id);

-- ===== tasks =====
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  subproject_id uuid references public.subprojects(id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  progress numeric not null default 0 check (progress between 0 and 100),
  assignee_id uuid references public.profiles(id) on delete set null,
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_subproject on public.tasks(subproject_id);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);
create index if not exists idx_tasks_status on public.tasks(status);

-- ===== progress_reports =====
create table if not exists public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  reported_by uuid references public.profiles(id) on delete set null,
  report_date date not null default current_date,
  work_done text not null,
  issues text,
  next_steps text,
  location text,
  weather text,
  progress_delta numeric,
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_project on public.progress_reports(project_id);
create index if not exists idx_reports_task on public.progress_reports(task_id);

-- ===== attachments =====
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.progress_reports(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_url text not null,
  file_path text not null,
  file_name text not null,
  file_type text,
  file_size bigint,
  is_image boolean not null default false,
  caption text,
  latitude double precision,
  longitude double precision,
  taken_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_attachments_report on public.attachments(report_id);
create index if not exists idx_attachments_project on public.attachments(project_id);

-- ===== comments =====
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_task on public.comments(task_id);

-- ===== milestones =====
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  due_date date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_milestones_project on public.milestones(project_id);

-- ===== activity_logs =====
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_logs_created on public.activity_logs(created_at desc);

-- ===== updated_at triggers =====
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_projects_touch on public.projects;
create trigger trg_projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_subprojects_touch on public.subprojects;
create trigger trg_subprojects_touch before update on public.subprojects
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_tasks_touch on public.tasks;
create trigger trg_tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ===== Auto-create profile on auth signup =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
