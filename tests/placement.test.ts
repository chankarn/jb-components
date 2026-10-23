import { describe, it, expect } from 'vitest';
import { originFor, place } from '@/lib/placement';

const vp = { width: 1000, height: 800 };
const anchor = { top: 100, left: 400, width: 100, height: 40 }; // กลาง x = 450
const floating = { width: 200, height: 120 };

describe('placement: place', () => {
  it('ด้านล่างกึ่งกลาง (ค่าตั้งต้น) · ลูกศรชี้กลางตัวยึด', () => {
    expect(place({ anchor, floating, viewport: vp })).toEqual({ top: 148, left: 350, side: 'bottom', arrow: 100, available: 800 - 140 - 16 });
  });
  it('align start / end', () => {
    expect(place({ anchor, floating, viewport: vp, align: 'start' }).left).toBe(400);
    expect(place({ anchor, floating, viewport: vp, align: 'end' }).left).toBe(300);
  });
  it('ขอด้านบนแต่ที่ไม่พอ → พลิกลงล่าง', () => {
    const p = place({ anchor, floating, viewport: vp, side: 'top' });
    expect(p.side).toBe('bottom');
  });
  it('ด้านบนเมื่อมีที่พอ', () => {
    const p = place({ anchor: { ...anchor, top: 500 }, floating, viewport: vp, side: 'top' });
    expect(p).toMatchObject({ side: 'top', top: 500 - 8 - 120 });
  });
  it('ไม่พลิกถ้าฝั่งตรงข้ามแคบกว่า', () => {
    // ตัวยึดอยู่ล่างจอ: ล่างเหลือ 60 บนเหลือ 700 → พลิกขึ้น
    expect(place({ anchor: { ...anchor, top: 700 }, floating, viewport: vp }).side).toBe('top');
    // จอเตี้ยมาก ทั้งสองฝั่งไม่พอ: ล่าง 70 บน 30 → อยู่ล่างตามเดิม
    expect(place({ anchor: { ...anchor, top: 30 }, floating, viewport: { width: 1000, height: 140 } }).side).toBe('bottom');
  });
  it('เลื่อนหนีขอบจอ แต่ลูกศรยังชี้กลางตัวยึด', () => {
    const p = place({ anchor: { top: 100, left: 0, width: 40, height: 40 }, floating, viewport: vp });
    expect(p.left).toBe(8);
    expect(p.arrow).toBe(12); // กลางตัวยึด x=20 → 12 จากขอบกล่อง (ชนขั้นต่ำ arrowPadding)
    const q = place({ anchor: { top: 100, left: 960, width: 40, height: 40 }, floating, viewport: vp });
    expect(q.left).toBe(1000 - 8 - 200);
    expect(q.arrow).toBe(188);
  });
  it('กล่องกว้างกว่าจอ → ชิดขอบซ้าย', () => {
    expect(place({ anchor, floating: { width: 990, height: 50 }, viewport: vp }).left).toBe(8);
  });
  it('ขวา/ซ้าย และพลิกแนวนอน', () => {
    expect(place({ anchor, floating, viewport: vp, side: 'right' })).toMatchObject({ side: 'right', left: 508, top: 60 });
    expect(place({ anchor: { ...anchor, left: 20 }, floating, viewport: vp, side: 'left' }).side).toBe('right');
  });
  it('minSize: รายการยาวที่หดได้ ไม่พลิกถ้าที่ว่างพอขั้นต่ำ · available บอกที่ว่างฝั่งที่วาง', () => {
    const tall = { width: 200, height: 600 };
    const a = { top: 300, left: 400, width: 100, height: 40 }; // ล่างเหลือ 460 บนเหลือ 300
    expect(place({ anchor: a, floating: tall, viewport: vp }).side).toBe('bottom'); // ล่างมากกว่า ไม่พลิกอยู่แล้ว
    const b = { ...a, top: 520 }; // ล่างเหลือ 240 บนเหลือ 520
    expect(place({ anchor: b, floating: tall, viewport: vp }).side).toBe('top'); // ไม่มี minSize → พลิกหาที่มากกว่า
    const keep = place({ anchor: b, floating: tall, viewport: vp, minSize: 220 });
    expect(keep).toMatchObject({ side: 'bottom', available: 240 - 16 });
  });
  it('พลิกขึ้นแล้วกล่องสูงเกินที่ว่าง → ชิดตัวยึดด้วยความสูงที่ถูกบีบ', () => {
    const p = place({ anchor: { top: 700, left: 400, width: 100, height: 40 }, floating: { width: 200, height: 1000 }, viewport: vp });
    expect(p).toMatchObject({ side: 'top', available: 700 - 16 });
    expect(p.top).toBe(700 - 8 - 684);
  });
  it('originFor', () => {
    expect(originFor({ top: 0, left: 0, side: 'bottom', arrow: 30, available: 0 })).toBe('30px top');
    expect(originFor({ top: 0, left: 0, side: 'left', arrow: 10, available: 0 })).toBe('right 10px');
  });
});

import { firstEnabled, lastEnabled, nextEnabled, typeahead } from '@/lib/menu';

describe('menu: nextEnabled', () => {
  const dis = [false, true, false, false, true];
  it('ข้ามตัวที่ปิด · วนรอบ', () => {
    expect(nextEnabled(dis, 0, 1)).toBe(2);
    expect(nextEnabled(dis, 3, 1)).toBe(0);
    expect(nextEnabled(dis, 0, -1)).toBe(3);
  });
  it('เริ่มจาก -1', () => {
    expect(firstEnabled(dis)).toBe(0);
    expect(lastEnabled(dis)).toBe(3);
    expect(firstEnabled([true, true])).toBe(-1);
    expect(firstEnabled([])).toBe(-1);
  });
});

describe('menu: typeahead', () => {
  const labels = ['แก้ไข', 'คัดลอก', 'แชร์', 'Archive', 'ลบ', 'Apple'];
  const dis = [false, false, false, false, false, false];
  it('หาตัวถัดไปที่ขึ้นต้นด้วยตัวอักษร · ไม่สนตัวพิมพ์ · วนรอบ', () => {
    expect(typeahead(labels, dis, -1, 'a')).toBe(3);
    expect(typeahead(labels, dis, 3, 'a')).toBe(5);
    expect(typeahead(labels, dis, 5, 'A')).toBe(3);
  });
  it('ภาษาไทย · พิมพ์ซ้ำตัวเดิม = วนต่อ', () => {
    expect(typeahead(labels, dis, -1, 'แ')).toBe(0);
    expect(typeahead(labels, dis, 0, 'แแ')).toBe(2);
  });
  it('พิมพ์ต่อเป็นคำ → อยู่ที่ตัวเดิมถ้ายังตรง', () => {
    expect(typeahead(labels, dis, 0, 'แก')).toBe(0);
    expect(typeahead(labels, dis, 0, 'แช')).toBe(2);
  });
  it('ข้ามตัวที่ปิด · ไม่เจอ = -1', () => {
    expect(typeahead(labels, [false, false, false, true, false, false], -1, 'a')).toBe(5);
    expect(typeahead(labels, dis, 0, 'z')).toBe(-1);
  });
});
