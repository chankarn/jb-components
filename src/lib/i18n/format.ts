import type { Lang } from './index';

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** แยกวัน/เดือน/ปี/เวลาตามเขตเวลาไทย ไม่ขึ้นกับ timezone ของเครื่อง server */
function bangkokParts(d: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), min: get('minute') };
}

/** TH = พ.ศ. `2 ต.ค. 2569` · EN = ค.ศ. `2 Oct 2026` (FR-L-16 ข้อ 3) */
export function formatDate(value: Date | string | number | null | undefined, lang: Lang): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const p = bangkokParts(date);
  return lang === 'th' ? `${p.d} ${TH_MONTHS[p.m - 1]} ${p.y + 543}` : `${p.d} ${EN_MONTHS[p.m - 1]} ${p.y}`;
}

export function formatDateTime(value: Date | string | number | null | undefined, lang: Lang): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const p = bangkokParts(date);
  const time = `${String(p.h).padStart(2, '0')}:${String(p.min).padStart(2, '0')}`;
  return `${formatDate(date, lang)} ${time}`;
}
