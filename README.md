# ⚡ ระบบติดตามงานก่อสร้างสถานีไฟฟ้า | Substation PM

ระบบจัดการโปรเจกต์ (To-do List Project Management) สำหรับติดตามความคืบหน้างานก่อสร้างสถานีไฟฟ้าย่อย แบ่งงานเป็นโปรเจกต์ย่อยได้ชัดเจน พร้อมระบบรายงานผลในพื้นที่ อัปโหลดรูปภาพหลักฐาน และจัดการสิทธิ์ผู้ใช้

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB%20%2B%20Storage-emerald?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 📊 **Dashboard** | ภาพรวมโครงการ, สถิติ, เปอร์เซ็นต์ความคืบหน้า (Process Bar), กราฟ |
| 📁 **โปรเจกต์** | จัดการสถานีไฟฟ้าแต่ละแห่ง พร้อมรายละเอียดครบถ้วน |
| 🏗️ **งานย่อย/ระบบ** | แบ่งเป็น งานโยธา, ไฟฟ้า, ติดตั้งอุปกรณ์, ทดสอบ, ส่งมอบ |
| ✅ **Tasks Kanban** | บอร์ดแบบ Kanban + รายการตาราง, เปลี่ยนสถานะได้ |
| 📝 **รายงานผล** | ฟอร์มรายงานในพื้นที่: งานที่ทำ, ปัญหา, แผนต่อไป, สภาพอากาศ |
| 📸 **อัปโหลดรูป/ไฟล์** | แนบรูปภาพหลักฐานประกอบรายงาน พร้อม lightbox |
| 📅 **Gantt Timeline** | ไทม์ไลน์แผนงานทั้งโปรเจกต์ พร้อมเส้น "วันนี้" |
| 👥 **ระบบสิทธิ์** | Admin, Manager, Editor, Viewer — ควบคุมได้ละเอียด |
| 🔐 **Google Login** | เข้าสู่ระบบด้วย Gmail ผ่าน Supabase Auth |
| 🌐 **ภาษาไทย/English** | เปลี่ยนภาษา UI ได้ทุกเมนู |
| 🌙 **Dark Mode** | โหมดมืด/สว่าง สลับได้ตลอดเวลา |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Charts**: Recharts
- **i18n**: Custom context-based (Thai primary, English toggle)
- **Deploy**: Vercel

---

## 🚀 เริ่มต้นใช้งาน

### 1. Clone และติดตั้ง

```bash
git clone <repo-url>
cd substation-pm
npm install
```

### 2. ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. ไปที่ **SQL Editor** แล้วรันไฟล์ SQL ตามลำดับ:
   - `supabase/migrations/0001_init_schema.sql` — สร้างตารางทั้งหมด
   - `supabase/migrations/0002_rls_policies.sql` — ตั้งค่า Row Level Security
   - `supabase/migrations/0003_storage_buckets.sql` — สร้าง storage buckets
3. ไปที่ **Authentication > Providers** เปิด **Google** แล้วใส่:
   - Client ID จาก Google Cloud Console
   - Client Secret จาก Google Cloud Console
   - Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
4. ไปที่ **Settings > API** คัดลอก:
   - Project URL
   - anon public key

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. รัน Dev Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

> 💡 **โหมด Demo**: หากยังไม่ได้ใส่ Supabase credentials ระบบจะรันเป็น **Demo Mode** แสดงข้อมูลตัวอย่างสถานีไฟฟ้า 4 แห่งพร้อมใช้งานได้ทันที

---

## 📐 โครงสร้างฐานข้อมูล

```
profiles        — ข้อมูลผู้ใช้ + สิทธิ์ (admin/manager/editor/viewer)
projects         — สถานีไฟฟ้า (โปรเจกต์หลัก)
subprojects      — งานย่อย/ระบบ (โยธา/ไฟฟ้า/อุปกรณ์/ทดสอบ/ส่งมอบ)
tasks            — งานแต่ละรายการ (Kanban)
progress_reports — รายงานผลในพื้นที่
attachments      — รูปภาพ/ไฟล์หลักฐาน (เก็บใน Supabase Storage)
comments         — ความคิดเห็นในงาน
milestones       — เป้าหมายสำคัญ (Energization, FAT/SAT, ส่งมอบ)
activity_logs    — ประวัติการเปลี่ยนแปลง
```

---

## 👥 ระบบสิทธิ์

| สิทธิ์ | อธิบาย |
|-------|--------|
| **Admin** | จัดการทุกอย่าง รวมถึงกำหนดสิทธิ์ผู้ใช้ |
| **Manager** | สร้าง/แก้ไข โปรเจกต์ งาน รายงาน บริหารทีมในโปรเจกต์ |
| **Editor** | สร้าง/แก้ไข งาน รายงาน และอัปโหลดไฟล์ |
| **Viewer** | ดูข้อมูลได้เท่านั้น แก้ไขไม่ได้ |

> ⚠️ ผู้ใช้ใหม่จะได้สิทธิ์ `viewer` โดยอัตโนมัติ — Admin เปลี่ยนสิทธิ์ได้ที่หน้า **Users**

---

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                      # Next.js App Router
│   ├── (app)/                # Route group ที่มี sidebar
│   │   ├── page.tsx          # Dashboard
│   │   ├── projects/         # รายการโปรเจกต์
│   │   │   └── [id]/         # รายละเอียดโปรเจกต์ (5 tabs)
│   │   ├── tasks/            # Tasks Kanban + List
│   │   ├── reports/          # รายงานผลทั้งหมด
│   │   ├── timeline/         # Gantt Timeline
│   │   └── users/            # จัดการผู้ใช้ (admin)
│   ├── login/                # หน้าเข้าสู่ระบบ
│   ├── auth/callback/        # OAuth callback
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Design tokens
├── components/
│   ├── ui/                   # shadcn/ui primitives (18 components)
│   ├── navigation/           # Sidebar + App Shell
│   └── theme-provider.tsx    # Dark mode provider
├── i18n/                     # ภาษาไทย + English
├── lib/
│   ├── auth/context.tsx      # Auth + Demo mode
│   ├── data/index.ts         # Data access layer
│   ├── demo/mock-data.ts     # ข้อมูลตัวอย่าง 4 สถานีไฟฟ้า
│   ├── supabase/             # Supabase clients + middleware
│   └── utils.ts              # Helper functions
├── types/database.ts         # TypeScript types
└── middleware.ts             # Auth session refresh
supabase/migrations/           # SQL migration files
```

---

## 🚢 Deploy บน Vercel

### วิธีที่ 1: ผ่าน Vercel Dashboard

1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → Import Project → เลือก repo
3. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. กด **Deploy**

### วิธีที่ 2: ผ่าน Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

เพิ่ม env vars ที่ Vercel Dashboard → Settings → Environment Variables

---

## 📋 License

MIT
