// =====================================================
// ตรวจสอบว่าใช้ Supabase จริงหรือ Demo mode (mock data)
// ถ้ายังไม่ได้ใส่ env ที่ถูกต้อง ระบบจะรันเป็น demo
// =====================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** ตรวจสอบว่า anon key มีรูปแบบ JWT ที่ถูกต้อง (ขึ้นต้นด้วย eyJ) */
const isValidAnonKey = SUPABASE_ANON_KEY.startsWith("eyJ");

export const isDemoMode =
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  SUPABASE_URL.includes("placeholder") ||
  SUPABASE_ANON_KEY.includes("placeholder") ||
  !isValidAnonKey;
