'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export type RowMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  hidden?: boolean;
};

/** เมนู "…" ท้ายแถวตาราง รวม action หลายอันไว้ที่เดียว · portal ไป body กันโดนตารางตัดขอบ ปิดด้วย Esc / คลิกนอก / เลื่อนหน้า */
export function RowMenu({ items, label }: { items: RowMenuItem[]; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const visible = items.filter((i) => !i.hidden);

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const up = window.innerHeight - r.bottom < visible.length * 40 + 24 && r.top > window.innerHeight - r.bottom;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, right: window.innerWidth - r.right, up });
  }, [visible.length]);

  useLayoutEffect(() => { if (open) place(); }, [open, place]);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const away = () => setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', away, true);
    window.addEventListener('resize', away);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', away, true);
      window.removeEventListener('resize', away);
    };
  }, [open]);

  if (!visible.length) return null;
  const itemCls = (danger?: boolean) => cn('flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition', danger ? 'text-danger-600 hover:bg-danger-50' : 'text-ink hover:bg-ink/5');

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={btn} type="button" aria-label={label ?? t('admin.menu.actions')} aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn('flex h-9 w-9 items-center justify-center rounded-full text-ink-mute transition hover:bg-ink/8 hover:text-ink', open && 'bg-ink/8 text-ink')}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && pos && createPortal(
        <ul
          ref={menu} role="menu"
          style={{ top: pos.top, right: pos.right, transform: pos.up ? 'translateY(-100%)' : undefined }}
          className="fixed z-50 min-w-[11rem] overflow-hidden rounded-xl border border-ink/10 bg-surface py-1 shadow-lift"
        >
          {visible.map((i, n) => (
            <li key={i.label} role="none" className={cn(i.danger && n > 0 && 'mt-1 border-t border-ink/8 pt-1')}>
              {i.href ? (
                <Link role="menuitem" href={i.href} className={itemCls(i.danger)} onClick={() => setOpen(false)}>{i.icon}{i.label}</Link>
              ) : (
                <button role="menuitem" type="button" className={itemCls(i.danger)} onClick={() => { setOpen(false); i.onClick?.(); }}>{i.icon}{i.label}</button>
              )}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  );
}
