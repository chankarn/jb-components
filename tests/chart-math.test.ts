import { describe, it, expect } from 'vitest';
import { formatCompact, formatFull, niceTicks } from '@/lib/chart-math';

describe('chart-math: ตัวเลขกราฟ', () => {
  it('formatCompact: 1,284 → 1.3K · 12.9K · 4.2M ตามสเปก stat tile', () => {
    expect(formatCompact(0)).toBe('0');
    expect(formatCompact(999)).toBe('999');
    expect(formatCompact(1000)).toBe('1K');
    expect(formatCompact(1284)).toBe('1.3K');
    expect(formatCompact(12900)).toBe('12.9K');
    expect(formatCompact(123456)).toBe('123K');
    expect(formatCompact(4_200_000)).toBe('4.2M');
    expect(formatCompact(-2500)).toBe('-2.5K');
  });
  it('formatFull: คั่นหลักพัน', () => expect(formatFull(1234567)).toBe('1,234,567'));

  it('niceTicks: เริ่มที่ 0 ก้าวเป็นเลขกลม (1/2/2.5/5 × 10ⁿ) และครอบค่าสูงสุด', () => {
    for (const max of [7, 98, 840, 1385, 5200, 73_000, 0.8]) {
      const t = niceTicks(max);
      expect(t[0]).toBe(0);
      expect(t[t.length - 1], `max ${max}`).toBeGreaterThanOrEqual(max);
      expect(t.length).toBeLessThanOrEqual(7);
      const step = t[1] - t[0];
      const mantissa = step / 10 ** Math.floor(Math.log10(step));
      expect([1, 2, 2.5, 5, 10]).toContain(Math.round(mantissa * 100) / 100);
    }
    expect(niceTicks(1385)).toEqual([0, 500, 1000, 1500]);
    expect(niceTicks(840)).toEqual([0, 250, 500, 750, 1000]);
  });
  it('niceTicks: ค่าว่าง/ศูนย์ไม่พัง', () => {
    expect(niceTicks(0)).toEqual([0, 1]);
    expect(niceTicks(NaN)).toEqual([0, 1]);
  });
});

import { sliceAt } from '@/lib/chart-math';

describe('chart-math: sliceAt (ตรวจว่ากดโดนชิ้นไหนของโดนัท)', () => {
  const R = 100;
  const point = (deg: number, r: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const; // deg วนตามเข็มจาก 12 นาฬิกา
  const values = [50, 25, 25]; // 180° / 90° / 90°

  it('ชิ้นแรกเริ่มที่ 12 นาฬิกา วนตามเข็ม: 45° อยู่ชิ้นที่ 0 · 135° (ขวาล่าง) ชิ้นที่ 0 · 225° ชิ้นที่ 1 · 315° ชิ้นที่ 2', () => {
    expect(sliceAt(...point(45, 82), R, values)).toBe(0);
    expect(sliceAt(...point(135, 82), R, values)).toBe(0);
    expect(sliceAt(...point(225, 82), R, values)).toBe(1);
    expect(sliceAt(...point(315, 82), R, values)).toBe(2);
  });
  it('รูกลางวง = hole · นอกวง = null', () => {
    expect(sliceAt(0, 0, R, values)).toBe('hole');
    expect(sliceAt(...point(90, 50), R, values)).toBe('hole');
    expect(sliceAt(...point(90, 130), R, values)).toBeNull();
  });
  it('ชิ้นเดียว/ชิ้นสุดท้ายใกล้ 360° ไม่หลุด', () => {
    expect(sliceAt(...point(358.5, 82), R, values)).toBe(2); // ปลายชิ้นสุดท้าย (ก่อนช่องว่าง 2°)
    expect(sliceAt(...point(359.5, 82), R, values)).toBe(0); // กลางช่องว่าง ใกล้ขอบชิ้นแรกกว่า
    expect(sliceAt(...point(10, 82), R, [100])).toBe(0);
  });
  it('ไม่มีข้อมูล → null', () => expect(sliceAt(...point(10, 82), R, [0, 0])).toBeNull());
});

import { countUp, percentChange, sparkPath } from '@/lib/chart-math';

describe('sparkPath / countUp / percentChange', () => {
  it('sparkPath: ค่าต่ำสุดอยู่ล่าง สูงสุดอยู่บน (เว้นขอบ) · พื้นที่ปิดลงฐาน', () => {
    const { line, area } = sparkPath([0, 10, 5], 100, 20);
    expect(line).toBe('M0 18 L50 2 L100 10');
    expect(area).toBe('M0 18 L50 2 L100 10 L100 20 L0 20 Z');
  });
  it('sparkPath: ค่าเท่ากัน → เส้นกลาง · จุดเดียว → ว่าง', () => {
    expect(sparkPath([3, 3], 10, 10).line).toBe('M0 5 L10 5');
    expect(sparkPath([1], 10, 10)).toEqual({ line: '', area: '' });
  });
  it('countUp: เริ่ม/จบตรงค่า · ครึ่งทางเลยครึ่ง (ease-out) · บีบ t', () => {
    expect(countUp(0, 100, 0)).toBe(0);
    expect(countUp(0, 100, 1)).toBe(100);
    expect(countUp(0, 100, 0.5)).toBe(87.5);
    expect(countUp(50, 0, 2)).toBe(0);
  });
  it('percentChange', () => {
    expect(percentChange(100, 112)).toBe(12);
    expect(percentChange(80, 77.6)).toBe(-3);
    expect(percentChange(-50, -25)).toBe(50);
    expect(percentChange(0, 5)).toBeNull();
  });
});
