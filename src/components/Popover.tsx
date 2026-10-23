'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { originFor, place, type Align, type Placement, type Side } from '@/lib/placement';

export type { Side, Align };

/* ─────────────────────────────────────────────────────────────
 * ตัวกลางของกล่องลอยทุกชนิด (Popover · Tooltip · DropdownMenu)
 * - วางตำแหน่งด้วย lib/placement (พลิกฝั่งเมื่อที่ไม่พอ · เลื่อนหนีขอบจอ · ลูกศรชี้กลางตัวยึดเสมอ)
 * - portal ไป body (ไม่โดน overflow ของตาราง/การ์ดตัด) · position: fixed · ตามตัวยึดตอนเลื่อนหน้า/ย่อจอ/ขนาดเปลี่ยน
 * - กล่องทุกตัวติด data-floating → คลิกในกล่องซ้อน (เมนูใน popover) ไม่นับเป็น "คลิกนอก" ของกล่องแม่
 * ───────────────────────────────────────────────────────────── */

type FloatOpts = { side?: Side; align?: Align; offset?: number; padding?: number };

/** ติดตามตำแหน่งกล่องลอยเทียบกับตัวยึด ขณะเปิดอยู่ */
export function useFloating(open: boolean, anchor: React.RefObject<HTMLElement | null>, { side = 'bottom', align = 'center', offset = 8, padding = 8 }: FloatOpts = {}) {
  const floating = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<Placement | null>(null);

  const update = React.useCallback(() => {
    const a = anchor.current;
    const f = floating.current;
    if (!a || !f) return;
    const r = a.getBoundingClientRect();
    const next = place({
      anchor: { top: r.top, left: r.left, width: r.width, height: r.height },
      floating: { width: f.offsetWidth, height: f.offsetHeight },
      viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
      side, align, offset, padding,
    });
    setPos((p) => (p && p.top === next.top && p.left === next.left && p.side === next.side && p.arrow === next.arrow ? p : next));
  }, [anchor, side, align, offset, padding]);

  // ref callback: กล่อง mount เมื่อไหร่วัดทันที (ก่อน paint) — ไม่เห็นกล่องกระโดดจากมุมจอ
  const setFloating = React.useCallback((el: HTMLDivElement | null) => {
    floating.current = el;
    if (el) update();
  }, [update]);

  React.useLayoutEffect(() => {
    // ปิดแล้วคงตำแหน่งเดิมไว้ ให้อนิเมชันตอนปิดเล่นอยู่ที่เดิม (เปิดใหม่ ref callback วัดใหม่ก่อน paint)
    if (!open) return;
    update();
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    if (anchor.current) ro.observe(anchor.current);
    if (floating.current) ro.observe(floating.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [open, update, anchor]);

  return { setFloating, pos, update };
}

/** ปิดเมื่อกดนอกตัวยึด/กล่อง (ไม่นับกล่องลอยซ้อนข้างใน) */
export function useDismiss(open: boolean, onClose: () => void, refs: React.RefObject<HTMLElement | null>[]) {
  const close = React.useRef(onClose);
  close.current = onClose;
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent | MouseEvent) => {
      const t = e.target as Node;
      if (refs.some((r) => r.current?.contains(t))) return;
      if (t instanceof Element && t.closest('[data-floating]')) return;
      close.current();
    };
    // mousedown ด้วย: บางสภาพแวดล้อมยิงแค่ mousedown ไม่มี pointerdown
    document.addEventListener('pointerdown', down);
    document.addEventListener('mousedown', down);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('mousedown', down); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

/** รวม ref หลายตัว (ref ของผู้ใช้ที่ติดมากับ trigger + ref ของเราเอง) */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (el: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el);
      else if (r) (r as React.MutableRefObject<T | null>).current = el;
    }
  };
}

const ARROW_SIDE: Record<Side, string> = {
  bottom: 'bottom-full border-b-[var(--arrow-bg)] border-x-transparent border-t-0',
  top: 'top-full border-t-[var(--arrow-bg)] border-x-transparent border-b-0',
  right: 'right-full border-r-[var(--arrow-bg)] border-y-transparent border-l-0',
  left: 'left-full border-l-[var(--arrow-bg)] border-y-transparent border-r-0',
};

/**
 * กล่องลอย (portal + อนิเมชันงอกออกจากตัวยึด + ลูกศร) — ใช้ภายใน Popover/Tooltip/DropdownMenu
 * `arrowColor` = สีพื้นของกล่อง (CSS color) ให้ลูกศรสีเดียวกัน
 */
