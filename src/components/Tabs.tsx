'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type TabItem<T extends string = string> = {
  key: T;
  label: string;
  /** ตัวเลขท้ายชื่อแท็บ (เช่น จำนวนรายการ) · undefined = ไม่แสดง */
  count?: number | string;
};

type Box = { left: number; width: number };

/**
 * แท็บแบบเส้นใต้ + แถบ hover เลื่อนตาม (สไตล์ Vercel จาก 21st.dev ปรับให้เข้ากับโปรเจกต์)
 * - controlled: `value` / `onChange` · ใช้สี brand/ink ตามธีมทั้งสว่างและมืด
 * - เข้าถึงได้: role=tablist/tab · ลูกศรซ้ายขวา Home End เลื่อนโฟกัสและเลือก · Tab ไปแค่แท็บที่เลือก
 * - ชื่อแท็บยาวเกินจอ: เลื่อนแนวนอนได้ · วัดตำแหน่งใหม่เมื่อขนาดหรือฟอนต์เปลี่ยน
 */
export function Tabs<T extends string>({
  items, value, onChange, 'aria-label': ariaLabel, className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  'aria-label'?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hover, setHover] = useState<string | null>(null);
  const [active, setActive] = useState<Box | null>(null);
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback((key: string | null): Box | null => {
    const el = key ? refs.current[key] : null;
    return el ? { left: el.offsetLeft, width: el.offsetWidth } : null;
  }, []);

  const sig = items.map((i) => `${i.key}:${i.label}:${i.count ?? ''}`).join('|');
  useLayoutEffect(() => { setActive(measure(value)); }, [value, sig, measure]);
  useLayoutEffect(() => { setHoverBox(measure(hover)); }, [hover, sig, measure]);
  // เปิดแอนิเมชันหลังวัดครั้งแรก ไม่งั้นเส้นใต้จะไถมาจากซ้ายตอนโหลดหน้า
  useEffect(() => { const id = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(id); }, []);
  useEffect(() => {
    const remeasure = () => { setActive(measure(value)); setHoverBox(measure(hover)); };
    const ro = typeof ResizeObserver !== 'undefined' && wrap.current ? new ResizeObserver(remeasure) : null;
    if (ro && wrap.current) ro.observe(wrap.current);
    void document.fonts?.ready.then(remeasure);
    return () => ro?.disconnect();
  }, [value, hover, measure]);
  // เลื่อนแท็บที่เลือกให้อยู่ในมุมมอง (กรณีแถบเลื่อนได้)
  useEffect(() => { refs.current[value]?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [value]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const last = items.length - 1;
    const to = e.key === 'ArrowRight' ? (index + 1 > last ? 0 : index + 1) : e.key === 'ArrowLeft' ? (index - 1 < 0 ? last : index - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (to < 0) return;
    e.preventDefault();
    const k = items[to].key;
    onChange(k);
    refs.current[k]?.focus();
  }

  const motion = ready ? 'transition-all duration-300 ease-out' : '';
  return (
    <div className={cn('no-scrollbar overflow-x-auto', className)}>
      <div ref={wrap} role="tablist" aria-label={ariaLabel} className="relative flex min-w-max items-center gap-1.5 border-b border-ink/10 pb-1.5">
        {/* แถบ hover */}
        <span aria-hidden className={cn('pointer-events-none absolute top-0 h-9 rounded-lg bg-ink/[.06]', motion)}
          style={{ left: hoverBox?.left ?? 0, width: hoverBox?.width ?? 0, opacity: hoverBox ? 1 : 0 }} />
        {/* เส้นใต้แท็บที่เลือก */}
        <span aria-hidden className={cn('pointer-events-none absolute -bottom-px h-0.5 rounded-full bg-brand-600', motion)}
          style={{ left: active?.left ?? 0, width: active?.width ?? 0, opacity: active ? 1 : 0 }} />
        {items.map((it, i) => {
          const on = it.key === value;
          return (
            <button
              key={it.key} ref={(el) => { refs.current[it.key] = el; }} type="button" role="tab"
              aria-selected={on} tabIndex={on ? 0 : -1}
              onClick={() => onChange(it.key)} onKeyDown={(e) => onKeyDown(e, i)}
              onMouseEnter={() => setHover(it.key)} onMouseLeave={() => setHover(null)}
              onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setHover(it.key); }} onBlur={() => setHover(null)}
              className={cn(
                'relative flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-semibold outline-none transition-colors duration-300',
                'focus-visible:ring-2 focus-visible:ring-brand-500/40',
                on ? 'text-ink' : 'text-ink-mute hover:text-ink',
              )}
            >
              {it.label}
              {it.count !== undefined && <span className={cn('text-xs font-medium tabular-nums', on ? 'text-brand-link' : 'text-ink-mute')}>{it.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
