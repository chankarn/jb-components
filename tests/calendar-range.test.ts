import { describe, it, expect } from 'vitest';
import {
  clampRange, displayRange, formatRange, inRange, isSameRange, isSelectable, normalizeRange, parseRange, pickDay, rangeLength, rangePresets,
} from '@/lib/calendar-range';
import { parseYmd, type YMD } from '@/lib/calendar';

const y = (s: string) => parseYmd(s) as YMD;

describe('calendar-range: พื้นฐาน', () => {
  it('normalizeRange เรียง from ≤ to เสมอ', () => {
    expect(normalizeRange(y('2026-10-21'), y('2026-10-28'))).toEqual({ from: '2026-10-21', to: '2026-10-28' });
    expect(normalizeRange(y('2026-10-28'), y('2026-10-21'))).toEqual({ from: '2026-10-21', to: '2026-10-28' });
    expect(normalizeRange(y('2026-10-21'), y('2026-10-21'))).toEqual({ from: '2026-10-21', to: '2026-10-21' });
  });

  it('rangeLength นับรวมวันเริ่มและวันจบ · ข้ามเดือน/ปี/ปีอธิกสุรทินไม่เพี้ยน', () => {
    expect(rangeLength({ from: '2026-10-21', to: '2026-10-21' })).toBe(1);
    expect(rangeLength({ from: '2026-10-21', to: '2026-10-27' })).toBe(7);
    expect(rangeLength({ from: '2026-12-30', to: '2027-01-02' })).toBe(4);
    expect(rangeLength({ from: '2024-02-28', to: '2024-03-01' })).toBe(3); // มี 29 ก.พ.
    expect(rangeLength({ from: '2026-10-27', to: '2026-10-21' })).toBe(7); // กลับด้านก็นับได้
    expect(rangeLength({ from: 'x', to: '2026-10-21' })).toBe(0);
  });

  it('inRange รวมปลายทั้งสองด้าน', () => {
    const [a, b] = [y('2026-10-10'), y('2026-10-20')];
    expect([ '2026-10-09', '2026-10-10', '2026-10-15', '2026-10-20', '2026-10-21'].map((d) => inRange(y(d), a, b))).toEqual([false, true, true, true, false]);
  });

  it('parseRange: สตริงผิด → null · กลับด้านแก้ให้ถูก', () => {
    expect(parseRange(null)).toBeNull();
    expect(parseRange({ from: '2026-02-30', to: '2026-03-01' })).toBeNull();
    expect(parseRange({ from: '2026-10-28', to: '2026-10-21' })).toEqual({ from: y('2026-10-21'), to: y('2026-10-28') });
  });

  it('isSameRange', () => {
    expect(isSameRange(null, null)).toBe(true);
    expect(isSameRange({ from: 'a', to: 'b' }, { from: 'a', to: 'b' })).toBe(true);
    expect(isSameRange({ from: 'a', to: 'b' }, { from: 'a', to: 'c' })).toBe(false);
    expect(isSameRange({ from: 'a', to: 'b' }, null)).toBe(false);
  });
});

describe('calendar-range: formatRange (ปี พ.ศ. ในภาษาไทย)', () => {
  it('วันเดียว / เดือนเดียวกัน / ปีเดียวกัน / คนละปี', () => {
    expect(formatRange({ from: '2026-10-21', to: '2026-10-21' }, 'th')).toBe('21 ต.ค. 2569');
    expect(formatRange({ from: '2026-10-21', to: '2026-10-28' }, 'th')).toBe('21 – 28 ต.ค. 2569');
    expect(formatRange({ from: '2026-10-21', to: '2026-11-03' }, 'th')).toBe('21 ต.ค. – 3 พ.ย. 2569');
    expect(formatRange({ from: '2025-12-28', to: '2026-01-03' }, 'th')).toBe('28 ธ.ค. 2568 – 3 ม.ค. 2569');
  });
  it('อังกฤษใช้ ค.ศ.', () => {
    expect(formatRange({ from: '2026-10-21', to: '2026-10-28' }, 'en')).toBe('21 – 28 Oct 2026');
    expect(formatRange({ from: '2025-12-28', to: '2026-01-03' }, 'en')).toBe('28 Dec 2025 – 3 Jan 2026');
  });
  it('กลับด้านก็จัดให้ถูก · ผิดรูปแบบ = ว่าง', () => {
    expect(formatRange({ from: '2026-10-28', to: '2026-10-21' }, 'th')).toBe('21 – 28 ต.ค. 2569');
    expect(formatRange({ from: 'x', to: 'y' }, 'th')).toBe('');
  });
});

describe('calendar-range: rangePresets', () => {
  const today = y('2026-10-21');
  const p = Object.fromEntries(rangePresets(today).map((x) => [x.key, x.range]));
  it('N วันที่ผ่านมานับรวมวันนี้', () => {
    expect(p.today).toEqual({ from: '2026-10-21', to: '2026-10-21' });
    expect(p.last7).toEqual({ from: '2026-10-15', to: '2026-10-21' });
    expect(rangeLength(p.last30)).toBe(30);
    expect(rangeLength(p.last90)).toBe(90);
    expect(p.last90.from).toBe('2026-07-24');
  });
  it('เดือนนี้ = 1 ถึงวันนี้ · เดือนก่อน = ทั้งเดือน', () => {
    expect(p.thisMonth).toEqual({ from: '2026-10-01', to: '2026-10-21' });
    expect(p.lastMonth).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });
  it('มกราคม → เดือนก่อนคือธันวาคมปีก่อน · มีนาคมปีอธิกสุรทิน → กุมภาพันธ์ 29 วัน', () => {
    expect(Object.fromEntries(rangePresets(y('2027-01-05')).map((x) => [x.key, x.range])).lastMonth).toEqual({ from: '2026-12-01', to: '2026-12-31' });
    expect(Object.fromEntries(rangePresets(y('2024-03-10')).map((x) => [x.key, x.range])).lastMonth).toEqual({ from: '2024-02-01', to: '2024-02-29' });
  });
});

