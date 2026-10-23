'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Collapse: กล่องยืด/หดความสูงแบบนุ่ม ใช้ห่ออะไรก็ได้ที่ต้องซ่อน/แสดง
 * - ใช้ grid-template-rows 0fr ↔ 1fr (เบราว์เซอร์คำนวณความสูงจริงเอง ไม่ต้องวัดด้วย JS · เนื้อหาเปลี่ยนขนาดระหว่างเปิดก็ไม่เพี้ยน)
 * - ตอนปิด เนื้อหาเป็น `inert` (กด Tab เข้าไม่ได้ screen reader ไม่อ่าน) แต่ยังอยู่ใน DOM (ค้นหาในหน้า/SEO เห็น · state ข้างในไม่หาย)
 */
export function Collapse({ open, children, className, ...rest }: { open: boolean; children: React.ReactNode; className?: string } & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>) {
  return (
    <div data-open={open || undefined} className={cn('collapse-panel', className)} inert={!open || undefined} {...rest}>
      <div className="collapse-inner">{children}</div>
    </div>
  );
}

export type AccordionItem = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** บรรทัดรองใต้หัวข้อ */
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type Common = {
  items: AccordionItem[];
  /** `card` = การ์ดใบเดียวมีเส้นคั่น · `separated` = แยกการ์ดทีละข้อ (ข้อที่เปิดยกขึ้น) · `flush` = ไม่มีพื้น มีแต่เส้นคั่น (วางในการ์ดอื่น) */
  variant?: 'card' | 'separated' | 'flush';
  /** ระดับหัวข้อ (h2–h6) ให้โครงหน้าถูกต้องสำหรับ screen reader */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
};
type Single = Common & {
  type?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (v: string | null) => void;
  /** กดข้อที่เปิดอยู่แล้วปิดได้ (ค่าตั้งต้น true) · false = ต้องเปิดไว้หนึ่งข้อเสมอ */
  collapsible?: boolean;
};
type Multiple = Common & {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (v: string[]) => void;
};
export type AccordionProps = Single | Multiple;

/**
 * Accordion: หัวข้อพับ/กางได้ (FAQ · หน้าตั้งค่า · รายละเอียดสินค้า)
 * - `type="single"` เปิดได้ทีละข้อ · `type="multiple"` เปิดหลายข้อพร้อมกัน · controlled หรือปล่อยให้จัดการเอง
 * - ARIA ตามแนวทาง accordion: ปุ่มหัวข้ออยู่ใน heading มี aria-expanded/aria-controls · เนื้อหาเป็น region
 * - คีย์บอร์ด: Enter/Space เปิดปิด · ↑↓ ย้ายระหว่างหัวข้อ · Home/End
 * - ยืดหดนุ่มด้วย Collapse · ลูกศรหมุน · ผู้ใช้ตั้งลดการเคลื่อนไหว = เปิดปิดทันที
 */
export function Accordion(props: AccordionProps) {
  const { items, variant = 'card', headingLevel = 3, className } = props;
  const multi = props.type === 'multiple';
  const base = React.useId();
  const headers = React.useRef<(HTMLButtonElement | null)[]>([]);

  const initial = multi ? (props.defaultValue ?? []) : props.defaultValue != null ? [props.defaultValue] : [];
  const [inner, setInner] = React.useState<string[]>(initial);
  const controlled = props.value !== undefined;
  const openIds: string[] = controlled ? (multi ? (props.value as string[]) : props.value != null ? [props.value as string] : []) : inner;

  function toggle(id: string) {
    const isOpen = openIds.includes(id);
    let next: string[];
    if (multi) next = isOpen ? openIds.filter((x) => x !== id) : [...openIds, id];
    else if (isOpen) next = (props as Single).collapsible === false ? openIds : [];
    else next = [id];
    if (!controlled) setInner(next);
    if (multi) (props as Multiple).onValueChange?.(next);
    else (props as Single).onValueChange?.(next[0] ?? null);
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    const enabled = items.map((it, k) => (it.disabled ? -1 : k)).filter((k) => k >= 0);
    const pos = enabled.indexOf(i);
    let next: number | undefined;
    if (e.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowUp') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next == null) return;
    e.preventDefault();
    headers.current[next]?.focus();
  }

  const H = `h${headingLevel}` as 'h3';
  return (
    <div
      className={cn(
        variant === 'card' && 'divide-y divide-ink/10 overflow-hidden rounded-card border border-ink/10 bg-surface',
        variant === 'flush' && 'divide-y divide-ink/10 border-y border-ink/10',
        variant === 'separated' && 'space-y-2.5',
        className,
      )}
    >
      {items.map((it, i) => {
        const open = openIds.includes(it.id);
        const hid = `${base}-h-${i}`;
        const pid = `${base}-p-${i}`;
        const locked = open && !multi && (props as Single).collapsible === false;
        return (
          <div
            key={it.id} data-open={open || undefined}
            className={cn(
                            variant === 'separated' && 'rounded-card border border-ink/10 bg-surface transition-shadow duration-300 data-[open]:shadow-card',
            )}
          >
            <H className="m-0 font-sans">
              <button
                ref={(el) => { headers.current[i] = el; }}
                id={hid} type="button" aria-expanded={open} aria-controls={pid} aria-disabled={it.disabled || locked || undefined}
                disabled={it.disabled}
                onClick={() => toggle(it.id)} onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  'flex w-full items-center gap-3 text-left outline-none transition-colors',
                  'focus-visible:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-45',
                  variant === 'flush' ? 'px-1 py-4' : 'px-5 py-4',
                  !it.disabled && 'hover:bg-ink/[0.03]',
                  variant === 'separated' && 'rounded-card',
                  locked && 'cursor-default',
                )}
              >
                {it.icon && <span className="flex shrink-0 text-brand-link">{it.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{it.title}</span>
                  {it.subtitle && <span className="mt-0.5 block text-xs text-ink-mute">{it.subtitle}</span>}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full text-ink-mute transition-[transform,background-color,color] duration-300',
                    open ? 'rotate-180 bg-brand-100 text-brand-link' : 'bg-ink/[0.05]',
                  )}
                >
                  <ChevronDown size={16} />
                </span>
              </button>
            </H>
            <Collapse open={open} id={pid} role="region" aria-labelledby={hid}>
              <div className={cn('acc-content text-sm leading-relaxed text-ink-soft', variant === 'flush' ? 'px-1 pb-4' : 'px-5 pb-5', it.icon && variant !== 'flush' && 'pl-[3.25rem]')}>
                {it.content}
              </div>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
}
