import { MONTHS_SHORT, addDays, cmpYmd, daysInMonth, displayYear, formatYmd, outOfRange, parseYmd, toYmd, type YMD } from '@/lib/calendar';

/**
 * ตรรกะของตัวเลือกช่วงวันที่ — ฟังก์ชันล้วน ไม่พึ่ง React/เขตเวลา (วันที่เป็นสตริง "YYYY-MM-DD" และ YMD จาก lib/calendar)
 */
export type DateRange = { from: string; to: string };
type Lang = 'th' | 'en';
export type Bounds = { min?: YMD | null; max?: YMD | null; /** ช่วงยาวสุดที่เลือกได้ (จำนวนวัน รวมวันเริ่มและวันจบ) */ maxDays?: number };

/** เรียงให้ from ≤ to เสมอ (คลิกวันจบก่อนวันเริ่มก็ได้ ช่วงเดิมไม่เสีย) */
export function normalizeRange(a: YMD, b: YMD): DateRange {
  return cmpYmd(a, b) <= 0 ? { from: toYmd(a), to: toYmd(b) } : { from: toYmd(b), to: toYmd(a) };
}

const dayNumber = (v: YMD) => Math.round(Date.UTC(v.y, v.m - 1, v.d) / 86400000);

/** จำนวนวันในช่วง รวมวันเริ่มและวันจบ (วันเดียว = 1) · รูปแบบผิด = 0 */
export function rangeLength(r: DateRange): number {
  const a = parseYmd(r.from);
  const b = parseYmd(r.to);
  return a && b ? Math.abs(dayNumber(b) - dayNumber(a)) + 1 : 0;
}

export function inRange(day: YMD, from: YMD, to: YMD): boolean {
  return cmpYmd(day, from) >= 0 && cmpYmd(day, to) <= 0;
}

export const isSameRange = (a: DateRange | null | undefined, b: DateRange | null | undefined) => (!a && !b) || (!!a && !!b && a.from === b.from && a.to === b.to);

/** รับค่าจากภายนอกอย่างปลอดภัย: สตริงผิดรูปแบบ/กลับด้าน → ปรับให้ถูก หรือ null */
export function parseRange(v: { from?: string; to?: string } | null | undefined): { from: YMD; to: YMD } | null {
  const a = parseYmd(v?.from);
  const b = parseYmd(v?.to);
  if (!a || !b) return null;
  return cmpYmd(a, b) <= 0 ? { from: a, to: b } : { from: b, to: a };
}

/**
 * ข้อความช่วงวันที่แบบย่อให้อ่านง่าย (ปีไทยเป็น พ.ศ.)
 *   วันเดียว                21 ต.ค. 2569
 *   เดือนเดียวกัน           21 – 28 ต.ค. 2569
 *   ปีเดียวกัน              21 ต.ค. – 3 พ.ย. 2569
 *   คนละปี                  28 ธ.ค. 2568 – 3 ม.ค. 2569
 */
export function formatRange(r: DateRange, lang: Lang): string {
  const a = parseYmd(r.from);
  const b = parseYmd(r.to);
  if (!a || !b) return '';
  const [from, to] = cmpYmd(a, b) <= 0 ? [a, b] : [b, a];
  if (cmpYmd(from, to) === 0) return formatYmd(from, lang);
  if (from.y !== to.y) return `${formatYmd(from, lang)} – ${formatYmd(to, lang)}`;
  const mon = MONTHS_SHORT[lang];
  if (from.m === to.m) return `${from.d} – ${to.d} ${mon[to.m - 1]} ${displayYear(to.y, lang)}`;
  return `${from.d} ${mon[from.m - 1]} – ${to.d} ${mon[to.m - 1]} ${displayYear(to.y, lang)}`;
}

export type PresetKey = 'today' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth';
export const PRESET_KEYS: PresetKey[] = ['today', 'last7', 'last30', 'last90', 'thisMonth', 'lastMonth'];

/** ช่วงสำเร็จรูป · "N วันที่ผ่านมา" นับรวมวันนี้ (7 วัน = วันนี้ย้อนไป 6 วัน) · เดือนก่อน = ทั้งเดือนก่อนหน้า */
export function rangePresets(today: YMD): { key: PresetKey; range: DateRange }[] {
  const lastN = (n: number): DateRange => ({ from: toYmd(addDays(today, -(n - 1))), to: toYmd(today) });
  const prevMonth = today.m === 1 ? { y: today.y - 1, m: 12 } : { y: today.y, m: today.m - 1 };
  return [
    { key: 'today', range: lastN(1) },
    { key: 'last7', range: lastN(7) },
    { key: 'last30', range: lastN(30) },
    { key: 'last90', range: lastN(90) },
    { key: 'thisMonth', range: { from: toYmd({ ...today, d: 1 }), to: toYmd(today) } },
    { key: 'lastMonth', range: { from: toYmd({ ...prevMonth, d: 1 }), to: toYmd({ ...prevMonth, d: daysInMonth(prevMonth.y, prevMonth.m) }) } },
  ];
}

/** ตัดช่วงให้อยู่ในขอบเขต min/max · อยู่นอกขอบเขตทั้งหมด = null */
export function clampRange(r: DateRange, { min, max }: Bounds): DateRange | null {
  const p = parseRange(r);
  if (!p) return null;
  let { from, to } = p;
  if (min && cmpYmd(from, min) < 0) from = min;
  if (max && cmpYmd(to, max) > 0) to = max;
  return cmpYmd(from, to) > 0 ? null : { from: toYmd(from), to: toYmd(to) };
}

/**
 * เลือกวันนี้ได้ไหม: อยู่ใน min/max และ (ระหว่างเลือกวันจบ) ไม่ทำให้ช่วงยาวเกิน maxDays
 * `anchor` = วันเริ่มที่คลิกไปแล้ว (null = ยังไม่ได้คลิก)
 */
export function isSelectable(day: YMD, anchor: YMD | null, b: Bounds): boolean {
  if (outOfRange(day, b.min, b.max)) return false;
  if (anchor && b.maxDays && b.maxDays > 0) return Math.abs(dayNumber(day) - dayNumber(anchor)) + 1 <= b.maxDays;
  return true;
}

/**
 * ขั้นตอนการคลิกวัน: คลิกแรก = ตั้งวันเริ่ม (anchor) · คลิกที่สอง = จบช่วง (เรียง from ≤ to ให้เอง)
 * คืนสถานะถัดไป: `anchor` (ยังรอวันจบ) หรือ `range` (เลือกเสร็จ) · วันที่เลือกไม่ได้ = ไม่เปลี่ยนอะไร
 */
export function pickDay(anchor: YMD | null, day: YMD, b: Bounds): { anchor: YMD | null; range: DateRange | null } {
  if (!isSelectable(day, anchor, b)) return { anchor, range: null };
  return anchor ? { anchor: null, range: normalizeRange(anchor, day) } : { anchor: day, range: null };
}

/** ช่วงที่ใช้วาดพื้นสีตอนนี้: กำลังเลือก (มี anchor) = anchor ถึงวันที่ชี้ · ไม่งั้นเป็นค่าที่เลือกไว้ */
export function displayRange(anchor: YMD | null, hover: YMD | null, value: { from: YMD; to: YMD } | null): { from: YMD; to: YMD } | null {
  if (anchor) {
    const end = hover ?? anchor;
    return cmpYmd(anchor, end) <= 0 ? { from: anchor, to: end } : { from: end, to: anchor };
  }
  return value;
}