describe('calendar-range: clampRange / isSelectable', () => {
  const b = { min: y('2026-10-05'), max: y('2026-10-25') };
  it('clampRange ตัดตามขอบเขต · นอกขอบเขตหมด = null', () => {
    expect(clampRange({ from: '2026-10-01', to: '2026-10-30' }, b)).toEqual({ from: '2026-10-05', to: '2026-10-25' });
    expect(clampRange({ from: '2026-10-10', to: '2026-10-12' }, b)).toEqual({ from: '2026-10-10', to: '2026-10-12' });
    expect(clampRange({ from: '2026-09-01', to: '2026-09-30' }, b)).toBeNull();
    expect(clampRange({ from: '2026-11-01', to: '2026-11-30' }, b)).toBeNull();
    expect(clampRange({ from: 'x', to: 'y' }, b)).toBeNull();
  });
  it('isSelectable: นอก min/max เลือกไม่ได้', () => {
    expect(isSelectable(y('2026-10-04'), null, b)).toBe(false);
    expect(isSelectable(y('2026-10-05'), null, b)).toBe(true);
    expect(isSelectable(y('2026-10-25'), null, b)).toBe(true);
    expect(isSelectable(y('2026-10-26'), null, b)).toBe(false);
  });
  it('isSelectable: maxDays จำกัดเฉพาะตอนเลือกวันจบ (ทั้งสองทิศ นับรวมวันเริ่ม)', () => {
    const lim = { maxDays: 7 };
    expect(isSelectable(y('2026-10-01'), null, lim)).toBe(true); // ยังไม่มีวันเริ่ม ไม่จำกัด
    const a = y('2026-10-10');
    expect(isSelectable(y('2026-10-16'), a, lim)).toBe(true); // 7 วันพอดี
    expect(isSelectable(y('2026-10-17'), a, lim)).toBe(false); // 8 วัน
    expect(isSelectable(y('2026-10-04'), a, lim)).toBe(true); // ย้อนหลัง 7 วันพอดี
    expect(isSelectable(y('2026-10-03'), a, lim)).toBe(false);
  });
});

describe('calendar-range: pickDay (คลิกแรก = วันเริ่ม · คลิกสอง = วันจบ)', () => {
  const b = {};
  it('สองคลิก → ได้ช่วง · ไม่มี anchor ค้าง', () => {
    const s1 = pickDay(null, y('2026-10-10'), b);
    expect(s1).toEqual({ anchor: y('2026-10-10'), range: null });
    const s2 = pickDay(s1.anchor, y('2026-10-15'), b);
    expect(s2).toEqual({ anchor: null, range: { from: '2026-10-10', to: '2026-10-15' } });
  });
  it('คลิกวันจบก่อนวันเริ่ม → สลับให้เอง', () => {
    expect(pickDay(y('2026-10-15'), y('2026-10-10'), b).range).toEqual({ from: '2026-10-10', to: '2026-10-15' });
  });
  it('คลิกวันเดิมสองครั้ง = ช่วงวันเดียว', () => {
    expect(pickDay(y('2026-10-10'), y('2026-10-10'), b).range).toEqual({ from: '2026-10-10', to: '2026-10-10' });
  });
  it('คลิกวันที่เลือกไม่ได้ → ไม่เปลี่ยนสถานะ (anchor คงเดิม ไม่ปิด)', () => {
    const bb = { max: y('2026-10-20'), maxDays: 5 };
    expect(pickDay(null, y('2026-10-25'), bb)).toEqual({ anchor: null, range: null });
    expect(pickDay(y('2026-10-10'), y('2026-10-19'), bb)).toEqual({ anchor: y('2026-10-10'), range: null }); // ยาวเกิน 5 วัน
  });
});

describe('calendar-range: displayRange (ช่วงที่วาดพื้นสี)', () => {
  const value = { from: y('2026-10-01'), to: y('2026-10-05') };
  it('ไม่ได้กำลังเลือก → ใช้ค่าที่เลือกไว้', () => expect(displayRange(null, y('2026-10-20'), value)).toEqual(value));
  it('กำลังเลือก (มี anchor) → anchor ถึงวันที่ชี้ ไม่แสดงช่วงเดิม', () => {
    expect(displayRange(y('2026-10-10'), y('2026-10-14'), value)).toEqual({ from: y('2026-10-10'), to: y('2026-10-14') });
    expect(displayRange(y('2026-10-10'), y('2026-10-06'), value)).toEqual({ from: y('2026-10-06'), to: y('2026-10-10') });
    expect(displayRange(y('2026-10-10'), null, value)).toEqual({ from: y('2026-10-10'), to: y('2026-10-10') });
  });
  it('ไม่มีทั้งสองอย่าง → null', () => expect(displayRange(null, null, null)).toBeNull());
});
