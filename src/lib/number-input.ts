/** ตรรกะล้วนของ NumberInput (แยกจาก .tsx เพื่อให้ vitest ทดสอบได้) */
import { clamp, decimals } from './slider';

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

/**
 * ข้อความ → ตัวเลข · รับ comma คั่นหลักพัน, เลขไทย, ช่องว่าง, เครื่องหมายลบแบบ − (U+2212)
 * ว่างหรืออ่านไม่ออก → null (ให้ช่องเป็นค่าว่างได้ แทนที่จะกลายเป็น 0)
 */
export function parseNumber(text: string): number | null {
  const s = text
    .replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)))
    .replace(/[,\s_]/g, '')
    .replace(/−/g, '-');
  if (s === '' || s === '-' || s === '.' || s === '-.') return null;
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** ตัวเลข → ข้อความมี comma · precision = จำนวนทศนิยมตายตัว (ไม่ระบุ = แสดงเท่าที่มี) */
export function formatNumber(n: number | null, precision?: number, locale = 'en-US'): string {
  if (n == null || !Number.isFinite(n)) return '';
  return n.toLocaleString(locale, precision == null
    ? { maximumFractionDigits: 20 }
    : { minimumFractionDigits: precision, maximumFractionDigits: precision });
}

/** ปัดตามทศนิยม แล้วบีบให้อยู่ในช่วง (ไม่บังคับลงขั้น step — พิมพ์ 37 ในช่อง step 5 ได้ 37) */
export function normalize(n: number, { min = -Infinity, max = Infinity, precision }: { min?: number; max?: number; precision?: number }): number {
  const v = precision == null ? n : Number(n.toFixed(precision));
  return clamp(v, min, max);
}

/** กด +/− หรือ ↑↓: เริ่มจากค่าว่างใช้ min (ถ้ามี) ไม่งั้น 0 · ผลปัดตามทศนิยมของ step กันเศษลอย */
export function stepValue(
  value: number | null, dir: 1 | -1, step: number,
  { min = -Infinity, max = Infinity, precision }: { min?: number; max?: number; precision?: number } = {},
): number {
  if (value == null) return clamp(Number.isFinite(min) ? min : 0, min, max);
  const d = Math.max(decimals(step), precision ?? 0, decimals(value));
  return clamp(Number((value + dir * step).toFixed(d)), min, max);
}
