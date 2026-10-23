'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { shake } from '@/lib/motion-fx';
import { filterOptions, hasExactLabel, highlightParts, moveActive, toggleValue, type ComboOption, type Matched } from '@/lib/combobox';

export type { ComboOption };

type Variant = 'field' | 'pill' | 'compact';
const BOX: Record<Variant, string> = {
  field: 'min-h-12 rounded-2xl px-3 py-1.5 text-sm',
  pill: 'min-h-10 rounded-pill px-4 py-1 text-sm',
  compact: 'min-h-9 rounded-lg px-2.5 py-1 text-xs',
};

type Common = {
  options: ComboOption[];
  placeholder?: string;
  disabled?: boolean;
  /** แสดงปุ่ม × ล้างค่าทั้งหมดบนช่อง */
  clearable?: boolean;
  variant?: Variant;
  /** ข้อความตอนค้นไม่เจอ (ค่าตั้งต้น "ไม่มีตัวเลือก") */
  emptyText?: string;
  /** พิมพ์ข้อความที่ยังไม่มีในรายการแล้วขึ้นแถว "เพิ่ม “…”" — ฟังก์ชันนี้ต้องเพิ่มตัวเลือกใหม่ (และเลือกให้ถ้าต้องการ) เอง */
  onCreate?: (label: string) => void;
  className?: string;
  id?: string;
  'aria-label'?: string;
};
type Single = Common & { multiple?: false; value: string | null; onChange: (v: string | null) => void };
type Multi = Common & {
  multiple: true;
  value: string[];
  onChange: (v: string[]) => void;
  /** เลือกได้สูงสุดกี่อัน */
  maxSelected?: number;
  /** ตอนไม่ได้โฟกัสแสดงชิปแค่กี่อัน ที่เหลือเป็น "+N" (ค่าตั้งต้น 3) */
  maxVisibleChips?: number;
};
export type ComboboxProps = Single | Multi;

type Row = { kind: 'option'; m: Matched } | { kind: 'create' };

/**
 * Combobox: ค้นหา + เลือกอันเดียวหรือหลายอัน (`multiple`)
 * - พิมพ์เพื่อกรอง (ไม่สนตัวพิมพ์/เครื่องหมายกำกับ · หลายคำต้องเจอครบ · ค้นเจอจาก `keywords`/`description` ด้วย) ตัวอักษรที่ค้นเจอถูกไฮไลต์
 * - โหมดหลายอัน: เลือกแล้วเป็นชิปในช่อง กดลบทีละอันหรือ Backspace ตอนช่องค้นหาว่าง · เลือกต่อเนื่องได้โดยแผงไม่ปิด · `maxSelected` จำกัดจำนวน
 * - คีย์บอร์ด: ↑↓ เลื่อน (ข้ามตัวที่ปิดไว้) · Enter เลือก · Esc ล้างคำค้นก่อน แล้วค่อยปิด (ไม่ลามไปปิด dialog ที่ครอบอยู่) · Tab ปิด
 * - ARIA combobox/listbox ครบ (aria-activedescendant · aria-multiselectable) · วาดผ่าน portal พลิกขึ้นบนเอง ใช้ใน dialog/drawer ได้
 */
