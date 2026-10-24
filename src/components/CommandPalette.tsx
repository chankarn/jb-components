'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { CornerDownLeft, Search, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { highlightParts } from '@/lib/combobox';
import { buildCommandRows, flattenRows, type CommandEntry } from '@/lib/command';
import { useModal } from '@/components/Overlay';
import { Loader } from '@/components/Loading';
import { useIsMac, useShortcut } from '@/components/Kbd';
import { formatShortcut } from '@/lib/platform';

export type CommandItem = CommandEntry & {
  icon?: React.ReactNode;
  /** ปุ่มลัดชิดขวา เขียนแบบ 'mod+N' แล้วแสดงตามระบบ (⌘N / Ctrl+N) — แสดงอย่างเดียว ไม่ได้ผูกปุ่มให้ */
  shortcut?: string;
  onSelect: () => void;
};

/**
 * กด ⌘K บน Mac / Ctrl+K บน Windows/Linux ที่ไหนก็ได้ในหน้า → เรียก `toggle`
 * (กันเบราว์เซอร์ทำงานเดิม: Ctrl+K ของ Chrome/Edge/Firefox คือค้นในแถบที่อยู่ · บน Mac ไม่รับ Ctrl+K เพราะชนกับปุ่มลบท้ายบรรทัดของระบบ)
 */
export function useCommandHotkey(toggle: () => void) {
  useShortcut('k', () => toggle());
}

/**
 * CommandPalette: หน้าต่างค้นหา + สั่งงานจากคีย์บอร์ด (แบบ ⌘K ของ Linear/Vercel)
 * - พิมพ์ค้นข้ามทุกกลุ่ม (เมนู · การทำงาน · ข้อมูล) ไม่สนตัวพิมพ์ หลายคำต้องเจอครบ ค้นจาก keywords ได้ · ตัวอักษรที่เจอถูกไฮไลต์
 * - ↑↓ เลื่อนข้ามกลุ่ม (วนรอบ) · Enter เลือก · Esc ปิด · ชี้เมาส์เลือกได้ · แถบไฮไลต์เลื่อนตามแบบสปริง
 * - `limit` จำกัดจำนวนต่อกลุ่ม · `onQueryChange` ให้ฝั่งที่ใช้โหลดผลเพิ่มตามคำค้น (`loading` แสดงวงหมุน)
 * - ARIA: ช่องค้นหาเป็น combobox คุม listbox (aria-activedescendant) · กลุ่มเป็น role="group" มีชื่อ
 * - พฤติกรรมหน้าต่างเดียวกับ Dialog: ล็อกการเลื่อน · กัน Tab หลุด · ปิดแล้วคืนโฟกัส
 */
