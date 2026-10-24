'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { firstEnabled, lastEnabled, nextEnabled, typeahead } from '@/lib/menu';
import { Floating, mergeRefs, useDismiss, useFloating, type Align, type Side } from '@/components/Popover';
import { useIsMac } from '@/components/Kbd';
import { formatShortcut } from '@/lib/platform';

export type MenuEntry =
  | {
      type?: 'item';
      label: string;
      icon?: React.ReactNode;
      /** ปุ่มลัดชิดขวา เขียนแบบ 'mod+D' แล้วแสดงตามระบบ (⌘D บน Mac · Ctrl+D บน Windows) — แสดงอย่างเดียว ไม่ได้ผูกคีย์ให้ */
      shortcut?: string;
      description?: string;
      onSelect?: () => void;
      href?: string;
      danger?: boolean;
      disabled?: boolean;
    }
  | { type: 'checkbox'; label: string; icon?: React.ReactNode; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }
  | { type: 'label'; label: string }
  | { type: 'separator' };

type Focusable = Extract<MenuEntry, { label: string }> & { type?: 'item' | 'checkbox' };

/**
 * DropdownMenu: เมนูคำสั่งที่กดเปิดจากปุ่ม (… · ผู้ใช้ · ส่งออก · เลือกคอลัมน์ที่แสดง)
 * - รายการ: คำสั่ง (ไอคอน/คำอธิบาย/ปุ่มลัด/ลิงก์/สีอันตราย/ปิดใช้) · ติ๊กเลือก (`checkbox` — กดแล้วเมนูไม่ปิด) · หัวกลุ่ม · เส้นคั่น
 * - คีย์บอร์ดตาม ARIA menu button: Enter/Space/↓ เปิดแล้วโฟกัสตัวแรก · ↑ เปิดที่ตัวสุดท้าย · ↑↓ วนรอบข้ามตัวที่ปิด · Home/End
 *   · พิมพ์ตัวอักษรกระโดดไปรายการ (ภาษาไทยได้) · Esc ปิดแล้วคืนโฟกัสที่ปุ่ม · Tab ปิด
 * - ชี้เมาส์แล้วโฟกัสตาม (คีย์บอร์ด/เมาส์ใช้สลับกันได้ไม่สับสน) · ใช้ตัววางตำแหน่งกลางของ Popover (พลิกเอง ตามตอนเลื่อนหน้า)
 */
