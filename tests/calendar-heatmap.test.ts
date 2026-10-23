import { describe, it, expect } from 'vitest';
import { buildCalendar, calendarStats, dayOfWeek, levelOf, levelThresholds, type DayValue } from '@/lib/calendar-heatmap';
import { addDays, parseYmd, toYmd } from '@/lib/calendar';

/** สร้างข้อมูลรายวันต่อเนื่องจาก start จำนวน n วัน ด้วยฟังก์ชันค่า */
const run = (start: string, n: number, f: (i: number) => number): DayValue[] =>
  Array.from({ length: n }, (_, i) => ({ date: toYmd(addDays(parseYmd(start)!, i)), value: f(i) }));

describe('calendar-heatmap: dayOfWeek', () => {
  it('ถูกต้องตามปฏิทินจริง (0 = อาทิตย์)', () => {
    expect(dayOfWeek('2026-10-21')).toBe(3); // พุธ
    expect(dayOfWeek('2026-10-18')).toBe(0); // อาทิตย์
    expect(dayOfWeek('2024-02-29')).toBe(4); // พฤหัสบดี (ปีอธิกสุรทิน)
  });
  it('วันที่ผิดรูปแบบ → throw', () => expect(() => dayOfWeek('2026-02-30')).toThrow());
});

describe('calendar-heatmap: levels', () => {
  it('เกณฑ์จากควอร์ไทล์ของค่าที่ > 0 · ค่า 0 ไม่นับ', () => {
    expect(levelThresholds([0, 0, 1, 2, 3, 4, 5, 6, 7, 8])).toEqual([2, 4, 6]);
    expect(levelThresholds([0, 0])).toEqual([0, 0, 0]);
  });
  it('levelOf: 0 → 0 · ไล่ 1–4 ตามเกณฑ์ · ค่าลบ/NaN = 0', () => {
    const t: [number, number, number] = [2, 4, 6];
    expect([0, 1, 2, 3, 4, 5, 6, 7, 99].map((v) => levelOf(v, t))).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(levelOf(-3, t)).toBe(0);
    expect(levelOf(NaN, t)).toBe(0);
  });
});

