'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };
const ITEM: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING },
};

/**
 * Reveal: เนื้อหาลอยขึ้นจากเบลอเป็นคมเมื่อเลื่อนมาเห็น (ครั้งเดียว)
 * - ห่อชิ้นเดียว: `<Reveal>…</Reveal>` · ทำทีละชิ้นต่อกัน: `<Reveal stagger>` แล้วลูกแต่ละตัวห่อด้วย `<RevealItem>`
 * - `delay` วินาที · ผู้ใช้ตั้งลดการเคลื่อนไหว = แสดงเลย
 */
export function Reveal({ children, className, delay = 0, stagger, as = 'div' }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** ระยะห่างระหว่างลูกแต่ละตัว (วินาที) — ใช้คู่กับ RevealItem */
  stagger?: number | boolean;
  as?: 'div' | 'section' | 'ul' | 'header';
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) return React.createElement(as, { className }, children);
  const gap = stagger === true ? 0.08 : stagger || 0;
  return (
    <Tag
      className={className}
      initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}
      variants={gap
        ? { hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }
        : { hidden: ITEM.hidden, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...SPRING, delay } } }}
    >
      {children}
    </Tag>
  );
}

/** ลูกของ <Reveal stagger> — โผล่ทีละตัวตามลำดับ */
export function RevealItem({ children, className, as = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'li' }) {
  const Tag = motion[as];
  return <Tag variants={ITEM} className={className}>{children}</Tag>;
}

/** หัวข้อของแต่ละ section: ป้ายเล็ก (eyebrow) · หัวข้อ (คำใน `highlight` เป็นสีไล่แบบแสงวิ่ง) · คำอธิบาย */
export function SectionHeading({ eyebrow, title, highlight, description, align = 'center', className }: {
  eyebrow?: string;
  title: string;
  /** ส่วนของ title ที่จะไฮไลต์ (ต้องเป็นข้อความที่อยู่ใน title) */
  highlight?: string;
  description?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  const parts = highlight && title.includes(highlight) ? title.split(highlight) : [title];
  return (
    <Reveal stagger className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl', className)}>
      {eyebrow && (
        <RevealItem>
          <span className="inline-flex items-center gap-2 rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-link ring-1 ring-brand-500/15">
            <span className="size-1.5 rounded-full bg-brand-500" />{eyebrow}
          </span>
        </RevealItem>
      )}
      <RevealItem>
        <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.15]">
          {parts.length > 1 ? <>{parts[0]}<span className="text-shimmer">{highlight}</span>{parts[1]}</> : title}
        </h2>
      </RevealItem>
      {description && <RevealItem><p className="mt-4 text-pretty text-base leading-relaxed text-ink-mute sm:text-lg">{description}</p></RevealItem>}
    </Reveal>
  );
}

/** ตั้ง --mx/--my ตามตำแหน่งเมาส์ (ใช้กับคลาส .spotlight) */
export function useSpotlight<T extends HTMLElement>() {
  return React.useCallback((e: React.PointerEvent<T>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
}
