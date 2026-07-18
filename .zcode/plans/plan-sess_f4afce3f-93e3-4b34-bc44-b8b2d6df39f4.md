## ปัญหา
Login ผ่าน Gmail ได้แล้ว แต่ dashboard ไม่แสดงข้อมูล เพราะ:
1. Error จริง ๆ ถูกกลืนเงียบใน `.catch(console.error)` (`page.tsx:36`) → หน้าจอแสดงแค่ "ไม่สามารถโหลดข้อมูลได้" โดยไม่บอกสาเหตุ
2. `fetchDashboardStats` ใช้ `Promise.all` → ถ้า query ใด query หนึ่ง fail ทั้ง dashboard เป็น null (แม้ 3/4 จะโหลดสำเร็จ)
3. น่าจะมี query fail เพราะ migrations ยังไม่ถูกรันบน Supabase จริง หรือตารางว่าง

## แผนการแก้ (4 ไฟล์)

### 1. `src/lib/data/index.ts` — ทนทานต่อ query fail บางส่วน
แปลง `fetchDashboardStats` จาก `Promise.all` → `Promise.allSettled` และเพิ่มฟิลด์ `errors` ในผลลัพธ์:
- แต่ละ query (projects/tasks/reports/logs) fail แยกอิสระ → ส่วนที่สำเร็จยังคืนมาแสดง
- รวบ error message ของแต่ละ query ที่ fail ไว้ใน `errors: { key, message }[]`
- ฟังก์ชันไม่ throw แล้ว (เว้นแต่ error นอก query) → หน้า dashboard เห็นข้อมูลที่โหลดได้เสมอ

เพิ่ม type export `DashboardStats` ด้วย

### 2. `src/app/(app)/page.tsx` — แสดง error จริง + โหลดแบบ partial
แยก state 3 กรณี:
- **ทั้งหมด fail** (เช่น migrations ยังไม่รัน) → หน้า error พร้อมแสดง raw error message (เช่น `relation "projects" does not exist`) เพื่อให้วินิจฉัยได้ + คำแนะนำให้รัน migrations
- **fail บางส่วน** → แสดงข้อมูลที่โหลดได้ปกติ + warning banner เล็ก ๆ บนสุดระบุว่าส่วนใด fail
- **โหลดสำเร็จหมดแต่ว่าง** → empty state ปกติ ("ยังไม่มีข้อมูล")

เปลี่ยน `useEffect` ให้จับ error ลง state แทน console

### 3. `src/i18n/dictionaries.ts` — เพิ่ม i18n keys (th + en)
เพิ่ม keys ใหม่:
- `loadDataError` — หัวข้อ error
- `loadDataErrorDesc` — คำอธิบายแบบเป็นมิตร + hint ให้รัน migrations
- `partialLoadWarning` — คำเตือน partial load
- `migrationsHint` — คำแนะนำเรื่อง DB setup

### 4. `supabase/migrations/0004_seed_demo_data.sql` — ไฟล์ใหม่: seed ข้อมูลตัวอย่าง
ใส่ข้อมูลตัวอย่าง idempotent (ใช้ `DO $$ ... END $$` ตรวจ existence ก่อน insert):
- 2-3 projects (สถานีไฟฟ้าย่อย) — ใช้ค่าจาก `demoProjects` ใน `mock-data.ts` เป็นฐาน
- subprojects หลาย phase
- tasks กระจายหลายสถานะ (todo/in_progress/review/done/blocked)
- progress_reports 1-2 รายการ
- activity_logs ไม่กี่รายการ
- ทุก FK ชี้ user (`created_by`/`user_id`/`assignee_id`/`reported_by`) ปล่อยเป็น NULL ได้ เพราะผู้ใช้ Gmail อาจยังไม่มี profile row → ใช้ NULL ทั้งหมดเพื่อ seed ได้ทันที

## สิ่งที่จะแจ้งผู้ใช้ทำหลังแก้ code
- reload dashboard ดูผล — ตอนนี้จะเห็น error จริงถ้ามี
- รัน migrations 0001→0004 ใน Supabase Dashboard > SQL Editor (วางแต่ละไฟล์ทีละอัน กด Run) ถ้ายังไม่เคยรัน
- migration `0001` มี trigger `handle_new_user` อยู่แล้ว → หลังรันจะมี profile ให้ผู้ใช้ Gmail อัตโนมัติ

## ไม่เกี่ยวกับงานนี้ (แต่พบระหว่างทาง)
- `error.tsx` (ไฟล์ใหม่ที่ยังไม่ได้ commit) ใช้ได้ปกติ เป็น boundary ของ route `(app)` — ไม่ต้องแก้
- ไม่มีปัญหา client/server supabase instance mismatch — token ส่งผ่าน cookie ถูกต้อง
- `isDemoMode` = false กับ `.env.local` ปัจจุบัน → ไม่ได้ติดอยู่ในโหมด demo