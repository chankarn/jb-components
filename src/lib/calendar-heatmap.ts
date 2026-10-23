import { addDays, cmpYmd, parseYmd, toYmd, type YMD } from '@/lib/calendar';

/**
 * ตรรกะของ calendar heatmap (แบบ GitHub: คอลัมน์ = สัปดาห์ · แถว = วันในสัปดาห์) — ฟังก์ชันล้วน ไม่พึ่ง React/เขตเวลา
 * วันที่ใช้สตริง "YYYY-MM-DD" ตลอด (คำนวณผ่าน lib/calendar ที่ไม่ผูกกับ timezone ของเครื่อง)
 */
export type DayValue = { date: string; value: number };
export type Level = 0 | 1 | 2 | 3 | 4;
/** null = นอกช่วงข้อมูล (ช่องว่างต้นปี/ปลายปีที่ไม่เต็มสัปดาห์) — ต่างจาก value 0 ที่แปลว่า "มีวันนั้น แต่ไม่มีกิจกรรม" */
export type CalCell = { date: string; value: number; level: Level } | null;
export type MonthMark = { week: number; month: number };
export type CalendarGrid = { weeks: CalCell[][]; months: MonthMark[]; from: string; to: string; max: number; thresholds: [number, number, number] };

const dowOf = (v: YMD) => new Date(Date.UTC(v.y, v.m - 1, v.d)).getUTCDay(); // 0 = อาทิตย์
const iso = (v: YMD) => toYmd(v);

/** วันในสัปดาห์ของวันที่ (0 = อาทิตย์) */
export function dayOfWeek(date: string): number {
  const v = parseYmd(date);
  if (!v) throw new Error(`invalid date: ${date}`);
  return dowOf(v);
}

/** เกณฑ์ระดับสี 1–4 จากควอร์ไทล์ของค่าที่ > 0 (ค่า ≤ t1 = ระดับ 1 · ≤ t2 = 2 · ≤ t3 = 3 · มากกว่า = 4) — 0 คือระดับ 0 เสมอ */
export function levelThresholds(values: number[]): [number, number, number] {
  const pos = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (!pos.length) return [0, 0, 0];
  const at = (q: number) => pos[Math.min(pos.length - 1, Math.max(0, Math.ceil(q * pos.length) - 1))];
  return [at(0.25), at(0.5), at(0.75)];
}

export function levelOf(value: number, [t1, t2, t3]: [number, number, number]): Level {
  if (!(value > 0)) return 0;
  if (value <= t1) return 1;
  if (value <= t2) return 2;
  if (value <= t3) return 3;
  return 4;
}

/**
 * สร้างตารางสัปดาห์ × วัน จากข้อมูลรายวัน
 * - ช่วงเริ่ม/จบ = `from`/`to` ถ้าให้มา ไม่งั้นวันที่น้อย/มากสุดในข้อมูล · วันในช่วงที่ไม่มีข้อมูล = 0 · วันที่ซ้ำรวมค่ากัน
 * - `weekStart`: 0 = สัปดาห์เริ่มวันอาทิตย์ (แบบ GitHub) · 1 = เริ่มวันจันทร์ · ช่องก่อนวันแรกและหลังวันสุดท้ายเป็น null
 * - ป้ายเดือนวางที่สัปดาห์ซึ่งมีวันที่ 1 (และคอลัมน์แรกใช้เดือนของวันแรก) · ป้ายที่ใกล้กันเกิน 3 คอลัมน์ตัดทิ้ง กันตัวหนังสือซ้อน
 *   (ถ้าชนกับเดือนแรกที่ไม่เต็ม ตัดเดือนแรกแทน)
 */
