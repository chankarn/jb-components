'use client';

import * as React from 'react';
import { useReducedMotion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/Marquee';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, RevealItem, SectionHeading, useSpotlight } from './Reveal';

/* ── LogoCloud ── */
export type Logo = { name: string; icon?: React.ReactNode };

/** แถบโลโก้ลูกค้า/พันธมิตร: วนไม่รู้จบ ขอบจาง · สีเทาจางแล้วเป็นสีเต็มตอนชี้ */
export function LogoCloud({ title, logos, className }: { title?: string; logos: Logo[]; className?: string }) {
  return (
    <section className={cn('py-12 sm:py-16', className)}>
      {title && <p className="mb-7 text-center text-sm font-medium text-ink-mute">{title}</p>}
      <Marquee speed={32} gap={56} label={title}>
        {logos.map((l) => (
          <span key={l.name} className="flex items-center gap-2.5 whitespace-nowrap font-display text-xl font-semibold text-ink/35 grayscale transition duration-300 hover:text-ink hover:grayscale-0">
            {l.icon && <span className="text-brand-500">{l.icon}</span>}{l.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ── FeatureBento ── */
export type Feature = { icon: React.ReactNode; title: string; description: string; visual?: React.ReactNode; wide?: boolean };

/**
 * FeatureBento: จุดเด่นแบบการ์ดหลายขนาด (bento) · การ์ดมีแสงตามเคอร์เซอร์และขอบเรือง (spotlight)
 * `wide` = กว้าง 2 ช่องบนจอกว้าง · `visual` = ภาพประกอบเล็กๆ ในการ์ด (UI จำลอง กราฟ ชิป ฯลฯ)
 */
export function FeatureBento({ id, eyebrow, title, highlight, description, features, className }: {
  id?: string; eyebrow?: string; title: string; highlight?: string; description?: React.ReactNode; features: Feature[]; className?: string;
}) {
  const spot = useSpotlight<HTMLDivElement>();
  return (
    <section id={id} className={cn('scroll-mt-24 py-20 sm:py-28', className)}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading eyebrow={eyebrow} title={title} highlight={highlight} description={description} />
        <Reveal stagger={0.08} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <RevealItem key={f.title} className={cn(f.wide && 'lg:col-span-2')}>
              <div
                onPointerMove={spot}
                className="spotlight group flex h-full flex-col overflow-hidden rounded-3xl bg-surface p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_0_0_1px_rgb(var(--ink)/0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.3),0_0_0_1px_rgb(var(--ink)/0.07)] sm:p-7"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-link ring-1 ring-brand-500/15 transition duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">{f.icon}</span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mute">{f.description}</p>
                {f.visual && <div className="mt-6 flex-1">{f.visual}</div>}
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ── Steps ── */
export type Step = { icon: React.ReactNode; title: string; description: string };

/** ขั้นตอนการใช้งาน 3–4 ขั้น · เส้นเชื่อมวาดตามการเลื่อนหน้า (จอแคบเป็นแนวตั้ง) */
export function Steps({ id, eyebrow, title, highlight, description, steps, className }: {
  id?: string; eyebrow?: string; title: string; highlight?: string; description?: React.ReactNode; steps: Step[]; className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const line = React.useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 55%'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => { line.current?.style.setProperty('--p', String(reduce ? 1 : Math.min(1, Math.max(0, v)))); });
  const cols = steps.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  return (
    <section id={id} className={cn('scroll-mt-24 py-20 sm:py-28', className)}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading eyebrow={eyebrow} title={title} highlight={highlight} description={description} />
        <div ref={ref} className={cn('relative mt-16 grid gap-10 md:gap-6', cols)}>
          {/* ราง + เส้นที่วาด (แนวนอนบนจอกว้าง · แนวตั้งบนจอแคบ) */}
          <span aria-hidden className="absolute bottom-6 left-7 top-7 w-0.5 rounded-full bg-ink/10 md:bottom-auto md:left-[12%] md:right-[12%] md:top-7 md:h-0.5 md:w-auto" />
          <span ref={line} aria-hidden className="steps-line absolute bottom-6 left-7 top-7 w-0.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 md:bottom-auto md:left-[12%] md:right-[12%] md:top-7 md:h-0.5 md:w-auto md:bg-gradient-to-r" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-brand-link shadow-[0_10px_30px_-12px_rgb(var(--brand-600)/0.5),0_0_0_1px_rgb(var(--ink)/0.07)]">
                {s.icon}
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-bold text-white">{i + 1}</span>
              </span>
              <div className="pt-1 md:pt-0">
                <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-mute md:mx-auto md:max-w-[16rem]">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── StatsBand ── */
export type Stat = { value: number; label: string; prefix?: string; suffix?: string; decimals?: number };

/** แถบตัวเลขเด่น: วิ่งขึ้นตอนเลื่อนมาเห็น · คั่นด้วยเส้นบาง */
export function StatsBand({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <section className={cn('py-10 sm:py-14', className)}>
      <Reveal stagger={0.1} className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-5 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <RevealItem key={s.label} className={cn('px-4 text-center', i > 0 && 'lg:border-l lg:border-ink/[0.08]', i % 2 === 1 && 'border-l border-ink/[0.08] lg:border-l')}>
            <p className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              <AnimatedNumber
                value={s.value} duration={1600}
                format={(n) => `${s.prefix ?? ''}${n.toLocaleString(undefined, { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0 })}${s.suffix ?? ''}`}
              />
            </p>
            <p className="mt-2 text-sm text-ink-mute">{s.label}</p>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
