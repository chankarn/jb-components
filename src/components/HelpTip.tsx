'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';

/**
 * ไอคอน ? อธิบายเพิ่มเติมของช่อง · เปิดด้วยการกด/Enter/Space (ไม่พึ่ง hover จึงใช้ได้บนจอสัมผัสและคีย์บอร์ด)
 * ปิดด้วย Esc / คลิกนอกกล่อง / เลื่อนหน้า · ใช้กับข้อความอธิบายแนวคิดที่ยาวกว่าหนึ่งบรรทัด
 * ส่วนข้อจำกัดสั้นๆ ที่ต้องรู้ก่อนกรอก (หน่วย ค่าว่างหมายถึงอะไร) ให้อยู่ใต้ช่องตามเดิม
 */
export function HelpTip({ text, className }: { text: string; className?: string }) {
  const t = useT();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const btn = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 12));
    const up = window.innerHeight - r.bottom < 160 && r.top > 160;
    setPos({ top: up ? r.top - 8 : r.bottom + 8, left, up });
  }, []);

  useLayoutEffect(() => { if (open) place(); }, [open, place]);
  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => { if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    const away = () => setOpen(false);
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', away, true);
    window.addEventListener('resize', away);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', away, true);
      window.removeEventListener('resize', away);
    };
  }, [open]);

  return (
    <>
      {/* span role=button (ไม่ใช่ <button>) เพื่อไม่ให้ <label> ของช่องส่ง hover/คลิกมาที่ไอคอนแทนช่องกรอก */}
      <span
        ref={btn} role="button" tabIndex={0} aria-label={t('common.help')} aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); } }}
        className={cn('inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-mute transition hover:bg-ink/8 hover:text-brand-link focus-visible:text-brand-link', open && 'bg-brand-100 text-brand-link', className)}
      >
        <HelpCircle size={16} />
      </span>
      {open && pos && createPortal(
        <div data-floating
          ref={box} id={id} role="note"
          style={{ top: pos.top, left: pos.left, width: Math.min(320, window.innerWidth - 24), transform: pos.up ? 'translateY(-100%)' : undefined }}
          className="fixed z-[70] rounded-xl border border-ink/10 bg-surface px-3.5 py-3 text-xs font-normal leading-relaxed text-ink-soft shadow-lift"
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}