export const Floating = React.forwardRef<HTMLDivElement, {
  open: boolean;
  pos: Placement | null;
  children: React.ReactNode;
  className?: string;
  arrow?: boolean;
  arrowColor?: string;
  /** ระยะที่เลื่อนเข้ามาตอนเปิด (px) */
  travel?: number;
  duration?: number;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationEnd'>>(function Floating(
  { open, pos, children, className, arrow, arrowColor = 'rgb(var(--surface))', travel = 6, duration = 0.16, style, ...rest }, ref,
) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const side = pos?.side ?? 'bottom';
  const d = side === 'bottom' ? { y: -travel } : side === 'top' ? { y: travel } : side === 'right' ? { x: -travel } : { x: travel };
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref} data-floating data-side={side}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, ...d }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0, transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 34, mass: 0.6 } }}
          exit={{ opacity: 0, scale: reduce ? 1 : 0.97, transition: { duration: reduce ? 0 : duration * 0.75 } }}
          style={{
            position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0,
            visibility: pos ? undefined : 'hidden', transformOrigin: pos ? originFor(pos) : undefined,
            ['--arrow-bg' as string]: arrowColor, ...style,
          }}
          className={cn('z-[80]', className)}
          {...(rest as object)}
        >
          {children}
          {arrow && pos && (
            <span
              aria-hidden
              className={cn('pointer-events-none absolute size-0 border-[6px] border-solid', ARROW_SIDE[side])}
              style={side === 'top' || side === 'bottom' ? { left: pos.arrow - 6 } : { top: pos.arrow - 6 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
});

/* ── Popover ── */

type PopoverProps = {
  /** ปุ่มที่กดเปิด — ต้องเป็น element เดียวที่รับ ref ได้ (button, หรือ component ที่ส่ง ref ต่อ) */
  trigger: React.ReactElement<Record<string, unknown>>;
  /** เนื้อหา · ส่งเป็นฟังก์ชันเพื่อรับ `close` ไปผูกกับปุ่มในกล่อง */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  align?: Align;
  offset?: number;
  arrow?: boolean;
  /** ชื่อกล่องสำหรับ screen reader */
  label?: string;
  className?: string;
};

/**
 * Popover: กล่องลอยทั่วไปที่กดเปิด (ฟอร์มสั้น ตัวกรอง รายละเอียด การ์ดโปรไฟล์)
 * - controlled (`open` + `onOpenChange`) หรือปล่อยให้จัดการเอง
 * - เปิดแล้วโฟกัสย้ายเข้ากล่อง · Esc ปิดแล้วคืนโฟกัสที่ปุ่ม (ไม่ลามไปปิด dialog ที่ครอบอยู่) · กดนอกกล่องปิด · Tab ออกนอกกล่องปิด
 * - role="dialog" + aria-expanded/aria-controls ที่ปุ่ม
 */
export function Popover({ trigger, children, open: openProp, onOpenChange, side = 'bottom', align = 'center', offset = 8, arrow = true, label, className }: PopoverProps) {
  const [inner, setInner] = React.useState(false);
  const open = openProp ?? inner;
  const setOpen = React.useCallback((v: boolean) => { if (openProp === undefined) setInner(v); onOpenChange?.(v); }, [openProp, onOpenChange]);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const id = React.useId();
  const anchor = React.useRef<HTMLElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const { setFloating, pos } = useFloating(open, anchor, { side, align, offset });
  useDismiss(open, close, [anchor, panel]);

  // เปิดแล้วโฟกัสช่องแรกในกล่อง (ถ้าไม่มีก็ตัวกล่อง)
  React.useEffect(() => {
    if (!open || !pos) return;
    const p = panel.current;
    if (!p || p.contains(document.activeElement)) return;
    const first = p.querySelector<HTMLElement>('input:not([disabled]),select,textarea,button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])');
    (first ?? p).focus({ preventScroll: true });
  }, [open, pos]);

  const tp = trigger.props;
  const triggerEl = React.cloneElement(trigger, {
    ref: mergeRefs(tp.ref as React.Ref<HTMLElement>, anchor),
    'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? id : undefined,
    onClick: (e: React.MouseEvent) => { (tp.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e); if (!e.defaultPrevented) setOpen(!open); },
  });

  return (
    <>
      {triggerEl}
      <Floating
        ref={mergeRefs(setFloating, panel)} open={open} pos={pos} arrow={arrow}
        id={id} role="dialog" aria-label={label} tabIndex={-1}
        onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); anchor.current?.focus(); } }}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !panel.current?.contains(next) && !anchor.current?.contains(next) && !(next instanceof Element && next.closest('[data-floating]'))) close();
        }}
        className={cn('max-w-[calc(100vw-16px)] rounded-2xl border border-ink/10 bg-surface p-4 text-sm text-ink shadow-lift outline-none', className)}
      >
        {typeof children === 'function' ? children(close) : children}
      </Floating>
    </>
  );
}
