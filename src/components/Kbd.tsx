'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ariaShortcut, detectMac, formatShortcut, isModEvent, shortcutKeys } from '@/lib/platform';

/**
 * เป็นเครื่อง Apple หรือไม่ (รู้หลัง mount — ฝั่ง server ถือว่า Mac ไปก่อน แล้วแก้เป็นค่าจริงก่อนผู้ใช้เห็นต่างกันนาน)
 * ใช้ตัดสินใจแสดง ⌘ หรือ Ctrl และฟังปุ่มลัดให้ถูกระบบ
 */
export function useIsMac() {
  const [mac, setMac] = React.useState(true);
  React.useEffect(() => { setMac(detectMac(navigator as Navigator & { userAgentData?: { platform?: string } })); }, []);
  return mac;
}

/** ข้อความปุ่มลัดตามระบบ เช่น useShortcutLabel('mod+S') → "⌘S" / "Ctrl+S" */
export function useShortcutLabel(shortcut: string) {
  return formatShortcut(shortcut, useIsMac());
}

/**
 * ผูกปุ่มลัด 'mod+<ตัวอักษร>' ทั้งหน้า (mod = ⌘ บน Mac · Ctrl บน Windows/Linux) · ตัวอักษรไม่สนพิมพ์เล็ก/ใหญ่
 * กันเบราว์เซอร์ทำงานเดิมของปุ่มนั้น (เช่น Ctrl+S บันทึกหน้าเว็บ · Ctrl+K ค้นในแถบที่อยู่)
 */
export function useShortcut(key: string, handler: (e: KeyboardEvent) => void, enabled = true) {
  const fn = React.useRef(handler);
  fn.current = handler;
  React.useEffect(() => {
    if (!enabled) return;
    const mac = detectMac(navigator as Navigator & { userAgentData?: { platform?: string } });
    const onKey = (e: KeyboardEvent) => {
      if (isModEvent(e, mac) && !e.shiftKey && e.key.toLowerCase() === key.toLowerCase()) { e.preventDefault(); fn.current(e); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, enabled]);
}

/**
 * Kbd: แสดงปุ่มลัดเป็นปุ่มคีย์บอร์ด ตามระบบของผู้ใช้
 * - เขียนครั้งเดียว `keys="mod+K"` → Mac แสดง ⌘ K · Windows แสดง Ctrl K
 * - `variant="caps"` แยกปุ่มละกล่อง (ค่าตั้งต้น) · `"text"` เป็นข้อความเดียว (ในเมนู/tooltip)
 * - screen reader อ่านเป็นข้อความเต็ม เช่น "Ctrl+K"
 */
export function Kbd({ keys, variant = 'caps', className }: { keys: string; variant?: 'caps' | 'text'; className?: string }) {
  const mac = useIsMac();
  const label = formatShortcut(keys, mac);
  if (variant === 'text') return <kbd className={cn('font-sans tracking-wider', className)}>{label}</kbd>;
  return (
    <kbd className={cn('inline-flex items-center gap-0.5 font-sans', className)}>
      <span className="sr-only">{label}</span>
      {shortcutKeys(keys, mac).map((k, i) => (
        <span key={i} aria-hidden className="inline-grid h-5 min-w-5 place-items-center rounded-[5px] border border-ink/15 bg-surface px-1 text-[11px] font-medium leading-none text-ink-mute shadow-[0_1px_0_rgb(var(--ink)/0.12)]">
          {k}
        </span>
      ))}
    </kbd>
  );
}

/** สำหรับ aria-keyshortcuts ตามระบบ */
export function useAriaShortcut(shortcut: string) {
  return ariaShortcut(shortcut, useIsMac());
}
