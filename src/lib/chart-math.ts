/** ตัวเลข/ขีดแกนของกราฟ (ฟังก์ชันล้วน ไม่พึ่ง React) */

/** 1,284 / 12.9K / 4.2M — ตามสเปก stat tile */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) return String(Math.round(n * 10) / 10);
  const units: [number, string][] = [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
  const [div, suffix] = units.find(([d]) => abs >= d)!;
  const v = n / div;
  return `${Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10}${suffix}`;
}
export const formatFull = (n: number) => new Intl.NumberFormat('en-US').format(n);

/**
 * ขีดบนแกนตัวเลขที่เป็นเลขกลมๆ (1, 2, 2.5, 5 × 10ⁿ) เริ่มที่ 0 — ปล่อยให้ Recharts เลือกเองจะได้ 350/700/1.1K ที่อ่านยาก
 * `max` = ค่าสูงสุดที่ต้องรองรับ · คืน ticks สำหรับ <YAxis ticks domain>
 */
export function niceTicks(max: number, count = 4): number[] {
  if (!Number.isFinite(max) || max <= 0) return [0, 1];
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * pow >= raw) ?? 10) * pow;
  const n = Math.ceil(max / step);
  return Array.from({ length: n + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6);
}

const INNER = 0.68;
const OUTER = 0.96;
const PAD_DEG = 2;

/**
 * หาชิ้นที่อยู่ใต้ตำแหน่งที่กด จากมุม/ระยะเทียบจุดศูนย์กลางวง (ไม่พึ่ง element ของ Recharts ที่ถูกวาดใหม่ตอน hover
 * จน mousedown/mouseup ตกคนละ element แล้วไม่เกิด click) · มุมเริ่มที่ 12 นาฬิกา วนตามเข็ม เหมือน startAngle={90} endAngle={-270}
 * คืน index ชิ้น · 'hole' = กดตรงรูกลางวง · null = กดนอกวง
 */
export function sliceAt(dx: number, dy: number, radius: number, values: number[]): number | 'hole' | null {
  const dist = Math.hypot(dx, dy);
  if (dist < radius * INNER) return 'hole';
  if (dist > radius * OUTER + 8) return null;
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const pad = values.length > 1 ? PAD_DEG : 0;
  const arc = 360 - pad * values.length;
  let start = 0;
  for (let i = 0; i < values.length; i++) {
    const end = start + (values[i] / total) * arc;
    // ช่องว่างระหว่างชิ้นนับเป็นของชิ้นที่ติดกัน (ครึ่งต่อครึ่ง)
    if (deg >= start - pad / 2 && deg < end + pad / 2) return i;
    start = end + pad;
  }
  return 0; // ปัดเศษใกล้ 360° = ชิ้นแรก
}