export function CommandPalette({
  open, onOpenChange, items, limit, placeholder = 'พิมพ์เพื่อค้นหาหรือสั่งงาน…', emptyText = 'ไม่พบผลลัพธ์', loading, onQueryChange, label = 'ค้นหาและคำสั่ง',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  limit?: Record<string, number>;
  placeholder?: string;
  emptyText?: string;
  loading?: boolean;
  onQueryChange?: (q: string) => void;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const mac = useIsMac();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const panel = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);
  useModal(open, close, panel, true);
  const uid = React.useId();
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);

  React.useEffect(() => { if (open) { setQuery(''); setActive(0); } }, [open]);
  React.useEffect(() => { onQueryChange?.(query); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = React.useMemo(() => buildCommandRows(items, query, limit), [items, query, limit]);
  const flat = React.useMemo(() => flattenRows(rows), [rows]);
  React.useEffect(() => { setActive(0); }, [query]);
  const cur = Math.min(active, Math.max(0, flat.length - 1));

  React.useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-cmd-index="${cur}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cur, open]);

  function run(item: CommandItem | undefined) {
    if (!item) return;
    close();
    // ปิดหน้าต่างก่อนแล้วค่อยทำงาน (เช่น เปลี่ยนหน้า) — โฟกัสคืนปุ่มเดิมไม่ไปตีกับหน้าใหม่
    setTimeout(() => item.onSelect(), 0);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(flat.length ? (cur + 1) % flat.length : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(flat.length ? (cur - 1 + flat.length) % flat.length : 0); }
    else if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); run(flat[cur]); }
  }

  if (!mounted) return null;
  let index = -1;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[min(14vh,120px)] sm:px-4">
          <motion.div
            aria-hidden onClick={close} className="absolute inset-0 bg-ink/40 backdrop-blur-[6px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          />
          <motion.div
            ref={panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: reduce ? { duration: 0.1 } : { type: 'spring', stiffness: 420, damping: 32 } }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.97, transition: { duration: 0.12 } }}
            className="relative flex max-h-[min(72dvh,560px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-surface outline-none shadow-[0_28px_70px_-16px_rgb(0_0_0/0.45),0_0_0_1px_rgb(var(--ink)/0.08)]"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-ink/[0.07] px-4">
              <Search aria-hidden size={18} className="shrink-0 text-ink-mute" />
              <input
                data-autofocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey}
                placeholder={placeholder} autoComplete="off" spellCheck={false}
                role="combobox" aria-expanded="true" aria-controls={`${uid}-list`} aria-autocomplete="list"
                aria-activedescendant={flat.length ? `${uid}-${cur}` : undefined}
                className="h-14 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-mute/70"
              />
              {loading && <Loader size={16} />}
              <kbd className="hidden shrink-0 rounded-md border border-ink/10 px-1.5 py-0.5 font-sans text-[11px] text-ink-mute sm:inline">esc</kbd>
            </div>

            <div ref={list} id={`${uid}-list`} role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {flat.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <span className="grid size-12 place-items-center rounded-2xl bg-ink/[0.05] text-ink-mute"><SearchX size={22} /></span>
                  <p className="text-sm font-semibold text-ink">{emptyText}</p>
                  {query && <p className="text-xs text-ink-mute">ไม่มีอะไรตรงกับ “{query}”</p>}
                </div>
              ) : (
                <LayoutGroup id={uid}>
                  {rows.map((g, gi) => (
                    <div key={g.group} role="group" aria-labelledby={`${uid}-g${gi}`} className="mb-1 last:mb-0">
                      <p id={`${uid}-g${gi}`} className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">{g.group}</p>
                      {g.items.map(({ item, ranges }) => {
                        index++;
                        const i = index;
                        const on = i === cur;
                        return (
                          <div
                            key={item.id} id={`${uid}-${i}`} data-cmd-index={i} role="option" aria-selected={on}
                            onMouseMove={() => { if (!on) setActive(i); }} onMouseDown={(e) => e.preventDefault()} onClick={() => run(item)}
                            className="relative flex cursor-pointer select-none items-center gap-3 rounded-xl px-2.5 py-2.5"
                          >
                            {on && (
                              <motion.span
                                layoutId="cmd-active" aria-hidden className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-500/15"
                                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 40 }}
                              />
                            )}
                            {item.icon && (
                              <span className={cn('relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors', on ? 'bg-surface text-brand-link shadow-card' : 'bg-ink/[0.05] text-ink-mute')}>
                                {item.icon}
                              </span>
                            )}
                            <span className="relative min-w-0 flex-1">
                              <span className="block truncate text-sm text-ink">
                                {highlightParts(item.label, ranges).map((p, k) => (p.hit ? <mark key={k} className="rounded-sm bg-transparent font-bold text-brand-link">{p.text}</mark> : <React.Fragment key={k}>{p.text}</React.Fragment>))}
                              </span>
                              {item.description && <span className="block truncate text-xs text-ink-mute">{item.description}</span>}
                            </span>
                            {item.shortcut && <kbd className="relative hidden shrink-0 font-sans text-[11px] tracking-wider text-ink-mute sm:inline">{formatShortcut(item.shortcut, mac)}</kbd>}
                            <CornerDownLeft aria-hidden size={14} className={cn('relative shrink-0 text-brand-link transition-opacity', on ? 'opacity-100' : 'opacity-0')} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </LayoutGroup>
              )}
            </div>

            <div aria-hidden className="hidden shrink-0 items-center gap-4 border-t border-ink/[0.07] bg-ink/[0.02] px-4 py-2.5 text-[11px] text-ink-mute sm:flex">
              <span className="flex items-center gap-1.5"><kbd className="rounded border border-ink/10 bg-surface px-1 font-sans">↑</kbd><kbd className="rounded border border-ink/10 bg-surface px-1 font-sans">↓</kbd>เลื่อน</span>
              <span className="flex items-center gap-1.5"><kbd className="rounded border border-ink/10 bg-surface px-1 font-sans">↵</kbd>เลือก</span>
              <span className="flex items-center gap-1.5"><kbd className="rounded border border-ink/10 bg-surface px-1 font-sans">esc</kbd>ปิด</span>
              <span className="ml-auto">{flat.length.toLocaleString()} รายการ</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
