import { describe, it, expect } from 'vitest';
import { clampIndex, marqueeCopies, marqueeDuration, maxIndex, perViewFor, slideSize, snapTarget, trackOffset } from '@/lib/carousel';

describe('carousel: perViewFor (ตามความกว้างกล่อง)', () => {
  it('ตัวเลขตรงๆ · ต่ำกว่า 1 = 1 · ปัดลง', () => {
    expect(perViewFor(999, 3)).toBe(3);
    expect(perViewFor(999, 0)).toBe(1);
    expect(perViewFor(999, 2.7)).toBe(2);
  });
  it('breakpoints: ใช้ขั้นสุดท้ายที่ความกว้างถึง · ลำดับ key ไม่สำคัญ', () => {
    const bp = { 1024: 3, 0: 1, 640: 2 };
    expect(perViewFor(320, bp)).toBe(1);
    expect(perViewFor(640, bp)).toBe(2);
    expect(perViewFor(1023, bp)).toBe(2);
    expect(perViewFor(1200, bp)).toBe(3);
  });
  it('กว้างน้อยกว่าขั้นแรก → ใช้ค่าขั้นแรก', () => expect(perViewFor(100, { 480: 2, 900: 4 })).toBe(2));
});

describe('carousel: index', () => {
  it('maxIndex ไม่ให้เหลือช่องว่างท้ายแถว', () => {
    expect(maxIndex(5, 1)).toBe(4);
    expect(maxIndex(5, 3)).toBe(2);
    expect(maxIndex(2, 3)).toBe(0);
  });
  it('clampIndex', () => {
    expect(clampIndex(-1, 5, 1)).toBe(0);
    expect(clampIndex(9, 5, 2)).toBe(3);
    expect(clampIndex(2, 5, 2)).toBe(2);
  });
});

describe('carousel: ขนาด/ตำแหน่ง', () => {
  it('slideSize หักช่องไฟ: 3 ใบใน 1000px ช่องไฟ 20 = 320', () => expect(slideSize(1000, 3, 20)).toBe(320));
  it('trackOffset', () => {
    expect(trackOffset(0, 320, 20)).toBe(-0);
    expect(trackOffset(2, 320, 20)).toBe(-680);
  });
});

describe('carousel: snapTarget (ปล่อยหลังลาก)', () => {
  const base = { index: 2, slide: 300, gap: 20, count: 6, perView: 1, velocity: 0 };
  it('ลากน้อยมาก (ไม่ถึง threshold) และช้า → อยู่ที่เดิม', () => expect(snapTarget({ ...base, offset: -20 })).toBe(2));
  it('ลากเกิน threshold ไปซ้าย → ใบถัดไป · ไปขวา → ใบก่อน', () => {
    expect(snapTarget({ ...base, offset: -80 })).toBe(3);
    expect(snapTarget({ ...base, offset: 80 })).toBe(1);
  });
  it('ปัดเร็ว (flick) แม้ลากสั้น → ไปตามทิศที่ปัด', () => {
    expect(snapTarget({ ...base, offset: -10, velocity: -900 })).toBe(3);
    expect(snapTarget({ ...base, offset: 10, velocity: 900 })).toBe(1);
  });
  it('ลากไกลหลายใบ → ไปตามจำนวนใบ (ปัดเศษ)', () => {
    expect(snapTarget({ ...base, offset: -650 })).toBe(4); // ~2.03 ใบ
    expect(snapTarget({ ...base, offset: 500 })).toBe(0); // ~1.56 → 2 ใบ
  });
  it('ไม่เลยขอบ', () => {
    expect(snapTarget({ ...base, index: 5, offset: -400, velocity: -2000 })).toBe(5);
    expect(snapTarget({ ...base, index: 0, offset: 400 })).toBe(0);
    expect(snapTarget({ ...base, index: 3, perView: 3, offset: -400 })).toBe(3); // max = 3
  });
  it('ขนาดเป็น 0 (ยังไม่วัด) → ไม่พัง', () => expect(snapTarget({ ...base, slide: 0, gap: 0, offset: -100 })).toBe(2));
});

describe('marquee', () => {
  it('marqueeCopies: ยาวพอเต็มกล่อง + 1 ชุด · อย่างน้อย 2', () => {
    expect(marqueeCopies(1000, 600)).toBe(3);
    expect(marqueeCopies(1000, 1200)).toBe(2);
    expect(marqueeCopies(1000, 200)).toBe(6);
    expect(marqueeCopies(1000, 0)).toBe(2);
  });
  it('marqueeDuration: ความเร็วคงที่ px/s', () => {
    expect(marqueeDuration(1200, 60)).toBe(20);
    expect(marqueeDuration(0, 60)).toBe(0);
    expect(marqueeDuration(500, 0)).toBe(0);
  });
});

import { loopSnap, normalizeLoop } from '@/lib/carousel';

describe('carousel: วนไม่รู้จบ', () => {
  const base = { slide: 300, gap: 20, count: 5, perView: 1, velocity: 0 };
  it('loopSnap เลยใบสุดท้ายไปใบสำเนาได้ (ไม่ติดขอบ) แต่ไม่เกินช่วงที่มีสำเนา', () => {
    expect(loopSnap({ ...base, index: 4, offset: -80 })).toBe(5);
    expect(loopSnap({ ...base, index: 0, offset: 80 })).toBe(-1);
    expect(loopSnap({ ...base, index: 4, offset: -2000 })).toBe(5);
    expect(loopSnap({ ...base, index: 0, offset: 2000 })).toBe(-1);
    expect(loopSnap({ ...base, index: 1, perView: 3, offset: 2000 })).toBe(-3);
  });
  it('normalizeLoop', () => {
    expect(normalizeLoop(5, 5)).toBe(0);
    expect(normalizeLoop(-1, 5)).toBe(4);
    expect(normalizeLoop(-3, 5)).toBe(2);
    expect(normalizeLoop(2, 5)).toBe(2);
    expect(normalizeLoop(3, 0)).toBe(0);
  });
});