export function buildCalendar(days: DayValue[], opts: { weekStart?: 0 | 1; from?: string; to?: string } = {}): CalendarGrid {
  const weekStart = opts.weekStart ?? 0;
  const parsed = days.map((d) => ({ v: parseYmd(d.date), value: d.value })).filter((d): d is { v: YMD; value: number } => !!d.v && Number.isFinite(d.value));
  const sorted = parsed.map((d) => d.v).sort(cmpYmd);
  const first = (opts.from ? parseYmd(opts.from) : null) ?? sorted[0];
  const last = (opts.to ? parseYmd(opts.to) : null) ?? sorted[sorted.length - 1];
  if (!first || !last || cmpYmd(first, last) > 0) return { weeks: [], months: [], from: '', to: '', max: 0, thresholds: [0, 0, 0] };

  const byDate = new Map<string, number>();
  for (const d of parsed) byDate.set(iso(d.v), (byDate.get(iso(d.v)) ?? 0) + d.value);

  // ทุกวันในช่วง
  const all: { date: string; value: number }[] = [];
  for (let cur = first; cmpYmd(cur, last) <= 0; cur = addDays(cur, 1)) all.push({ date: iso(cur), value: byDate.get(iso(cur)) ?? 0 });

  const thresholds = levelThresholds(all.map((d) => d.value));
  const lead = (dowOf(first) - weekStart + 7) % 7; // ช่องว่างก่อนวันแรกในสัปดาห์แรก
  const cells: CalCell[] = [
    ...Array<CalCell>(lead).fill(null),
    ...all.map((d): CalCell => ({ date: d.date, value: d.value, level: levelOf(d.value, thresholds) })),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: CalCell[][] = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  // ป้ายเดือน
  const marks: MonthMark[] = [{ week: 0, month: first.m }];
  weeks.forEach((wk, w) => {
    const hit = wk.find((c) => c && c.date.endsWith('-01'));
    if (!hit) return;
    const month = Number(hit.date.slice(5, 7));
    if (w === 0) marks[0] = { week: 0, month }; // สัปดาห์แรกมีวันที่ 1 อยู่แล้ว: ใช้เดือนนั้น (ไม่ซ้อนสองป้ายในคอลัมน์เดียว)
    else marks.push({ week: w, month });
  });
  // ป้ายที่ใกล้กันเกิน (< 3 คอลัมน์) ตัดทิ้ง · ถ้าชนกับป้ายแรกสุด (เดือนแรกที่เหลือไม่กี่วัน) ให้ตัดป้ายแรกแทน
  // ไม่งั้นป้ายเดือนถัดไปหาย (เช่น เริ่ม 22 ต.ค. แล้วข้ามจาก ต.ค. ไป ธ.ค. โดยไม่มี พ.ย.) ผู้ดูจะเข้าใจผิด
  const months: MonthMark[] = [];
  for (const m of marks) {
    const prev = months[months.length - 1];
    if (!prev || m.week - prev.week >= 3) months.push(m);
    else if (months.length === 1 && prev.week === 0) months[0] = m;
  }

  return { weeks, months, from: iso(first), to: iso(last), max: Math.max(0, ...all.map((d) => d.value)), thresholds };
}

export type Run = { length: number; start: string | null; end: string | null };
export type CalendarStats = { total: number; busiest: { date: string; value: number } | null; longest: Run; current: Run };

/**
 * สถิติรายวัน: รวม · วันที่สูงสุด · streak ยาวสุด · streak ปัจจุบัน (วัน "มีกิจกรรม" = ค่า > 0)
 * streak ปัจจุบัน = ต่อเนื่องจนถึงวันสุดท้ายของช่วง · ถ้าวันสุดท้ายยังไม่มีกิจกรรม (เช่น วันนี้ยังไม่ทันทำ) นับถอยจากเมื่อวานแทน
 * โดยไม่ทำ streak ขาดทันที (เหมือน GitHub) · ข้อมูลที่ไม่มีทั้งช่วงได้ length 0
 */
export function calendarStats(days: DayValue[], opts: { from?: string; to?: string } = {}): CalendarStats {
  const grid = buildCalendar(days, opts);
  const flat = grid.weeks.flat().filter((c): c is NonNullable<CalCell> => !!c);
  const total = flat.reduce((s, c) => s + c.value, 0);
  const busiestCell = flat.reduce<NonNullable<CalCell> | null>((b, c) => (c.value > (b?.value ?? 0) ? c : b), null);

  let longest: Run = { length: 0, start: null, end: null };
  let run: Run = { length: 0, start: null, end: null };
  for (const c of flat) {
    if (c.value > 0) {
      run = run.length ? { ...run, length: run.length + 1, end: c.date } : { length: 1, start: c.date, end: c.date };
      if (run.length > longest.length) longest = run;
    } else run = { length: 0, start: null, end: null };
  }

  let i = flat.length - 1;
  if (i >= 0 && !(flat[i].value > 0)) i--; // วันสุดท้ายยังว่าง: นับถอยจากเมื่อวาน
  let current: Run = { length: 0, start: null, end: null };
  for (const end = i; i >= 0 && flat[i].value > 0; i--) current = { length: current.length + 1, start: flat[i].date, end: flat[end].date };
  return { total, busiest: busiestCell ? { date: busiestCell.date, value: busiestCell.value } : null, longest, current };
}
