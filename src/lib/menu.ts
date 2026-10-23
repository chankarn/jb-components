/** ตรรกะล้วนของเมนู/รายการที่ใช้คีย์บอร์ด (แยกจาก .tsx เพื่อให้ vitest ทดสอบได้) */

/**
 * ตัวถัดไปที่กดได้ ตามทิศ (วนรอบ) · from = -1 กับ dir = 1 → ตัวแรก · from = -1 กับ dir = -1 → ตัวสุดท้าย
 * ไม่มีตัวที่กดได้เลย → -1
 */
export function nextEnabled(disabled: readonly boolean[], from: number, dir: 1 | -1): number {
  const n = disabled.length;
  if (!n) return -1;
  let i = from < 0 ? (dir === 1 ? -1 : n) : from;
  for (let k = 0; k < n; k++) {
    i = (i + dir + n) % n;
    if (!disabled[i]) return i;
  }
  return -1;
}

export function firstEnabled(disabled: readonly boolean[]) { return nextEnabled(disabled, -1, 1); }
export function lastEnabled(disabled: readonly boolean[]) { return nextEnabled(disabled, -1, -1); }

/**
 * พิมพ์ตัวอักษรเพื่อกระโดด (typeahead): หาตัวที่ขึ้นต้นด้วยคำที่พิมพ์ เริ่มค้นจากตัวถัดจากปัจจุบัน (วนรอบ)
 * - พิมพ์ตัวเดิมซ้ำ (เช่น "ก ก") = วนไปตัวถัดไปที่ขึ้นต้นด้วยตัวนั้น
 * - ไม่สนตัวพิมพ์ · ข้ามตัวที่ปิด · ไม่เจอ → -1
 */
export function typeahead(labels: readonly string[], disabled: readonly boolean[], current: number, query: string): number {
  const q = query.toLocaleLowerCase();
  if (!q) return -1;
  const repeated = q.length > 1 && [...q].every((c) => c === q[0]);
  const needle = repeated ? q[0] : q;
  const n = labels.length;
  // คำยาวขึ้น (พิมพ์ต่อ) → ตัวปัจจุบันยังตรงอยู่ก็อยู่ที่เดิม · ตัวเดียวหรือพิมพ์ซ้ำ → เริ่มหาจากตัวถัดไป
  const startOffset = needle.length > 1 ? 0 : 1;
  for (let k = 0; k < n; k++) {
    const i = (Math.max(current, -1) + startOffset + k + n) % n;
    if (!disabled[i] && labels[i].trim().toLocaleLowerCase().startsWith(needle)) return i;
  }
  return -1;
}