export function DropdownMenu({
  trigger, items, side = 'bottom', align = 'start', label, className,
}: {
  trigger: React.ReactElement<Record<string, unknown>>;
  items: MenuEntry[];
  side?: Side;
  align?: Align;
  /** ชื่อเมนูสำหรับ screen reader (ไม่ระบุ = ใช้ข้อความบนปุ่ม) */
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const mac = useIsMac();
  const id = React.useId();
  const anchor = React.useRef<HTMLElement | null>(null);
  const menu = React.useRef<HTMLDivElement | null>(null);
  const refs = React.useRef<(HTMLElement | null)[]>([]);
  const query = React.useRef({ text: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });
  const { setFloating, pos } = useFloating(open, anchor, { side, align, offset: 6 });

  // เฉพาะรายการที่โฟกัสได้ (เรียงตามลำดับ) — ใช้กับคีย์บอร์ด
  const focusables = items.filter((i): i is Focusable => i.type === undefined || i.type === 'item' || i.type === 'checkbox');
  const disabled = focusables.map((i) => !!i.disabled);
  const labels = focusables.map((i) => i.label);

  const close = React.useCallback((refocus = true) => {
    setOpen(false);
    setActive(-1);
    if (refocus) anchor.current?.focus({ preventScroll: true });
  }, []);
  useDismiss(open, () => close(false), [anchor, menu]);

  // โฟกัสตาม active (หลังกล่องวางตำแหน่งแล้ว ไม่งั้นหน้าเลื่อนไปหามุมจอ)
  React.useEffect(() => {
    if (open && pos && active >= 0) refs.current[active]?.focus({ preventScroll: true });
  }, [open, pos, active]);

  function openAt(which: 'first' | 'last') {
    setOpen(true);
    setActive(which === 'first' ? firstEnabled(disabled) : lastEnabled(disabled));
  }

  function select(item: Focusable) {
    if (item.disabled) return;
    if (item.type === 'checkbox') { item.onCheckedChange(!item.checked); return; }
    close();
    item.onSelect?.();
  }

  function onMenuKey(e: React.KeyboardEvent) {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); setActive((a) => nextEnabled(disabled, a, k === 'ArrowDown' ? 1 : -1)); }
    else if (k === 'Home' || k === 'PageUp') { e.preventDefault(); setActive(firstEnabled(disabled)); }
    else if (k === 'End' || k === 'PageDown') { e.preventDefault(); setActive(lastEnabled(disabled)); }
    else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (k === 'Tab') close(false);
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && k !== ' ') {
      const q = query.current;
      clearTimeout(q.timer);
      q.text += k;
      q.timer = setTimeout(() => { q.text = ''; }, 600);
      const hit = typeahead(labels, disabled, active, q.text);
      if (hit >= 0) setActive(hit);
    }
  }

  const tp = trigger.props;
  const triggerEl = React.cloneElement(trigger, {
    ref: mergeRefs(tp.ref as React.Ref<HTMLElement>, anchor),
    id: (tp.id as string) ?? `${id}-trigger`,
    'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? id : undefined,
    onClick: (e: React.MouseEvent) => {
      (tp.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      if (e.defaultPrevented) return;
      if (open) close(false); else openAt('first');
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      (tp.onKeyDown as ((e: React.KeyboardEvent) => void) | undefined)?.(e);
      if (e.key === 'ArrowDown') { e.preventDefault(); openAt('first'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); openAt('last'); }
    },
  });

  let fi = -1; // ลำดับในรายการที่โฟกัสได้ ระหว่างวาด
  return (
    <>
      {triggerEl}
      <Floating
        ref={mergeRefs(setFloating, menu)} open={open} pos={pos} duration={0.14}
        id={id} role="menu" aria-label={label} aria-labelledby={label ? undefined : ((tp.id as string) ?? `${id}-trigger`)}
        onKeyDown={onMenuKey} tabIndex={-1}
        className={cn('min-w-[12rem] max-w-[calc(100vw-16px)] rounded-xl border border-ink/10 bg-surface p-1 shadow-lift outline-none', className)}
      >
        {items.map((item, n) => {
          if (item.type === 'separator') return <div key={`s${n}`} role="separator" className="-mx-1 my-1 h-px bg-ink/10" />;
          if (item.type === 'label') return <div key={`l${n}`} role="presentation" className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">{item.label}</div>;
          const i = ++fi;
          const isActive = active === i;
          const danger = item.type !== 'checkbox' && item.danger;
          const cls = cn(
            'flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors',
            item.disabled ? 'cursor-not-allowed opacity-40' : danger ? 'text-danger-700' : 'text-ink',
            isActive && !item.disabled && (danger ? 'bg-danger-50' : 'bg-ink/[0.06]'),
          );
          const common = {
            ref: (el: HTMLElement | null) => { refs.current[i] = el; },
            tabIndex: -1,
            'aria-disabled': item.disabled || undefined,
            onPointerMove: () => { if (!item.disabled && active !== i) setActive(i); },
            onPointerLeave: () => { if (active === i) { setActive(-1); menu.current?.focus({ preventScroll: true }); } },
            className: cls,
          };
          if (item.type === 'checkbox') {
            return (
              <div
                key={n} role="menuitemcheckbox" aria-checked={item.checked} {...common}
                onClick={() => select(item)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item); } }}
              >
                <span className={cn('grid size-4 shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors', item.checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/30')}>
                  {item.checked && <Check size={11} strokeWidth={3.5} />}
                </span>
                {item.icon && <span className="flex shrink-0 text-ink-mute">{item.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </div>
            );
          }
          const body = (
            <>
              {item.icon && <span className={cn('flex shrink-0', danger ? 'text-danger-600' : 'text-ink-mute')}>{item.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.label}</span>
                {item.description && <span className="block truncate text-xs text-ink-mute">{item.description}</span>}
              </span>
              {item.shortcut && <kbd className="ml-3 shrink-0 font-sans text-xs tracking-wider text-ink-mute">{formatShortcut(item.shortcut, mac)}</kbd>}
            </>
          );
          if (item.href && !item.disabled) {
            return <Link key={n} href={item.href} role="menuitem" {...common} onClick={() => close(false)}>{body}</Link>;
          }
          return (
            <div
              key={n} role="menuitem" {...common}
              onClick={() => select(item)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item); } }}
            >
              {body}
            </div>
          );
        })}
      </Floating>
    </>
  );
}
