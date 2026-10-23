import { describe, it, expect } from 'vitest';
import { filterOptions, fold, hasExactLabel, highlightParts, mergeRanges, moveActive, normalizeText, toggleValue, type ComboOption } from '@/lib/combobox';

const opts = (...labels: string[]): ComboOption[] => labels.map((label) => ({ value: label, label }));
const labels = (m: ReturnType<typeof filterOptions>) => m.map((x) => x.option.label);

describe('combobox: fold / normalizeText', () => {
  it('ไม่สนตัวพิมพ์เล็ก/ใหญ่ และเครื่องหมายกำกับของอักษรละติน', () => {
    expect(normalizeText('  Café  ')).toBe('cafe');
    expect(normalizeText('ÀÉÎÕÜ')).toBe('aeiou');
  });
  it('อักษรไทยคงเดิมครบ (สระ/วรรณยุกต์ไม่ถูกตัด)', () => {
    expect(normalizeText('น้ำผึ้ง')).toBe('น้ำผึ้ง');
    expect(normalizeText('ก๋วยเตี๋ยว')).toBe('ก๋วยเตี๋ยว');
  });
  it('สระอำ (ำ) ไม่ถูกแยกเป็นสองตัว · ค้นด้วยสระอำเจอและไฮไลต์ครบ', () => {
    expect(fold('น้ำ').text).toBe('น้ำ');
    const [m] = filterOptions(opts('น้ำผึ้ง'), 'น้ำ');
    expect(m.ranges).toEqual([[0, 3]]);
  });
  it('ตัวอักษรยาวสองหน่วย (อีโมจิ) ไฮไลต์ไม่ตัดครึ่ง', () => {
    const [m] = filterOptions(opts('a😀b'), '😀');
    expect(m.ranges).toEqual([[1, 3]]);
  });
  it('แผนที่กลับไปตำแหน่งเดิมถูกต้อง แม้ตัวอักษรหนึ่งตัวแตกเป็นหลายตัว', () => {
    const { text, map } = fold('Å–B'); // Å แยกเป็น a + เครื่องหมาย (ตัดทิ้ง) · – คงไว้
    expect(text).toBe('a–b');
    expect(map).toEqual([0, 1, 2]);
    const f2 = fold('ﬁx'); // ลิเกเจอร์ ﬁ → "fi" สองตัวจากตัวเดียว
    expect(f2.text).toBe('fix');
    expect(f2.map).toEqual([0, 0, 1]);
  });
});

describe('combobox: filterOptions', () => {
  const data = opts('ผลิต', 'คลังสินค้า', 'ควบคุมคุณภาพ', 'Quality Control', 'Warehouse', 'Production', 'Cafe Bar');

  it('คำค้นว่าง/ช่องว่างล้วน → ทุกตัวเลือกตามลำดับเดิม ไม่ไฮไลต์', () => {
    expect(labels(filterOptions(data, ''))).toEqual(data.map((d) => d.label));
    expect(labels(filterOptions(data, '   '))).toEqual(data.map((d) => d.label));
    expect(filterOptions(data, '').every((m) => m.ranges.length === 0)).toBe(true);
  });

  it('ค้นภาษาไทย: ขึ้นต้นด้วย "คว" เจอควบคุมคุณภาพ · ไม่เจอ "คล"', () => {
    expect(labels(filterOptions(data, 'คว'))).toEqual(['ควบคุมคุณภาพ']);
    expect(labels(filterOptions(data, 'คล'))).toEqual(['คลังสินค้า']);
  });

  it('ไม่สนตัวพิมพ์ และเครื่องหมายกำกับ (cafe หาเจอ Café ได้)', () => {
    expect(labels(filterOptions(opts('Café Latte', 'Tea'), 'CAFE'))).toEqual(['Café Latte']);
    expect(labels(filterOptions(data, 'WARE'))).toEqual(['Warehouse']);
  });

  it('หลายคำ = ต้องเจอครบทุกคำ (ลำดับคำไม่สำคัญ)', () => {
    expect(labels(filterOptions(data, 'control quality'))).toEqual(['Quality Control']);
    expect(labels(filterOptions(data, 'quality ware'))).toEqual([]);
  });

  it('อันดับ: ขึ้นต้นก่อน → ขึ้นต้นคำกลาง → อยู่กลางคำ · เท่ากันคงลำดับเดิม', () => {
    const d = opts('Grape', 'Rape seed', 'Drape', 'Tape');
    // "ape" ... ไม่มีใครขึ้นต้น: 'Rape seed' ขึ้นต้นด้วย "ra" ไม่ใช่ ape; ทดสอบด้วย "ra"
    expect(labels(filterOptions(d, 'ra'))).toEqual(['Rape seed', 'Grape', 'Drape']);
    expect(labels(filterOptions(opts('b ca', 'ca b', 'xca'), 'ca'))).toEqual(['ca b', 'b ca', 'xca']);
  });

  it('ค้นเจอจาก keywords และ description (อันดับท้ายสุด) แต่ไม่ไฮไลต์ในชื่อ', () => {
    const d: ComboOption[] = [
      { value: 'a', label: 'สมชาย ใจดี', keywords: ['somchai', 'sc01'] },
      { value: 'b', label: 'ฝ่ายบัญชี', description: 'ดูแลโดย somchai' },
      { value: 'c', label: 'ใครสักคน' },
    ];
    const m = filterOptions(d, 'somchai');
    expect(labels(m)).toEqual(['สมชาย ใจดี', 'ฝ่ายบัญชี']);
    expect(m.every((x) => x.ranges.length === 0)).toBe(true);
  });

  it('ไฮไลต์ตำแหน่งในชื่อเดิมถูกต้อง (รวมเครื่องหมายกำกับ)', () => {
    const [m] = filterOptions(opts('Café Latte'), 'lat');
    expect(m.ranges).toEqual([[5, 8]]);
    const [t] = filterOptions(opts('ควบคุมคุณภาพ'), 'คุณ');
    expect(t.ranges).toEqual([[6, 9]]);
  });

  it('คำค้นหลายคำที่ทับกันรวมเป็นช่วงเดียว', () => {
    const [m] = filterOptions(opts('Quality Control'), 'qual ual');
    expect(m.ranges).toEqual([[0, 4]]);
  });

  it('ไม่เจอเลย → อาร์เรย์ว่าง', () => expect(filterOptions(data, 'zzzz')).toEqual([]));
});

