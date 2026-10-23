'use client';

import * as React from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SegmentOption<V extends string = string> = { value: V; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; 'aria-label'?: string };

const SIZE = {
  sm: { box: 'h-8 p-0.5 text-xs', item: 'px-2.5 gap-1' },
  md: { box: 'h-10 p-1 text-sm', item: 'px-2.5 gap-1.5 sm:px-3.5' },
} as const;

/**
 * SegmentedControl: ปุ่มกลุ่มเลือกได้ทีละอัน (วัน/สัปดาห์/เดือน · มุมมองตาราง/การ์ด)
 * - พื้นของตัวที่เลือกเลื่อนตามไปแบบสปริง (framer-motion layout) · ผู้ใช้ตั้งลดการเคลื่อนไหว = ย้ายทันที
 * - ARIA radiogroup: Tab เข้ากลุ่มครั้งเดียวที่ตัวที่เลือก · ← → ↑ ↓ เลื่อนและเลือก (ข้ามตัวที่ปิด) · Home/End
 * - `fullWidth` ยืดเต็มกล่อง (ช่องกว้างตามข้อความแล้วแบ่งที่เหลือ — จอแคบไม่ตัดคำก่อนจำเป็น) · ใส่ไอคอนอย่างเดียวได้ (ต้องมี `aria-label` ที่ตัวเลือก)
 */
export function SegmentedControl<V extends string>({
  options, value, onChange, size = 'md', fullWidth, label, disabled, className,
}: {
  options: SegmentOption<V>[];
  value: V;
  onChange: (v: V) => void;
  size?: keyof typeof SIZE;
  fullWidth?: boolean;
  /** ชื่อกลุ่มสำหรับ screen reader */
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const s = SIZE[size];

  function onKey(e: React.KeyboardEvent, i: number) {
    const enabled = options.map((o, k) => (o.disabled || disabled ? -1 : k)).filter((k) => k >= 0);
    if (!enabled.length) return;
    const pos = enabled.indexOf(i);
    let next: number | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next == null) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  // ตัวที่รับ Tab: ตัวที่เลือก หรือถ้าไม่มี/ปิดอยู่ ก็ตัวแรกที่กดได้
  const tabStop = (() => {
    const sel = options.findIndex((o) => o.value === value && !o.disabled);
    return sel >= 0 ? sel : options.findIndex((o) => !o.disabled);
  })();

  return (
    <LayoutGroup id={id}>
      <div
        role="radiogroup" aria-label={label} aria-disabled={disabled || undefined}
        className={cn(
          'relative items-stretch rounded-pill bg-ink/[0.06] font-semibold',
          fullWidth ? 'flex w-full' : 'inline-flex',
          s.box, disabled && 'pointer-events-none opacity-50', className,
        )}
      >
        {options.map((o, i) => {
          const active = o.value === value;
          return (
            <button
              key={o.value} ref={(el) => { refs.current[i] = el; }}
              type="button" role="radio" aria-checked={active} aria-label={o['aria-label']}
              tabIndex={i === tabStop ? 0 : -1} disabled={disabled || o.disabled}
              onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'relative flex min-w-0 items-center justify-center whitespace-nowrap rounded-pill outline-none transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-40',
                active ? 'text-ink' : 'text-ink-mute hover:text-ink',
                fullWidth && 'flex-auto', s.item,
              )}
            >
              {active && (
                <motion.span
                  layoutId="segment-pill" aria-hidden
                  className="absolute inset-0 rounded-pill bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08),0_2px_8px_-2px_rgb(0_0_0/0.12)]"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
                />
              )}
              {o.icon && <span className="relative flex shrink-0">{o.icon}</span>}
              {o.label != null && o.label !== '' && <span className="relative truncate">{o.label}</span>}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
