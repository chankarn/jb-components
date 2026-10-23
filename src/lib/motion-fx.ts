/**
 * เอฟเฟกต์ตอบสนองสั้นๆ ที่ใช้ร่วมกันทุกช่องกรอก (Web Animations API — ไม่ต้องมี state/คลาสใน React)
 * - shake: ใส่ค่าไม่ได้ (ผิดรูปแบบ · ซ้ำ · เกินขอบ · ครบจำนวน)
 * - pop: ยืนยันว่ารับค่าแล้ว (ขยายนิดแล้วคืน)
 * ผู้ใช้ตั้งลดการเคลื่อนไหวในระบบ → ไม่เล่น (ข้อความ/สีบอกสถานะยังอยู่ครบ)
 */

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const SHAKE: Keyframe[] = [0, -7, 7, -5, 5, -2, 0].map((x) => ({ transform: `translateX(${x}px)` }));
const POP: Keyframe[] = [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }];

export function shake(el: Element | null | undefined) {
  if (!el || reduced()) return;
  el.animate(SHAKE, { duration: 420, easing: 'ease-out' });
}

export function pop(el: Element | null | undefined) {
  if (!el || reduced()) return;
  el.animate(POP, { duration: 260, easing: 'cubic-bezier(.34, 1.56, .64, 1)' });
}
