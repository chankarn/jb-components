'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Floating, mergeRefs, useFloating, type Align, type Side } from '@/components/Popover';

// เวลาปิด tooltip ล่าสุด (ทั้งหน้า): เลื่อนจากปุ่มหนึ่งไปอีกปุ่มภายใน 300ms → เปิดทันทีไม่ต้องรอ (แบบแถบเครื่องมือของแอปทั่วไป)
let lastClosed = 0;

/**
 * Tooltip: ป้ายสั้นๆ อธิบายปุ่ม (โดยเฉพาะปุ่มไอคอน) — ข้อความยาว/มีลิงก์ใช้ Popover หรือ HelpTip แทน
 * - เปิดเมื่อชี้ค้าง (`delay` ms) หรือโฟกัสด้วยคีย์บอร์ด · ปิดเมื่อออก/Esc
 * - ชี้ต่อจากปุ่มหนึ่งไปอีกปุ่มแล้วเปิดทันที · เลื่อนเมาส์เข้าไปในป้ายได้โดยไม่ปิด (WCAG 1.4.13)
 * - จอสัมผัสไม่เปิดตอนแตะ (ไม่บังการกด) — ข้อมูลสำคัญอย่าซ่อนไว้ใน tooltip อย่างเดียว
 * - ตั้ง aria-describedby ที่ตัวยึดให้ screen reader อ่านต่อท้าย · ปุ่มไอคอนยังต้องมี aria-label ของตัวเอง
 * - ปุ่ม disabled ไม่ส่ง event เมาส์ → ครอบด้วย <span tabIndex={0}> ก่อน
 */
export function Tooltip({
  content, children, side = 'top', align = 'center', delay = 450, disabled, className,
}: {
  content: React.ReactNode;
  children: React.ReactElement<Record<string, unknown>>;
  side?: Side;
  align?: Align;
  delay?: number;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const anchor = React.useRef<HTMLElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const { setFloating, pos } = useFloating(open, anchor, { side, align, offset: 8 });

  const clear = () => clearTimeout(timer.current);
  const show = (instant = false) => {
    if (disabled) return;
    clear();
    if (instant || Date.now() - lastClosed < 300) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = (wait = 80) => {
    clear();
    timer.current = setTimeout(() => { setOpen(false); lastClosed = Date.now(); }, wait);
  };
  React.useEffect(() => clear, []);
  React.useEffect(() => { if (disabled) setOpen(false); }, [disabled]);

  React.useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); lastClosed = 0; } };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  const p = children.props;
  const call = (name: string, e: unknown) => (p[name] as ((e: unknown) => void) | undefined)?.(e);
  const child = React.cloneElement(children, {
    ref: mergeRefs(p.ref as React.Ref<HTMLElement>, anchor),
    'aria-describedby': open ? cn(p['aria-describedby'] as string, id) : p['aria-describedby'],
    onPointerEnter: (e: React.PointerEvent) => { call('onPointerEnter', e); if (e.pointerType !== 'touch') show(); },
    onPointerLeave: (e: React.PointerEvent) => { call('onPointerLeave', e); hide(); },
    onPointerDown: (e: React.PointerEvent) => { call('onPointerDown', e); clear(); setOpen(false); }, // กดปุ่มแล้วป้ายหลบ
    // โฟกัสจากคีย์บอร์ดเท่านั้น (คลิกเมาส์ก็โฟกัส แต่ไม่ควรเด้งป้ายซ้ำหลังกด)
    onFocus: (e: React.FocusEvent) => { call('onFocus', e); if ((e.target as HTMLElement).matches(':focus-visible')) show(true); },
    onBlur: (e: React.FocusEvent) => { call('onBlur', e); hide(0); },
  });

  return (
    <>
      {child}
      <Floating
        ref={setFloating} open={open} pos={pos} arrow arrowColor="rgb(var(--ink))" travel={4}
        id={id} role="tooltip"
        onPointerEnter={clear} onPointerLeave={() => hide()}
        className={cn('max-w-xs rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium leading-snug text-paper shadow-lift', className)}
      >
        {content}
      </Floating>
    </>
  );
}
