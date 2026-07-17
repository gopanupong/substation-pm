import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** รวม className แบบ Tailwind + จัดการ conflict */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** สุ่ม id แบบ short uuid สำหรับ client-side */
export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** แปลงเป็นสตริงวันที่แบบไทย/อังกฤษ */
export function formatDate(iso: string | null | undefined, locale: "th" | "en" = "th") {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** แปลงเป็นเปอร์เซ็นต์ทศนิยม 0 ตำแหน่ง */
export function pct(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** คำนวณเปอร์เซ็นต์ความคืบหน้าเฉลี่ยของงานย่อย/งาน */
export function avgProgress(items: { progress?: number | null }[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc, it) => acc + (it.progress ?? 0), 0);
  return pct(sum / items.length);
}

/** สีตามระดับความคืบหน้า */
export function progressColor(p: number) {
  if (p >= 100) return "bg-emerald-500";
  if (p >= 75) return "bg-sky-500";
  if (p >= 40) return "bg-amber-500";
  if (p > 0) return "bg-orange-500";
  return "bg-zinc-400";
}

/** เปลี่ยนวัตถุไฟล์เป็น data URL (สำหรับ preview) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** ย่อข้อความ */
export function truncate(s: string, n = 80) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** แปลงไบต์เป็นขนาดที่อ่านง่าย */
export function humanSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}
