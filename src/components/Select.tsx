'use client';

import { useT } from '@/lib/i18n/client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Opt = { value: string; label: string; disabled?: boolean };
type Variant = 'field' | 'pill' | 'compact';

const TRIGGER: Record<Variant, string> = {
  field: 'h-12 rounded-2xl px-4 text-sm',
  pill: 'h-10 rounded-pill pl-4 pr-3 text-sm',
  compact: 'h-8 rounded-lg px-2.5 text-xs',
};

const toText = (n: React.ReactNode): string =>
  React.Children.toArray(n).map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : '')).join('');

/** อ่าน <option> ที่ส่งมาเป็น children (รองรับ array / fragment / map) ให้ใช้แทน <select> เดิมได้โดยไม่ต้องแก้หน้า */
function readOptions(children: React.ReactNode): Opt[] {
  const out: Opt[] = [];
  const walk = (nodes: React.ReactNode) =>
    React.Children.forEach(nodes, (c) => {
      if (!React.isValidElement(c)) return;
      const p = c.props as { value?: string | number; disabled?: boolean; children?: React.ReactNode };
      if (c.type === React.Fragment) return walk(p.children);
      if (c.type === 'option') out.push({ value: String(p.value ?? toText(p.children)), label: toText(p.children), disabled: p.disabled });
    });
  walk(children);
  return out;
}

type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: Variant;
  placeholder?: string;
  'aria-label'?: string;
  id?: string;
};

/**
 * กล่องเลือกแบบรายการเลื่อนลง — API เหมือน <select> เดิม (value / onChange(e.target.value) / <option> เป็น children)
 * เมนูวาดผ่าน portal จึงไม่ถูกตัดโดยตาราง/drawer ที่ overflow-hidden และพลิกขึ้นบนเองเมื่อล่างไม่พอ
 */
export function Select({ value, onChange, disabled, children, className, variant = 'field', placeholder = '—', id, ...rest }: Props) {
  const t = useT();
  const reduce = useReducedMotion();
  const options = React.useMemo(() => readOptions(children), [children]);
  const current = options.find((o) => o.value === String(value ?? ''));
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [pos, setPos] = React.useState<{ left: number; width: number; top?: number; bottom?: number; max: number } | null>(null);
  const btn = React.useRef<HTMLButtonElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const uid = React.useId();

  const place = React.useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const flip = below < 200 && above > below;
    setPos({
      left: r.left,
      width: Math.max(r.width, 160),
      max: Math.min(288, flip ? above : below),
      ...(flip ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
  }, []);

  const show = () => {
    if (disabled) return;
    place();
    setActive(Math.max(0, options.findIndex((o) => o.value === String(value ?? ''))));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    btn.current?.focus();
  };

  function pick(o: Opt) {
    if (o.disabled) return;
    setOpen(false);
    btn.current?.focus();
    if (o.value !== String(value ?? '')) onChange?.({ target: { value: o.value }, currentTarget: { value: o.value } } as unknown as React.ChangeEvent<HTMLSelectElement>);
  }

  React.useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !list.current?.contains(t)) setOpen(false);
    };
    const move = (e: Event) => {
      if (list.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', down);
    window.addEventListener('scroll', move, true);
    window.addEventListener('resize', move);
    return () => {
      document.removeEventListener('mousedown', down);
      window.removeEventListener('scroll', move, true);
      window.removeEventListener('resize', move);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function step(dir: 1 | -1) {
    if (!options.length) return;
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  }

  function onKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === 'ArrowDown') (e.preventDefault(), step(1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), step(-1));
    else if (e.key === 'Home') (e.preventDefault(), setActive(0));
    else if (e.key === 'End') (e.preventDefault(), setActive(options.length - 1));
    else if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), options[active] && pick(options[active]));
    else if (e.key === 'Escape') (e.preventDefault(), close());
    else if (e.key === 'Tab') setOpen(false);
    else if (e.key.length === 1) {
      // พิมพ์ตัวอักษรเพื่อกระโดดไปข้อที่ขึ้นต้นด้วยตัวนั้น
      const i = options.findIndex((o, n) => n > active && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      const j = i >= 0 ? i : options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (j >= 0) setActive(j);
    }
  }

  return (
    <>
      <button
        ref={btn}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? uid : undefined}
        aria-label={rest['aria-label']}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        className={cn(
          'group flex w-full min-w-0 items-center justify-between gap-2 border border-ink/15 bg-surface text-left outline-none transition',
          'hover:border-ink/30 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20',
          open && 'border-brand-500 ring-2 ring-brand-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ink/15',
          TRIGGER[variant],
          className,
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !current && 'text-ink-mute/70')}>{current?.label ?? placeholder}</span>
        <ChevronDown size={variant === 'compact' ? 14 : 16} className={cn('shrink-0 text-ink-mute transition-transform duration-200', open && 'rotate-180 text-brand-link')} />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.ul
                ref={list}
                id={uid}
                role="listbox"
                initial={reduce ? false : { opacity: 0, y: pos.bottom !== undefined ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.max }}
                className="z-[300] overflow-auto rounded-2xl border border-ink/10 bg-surface p-1.5 shadow-lift"
              >
                {options.map((o, i) => {
                  const selected = o.value === String(value ?? '');
                  return (
                    <li
                      key={o.value + i}
                      data-i={i}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={o.disabled}
                      onMouseEnter={() => !o.disabled && setActive(i)}
                      onClick={() => pick(o)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                        variant === 'compact' && 'py-1.5 text-xs',
                        i === active && 'bg-brand-50',
                        selected && 'font-semibold text-brand-link',
                        o.disabled && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      <span className="min-w-0 truncate">{o.label}</span>
                      {selected && <Check size={14} className="shrink-0" />}
                    </li>
                  );
                })}
                {options.length === 0 && <li className="px-3 py-2 text-sm text-ink-mute">{t('common.no_options')}</li>}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
