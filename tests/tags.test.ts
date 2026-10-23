import { describe, it, expect } from 'vitest';
import { addTags, splitTags, tagKey, trickle } from '@/lib/tags';

describe('tags: splitTags', () => {
  it('แยกตาม comma / ขึ้นบรรทัด / ; / comma ไทย · ตัดช่องว่าง · ทิ้งค่าว่าง', () => {
    expect(splitTags('react, next ,,  tailwind\nvitest;  ts、ไทย')).toEqual(['react', 'next', 'tailwind', 'vitest', 'ts', 'ไทย']);
  });
  it('ช่องว่างซ้อนกลางคำยุบเหลือหนึ่ง', () => expect(splitTags('  ความ   ปลอดภัย ')).toEqual(['ความ ปลอดภัย']));
  it('ตัวคั่นกำหนดเองได้ (เช่น เว้นวรรค)', () => expect(splitTags('a b  c', [' '])).toEqual(['a', 'b', 'c']));
});

describe('tags: addTags', () => {
  it('ซ้ำไม่สนตัวพิมพ์ → คืนค่าตัวเดิมใน duplicates', () => {
    const r = addTags(['React'], ['react', 'Next']);
    expect(r.tags).toEqual(['React', 'Next']);
    expect(r.duplicates).toEqual(['React']);
    expect(r.added).toEqual(['Next']);
  });
  it('ซ้ำกันเองในชุดที่วาง', () => expect(addTags([], ['a', 'A', 'b']).tags).toEqual(['a', 'b']));
  it('validate / maxLength → invalid', () => {
    const r = addTags([], ['ok@x.co', 'bad', 'toolongvalue@x.co'], { validate: (t) => t.includes('@'), maxLength: 10 });
    expect(r.tags).toEqual(['ok@x.co']);
    expect(r.invalid).toEqual(['bad', 'toolongvalue@x.co']);
  });
  it('max → เพิ่มเท่าที่เหลือ ที่เหลือ overflow', () => {
    const r = addTags(['a'], ['b', 'c', 'd'], { max: 3 });
    expect(r.tags).toEqual(['a', 'b', 'c']);
    expect(r.overflow).toEqual(['d']);
  });
  it('transform ก่อนเช็ก (ตัด #)', () => {
    const r = addTags(['design'], ['#Design', '#ux'], { transform: (t) => t.replace(/^#+/, '') });
    expect(r.duplicates).toEqual(['design']);
    expect(r.added).toEqual(['ux']);
  });
  it('tagKey', () => expect(tagKey('  Hello   World ')).toBe('hello world'));
});

describe('trickle', () => {
  it('คืบเข้าหาเพดานแต่ไม่ถึง · ช้าลงเมื่อใกล้', () => {
    let p = 0.1;
    const steps: number[] = [];
    for (let i = 0; i < 200; i++) { const n = trickle(p); steps.push(n - p); p = n; }
    expect(p).toBeLessThanOrEqual(0.94);
    expect(p).toBeGreaterThan(0.9);
    expect(steps[0]).toBeGreaterThan(steps[20]);
  });
  it('เกินเพดานแล้วไม่ขยับ', () => expect(trickle(0.97)).toBe(0.97));
});
