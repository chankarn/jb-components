/** ตรรกะล้วนของ FileDrop (แยกจาก .tsx เพื่อให้ vitest ทดสอบได้) */

export type FileLike = { name: string; size: number; type: string };
export type Rejection = { name: string; reason: 'type' | 'size' | 'count' };

/**
 * เช็กไฟล์กับค่า accept แบบเดียวกับ <input accept>: นามสกุล (.pdf), MIME ตรงตัว (application/pdf), หรือ wildcard (image/*)
 * ไม่ระบุ accept → รับทุกไฟล์ · ไม่สนตัวพิมพ์
 */
export function matchesAccept(file: Pick<FileLike, 'name' | 'type'>, accept?: string): boolean {
  if (!accept?.trim()) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean).some((a) => {
    if (a.startsWith('.')) return name.endsWith(a);
    if (a.endsWith('/*')) return type.startsWith(a.slice(0, -1));
    return type === a;
  });
}

/** ขนาดไฟล์อ่านง่าย: 0 B · 512 B · 1.5 KB · 12 MB (ฐาน 1024 · ทศนิยมเดียวเมื่อน้อยกว่า 10) */
export function formatBytes(bytes: number): string {
  if (!(bytes > 0)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const v = bytes / 1024 ** i;
  return `${i === 0 ? v : v < 10 ? Number(v.toFixed(1)) : Math.round(v)} ${units[i]}`;
}

/**
 * แยกไฟล์ที่รับได้/ไม่ได้ ตามลำดับที่เลือกมา
 * - ผิดชนิดหรือใหญ่เกิน → ตกทีละไฟล์ (ไม่ทำให้ไฟล์อื่นตกด้วย)
 * - เกินจำนวน → รับเท่าที่ยังเหลือที่ว่าง (นับรวมไฟล์ที่มีอยู่แล้ว `existing`) ที่เหลือตก
 */
export function validateFiles<T extends FileLike>(
  files: readonly T[],
  { accept, maxSize, maxFiles, existing = 0 }: { accept?: string; maxSize?: number; maxFiles?: number; existing?: number },
): { accepted: T[]; rejected: Rejection[] } {
  const accepted: T[] = [];
  const rejected: Rejection[] = [];
  let room = maxFiles == null ? Infinity : Math.max(0, maxFiles - existing);
  for (const f of files) {
    if (!matchesAccept(f, accept)) rejected.push({ name: f.name, reason: 'type' });
    else if (maxSize != null && f.size > maxSize) rejected.push({ name: f.name, reason: 'size' });
    else if (room <= 0) rejected.push({ name: f.name, reason: 'count' });
    else { accepted.push(f); room--; }
  }
  return { accepted, rejected };
}

/** หมวดไฟล์สำหรับเลือกไอคอน */
export function fileKind(file: Pick<FileLike, 'name' | 'type'>): 'image' | 'video' | 'audio' | 'pdf' | 'sheet' | 'doc' | 'archive' | 'other' {
  const t = (file.type || '').toLowerCase();
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  if (t === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(ext)) return 'sheet';
  if (['doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'pages'].includes(ext)) return 'doc';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  return 'other';
}