export function Combobox(props: ComboboxProps) {
  const { options, placeholder, disabled, clearable, variant = 'field', emptyText, onCreate, className, id } = props;
  const multi = props.multiple === true;
  const selected: string[] = multi ? props.value : props.value != null ? [props.value] : [];
  const maxSelected = multi ? props.maxSelected : undefined;
  const maxVisibleChips = multi ? (props.maxVisibleChips ?? 3) : 0;

  const t = useT();
  const reduce = useReducedMotion();
  const uid = React.useId();
  const box = React.useRef<HTMLDivElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLUListElement>(null);

  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(-1);
  const [blocked, setBlocked] = React.useState(false);
  const [pos, setPos] = React.useState<{ left: number; width: number; top?: number; bottom?: number; max: number } | null>(null);

  const current = !multi ? options.find((o) => o.value === props.value) : undefined;
  const rows: Row[] = React.useMemo(() => {
    const r: Row[] = filterOptions(options, query).map((m) => ({ kind: 'option', m }));
    if (onCreate && query.trim() && !hasExactLabel(options, query)) r.push({ kind: 'create' });
    return r;
  }, [options, query, onCreate]);
  const disabledFlags = React.useMemo(() => rows.map((r) => ({ disabled: r.kind === 'option' ? r.m.option.disabled : false })), [rows]);

  const place = React.useCallback(() => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const flip = below < 220 && above > below;
    setPos({
      left: Math.min(r.left, Math.max(8, window.innerWidth - Math.max(r.width, 220) - 8)),
      width: Math.max(r.width, 220),
      max: Math.min(340, flip ? above : below),
      ...(flip ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
  }, []);

  const show = React.useCallback(() => {
    if (disabled) return;
    place();
    setOpen(true);
  }, [disabled, place]);
  const closeList = React.useCallback(() => { setOpen(false); setQuery(''); }, []);

  // รายการเปลี่ยน/เปิดแผง → active ไปที่ตัวที่เลือกอยู่ (โหมดเดี่ยว ไม่มีคำค้น) หรือตัวแรกที่เลือกได้
  React.useEffect(() => {
    if (!open) return;
    const pickedIdx = !multi && !query ? rows.findIndex((r) => r.kind === 'option' && r.m.option.value === props.value) : -1;
    setActive(pickedIdx >= 0 ? pickedIdx : moveActive(disabledFlags, -1, 1));
  }, [open, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (open && active >= 0) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  React.useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const el = e.target as Node;
      if (!box.current?.contains(el) && !panel.current?.contains(el)) closeList();
    };
    const follow = () => place();
    document.addEventListener('mousedown', down);
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      document.removeEventListener('mousedown', down);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [open, place, closeList]);

  React.useEffect(() => {
    if (!blocked) return;
    const id2 = window.setTimeout(() => setBlocked(false), 1800);
    return () => window.clearTimeout(id2);
  }, [blocked]);

  function choose(row: Row | undefined) {
    if (!row) return;
    if (row.kind === 'create') {
      onCreate?.(query.trim());
      setQuery('');
      return;
    }
    const o = row.m.option;
    if (o.disabled) return;
    if (multi) {
      const r = toggleValue(selected, o.value, maxSelected);
      if (r.blocked) { setBlocked(true); shake(box.current); return; }
      if (r.next.length > selected.length) flash(o.value);
      props.onChange(r.next);
      setQuery(''); // เลือกต่อได้เลย: ล้างคำค้นให้เห็นรายการเต็ม แผงไม่ปิด
      input.current?.focus();
    } else {
      props.onChange(o.value);
      closeList();
      input.current?.focus();
    }
  }

  // ชิปที่เพิ่งเลือกเล่นวงกระเพื่อม (เหมือน TagInput)
  const [fresh, setFresh] = React.useState<string | null>(null);
  const freshTimer = React.useRef<number | undefined>(undefined);
  function flash(v: string) {
    window.clearTimeout(freshTimer.current);
    setFresh(v);
    freshTimer.current = window.setTimeout(() => setFresh(null), 750);
  }
  React.useEffect(() => () => window.clearTimeout(freshTimer.current), []);

  function removeValue(v: string) {
    if (multi) props.onChange(selected.filter((x) => x !== v));
  }
  function clearAll() {
    if (multi) props.onChange([]);
    else props.onChange(null);
    setQuery('');
    input.current?.focus();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      if (!open) { show(); return; }
      setActive((a) => moveActive(disabledFlags, a, k === 'ArrowDown' ? 1 : -1));
    } else if (k === 'Enter') {
      if (open && active >= 0) { e.preventDefault(); choose(rows[active]); }
    } else if (k === 'Escape') {
      if (open) {
        e.stopPropagation(); // ไม่ปล่อยให้ Esc ลามไปปิด dialog/drawer ที่ครอบอยู่
        e.preventDefault();
        if (query) setQuery('');
        else closeList();
      }
    } else if (k === 'Backspace') {
      if (multi && !query && selected.length) removeValue(selected[selected.length - 1]);
    } else if (k === 'Tab') {
      closeList();
    }
  }

  const hasValue = selected.length > 0;
  const collapsed = multi && !focused && !open && selected.length > maxVisibleChips;
  const chipValues = collapsed ? selected.slice(0, maxVisibleChips) : selected;
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const compact = variant === 'compact';

  return (
    <>
      <div
        ref={box} data-combobox
        onMouseDown={(e) => {
          if (disabled) return;
          if ((e.target as HTMLElement).closest('button')) return; // ปุ่มลบชิป/ล้าง/ลูกศร จัดการเอง
          e.preventDefault(); // ไม่ให้ช่องค้นหาเสียโฟกัสตอนคลิกบนพื้นที่ว่างของกล่อง
          input.current?.focus();
          if (!open) show();
        }}
        className={cn(
          'flex w-full min-w-0 cursor-text items-center gap-1.5 border border-ink/15 bg-surface transition',
          'hover:border-ink/30 focus-within:border-brand-500 focus-within:shadow-glow',
          open && 'border-brand-500 shadow-glow',
          disabled && 'cursor-not-allowed opacity-50 hover:border-ink/15',
          BOX[variant],
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
          {multi && chipValues.map((v) => (
            <motion.span
              key={v} layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, filter: 'blur(3px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3, filter: 'blur(3px)', transition: { duration: 0.16 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 26, mass: 0.7 }}
              className={cn('tag-chip relative inline-flex max-w-[12rem] items-center gap-0.5 rounded-lg bg-brand-50 py-0.5 pl-2 pr-0.5 text-xs font-semibold text-brand-link', compact && 'py-0')}
            >
              {fresh === v && !reduce && <span aria-hidden className="tag-ripple pointer-events-none absolute inset-0 rounded-[inherit]" />}
              <span className="truncate">{labelOf(v)}</span>
              {!disabled && (
                <button type="button" tabIndex={-1} aria-label={t('combobox.remove', { name: labelOf(v) })} onClick={() => removeValue(v)}
                  className="flex size-4 shrink-0 items-center justify-center rounded-md transition hover:bg-brand-100">
                  <X size={11} strokeWidth={2.5} />
                </button>
              )}
            </motion.span>
          ))}
          </AnimatePresence>
          {collapsed && <span className="inline-flex items-center rounded-lg bg-ink/[.06] px-2 py-0.5 text-xs font-semibold text-ink-soft">+{selected.length - maxVisibleChips}</span>}
          <input
            ref={input} id={id} type="text" disabled={disabled} autoComplete="off" spellCheck={false}
            role="combobox" aria-expanded={open} aria-controls={open ? `${uid}-list` : undefined} aria-autocomplete="list" aria-haspopup="listbox"
            aria-activedescendant={open && active >= 0 ? `${uid}-opt-${active}` : undefined} aria-label={props['aria-label']}
            value={open || multi ? query : (current?.label ?? '')}
            placeholder={multi ? (hasValue ? '' : (placeholder ?? t('combobox.placeholder'))) : (current ? '' : (placeholder ?? t('combobox.placeholder')))}
            onChange={(e) => { setQuery(e.target.value); if (!open) show(); }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKey}
            className={cn('min-w-[5rem] flex-1 bg-transparent py-1 outline-none placeholder:text-ink-mute/70 disabled:cursor-not-allowed', !multi && !open && current && 'truncate')}
          />
        </div>
        {clearable && hasValue && !disabled && (
          <button type="button" tabIndex={-1} aria-label={t('combobox.clear_all')} onClick={clearAll} className="shrink-0 rounded-full p-1 text-ink-mute transition hover:bg-ink/5 hover:text-ink">
            <X size={compact ? 12 : 14} />
          </button>
        )}
        <button type="button" tabIndex={-1} aria-hidden disabled={disabled} onClick={() => { if (open) closeList(); else { input.current?.focus(); show(); } }} className="shrink-0 rounded-full p-0.5">
          <ChevronDown size={compact ? 14 : 16} className={cn('text-ink-mute transition-transform duration-200', open && 'rotate-180 text-brand-link')} />
        </button>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div data-floating
                ref={panel}
                initial={reduce ? false : { opacity: 0, y: pos.bottom !== undefined ? 6 : -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.max }}
                className="z-[300] flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-lift"
              >
                <ul ref={list} id={`${uid}-list`} role="listbox" aria-multiselectable={multi || undefined} className="min-h-0 flex-1 overflow-auto p-1.5">
                  {rows.map((row, i) => {
                    if (row.kind === 'create') {
                      return (
                        <li key="__create" id={`${uid}-opt-${i}`} data-i={i} role="option" aria-selected={false}
                          onMouseMove={() => active !== i && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(row)}
                          className={cn('flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-link transition-colors', compact && 'py-1.5 text-xs', i === active && 'bg-brand-50')}>
                          <Plus size={14} className="shrink-0" />
                          <span className="min-w-0 truncate">{t('combobox.create', { q: query.trim() })}</span>
                        </li>
                      );
                    }
                    const o = row.m.option;
                    const isSel = selected.includes(o.value);
                    return (
                      <li
                        key={o.value} id={`${uid}-opt-${i}`} data-i={i} role="option" aria-selected={isSel} aria-disabled={o.disabled || undefined}
                        onMouseMove={() => !o.disabled && active !== i && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(row)}
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                          compact && 'py-1.5 text-xs',
                          i === active && 'bg-brand-50',
                          isSel && !multi && 'font-semibold text-brand-link',
                          o.disabled && 'cursor-not-allowed opacity-40',
                        )}
                      >
                        {multi && (
                          <span aria-hidden className={cn('flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors', isSel ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/25')}>
                            {isSel && <Check size={11} strokeWidth={3.5} />}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">
                            {highlightParts(o.label, row.m.ranges).map((p, k) => p.hit
                              ? <mark key={k} className="bg-transparent font-extrabold text-brand-link">{p.text}</mark>
                              : <React.Fragment key={k}>{p.text}</React.Fragment>)}
                          </span>
                          {o.description && <span className="block truncate text-xs font-normal text-ink-mute">{o.description}</span>}
                        </span>
                        {!multi && isSel && <Check size={14} className="shrink-0" />}
                      </li>
                    );
                  })}
                  {rows.length === 0 && <li role="presentation" className="px-3 py-2 text-sm text-ink-mute">{emptyText ?? t('common.no_options')}</li>}
                </ul>
                {multi && (selected.length > 0 || maxSelected) && (
                  <div className="flex items-center justify-between gap-2 border-t border-ink/8 px-3 py-2 text-xs" aria-live="polite">
                    <span className={cn('text-ink-mute transition-colors', blocked && 'font-semibold text-warn-700')}>
                      {blocked && maxSelected ? t('combobox.max', { n: maxSelected }) : maxSelected ? `${selected.length}/${maxSelected}` : t('combobox.selected', { n: selected.length })}
                    </span>
                    {selected.length > 0 && (
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearAll} className="rounded-full px-2.5 py-1 font-semibold text-ink-mute transition hover:bg-ink/5 hover:text-ink">{t('combobox.clear_all')}</button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
