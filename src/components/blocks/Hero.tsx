'use client';

import * as React from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sparkPath } from '@/lib/chart-math';
import { Avatar } from '@/components/Avatar';

export type HeroChip = { icon?: React.ReactNode; label: string; value?: string; className?: string };

/**
 * Hero: ส่วนแรกของหน้า — พื้นหลังแสง aurora ลอยช้าๆ + ตารางเส้นจาง · หัวข้อโผล่ทีละบรรทัด · ภาพหลักพร้อมชิปลอยรอบๆ
 * - `layout="center"`: ข้อความกลางจอ ภาพหลักอยู่ล่าง เอียงอยู่แล้วตั้งตรงเมื่อเลื่อนลง (perspective ตามการเลื่อน)
 * - `layout="split"`: ข้อความซ้าย ภาพหลักขวา เอียงตามเมาส์แบบ 3 มิติ
 * - `title` เป็นอาร์เรย์บรรทัด (ภาษาไทยไม่มีเว้นวรรคระหว่างคำ ตัดบรรทัดเองให้สวย) · `highlight` = ข้อความในบรรทัดที่เป็นสีไล่
 */
export function Hero({
  layout = 'center', badge, title, highlight, description, actions, trust, visual, chips = [], className,
}: {
  layout?: 'center' | 'split';
  badge?: { label: string; tag?: string; href?: string };
  title: string[];
  highlight?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** แถบความน่าเชื่อถือใต้ปุ่ม เช่น รูปผู้ใช้ + คะแนน */
  trust?: { avatars?: string[]; rating?: number; text: string };
  /** ภาพหลัก (ค่าตั้งต้น: ProductMock) */
  visual?: React.ReactNode;
  /** ชิปลอยรอบภาพหลัก (สูงสุด 4) */
  chips?: HeroChip[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const center = layout === 'center';
  const visualRef = React.useRef<HTMLDivElement>(null);

  // center: ภาพเอียง 18° แล้วค่อยตั้งตรงตามการเลื่อน
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ['start end', 'center center'] });
  const tilt = useSpring(useTransform(scrollYProgress, [0, 1], [18, 0]), { stiffness: 120, damping: 24 });
  const lift = useSpring(useTransform(scrollYProgress, [0, 1], [0.92, 1]), { stiffness: 120, damping: 24 });

  // split: เอียงตามเมาส์
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (center || reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  }

  const lineVar = { hidden: { y: '110%' }, show: { y: '0%', transition: { type: 'spring' as const, stiffness: 90, damping: 18 } } };
  const fade = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, type: 'spring' as const, stiffness: 110, damping: 20 } });

  const text = (
    <div className={cn('relative z-10', center ? 'mx-auto max-w-3xl text-center' : 'max-w-xl')}>
      {badge && (
        <motion.a
          href={badge.href ?? '#'} {...fade(0)}
          className="group inline-flex items-center gap-2 rounded-pill bg-surface/80 py-1 pl-1 pr-3 text-xs font-medium text-ink-soft shadow-[0_0_0_1px_rgb(var(--ink)/0.08)] backdrop-blur transition hover:shadow-[0_0_0_1px_rgb(var(--brand-500)/0.4)]"
        >
          {badge.tag && <span className="rounded-pill bg-gradient-to-r from-brand-500 to-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">{badge.tag}</span>}
          {badge.label}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </motion.a>
      )}
      <motion.h1
        initial={reduce ? undefined : 'hidden'} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        className="mt-6 text-balance font-display text-[clamp(1.85rem,8.3vw,2.6rem)] font-semibold leading-[1.15] tracking-tight text-ink sm:text-6xl sm:leading-[1.08] lg:text-[4.2rem]"
      >
        {title.map((line, i) => {
          const parts = highlight && line.includes(highlight) ? line.split(highlight) : null;
          return (
            <span key={i} className="block overflow-hidden pb-[0.12em]">
              <motion.span variants={reduce ? undefined : lineVar} className="block">
                {parts ? <>{parts[0]}<span className="text-shimmer">{highlight}</span>{parts[1]}</> : line}
              </motion.span>
            </span>
          );
        })}
      </motion.h1>
      {description && <motion.p {...fade(0.45)} className={cn('mt-6 text-pretty text-lg leading-relaxed text-ink-mute sm:text-xl', center && 'mx-auto max-w-2xl')}>{description}</motion.p>}
      {actions && <motion.div {...fade(0.6)} className={cn('mt-9 flex flex-wrap gap-3', center && 'justify-center')}>{actions}</motion.div>}
      {trust && (
        <motion.div {...fade(0.75)} className={cn('mt-8 flex items-center gap-3 text-sm text-ink-mute', center && 'justify-center')}>
          {trust.avatars && (
            <span className="flex -space-x-2">
              {trust.avatars.map((n, i) => <Avatar key={n} name={n} seed={i + 2} size={30} className="ring-2 ring-paper" />)}
            </span>
          )}
          <span className="text-left leading-tight">
            {trust.rating != null && (
              <span className="flex items-center gap-0.5 text-warn-500" aria-label={`คะแนน ${trust.rating} จาก 5`}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} className={i < Math.round(trust.rating!) ? 'fill-current' : 'opacity-30'} />)}
              </span>
            )}
            <span className="block">{trust.text}</span>
          </span>
        </motion.div>
      )}
    </div>
  );

  const pictured = (
    <div className="relative">
      {chips.slice(0, 4).map((c, i) => (
        <motion.div
          key={c.label}
          initial={reduce ? undefined : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + i * 0.15, type: 'spring', stiffness: 200, damping: 16 }}
          className={cn('absolute z-20 hidden sm:block', CHIP_POS[i], c.className)}
        >
          <div className="float-y flex items-center gap-2.5 rounded-2xl bg-surface/90 px-3.5 py-2.5 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.07)] backdrop-blur" style={{ animationDelay: `${i * -1.5}s` }}>
            {c.icon && <span className="grid size-8 place-items-center rounded-xl bg-brand-100 text-brand-link">{c.icon}</span>}
            <span className="leading-tight">
              <span className="block text-[11px] text-ink-mute">{c.label}</span>
              {c.value && <span className="block text-sm font-semibold text-ink">{c.value}</span>}
            </span>
          </div>
        </motion.div>
      ))}
      {visual ?? <ProductMock />}
    </div>
  );

  return (
    <section className={cn('relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40', className)}>
      <div aria-hidden className="aurora"><span /><span /><span /></div>
      <div aria-hidden className="grid-fade" />
      {/* จางลงที่ขอบล่าง ให้ต่อกับ section ถัดไปเนียนๆ ไม่เห็นรอยตัด */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        {center ? (
          <>
            {text}
            <motion.div
              ref={visualRef} initial={reduce ? undefined : { opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 60, damping: 18 }}
              className="mx-auto mt-16 max-w-5xl sm:mt-20" style={{ perspective: 1600 }}
            >
              <motion.div style={reduce ? undefined : { rotateX: tilt, scale: lift, transformOrigin: 'center top' }}>{pictured}</motion.div>
            </motion.div>
          </>
        ) : (
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {text}
            <motion.div
              initial={reduce ? undefined : { opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 70, damping: 18 }}
              onPointerMove={onMove} onPointerLeave={() => { rx.set(0); ry.set(0); }} style={{ perspective: 1200 }}
            >
              <motion.div style={reduce ? undefined : { rotateX: srx, rotateY: sry }}>{pictured}</motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

const CHIP_POS = ['-left-6 top-[18%] lg:-left-12', '-right-5 top-[8%] lg:-right-10', '-left-4 bottom-[14%] lg:-left-8', '-right-6 bottom-[22%] lg:-right-12'];

/** ภาพจำลองหน้าจอแดชบอร์ด (HTML ล้วน — สีตาม CI และโหมดมืดอัตโนมัติ) */
export function ProductMock({ className }: { className?: string }) {
  const series = [38, 42, 40, 47, 45, 52, 50, 58, 55, 63, 61, 70, 68, 76];
  const { line, area } = sparkPath(series, 400, 120, 8);
  const bars = [55, 72, 48, 86, 64, 92, 70];
  return (
    <div className={cn('overflow-hidden rounded-[22px] bg-surface p-2 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.45),0_0_0_1px_rgb(var(--ink)/0.08)] sm:rounded-[28px] sm:p-3', className)}>
      <div className="flex items-center gap-1.5 px-2 pb-2 sm:pb-3">
        <span className="size-2.5 rounded-full bg-danger-500/70" /><span className="size-2.5 rounded-full bg-warn-500/70" /><span className="size-2.5 rounded-full bg-ok-500/70" />
        <span className="mx-auto h-5 w-40 rounded-md bg-ink/[0.05] sm:w-64" />
      </div>
      <div className="flex gap-3 rounded-2xl bg-paper p-3 sm:p-4">
        <div className="hidden w-36 shrink-0 space-y-2 sm:block">
          <div className="mb-4 flex items-center gap-2"><span className="size-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700" /><span className="h-2.5 w-16 rounded bg-ink/15" /></div>
          {[1, 0, 0, 0, 0].map((on, i) => <div key={i} className={cn('h-7 rounded-lg', on ? 'bg-brand-100' : 'bg-ink/[0.04]')} />)}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[['ยอดขาย', '฿1.41M', '+10.9%'], ['คำสั่งซื้อ', '9,965', '+9.7%'], ['ลูกค้าใหม่', '482', '+4.2%']].map(([k, v, d]) => (
              <div key={k} className="rounded-xl bg-surface p-2.5 shadow-[0_0_0_1px_rgb(var(--ink)/0.05)] sm:p-3">
                <p className="text-[9px] text-ink-mute sm:text-[11px]">{k}</p>
                <p className="mt-0.5 font-display text-sm font-semibold text-ink sm:text-xl">{v}</p>
                <p className="mt-0.5 text-[9px] font-bold text-ok-700 sm:text-[11px]">↗ {d}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="rounded-xl bg-surface p-3 shadow-[0_0_0_1px_rgb(var(--ink)/0.05)] sm:col-span-2">
              <p className="text-[10px] font-semibold text-ink-soft sm:text-xs">ยอดขายรายวัน</p>
              <svg viewBox="0 0 400 120" className="mt-2 h-24 w-full sm:h-32" preserveAspectRatio="none" aria-hidden>
                <defs><linearGradient id="pm-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(var(--brand-500))" stopOpacity=".3" /><stop offset="100%" stopColor="rgb(var(--brand-500))" stopOpacity="0" /></linearGradient></defs>
                <path d={area} fill="url(#pm-a)" />
                <path d={line} fill="none" stroke="rgb(var(--brand-500))" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="hidden rounded-xl bg-surface p-3 shadow-[0_0_0_1px_rgb(var(--ink)/0.05)] sm:block">
              <p className="text-xs font-semibold text-ink-soft">รายสัปดาห์</p>
              <div className="mt-3 flex h-32 items-end gap-1.5">
                {bars.map((b, i) => <span key={i} className={cn('flex-1 rounded-t-md', i === 5 ? 'bg-brand-500' : 'bg-ink/10')} style={{ height: `${b}%` }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
