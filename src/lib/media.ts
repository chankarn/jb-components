/** ตรรกะล้วนของ MediaLightbox / MediaGallery (ทดสอบได้) */

export type MediaKind = 'image' | 'video';

const VIDEO_EXT = /\.(mp4|m4v|webm|mov|ogv|ogg|mkv)(?:[?#].*)?$/i;

/**
 * รูปหรือวิดีโอ: ใช้ `type` ที่ระบุมาก่อน (เช่น MIME จากไฟล์ที่อัปโหลด 'video/mp4') ไม่งั้นดูจากนามสกุลใน URL
 * blob:/data: ที่ไม่มีนามสกุล → ดู MIME ใน data: ถ้ามี ไม่งั้นถือเป็นรูป (ควรส่ง type มาเองสำหรับไฟล์จากเครื่อง)
 */
export function mediaKind(src: string, type?: string): MediaKind {
  if (type) return type === 'video' || type.startsWith('video/') ? 'video' : 'image';
  if (src.startsWith('data:video/')) return 'video';
  return VIDEO_EXT.test(src) ? 'video' : 'image';
}

/** ความยาวคลิป: 5 → "0:05" · 75 → "1:15" · 3725 → "1:02:05" · ไม่รู้ค่า → "" */
export function formatDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return '';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

/** ตำแหน่งถัดไป/ก่อนหน้าแบบวนรอบ */
export const stepIndex = (i: number, dir: 1 | -1, count: number) => (count ? (i + dir + count) % count : 0);

/** ปัดซ้าย/ขวาพอจะเปลี่ยนรายการไหม (ระยะเกิน 25% ของความกว้าง หรือปัดเร็ว) → 1 ถัดไป · -1 ก่อนหน้า · 0 อยู่ที่เดิม */
export function swipeDirection(offsetX: number, velocityX: number, width: number): 1 | -1 | 0 {
  if (offsetX < -width * 0.25 || velocityX < -500) return 1;
  if (offsetX > width * 0.25 || velocityX > 500) return -1;
  return 0;
}
