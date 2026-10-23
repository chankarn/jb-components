/** ตรรกะล้วนของ Slider (แยกจาก .tsx เพื่อให้ vitest ทดสอบได้) */

/** จำนวนตำแหน่งทศนิยมของ step (0.25 → 2 · 5 → 0 · 1e-3 → 3) ใช้ปัดเศษกัน 0.1+0.2 = 0.30000000000000004 */
export function decimals(step: number): number {
  if (!Number.isFinite(step)) return 0;
  const s = String(step);
  const e = s.match(/e-(\d+)$/);
  if (e) return Number(e[1]);
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** ปัดให้ลงขั้น step นับจาก min แล้วไม่หลุดช่วง */
export function snap(v: number, min: number, max: number, step: number): number {
  if (!(step > 0)) return clamp(v, min, max);
  const n = Math.round((v - min) / step);
  const snapped = Number((min + n * step).toFixed(decimals(step)));
  // ขั้นสุดท้ายอาจเกิน max ถ้าช่วงหารด้วย step ไม่ลงตัว → ถอยลงหนึ่งขั้น
  return snapped > max ? Number((snapped - step).toFixed(decimals(step))) : Math.max(min, snapped);
}

/** ค่า → ตำแหน่ง 0..100 (%) */
export function toPercent(v: number, min: number, max: number): number {
  return max === min ? 0 : ((clamp(v, min, max) - min) / (max - min)) * 100;
}

/** ตำแหน่งบนราง (สัดส่วน 0..1) → ค่าที่ปัดแล้ว */
export function fromRatio(ratio: number, min: number, max: number, step: number): number {
  return snap(min + clamp(ratio, 0, 1) * (max - min), min, max, step);
}

/** คลิกที่รางในโหมดช่วง: เลือกปุ่มที่ใกล้กว่า · ค่าเท่ากัน (ปุ่มซ้อนกัน) → ถ้าคลิกขวากว่าให้ปุ่มบน ไม่งั้นปุ่มล่าง เพื่อให้ลากแยกออกได้เสมอ */
export function nearestThumb(values: readonly number[], v: number): number {
  if (values.length < 2) return 0;
  const [a, b] = values;
  if (a === b) return v > b ? 1 : 0;
  return Math.abs(v - a) <= Math.abs(v - b) ? 0 : 1;
}

/** ย้ายปุ่มที่ i ไปค่า v โดยไม่ข้ามปุ่มอีกตัว (ต้องห่างกันอย่างน้อย minGap) */
export function moveThumb(values: readonly number[], i: number, v: number, minGap = 0): number[] {
  const next = [...values];
  if (values.length < 2) return [v];
  next[i] = i === 0 ? Math.min(v, values[1] - minGap) : Math.max(v, values[0] + minGap);
  return next;
}

/** คีย์บอร์ดตามแนวทาง ARIA slider: ลูกศร ±step · PageUp/Down หรือ Shift+ลูกศร ก้าวใหญ่ (10 ขั้น หรือ 10% ของช่วง แล้วแต่อันไหนมากกว่า) · Home/End สุดช่วง · ไม่รู้จัก → null */
export function keyValue(key: string, v: number, min: number, max: number, step: number, shift = false): number | null {
  const big = Math.max(step * 10, snap((max - min) / 10, 0, max - min, step) || step);
  const s = shift ? big : step;
  switch (key) {
    case 'ArrowRight': case 'ArrowUp': return snap(v + s, min, max, step);
    case 'ArrowLeft': case 'ArrowDown': return snap(v - s, min, max, step);
    case 'PageUp': return snap(v + big, min, max, step);
    case 'PageDown': return snap(v - big, min, max, step);
    case 'Home': return min;
    case 'End': return max;
    default: return null;
  }
}
