/** ฟังก์ชันปฏิทินล้วน (ไม่แตะ timezone) — ใช้กับ DatePicker · วันที่เป็นสตริง `YYYY-MM-DD` เหมือน <input type="date"> */
export type YMD = { y: number; m: number; d: number }; // m = 1..12

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function parseYmd(s: string | null | undefined): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s ?? '');
  if (!m) return null;
  const v = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  return v.m >= 1 && v.m <= 12 && v.d >= 1 && v.d <= daysInMonth(v.y, v.m) ? v : null;
}

export const toYmd = (v: YMD) => `${String(v.y).padStart(4, '0')}-${pad2(v.m)}-${pad2(v.d)}`;

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** วันในสัปดาห์ของวันที่ 1 (0 = อาทิตย์) */
const firstWeekday = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1)).getUTCDay();

export function addMonths(y: number, m: number, delta: number): { y: number; m: number } {
  const idx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(idx / 12), m: (((idx % 12) + 12) % 12) + 1 };
}

export const cmpYmd = (a: YMD, b: YMD) => a.y - b.y || a.m - b.m || a.d - b.d;

export function addDays(v: YMD, n: number): YMD {
  const t = new Date(Date.UTC(v.y, v.m - 1, v.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export type Cell = YMD & { inMonth: boolean };

/** ตารางเดือน 6 แถว × 7 วัน (เริ่มวันอาทิตย์) — คงที่ 42 ช่องเพื่อให้ปฏิทินไม่กระโดดความสูงเวลาเปลี่ยนเดือน */
export function monthGrid(y: number, m: number): Cell[] {
  const lead = firstWeekday(y, m);
  const start = addDays({ y, m, d: 1 }, -lead);
  return Array.from({ length: 42 }, (_, i) => {
    const c = addDays(start, i);
    return { ...c, inMonth: c.y === y && c.m === m };
  });
}

export function outOfRange(v: YMD, min?: YMD | null, max?: YMD | null) {
  return (!!min && cmpYmd(v, min) < 0) || (!!max && cmpYmd(v, max) > 0);
}

export function clampYmd(v: YMD, min?: YMD | null, max?: YMD | null): YMD {
  if (min && cmpYmd(v, min) < 0) return min;
  if (max && cmpYmd(v, max) > 0) return max;
  return v;
}

export function todayYmd(now: Date = new Date()): YMD {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

export const MONTHS_FULL = {
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
} as const;
export const MONTHS_SHORT = {
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
} as const;
export const WEEKDAYS = { th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] } as const;

/** ปีที่แสดง: ไทย = พ.ศ. (+543) · อังกฤษ = ค.ศ. */
export const displayYear = (y: number, lang: 'th' | 'en') => (lang === 'th' ? y + 543 : y);

export function formatYmd(v: YMD, lang: 'th' | 'en') {
  return `${v.d} ${MONTHS_SHORT[lang][v.m - 1]} ${displayYear(v.y, lang)}`;
}
