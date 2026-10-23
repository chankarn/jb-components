/** ตรรกะล้วนของ TagInput และแถบโหลด (แยกจาก .tsx เพื่อให้ vitest ทดสอบได้) */

/** เทียบแท็กซ้ำแบบไม่สนตัวพิมพ์/ช่องว่างหัวท้าย/ช่องว่างซ้อน */
export const tagKey = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

/** แยกข้อความ (พิมพ์หรือวาง) เป็นแท็ก ตามตัวคั่น (ค่าตั้งต้น: comma, comma ไทย/จีน, ขึ้นบรรทัด, tab, ;) · ตัดช่องว่าง · ทิ้งค่าว่าง */
export function splitTags(text: string, separators: readonly string[] = [',', '，', '、', ';', '\n', '\t']): string[] {
  let parts = [text];
  for (const sep of separators) parts = parts.flatMap((p) => p.split(sep));
  return parts.map((p) => p.trim().replace(/\s+/g, ' ')).filter(Boolean);
}

export type AddResult = {
  /** รายการใหม่ทั้งหมด */
  tags: string[];
  added: string[];
  /** แท็กเดิมที่ซ้ำ (คืนเป็นค่าที่มีอยู่แล้ว เพื่อให้ UI สั่นชิปตัวนั้น) */
  duplicates: string[];
  invalid: string[];
  /** ตกเพราะเกินจำนวน */
  overflow: string[];
};

/**
 * เพิ่มแท็กหลายอันทีเดียว ตามลำดับ
 * - ซ้ำกับของเดิมหรือซ้ำกันเองในชุดที่วาง → ไม่เพิ่ม · ไม่ผ่าน `validate` → invalid · ยาวเกิน `maxLength` → invalid
 * - เกิน `max` → overflow (ที่ยังเหลือที่ก็เพิ่มไป)
 * - `transform` แปลงก่อนเช็ก (เช่น ตัดเครื่องหมาย # หรือเป็นตัวเล็ก)
 */
export function addTags(
  current: readonly string[],
  incoming: readonly string[],
  { max, maxLength, validate, transform }: { max?: number; maxLength?: number; validate?: (t: string) => boolean; transform?: (t: string) => string } = {},
): AddResult {
  const tags = [...current];
  const seen = new Map(current.map((t) => [tagKey(t), t]));
  const r: AddResult = { tags, added: [], duplicates: [], invalid: [], overflow: [] };
  for (const raw of incoming) {
    const t = (transform ? transform(raw) : raw).trim().replace(/\s+/g, ' ');
    if (!t) continue;
    const key = tagKey(t);
    const dup = seen.get(key);
    if (dup !== undefined) { if (!r.duplicates.includes(dup)) r.duplicates.push(dup); continue; }
    if ((maxLength != null && t.length > maxLength) || (validate && !validate(t))) { r.invalid.push(t); continue; }
    if (max != null && tags.length >= max) { r.overflow.push(t); continue; }
    tags.push(t);
    seen.set(key, t);
    r.added.push(t);
  }
  return r;
}

/**
 * แถบโหลดด้านบน (แบบ NProgress): ยังไม่รู้ว่าเหลือเท่าไร → ค่อยๆ คืบเข้าหา ~94% ช้าลงเรื่อยๆ ไม่ถึง 100 จนกว่าจะเสร็จจริง
 * ยิ่งใกล้ยิ่งคืบน้อย (ระยะที่เหลือ × อัตรา) และมีขั้นต่ำกันนิ่งสนิท
 */
export function trickle(p: number, rate = 0.08, ceiling = 0.94): number {
  if (p >= ceiling) return p;
  return Math.min(ceiling, p + Math.max(0.004, (ceiling - p) * rate));
}