describe('calendar-heatmap: buildCalendar', () => {
  // 18 ต.ค. 2026 = อาทิตย์ → สัปดาห์เริ่มอาทิตย์: 7 วันเต็มพอดี 1 คอลัมน์
  it('วันแรกเป็นอาทิตย์ + weekStart 0 → ไม่มีช่องว่างหน้า · 14 วัน = 2 สัปดาห์เต็ม', () => {
    const g = buildCalendar(run('2026-10-18', 14, () => 1));
    expect(g.weeks).toHaveLength(2);
    expect(g.weeks.flat().every((c) => c !== null)).toBe(true);
    expect(g.weeks[0][0]!.date).toBe('2026-10-18');
  });

  it('เริ่มกลางสัปดาห์ → ช่องก่อนวันแรกเป็น null · ท้ายสัปดาห์ที่ไม่เต็มเป็น null', () => {
    const g = buildCalendar(run('2026-10-21', 3, () => 1)); // พุธ พฤ ศุกร์
    expect(g.weeks).toHaveLength(1);
    expect(g.weeks[0].map((c) => (c ? c.date.slice(8) : null))).toEqual([null, null, null, '21', '22', '23', null]);
  });

  it('weekStart 1 (เริ่มจันทร์): วันอาทิตย์ไปอยู่แถวสุดท้าย', () => {
    const g = buildCalendar(run('2026-10-19', 7, () => 1), { weekStart: 1 }); // จันทร์ → อาทิตย์
    expect(g.weeks).toHaveLength(1);
    expect(g.weeks[0][0]!.date).toBe('2026-10-19');
    expect(g.weeks[0][6]!.date).toBe('2026-10-25');
  });

  it('วันที่ไม่มีในข้อมูลแต่อยู่ในช่วง = 0 (ไม่ใช่ null) · วันซ้ำรวมค่ากัน · ลำดับข้อมูลสลับกันได้', () => {
    const g = buildCalendar([{ date: '2026-10-23', value: 2 }, { date: '2026-10-21', value: 5 }, { date: '2026-10-21', value: 1 }]);
    const cells = g.weeks.flat().filter(Boolean).map((c) => [c!.date.slice(8), c!.value]);
    expect(cells).toEqual([['21', 6], ['22', 0], ['23', 2]]);
  });

  it('from/to กำหนดช่วงเองได้ (ตัดข้อมูลนอกช่วง)', () => {
    const g = buildCalendar(run('2026-10-01', 60, () => 1), { from: '2026-10-10', to: '2026-10-20' });
    expect(g.from).toBe('2026-10-10');
    expect(g.to).toBe('2026-10-20');
    expect(g.weeks.flat().filter(Boolean)).toHaveLength(11);
  });

  it('ข้อมูลว่าง/วันที่ผิด/ช่วงกลับด้าน → ตารางว่าง ไม่พัง', () => {
    expect(buildCalendar([]).weeks).toEqual([]);
    expect(buildCalendar([{ date: 'x', value: 1 }]).weeks).toEqual([]);
    expect(buildCalendar(run('2026-10-01', 5, () => 1), { from: '2026-10-20', to: '2026-10-10' }).weeks).toEqual([]);
  });

  it('ระดับสี: ค่า 0 → 0 · มีทั้งสี่ระดับเมื่อค่าหลากหลาย', () => {
    const g = buildCalendar(run('2026-10-18', 28, (i) => (i % 7 === 0 ? 0 : i)));
    const levels = new Set(g.weeks.flat().filter(Boolean).map((c) => c!.level));
    expect([...levels].sort()).toEqual([0, 1, 2, 3, 4]);
    expect(g.weeks.flat().filter((c) => c && c.value === 0).every((c) => c!.level === 0)).toBe(true);
  });

  it('ป้ายเดือน: คอลัมน์แรก = เดือนของวันแรก · อยู่ที่สัปดาห์ที่มีวันที่ 1 · ห่างกันอย่างน้อย 3 คอลัมน์', () => {
    const g = buildCalendar(run('2026-01-10', 365, () => 1)); // 10 ม.ค. 2026 → 9 ม.ค. 2027
    expect(g.months[0]).toEqual({ week: 0, month: 1 });
    expect(g.months.map((m) => m.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]);
    for (let i = 1; i < g.months.length; i++) expect(g.months[i].week - g.months[i - 1].week).toBeGreaterThanOrEqual(3);
    // ป้าย "มี.ค." ต้องอยู่คอลัมน์ที่มี 1 มี.ค. จริง
    const mar = g.months.find((m) => m.month === 3)!;
    expect(g.weeks[mar.week].some((c) => c?.date === '2026-03-01')).toBe(true);
  });

  it('เริ่มปลายเดือน (เดือนแรกเหลือไม่กี่วัน) → ตัดป้ายเดือนแรกทิ้ง ไม่ใช่ตัดเดือนถัดไป (ไม่ข้ามจาก ต.ค. ไป ธ.ค.)', () => {
    const g = buildCalendar(run('2025-10-22', 365, () => 1));
    expect(g.months[0].month).toBe(11); // 1 พ.ย. 2025 อยู่คอลัมน์ที่ 1 ห่างจากป้าย ต.ค. คอลัมน์ 0 แค่ 1
    expect(g.months.map((m) => m.month)).toEqual([11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (let i = 1; i < g.months.length; i++) expect(g.months[i].week - g.months[i - 1].week).toBeGreaterThanOrEqual(3);
  });

  it('สัปดาห์แรกมีวันที่ 1 ของเดือนถัดไปอยู่แล้ว → ใช้เดือนนั้น ไม่ซ้อนสองป้ายในคอลัมน์เดียว', () => {
    const g = buildCalendar(run('2026-09-29', 40, () => 1)); // อ. 29 ก.ย. · สัปดาห์แรก (27 ก.ย.–3 ต.ค.) มี 1 ต.ค. อยู่ด้วย
    expect(g.weeks[0].some((c) => c?.date === '2026-10-01')).toBe(true);
    expect(g.months[0]).toEqual({ week: 0, month: 10 });
    expect(g.months.filter((m) => m.week === 0)).toHaveLength(1);
  });
});

describe('calendar-heatmap: calendarStats', () => {
  it('รวม · วันสูงสุด (วันแรกที่สูงสุดเมื่อเท่ากัน)', () => {
    const s = calendarStats(run('2026-10-01', 5, (i) => [3, 9, 0, 9, 1][i]));
    expect(s.total).toBe(22);
    expect(s.busiest).toEqual({ date: '2026-10-02', value: 9 });
  });

  it('streak ยาวสุด: นับวันติดกันที่ค่า > 0 · ขาดวันเดียวก็เริ่มนับใหม่', () => {
    const s = calendarStats(run('2026-10-01', 12, (i) => (i === 4 ? 0 : 1))); // ว่างวันที่ 5 → [1-4] และ [6-12]
    expect(s.longest).toEqual({ length: 7, start: '2026-10-06', end: '2026-10-12' });
  });

  it('streak ปัจจุบัน: ต่อเนื่องจนถึงวันสุดท้าย', () => {
    const s = calendarStats(run('2026-10-01', 10, (i) => (i < 5 ? 0 : 2)));
    expect(s.current).toEqual({ length: 5, start: '2026-10-06', end: '2026-10-10' });
  });

  it('วันสุดท้ายยังว่าง (วันนี้ยังไม่ทันทำ) → นับถอยจากเมื่อวาน ไม่ถือว่าขาด', () => {
    const s = calendarStats(run('2026-10-01', 10, (i) => (i >= 6 && i < 9 ? 3 : 0))); // 7-9 ต.ค. มี · 10 ต.ค. ว่าง
    expect(s.current).toEqual({ length: 3, start: '2026-10-07', end: '2026-10-09' });
  });

  it('ว่างหลายวันท้ายช่วง → streak ปัจจุบัน 0', () => {
    const s = calendarStats(run('2026-10-01', 10, (i) => (i < 5 ? 1 : 0)));
    expect(s.current.length).toBe(0);
    expect(s.longest.length).toBe(5);
  });

  it('ไม่มีกิจกรรมเลย/ไม่มีข้อมูล → ศูนย์ทั้งหมด ไม่พัง', () => {
    const z = calendarStats(run('2026-10-01', 5, () => 0));
    expect(z).toMatchObject({ total: 0, busiest: null, longest: { length: 0 }, current: { length: 0 } });
    expect(calendarStats([])).toMatchObject({ total: 0, busiest: null });
  });

  it('ข้ามเดือน/ปี (รวมปีอธิกสุรทิน) ไม่เพี้ยน', () => {
    const s = calendarStats(run('2023-12-30', 100, () => 1)); // ข้ามปี 2024 ที่มี 29 ก.พ.
    expect(s.longest.length).toBe(100);
    expect(s.longest.end).toBe('2024-04-07');
  });
});
