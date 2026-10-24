/**
 * ปุ่มลัดข้ามระบบ (macOS ↔ Windows/Linux) — ฟังก์ชันล้วน ทดสอบได้
 * เขียนปุ่มลัดครั้งเดียวด้วย `mod` (= ⌘ บน Mac · Ctrl ที่อื่น) เช่น 'mod+S', 'mod+shift+P'
 */

type NavLike = { platform?: string; userAgent?: string; userAgentData?: { platform?: string } };

/** เป็นเครื่อง Apple (Mac/iPhone/iPad) หรือไม่ · ใช้ userAgentData ก่อน (navigator.platform เลิกใช้แล้ว) */
export function detectMac(nav?: NavLike): boolean {
  if (!nav) return false;
  const p = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(p);
}

/**
 * กดปุ่ม "mod" อยู่หรือไม่ ตามระบบ: Mac = ⌘ (ไม่นับ Ctrl — Ctrl+K บน Mac คือ "ลบถึงท้ายบรรทัด" ในช่องพิมพ์)
 * · Windows/Linux = Ctrl (ไม่นับปุ่ม Windows) · กด Alt ร่วม = ไม่นับ (Ctrl+Alt คือ AltGr บนคีย์บอร์ดยุโรป)
 */
export function isModEvent(e: { metaKey: boolean; ctrlKey: boolean; altKey: boolean }, mac: boolean): boolean {
  if (e.altKey) return false;
  return mac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}

const MAC: Record<string, string> = { mod: '⌘', cmd: '⌘', meta: '⌘', ctrl: '⌃', shift: '⇧', alt: '⌥', option: '⌥', enter: '↵', return: '↵', del: '⌫', backspace: '⌫', delete: '⌦', esc: 'esc', escape: 'esc', tab: '⇥', up: '↑', down: '↓', left: '←', right: '→', space: 'Space' };
const WIN: Record<string, string> = { mod: 'Ctrl', cmd: 'Ctrl', meta: 'Win', ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt', option: 'Alt', enter: 'Enter', return: 'Enter', del: 'Backspace', backspace: 'Backspace', delete: 'Del', esc: 'Esc', escape: 'Esc', tab: 'Tab', up: '↑', down: '↓', left: '←', right: '→', space: 'Space' };

/** แยกปุ่มลัดเป็นรายปุ่มตามระบบ: 'mod+shift+p' → Mac ['⌘','⇧','P'] · Windows ['Ctrl','Shift','P'] (รับรูปแบบเก่า '⌘S' ด้วย) */
export function shortcutKeys(shortcut: string, mac: boolean): string[] {
  let s = shortcut.trim();
  if (s.startsWith('⌘')) s = `mod+${s.slice(1)}`;
  const parts = s === '+' ? ['+'] : s.split('+').map((p) => p.trim()).filter(Boolean);
  const map = mac ? MAC : WIN;
  return parts.map((p) => map[p.toLowerCase()] ?? (p.length === 1 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1)));
}

/** ข้อความปุ่มลัดตามระบบ: Mac "⌘⇧P" (ติดกันแบบเมนู macOS) · Windows "Ctrl+Shift+P" */
export function formatShortcut(shortcut: string, mac: boolean): string {
  const keys = shortcutKeys(shortcut, mac);
  return mac ? keys.join('') : keys.join('+');
}

/** ค่า aria-keyshortcuts ตามมาตรฐาน (ชื่อปุ่มแบบ KeyboardEvent.key): 'mod+K' → Mac "Meta+K" · Windows "Control+K" */
export function ariaShortcut(shortcut: string, mac: boolean): string {
  return shortcut.split('+').map((p) => {
    const k = p.trim().toLowerCase();
    if (k === 'mod') return mac ? 'Meta' : 'Control';
    if (k === 'ctrl') return 'Control';
    if (k === 'cmd' || k === 'meta') return 'Meta';
    if (k === 'shift') return 'Shift';
    if (k === 'alt' || k === 'option') return 'Alt';
    return p.trim().length === 1 ? p.trim().toUpperCase() : p.trim();
  }).join('+');
}