describe('combobox: mergeRanges / highlightParts', () => {
  it('mergeRanges รวมช่วงที่ทับ/ติดกัน และเรียงให้', () => {
    expect(mergeRanges([[5, 8], [0, 2], [1, 4], [8, 9]])).toEqual([[0, 4], [5, 9]]);
    expect(mergeRanges([])).toEqual([]);
  });
  it('highlightParts แบ่งข้อความถูก', () => {
    expect(highlightParts('Warehouse', [[0, 4]])).toEqual([{ text: 'Ware', hit: true }, { text: 'house', hit: false }]);
    expect(highlightParts('Warehouse', [[2, 4], [6, 9]])).toEqual([
      { text: 'Wa', hit: false }, { text: 're', hit: true }, { text: 'ho', hit: false }, { text: 'use', hit: true },
    ]);
    expect(highlightParts('abc', [])).toEqual([{ text: 'abc', hit: false }]);
    expect(highlightParts('', [])).toEqual([{ text: '', hit: false }]);
  });
});

describe('combobox: toggleValue (เลือกหลายอัน)', () => {
  it('เพิ่ม/เอาออก', () => {
    expect(toggleValue(['a'], 'b')).toEqual({ next: ['a', 'b'], blocked: false });
    expect(toggleValue(['a', 'b'], 'a')).toEqual({ next: ['b'], blocked: false });
  });
  it('เกิน max เพิ่มไม่ได้ (blocked) แต่เอาออกได้เสมอ', () => {
    expect(toggleValue(['a', 'b'], 'c', 2)).toEqual({ next: ['a', 'b'], blocked: true });
    expect(toggleValue(['a', 'b'], 'b', 2)).toEqual({ next: ['a'], blocked: false });
    expect(toggleValue(['a'], 'b', 2)).toEqual({ next: ['a', 'b'], blocked: false });
  });
  it('max เป็น 0/undefined = ไม่จำกัด', () => {
    expect(toggleValue(['a', 'b', 'c'], 'd', 0).blocked).toBe(false);
    expect(toggleValue(['a', 'b', 'c'], 'd').blocked).toBe(false);
  });
  it('ไม่แก้อาร์เรย์เดิม', () => {
    const src = ['a'];
    toggleValue(src, 'b');
    expect(src).toEqual(['a']);
  });
});

describe('combobox: moveActive (ข้ามตัวที่ปิดไว้ วนรอบ)', () => {
  const items = [{}, { disabled: true }, {}, { disabled: true }, {}];
  it('ลง/ขึ้นข้ามตัวที่ปิด', () => {
    expect(moveActive(items, 0, 1)).toBe(2);
    expect(moveActive(items, 2, 1)).toBe(4);
    expect(moveActive(items, 4, -1)).toBe(2);
  });
  it('วนรอบสุดขอบ', () => {
    expect(moveActive(items, 4, 1)).toBe(0);
    expect(moveActive(items, 0, -1)).toBe(4);
  });
  it('เริ่มจาก -1 (ยังไม่มีตัวที่ active)', () => {
    expect(moveActive(items, -1, 1)).toBe(0);
    expect(moveActive(items, -1, -1)).toBe(4);
  });
  it('first / last ข้ามตัวที่ปิดที่ปลายทาง', () => {
    expect(moveActive([{ disabled: true }, {}, {}, { disabled: true }], 0, 'first')).toBe(1);
    expect(moveActive([{ disabled: true }, {}, {}, { disabled: true }], 0, 'last')).toBe(2);
  });
  it('ไม่มีตัวเลือก/ปิดหมด → -1', () => {
    expect(moveActive([], 0, 1)).toBe(-1);
    expect(moveActive([{ disabled: true }, { disabled: true }], -1, 1)).toBe(-1);
    expect(moveActive([{ disabled: true }], 0, 'first')).toBe(-1);
  });
});

describe('combobox: hasExactLabel', () => {
  it('ซ้ำกับตัวเลือกที่มี (ไม่สนตัวพิมพ์/ช่องว่างหัวท้าย)', () => {
    const d = opts('Warehouse', 'ผลิต');
    expect(hasExactLabel(d, ' warehouse ')).toBe(true);
    expect(hasExactLabel(d, 'ผลิต')).toBe(true);
    expect(hasExactLabel(d, 'ware')).toBe(false);
    expect(hasExactLabel(d, '')).toBe(false);
  });
});
