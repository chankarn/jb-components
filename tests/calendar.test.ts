import { describe, it, expect } from 'vitest';
import { addDays, addMonths, clampYmd, cmpYmd, daysInMonth, displayYear, formatYmd, monthGrid, outOfRange, parseYmd, toYmd } from '@/lib/calendar';

describe('calendar: ฟังก์ชันปฏิทิน', () => {
  it('parse/format ไป-กลับได้ และปฏิเสธวันที่ที่ไม่มีจริง', () => {
    expect(parseYmd('2026-10-16')).toEqual({ y: 2026, m: 10, d: 16 });
    expect(parseYmd('2026-10-16T08:30')).toEqual({ y: 2026, m: 10, d: 16 });
    expect(toYmd({ y: 2026, m: 1, d: 5 })).toBe('2026-01-05');
    for (const bad of ['', null, undefined, '2026-13-01', '2026-02-30', '2025-02-29', 'abc', '2026-10']) expect(parseYmd(bad as string), String(bad)).toBeNull();
  });

  it('จำนวนวันในเดือน รวมปีอธิกสุรทิน (ก.พ. 29 วัน)', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(2100, 2)).toBe(28); // หาร 100 ลงตัวแต่ไม่ถึง 400
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('ตารางเดือนมี 42 ช่อง เริ่มวันอาทิตย์ และเรียงต่อเนื่องไม่ซ้ำ', () => {
    for (const [y, m] of [[2026, 10], [2026, 2], [2024, 2], [2026, 11], [2027, 5]] as const) {
      const g = monthGrid(y, m);
      expect(g).toHaveLength(42);
      expect(new Date(Date.UTC(g[0].y, g[0].m - 1, g[0].d)).getUTCDay(), `${y}-${m} เริ่มอาทิตย์`).toBe(0);
      const inMonth = g.filter((c) => c.inMonth);
      expect(inMonth).toHaveLength(daysInMonth(y, m));
      expect(inMonth[0].d).toBe(1);
      for (let i = 1; i < g.length; i++) expect(cmpYmd(g[i], g[i - 1])).toBeGreaterThan(0);
    }
    // 1 ต.ค. 2026 เป็นวันพฤหัสบดี → มีวันของเดือนก่อน 4 ช่องนำหน้า
    const oct = monthGrid(2026, 10);
    expect(oct.findIndex((c) => c.inMonth)).toBe(4);
  });

  it('เลื่อนเดือนข้ามปี', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ y: 2027, m: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ y: 2025, m: 12 });
    expect(addMonths(2026, 10, -22)).toEqual({ y: 2024, m: 12 });
    expect(addMonths(2026, 6, 0)).toEqual({ y: 2026, m: 6 });
  });

  it('บวกวันข้ามเดือน/ปี/ปีอธิกสุรทิน', () => {
    expect(addDays({ y: 2026, m: 12, d: 31 }, 1)).toEqual({ y: 2027, m: 1, d: 1 });
    expect(addDays({ y: 2024, m: 2, d: 28 }, 1)).toEqual({ y: 2024, m: 2, d: 29 });
    expect(addDays({ y: 2025, m: 3, d: 1 }, -1)).toEqual({ y: 2025, m: 2, d: 28 });
  });

  it('ช่วง min/max: นับเฉพาะนอกช่วง และ clamp เข้าช่วง', () => {
    const min = { y: 2026, m: 10, d: 16 };
    const max = { y: 2027, m: 10, d: 16 };
    expect(outOfRange({ y: 2026, m: 10, d: 15 }, min, max)).toBe(true);
    expect(outOfRange(min, min, max)).toBe(false);
    expect(outOfRange(max, min, max)).toBe(false);
    expect(outOfRange({ y: 2027, m: 10, d: 17 }, min, max)).toBe(true);
    expect(outOfRange({ y: 1999, m: 1, d: 1 })).toBe(false);
    expect(clampYmd({ y: 2020, m: 1, d: 1 }, min, max)).toEqual(min);
    expect(clampYmd({ y: 2030, m: 1, d: 1 }, min, max)).toEqual(max);
  });

  it('แสดงปี พ.ศ. ในภาษาไทย และ ค.ศ. ในภาษาอังกฤษ', () => {
    expect(displayYear(2026, 'th')).toBe(2569);
    expect(displayYear(2026, 'en')).toBe(2026);
    expect(formatYmd({ y: 2027, m: 4, d: 15 }, 'th')).toBe('15 เม.ย. 2570');
    expect(formatYmd({ y: 2027, m: 4, d: 15 }, 'en')).toBe('15 Apr 2027');
  });
});
