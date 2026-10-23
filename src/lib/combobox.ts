/**
 * ตรรกะของ Combobox — ฟังก์ชันล้วน ไม่พึ่ง React
 * ค้นหา (ไม่สนตัวพิมพ์เล็ก/ใหญ่ และเครื่องหมายกำกับของอักษรละติน เช่น café = cafe · อักษรไทยคงเดิมครบ) + ไฮไลต์ตัวที่ค้นเจอ
 * + สลับค่าในโหมดเลือกหลายอัน + เลื่อนตำแหน่งที่ active ข้ามตัวเลือกที่ปิดไว้
 */
export type ComboOption = {
  value: string;
  label: string;
  /** บรรทัดรองใต้ชื่อ (ค้นหาเจอด้วย แต่ไม่ไฮไลต์) */
  description?: string;
  /** คำที่ใช้ค้นหาได้เพิ่ม เช่น ชื่อเล่น/รหัส (ไม่แสดงบนหน้าจอ) */
  keywords?: string[];
  disabled?: boolean;
};

/**
 * ตัวหนังสือเทียบแบบไม่สนตัวพิมพ์/เครื่องหมายกำกับ พร้อมแผนที่กลับไปตำแหน่งในข้อความเดิม (กันไฮไลต์เพี้ยนเมื่อความยาวเปลี่ยน)
 * `map[k]` = ตำแหน่งเริ่มของตัวที่ k ในข้อความเดิม · `end[k]` = ตำแหน่งจบ (รองรับตัวอักษรที่ยาวสองหน่วย เช่น อีโมจิ)
 */
export function fold(s: string): { text: string; map: number[]; end: number[] } {
  let text = '';
  const map: number[] = [];
  const end: number[] = [];
  let i = 0;
  for (const ch of s) {
    // อักษรไทยคงเดิม: NFKD จะแยกสระอำ (ำ) เป็นนิคหิต+สระอา ทำให้ตำแหน่งไฮไลต์เพี้ยน
    // ตัวอื่น: NFKD แยกอักษรละตินที่มีเครื่องหมายกำกับ (U+0300–036F) แล้วตัดเครื่องหมายทิ้ง
    const f = /[\u0E00-\u0E7F]/.test(ch) ? ch : ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    // เก็บแผนที่ต่อ "หน่วย UTF-16" (ให้ตรงกับ indexOf/length ของข้อความ) ไม่ใช่ต่อตัวอักษร ไม่งั้นอีโมจิทำให้ตำแหน่งเยื้อง
    for (let u = 0; u < f.length; u++) { map.push(i); end.push(i + ch.length); }
    text += f;
    i += ch.length;
  }
  return { text, map, end };
}
export const normalizeText = (s: string) => fold(s).text.trim();

export type Range = [number, number]; // [เริ่ม, จบ) ในข้อความเดิม
export type Matched = { option: ComboOption; index: number; ranges: Range[] };

/**
 * กรอง + จัดอันดับตามคำค้น (หลายคำคั่นด้วยช่องว่าง: ต้องเจอครบทุกคำ)
 * อันดับ: ขึ้นต้นด้วยคำแรก → ขึ้นต้นคำใดคำหนึ่ง → มีอยู่ในชื่อ → เจอแค่ใน keywords/description (ถ้าเท่ากัน คงลำดับเดิม)
 * คำค้นว่าง = ทุกตัวเลือก ตามลำดับเดิม ไม่ไฮไลต์
 */
export function filterOptions(options: ComboOption[], query: string): Matched[] {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return options.map((option, index) => ({ option, index, ranges: [] }));

  const out: (Matched & { score: number })[] = [];
  options.forEach((option, index) => {
    const label = fold(option.label);
    const extra = normalizeText([...(option.keywords ?? []), option.description ?? ''].join(' '));
    const ranges: Range[] = [];
    let score = 0;
    for (let t = 0; t < tokens.length; t++) {
      const tok = tokens[t];
      const at = label.text.indexOf(tok);
      let part: number;
      if (at >= 0) {
        ranges.push([label.map[at], label.end[at + tok.length - 1]]);
        const wordStart = at === 0 || /[\s\-_/.,()]/.test(label.text[at - 1]);
        part = at === 0 && t === 0 ? 0 : wordStart ? 1 : 2;
      } else if (extra.includes(tok)) part = 3; // เจอแค่ใน keywords/description
      else return; // มีคำที่ไม่เจอเลย → ไม่ผ่าน
      score = Math.max(score, part);
    }
    out.push({ option, index, ranges: mergeRanges(ranges), score });
  });
  return out.sort((a, b) => a.score - b.score || a.index - b.index).map(({ option, index, ranges }) => ({ option, index, ranges }));
}

export function mergeRanges(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: Range[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push([r[0], r[1]]);
  }
  return out;
}

/** แบ่งข้อความเป็นช่วง ปกติ/ไฮไลต์ ตาม ranges (ranges ต้องเรียงและไม่ทับกัน — ใช้ผลของ mergeRanges) */
export function highlightParts(text: string, ranges: Range[]): { text: string; hit: boolean }[] {
  if (!ranges.length) return [{ text, hit: false }];
  const parts: { text: string; hit: boolean }[] = [];
  let pos = 0;
  for (const [a, b] of ranges) {
    if (a > pos) parts.push({ text: text.slice(pos, a), hit: false });
    parts.push({ text: text.slice(a, b), hit: true });
    pos = b;
  }
  if (pos < text.length) parts.push({ text: text.slice(pos), hit: false });
  return parts;
}

/** สลับค่าในโหมดเลือกหลายอัน · เกิน `max` เพิ่มไม่ได้ (blocked) แต่เอาออกได้เสมอ */
export function toggleValue(selected: string[], value: string, max?: number): { next: string[]; blocked: boolean } {
  if (selected.includes(value)) return { next: selected.filter((v) => v !== value), blocked: false };
  if (max != null && max > 0 && selected.length >= max) return { next: selected, blocked: true };
  return { next: [...selected, value], blocked: false };
}

/** ตำแหน่ง active ถัดไป ข้ามตัวที่ปิดไว้ วนรอบ · `from` = -1 เมื่อยังไม่มีตัวที่ active · ไม่มีตัวเลือกที่ใช้ได้ = -1 */
export function moveActive(items: { disabled?: boolean }[], from: number, to: 1 | -1 | 'first' | 'last'): number {
  const n = items.length;
  if (!n || items.every((i) => i.disabled)) return -1;
  if (to === 'first') return items.findIndex((i) => !i.disabled);
  if (to === 'last') return n - 1 - [...items].reverse().findIndex((i) => !i.disabled);
  let i = from < 0 ? (to === 1 ? -1 : n) : from; // ยังไม่มีตัวที่ active: ลง = เริ่มที่ตัวแรก · ขึ้น = เริ่มที่ตัวสุดท้าย
  for (let k = 0; k < n; k++) {
    i = (i + to + n) % n;
    if (!items[i].disabled) return i;
  }
  return -1;
}

/** ข้อความที่พิมพ์ซ้ำกับตัวเลือกที่มีอยู่แล้ว (ไม่สนตัวพิมพ์) — ใช้ตัดสินว่าจะเสนอ "เพิ่มใหม่" หรือไม่ */
export function hasExactLabel(options: ComboOption[], query: string): boolean {
  const q = normalizeText(query);
  return !!q && options.some((o) => normalizeText(o.label) === q);
}
