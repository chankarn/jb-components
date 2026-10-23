'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Floating, mergeRefs, useFloating } from '@/components/Popover';
import { HelpCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';

/**
 * ไอคอน ? อธิบายเพิ่มเติมของช่อง · เปิดด้วยการกด/Enter/Space (ไม่พึ่ง hover จึงใช้ได้บนจอสัมผัสและคีย์บอร์ด)
 * ปิดด้วย Esc / คลิกนอกกล่อง (เลื่อนหน้าแล้วกล่องตามไอคอนไป ไม่ปิด) · ใช้กับข้อความอธิบายแนวคิดที่ยาวกว่าหนึ่งบรรทัด
 * ส่วนข้อจำกัดสั้นๆ ที่ต้องรู้ก่อนกรอก (หน่วย ค่าว่างหมายถึงอะไร) ให้อยู่ใต้ช่องตามเดิม
 */
export function HelpTip({ text, className }: { text: string; className?: string }) {
  const t = useT();
  const id = useId();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // ตัววางตำแหน่งกลาง: พลิกขึ้นเมื่อด้านล่างไม่พอ · เลื่อนหนีขอบจอ · ลูกศรชี้ไอคอนเสมอ · ตามไอคอนตอนเลื่อนหน้า
  const { setFloating, pos } = useFloating(open, btn, { side: 'bottom', align: 'center', offset: 8, padding: 12 });
  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => { if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <>
      {/* span role=button (ไม่ใช่ <button>) เพื่อไม่ให้ <label> ของช่องส่ง hover/คลิกมาที่ไอคอนแทนช่องกรอก */}
      <span
        ref={btn} role="button" tabIndex={0} aria-label={t('common.help')} aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); } }}
        className={cn('inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-mute outline-none transition hover:bg-ink/8 hover:text-brand-link focus-visible:text-brand-link focus-visible:ring-2 focus-visible:ring-brand-500/50', open && 'bg-brand-100 text-brand-link', className)}
      >
        <HelpCircle size={16} />
      </span>
      <Floating
        ref={mergeRefs(box, setFloating)} open={open} pos={pos} arrow
        id={id} role="note"
        style={{ width: 'min(320px, calc(100vw - 24px))' }}
        className="rounded-xl border border-ink/10 bg-surface px-3.5 py-3 text-xs font-normal leading-relaxed text-ink-soft shadow-lift"
      >
        {text}
      </Floating>
    </>
  );
}
