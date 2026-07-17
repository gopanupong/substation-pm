-- =====================================================
-- Storage Buckets + Policies
-- =====================================================
-- bucket เก็บรูปรายงานผลและไฟล์หลักฐานต่างๆ
-- =====================================================

-- สร้าง buckets (public สำหรับอ่านรูปได้สะดวก)
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

-- ===== Policies: report-images =====
-- ทุกคนที่ login อ่านได้
create policy "img_read" on storage.objects for select
  to authenticated using (bucket_id in ('report-images','project-files'));

-- เฉพาะ staff อัปโหลด/แก้ไข/ลบ ได้
create policy "img_staff_write" on storage.objects for insert
  to authenticated with check (
    bucket_id in ('report-images','project-files') and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager','editor'))
  );

create policy "img_staff_update" on storage.objects for update
  to authenticated using (
    bucket_id in ('report-images','project-files') and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager','editor'))
  );

create policy "img_admin_delete" on storage.objects for delete
  to authenticated using (
    bucket_id in ('report-images','project-files') and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
  );
