import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date | string, withTime = false) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(date);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('th-TH').format(n);
}

/** 3725 -> "1:02:05" ใช้กับ player */
export function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${m}:${pad(r)}`;
}

/** ค่าที่ใช้กับ <input type="datetime-local"> */
export function toLocalInput(d: Date | string | null | undefined) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  const off = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - off).toISOString().slice(0, 16);
}

export function daysLeft(due: Date | string | null | undefined) {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}
