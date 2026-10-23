import { describe, it, expect } from 'vitest';
import { decimals, fromRatio, keyValue, moveThumb, nearestThumb, snap, toPercent } from '@/lib/slider';
import { formatNumber, normalize, parseNumber, stepValue } from '@/lib/number-input';
import { fileKind, formatBytes, matchesAccept, validateFiles } from '@/lib/file-drop';

describe('slider', () => {
  it('decimals', () => {
    expect(decimals(1)).toBe(0);
    expect(decimals(0.25)).toBe(2);
    expect(decimals(1e-7)).toBe(7);
  });
  it('snap ลงขั้นจาก min · ไม่มีเศษลอย · ไม่เกิน max', () => {
    expect(snap(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
    expect(snap(7, 0, 100, 5)).toBe(5);
    expect(snap(8, 0, 100, 5)).toBe(10);
    expect(snap(13, 3, 100, 5)).toBe(13); // ขั้นนับจาก min = 3, 8, 13
    expect(snap(99, 0, 99, 10)).toBe(90); // 100 เกิน max → ถอยหนึ่งขั้น
    expect(snap(-5, 0, 10, 1)).toBe(0);
  });
  it('toPercent / fromRatio', () => {
    expect(toPercent(25, 0, 200)).toBe(12.5);
    expect(toPercent(5, 5, 5)).toBe(0);
    expect(fromRatio(0.333, 0, 1000, 50)).toBe(350);
    expect(fromRatio(1.4, 0, 10, 1)).toBe(10);
  });
  it('nearestThumb: ใกล้ตัวไหนเลือกตัวนั้น · ซ้อนกันให้ลากแยกออกได้', () => {
    expect(nearestThumb([20, 80], 30)).toBe(0);
    expect(nearestThumb([20, 80], 60)).toBe(1);
    expect(nearestThumb([50, 50], 70)).toBe(1);
    expect(nearestThumb([50, 50], 30)).toBe(0);
    expect(nearestThumb([50], 90)).toBe(0);
  });
  it('moveThumb ไม่ข้ามกัน · เว้นระยะ minGap', () => {
    expect(moveThumb([20, 80], 0, 90)).toEqual([80, 80]);
    expect(moveThumb([20, 80], 1, 10, 5)).toEqual([20, 25]);
    expect(moveThumb([20, 80], 0, 40)).toEqual([40, 80]);
  });
  it('keyValue', () => {
    expect(keyValue('ArrowRight', 5, 0, 100, 1)).toBe(6);
    expect(keyValue('ArrowDown', 0, 0, 100, 1)).toBe(0);
    expect(keyValue('PageUp', 5, 0, 1000, 1)).toBe(105); // 10% ของช่วง > 10 ขั้น
    expect(keyValue('ArrowLeft', 50, 0, 100, 1, true)).toBe(40);
    expect(keyValue('End', 5, 0, 100, 1)).toBe(100);
    expect(keyValue('a', 5, 0, 100, 1)).toBeNull();
  });
});

describe('number-input', () => {
  it('parseNumber: comma · เลขไทย · ลบแบบ − · ว่าง/อ่านไม่ออก = null', () => {
    expect(parseNumber('1,234.5')).toBe(1234.5);
    expect(parseNumber('๑๒๓')).toBe(123);
    expect(parseNumber('−42')).toBe(-42);
    expect(parseNumber('.5')).toBe(0.5);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('-')).toBeNull();
    expect(parseNumber('12abc')).toBeNull();
    expect(parseNumber('1.2.3')).toBeNull();
  });
  it('formatNumber', () => {
    expect(formatNumber(1234567.891, 2)).toBe('1,234,567.89');
    expect(formatNumber(1500, 0)).toBe('1,500');
    expect(formatNumber(0.125)).toBe('0.125');
    expect(formatNumber(null)).toBe('');
  });
  it('normalize: ปัดทศนิยมแล้วบีบช่วง · ไม่บังคับลงขั้น', () => {
    expect(normalize(37, { min: 0, max: 100 })).toBe(37);
    expect(normalize(1.006, { precision: 2 })).toBe(1.01);
    expect(normalize(-3, { min: 0 })).toBe(0);
  });
  it('stepValue: เริ่มจากว่าง · ไม่มีเศษลอย · ไม่เกินช่วง', () => {
    expect(stepValue(null, 1, 1)).toBe(0);
    expect(stepValue(null, 1, 1, { min: 5 })).toBe(5);
    expect(stepValue(0.1, 1, 0.2)).toBe(0.3);
    expect(stepValue(9, 1, 5, { max: 10 })).toBe(10);
    expect(stepValue(1.25, -1, 1)).toBe(0.25);
  });
});

describe('file-drop', () => {
  const f = (name: string, type: string, size = 100) => ({ name, type, size });
  it('matchesAccept: นามสกุล · MIME · wildcard · ไม่สนตัวพิมพ์', () => {
    expect(matchesAccept(f('A.PDF', ''), '.pdf')).toBe(true);
    expect(matchesAccept(f('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(f('a.png', 'image/png'), 'application/pdf, .docx')).toBe(false);
    expect(matchesAccept(f('a.bin', ''), undefined)).toBe(true);
  });
  it('formatBytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(12 * 1024 * 1024)).toBe('12 MB');
  });
  it('validateFiles: ตกทีละไฟล์ · จำนวนนับรวมที่มีอยู่', () => {
    const r = validateFiles(
      [f('a.png', 'image/png'), f('b.exe', 'application/x-msdownload'), f('c.png', 'image/png', 9e9), f('d.jpg', 'image/jpeg'), f('e.jpg', 'image/jpeg')],
      { accept: 'image/*', maxSize: 1e6, maxFiles: 3, existing: 1 },
    );
    expect(r.accepted.map((x) => x.name)).toEqual(['a.png', 'd.jpg']);
    expect(r.rejected).toEqual([{ name: 'b.exe', reason: 'type' }, { name: 'c.png', reason: 'size' }, { name: 'e.jpg', reason: 'count' }]);
  });
  it('fileKind', () => {
    expect(fileKind(f('x.jpg', 'image/jpeg'))).toBe('image');
    expect(fileKind(f('report.PDF', ''))).toBe('pdf');
    expect(fileKind(f('data.xlsx', ''))).toBe('sheet');
    expect(fileKind(f('x.zip', 'application/zip'))).toBe('archive');
    expect(fileKind(f('x', ''))).toBe('other');
  });
});
