'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SiteLink = { href: string; label: string };

/** หา section ที่อยู่กลางจอตอนนี้ (สำหรับลิงก์แบบ #id) */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(null);
  React.useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    const top = () => { if (window.scrollY < 80) setActive(null); };
    window.addEventListener('scroll', top, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', top); };
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/**
 * SiteNav: แถบเมนูบนของเว็บหน้าบ้าน
 * - ด้านบนสุดโปร่งใส เลื่อนลงแล้วเป็นพื้นเบลอมีเงา (ลอยเป็นแคปซูลบนจอกว้าง)
 * - ลิงก์แบบ `#id` เลื่อนนุ่มไป section นั้น และมีแคปซูลไฮไลต์เลื่อนตาม section ที่กำลังอ่าน (scrollspy)
 * - จอแคบ: ปุ่ม ☰ เปิดเมนูลงมาพร้อมลิงก์ไล่โผล่ทีละอัน · เลือกลิงก์/Esc แล้วปิด
 */
export function SiteNav({ brand, links, actions, className }: {
  brand: { name: string; mark?: React.ReactNode; href?: string };
  links: SiteLink[];
  /** ปุ่มขวา เช่น เข้าสู่ระบบ / เริ่มใช้ฟรี (จอแคบย้ายไปอยู่ในเมนู) */
  actions?: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const active = useScrollSpy(links.filter((l) => l.href.startsWith('#')).map((l) => l.href.slice(1)));

  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  React.useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5', className)}>
      <div
        className={cn(
          'mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-2xl px-3 transition-[background-color,box-shadow,backdrop-filter] duration-300 sm:px-4',
          scrolled || open ? 'bg-surface/75 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25),0_0_0_1px_rgb(var(--ink)/0.06)] backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <Link href={brand.href ?? '#'} className="flex shrink-0 items-center gap-2.5 rounded-lg font-display text-lg font-semibold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_6px_16px_-6px_rgb(var(--brand-600)/0.7)]">{brand.mark ?? brand.name[0]}</span>
          {brand.name}
        </Link>

        <LayoutGroup id="site-nav">
          <nav aria-label="เมนูหลัก" className="mx-auto hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const on = active != null && l.href === `#${active}`;
              return (
                <a
                  key={l.href} href={l.href} aria-current={on ? 'true' : undefined}
                  className={cn('relative rounded-pill px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/50', on ? 'text-ink' : 'text-ink-soft hover:text-ink')}
                >
                  {on && <motion.span layoutId="site-nav-pill" aria-hidden className="absolute inset-0 rounded-pill bg-ink/[0.06]" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span className="relative">{l.label}</span>
                </a>
              );
            })}
          </nav>
        </LayoutGroup>

        <div className="ml-auto hidden items-center gap-2 md:flex">{actions}</div>
        <button
          type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-nav-menu" aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
          className="ml-auto grid size-10 place-items-center rounded-xl text-ink transition hover:bg-ink/[0.06] md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-nav-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="mx-auto mt-2 max-w-6xl origin-top rounded-2xl bg-surface/95 p-3 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.06)] backdrop-blur-xl md:hidden"
          >
            <motion.ul initial="h" animate="s" variants={{ h: {}, s: { transition: { staggerChildren: 0.05 } } }}>
              {links.map((l) => (
                <motion.li key={l.href} variants={{ h: { opacity: 0, x: -10 }, s: { opacity: 1, x: 0 } }}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-base font-medium text-ink transition hover:bg-ink/[0.05]">{l.label}</a>
                </motion.li>
              ))}
            </motion.ul>
            {actions && <div className="mt-2 flex flex-wrap gap-2 border-t border-ink/[0.07] pt-3 [&>*]:flex-1">{actions}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
