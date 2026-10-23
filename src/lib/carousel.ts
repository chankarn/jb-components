/**
 * ตรรกะของ Carousel และ Marquee — ฟังก์ชันล้วน ไม่พึ่ง React/DOM (ทดสอบได้ตรงๆ)
 */

/** จำนวนสไลด์ต่อหน้าตามความกว้าง "ของกล่องเอง" (ไม่ใช่ของจอ): `{ 0: 1, 640: 2, 1024: 3 }` = กว้าง ≥ 640px เห็น 2 ใบ ฯลฯ */
export type PerView = number | Record<number, number>;

export function perViewFor(width: number, perView: PerView): number {
  if (typeof perView === 'number') return Math.max(1, Math.floor(perView));
  const steps = Object.entries(perView).map(([w, n]) => [Number(w), n] as const).sort((a, b) => a[0] - b[0]);
  let n = steps[0]?.[1] ?? 1;
  for (const [w, v] of steps) if (width >= w) n = v;
  return Math.max(1, Math.floor(n));
}

/** ตำแหน่งสุดท้ายที่เลื่อนไปได้ (สไลด์แรกของหน้าสุดท้าย) — ไม่ให้เหลือช่องว่างท้ายแถว */
export const maxIndex = (count: number, perView: number) => Math.max(0, count - perView);
export const clampIndex = (i: number, count: number, perView: number) => Math.min(Math.max(0, i), maxIndex(count, perView));

/** ความกว้างสไลด์ให้เต็มกล่องพอดี `perView` ใบ (หักช่องไฟแล้ว) */
export const slideSize = (container: number, perView: number, gap: number) => Math.max(0, (container - gap * (perView - 1)) / perView);
/** ตำแหน่ง x ของแถบสไลด์เมื่ออยู่ที่สไลด์ `index` */
export const trackOffset = (index: number, slide: number, gap: number) => -index * (slide + gap);

/**
 * ปล่อยนิ้ว/เมาส์หลังลากแล้วควรไปสไลด์ไหน
 * - ลากไกลกี่ใบก็ไปตามนั้น (ปัดเศษ) · ลากไม่ถึงครึ่งใบแต่เกิน `threshold` (สัดส่วนของใบ) หรือปัดเร็ว (velocity) = ไปใบถัดไปในทิศที่ลาก
 * - `offset` ติดลบ = ลากไปซ้าย = ไปสไลด์ถัดไป · `velocity` px/s ติดลบ = ปัดไปซ้าย
 * - ไม่เลยขอบ (ขอบมีแค่แรงยืดตอนลาก ปล่อยแล้วเด้งกลับ)
 */
export function snapTarget(o: {
  index: number; offset: number; velocity: number; slide: number; gap: number; count: number; perView: number; threshold?: number; flick?: number;
}): number {
  return clampIndex(rawSnap(o), o.count, o.perView);
}

/**
 * โหมดวนไม่รู้จบ: ตำแหน่ง "เสมือน" ไปได้ตั้งแต่ -perView ถึง count (ช่วงที่ยังมีใบสำเนาหัว/ท้ายรองรับ)
 * ปล่อยหลังลากแล้วเลยขอบไม่ติดขอบ แต่ไปต่อบนใบสำเนา แล้วค่อย normalizeLoop กลับเป็นใบจริง
 */
export function loopSnap(o: { index: number; offset: number; velocity: number; slide: number; gap: number; count: number; perView: number; threshold?: number; flick?: number }): number {
  return Math.min(o.count, Math.max(-o.perView, rawSnap(o)));
}

/** ตำแหน่งเสมือน → ใบจริง 0..count-1 (count → 0 · -1 → count-1) */
export function normalizeLoop(pos: number, count: number): number {
  return count > 0 ? ((pos % count) + count) % count : 0;
}

/** ตำแหน่งปลายทางก่อนบีบให้อยู่ในขอบ (ปัดตามระยะที่ลาก · ลากน้อยแต่ปัดเร็ว/เกิน threshold = ไปหนึ่งใบตามทิศ) */
function rawSnap(o: { index: number; offset: number; velocity: number; slide: number; gap: number; threshold?: number; flick?: number }): number {
  const step = o.slide + o.gap;
  if (step <= 0) return o.index;
  const moved = -o.offset / step;
  let target = o.index + Math.round(moved);
  if (target === o.index) {
    const threshold = o.threshold ?? 0.15;
    const flick = o.flick ?? 400;
    const dir = Math.abs(o.velocity) > flick ? -Math.sign(o.velocity) : Math.abs(moved) > threshold ? Math.sign(moved) : 0;
    target = o.index + dir;
  }
  return target;
}

/** จำนวนชุดที่ต้องวาดซ้ำให้ marquee ต่อกันเนียนไม่เห็นช่องว่าง: พอให้ยาวกว่ากล่อง + อีก 1 ชุด (อย่างน้อย 2) */
export function marqueeCopies(container: number, group: number): number {
  if (!(group > 0)) return 2;
  return Math.max(2, Math.ceil(container / group) + 1);
}

/** ระยะเวลาวนหนึ่งชุด (วินาที) ให้ความเร็วคงที่ `speed` px/s ไม่ว่าเนื้อหาจะยาวแค่ไหน */
export const marqueeDuration = (group: number, speed: number) => (group > 0 && speed > 0 ? group / speed : 0);
