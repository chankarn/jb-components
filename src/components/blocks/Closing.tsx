'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/Marquee';
import { Accordion, type AccordionItem } from '@/components/Accordion';
import { Avatar } from '@/components/Avatar';
import { ThemeToggle } from '@/components/ThemeProvider';
import { shake } from '@/lib/motion-fx';
import { Reveal, SectionHeading } from './Reveal';

/* ── Testimonials ── */
export type Testimonial = { quote: string; name: string; role: string; rating?: number };

function QuoteCard({ t, seed }: { t: Testimonial; seed: number }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-3xl bg-surface p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_0_0_1px_rgb(var(--ink)/0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgb(0_0_0/0.3),0_0_0_1px_rgb(var(--brand-500)/0.25)] sm:w-[360px]">
      <div className="flex items-center justify-between">
        <Quote aria-hidden size={22} className="fill-brand-100 text-brand-500" />
        {t.rating != null && (
          <span className="flex gap-0.5 text-warn-500" aria-label={`คะแนน ${t.rating} จาก 5`}>
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} className={i < t.rating! ? 'fill-current' : 'opacity-25'} />)}
          </span>
        )}
      </div>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar name={t.name} seed={seed} size={38} />
        <span className="leading-tight"><span className="block text-sm font-semibold text-ink">{t.name}</span><span className="block text-xs text-ink-mute">{t.role}</span></span>
      </figcaption>
    </figure>
  );
}

/** รีวิวลูกค้า: การ์ดสองแถววิ่งสวนทางไม่รู้จบ · ชี้แล้วหยุดแถวนั้น · ขอบจาง */
export function Testimonials({ id, eyebrow, title, highlight, description, items, className }: {
  id?: string; eyebrow?: string; title: string; highlight?: string; description?: React.ReactNode; items: Testimonial[]; className?: string;
}) {
  const half = Math.ceil(items.length / 2);
  return (
    <section id={id} className={cn('scroll-mt-24 overflow-hidden py-20 sm:py-28', className)}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6"><SectionHeading eyebrow={eyebrow} title={title} highlight={highlight} description={description} /></div>
      <Reveal className="mt-14 space-y-5">
        <Marquee speed={28} gap={20} label="รีวิวจากลูกค้า แถวที่ 1">{items.slice(0, half).map((t, i) => <QuoteCard key={t.name} t={t} seed={i + 1} />)}</Marquee>
        <Marquee speed={24} gap={20} direction="right" label="รีวิวจากลูกค้า แถวที่ 2">{items.slice(half).map((t, i) => <QuoteCard key={t.name} t={t} seed={i + 5} />)}</Marquee>
      </Reveal>
    </section>
  );
}

/* ── FaqSection ── */
/** คำถามที่พบบ่อย: หัวข้อ + การ์ดติดต่อ (ซ้าย ติดจอตอนเลื่อน) · Accordion (ขวา) */
export function FaqSection({ id, eyebrow, title, highlight, description, items, aside, className }: {
  id?: string; eyebrow?: string; title: string; highlight?: string; description?: React.ReactNode; items: AccordionItem[];
  /** การ์ดใต้หัวข้อ เช่น "ยังมีคำถาม? คุยกับทีมงาน" */
  aside?: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 py-20 sm:py-28', className)}>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[2fr_3fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading align="left" eyebrow={eyebrow} title={title} highlight={highlight} description={description} />
          {aside && <Reveal delay={0.2} className="mt-8">{aside}</Reveal>}
        </div>
        <Reveal delay={0.1}><Accordion variant="separated" items={items} defaultValue={items[0]?.id} /></Reveal>
      </div>
    </section>
  );
}

/* ── CtaBand ── */
/** กล่องชวนลงมือปิดท้าย: พื้นไล่สีแบรนด์ + แสง aurora + ตารางเส้น + ลำแสงวิ่งผ่าน · `points` = จุดเด่นสั้นๆ ใต้ปุ่ม */
export function CtaBand({ title, description, actions, points, className }: {
  title: string; description?: React.ReactNode; actions?: React.ReactNode; points?: string[]; className?: string;
}) {
  return (
    <section className={cn('px-3 py-16 sm:px-5 sm:py-24', className)}>
      <Reveal className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-700 to-[rgb(var(--ink))] px-6 py-16 text-center text-white shadow-[0_40px_100px_-40px_rgb(var(--brand-700)/0.8)] sm:px-12 sm:py-24">
        <div aria-hidden className="aurora opacity-70 mix-blend-screen"><span /><span /><span /></div>
        <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/.07)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.07)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
        <span aria-hidden className="beam" />
        <h2 className="relative mx-auto max-w-3xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{title}</h2>
        {description && <p className="relative mx-auto mt-5 max-w-2xl text-pretty text-base text-white/80 sm:text-lg">{description}</p>}
        {actions && <div className="relative mt-9 flex flex-wrap justify-center gap-3">{actions}</div>}
        {points && (
          <ul className="relative mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            {points.map((p) => <li key={p} className="flex items-center gap-1.5"><Check size={15} className="text-white" />{p}</li>)}
          </ul>
        )}
      </Reveal>
    </section>
  );
}

/* ── SiteFooter ── */
export type FooterColumn = { title: string; links: { label: string; href: string }[] };

/**
 * ท้ายเว็บ: แบรนด์ + คำอธิบาย + สมัครรับข่าว · คอลัมน์ลิงก์ · แถบล่าง (ลิขสิทธิ์ · สลับธีม) · ชื่อแบรนด์ตัวใหญ่จางๆ เป็นฉากหลัง
 * `onSubscribe` คืน Promise — ตรวจรูปแบบอีเมลให้ (ผิด = ช่องสั่น) · สำเร็จเปลี่ยนเป็นข้อความขอบคุณ
 */
export function SiteFooter({ brand, description, columns, onSubscribe, legal, className }: {
  brand: { name: string; mark?: React.ReactNode };
  description?: string;
  columns: FooterColumn[];
  onSubscribe?: (email: string) => Promise<void>;
  legal?: string;
  className?: string;
}) {
  const [email, setEmail] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = React.useState('');
  const form = React.useRef<HTMLFormElement>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError('กรุณากรอกอีเมลให้ถูกต้อง'); shake(form.current); return; }
    setError('');
    setState('loading');
    try { await onSubscribe?.(email.trim()); setState('done'); } catch { setState('idle'); setError('สมัครไม่สำเร็จ ลองอีกครั้ง'); }
  }
  return (
    <footer className={cn('relative overflow-hidden border-t border-ink/[0.07] bg-surface/60', className)}>
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <span className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">{brand.mark ?? brand.name[0]}</span>{brand.name}
            </span>
            {description && <p className="mt-4 text-sm leading-relaxed text-ink-mute">{description}</p>}
            {onSubscribe && (
              state === 'done' ? (
                <p className="mt-6 flex items-center gap-2 rounded-2xl bg-ok-50 px-4 py-3 text-sm font-medium text-ok-700"><Check size={16} /> ขอบคุณ! เราจะส่งข่าวสารไปที่ {email}</p>
              ) : (
                <form ref={form} noValidate onSubmit={submit} className="mt-6">
                  <label htmlFor="footer-email" className="text-xs font-semibold text-ink-soft">รับข่าวสารและเคล็ดลับทุกเดือน</label>
                  <div className={cn('mt-2 flex items-center gap-1 rounded-pill bg-surface p-1 pl-4 shadow-[0_0_0_1px_rgb(var(--ink)/0.12)] transition focus-within:shadow-[0_0_0_1px_rgb(var(--brand-500)),0_0_0_4px_rgb(var(--brand-500)/0.12)]', error && 'shadow-[0_0_0_1px_rgb(var(--danger-500))]')}>
                    <input
                      id="footer-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="name@company.com" aria-invalid={!!error || undefined} aria-describedby={error ? 'footer-email-err' : undefined}
                      className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-mute/70"
                    />
                    <button type="submit" disabled={state === 'loading'} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-pill bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
                      {state === 'loading' ? 'กำลังส่ง…' : <>สมัคร <ArrowRight size={14} /></>}
                    </button>
                  </div>
                  {error && <p id="footer-email-err" role="alert" className="mt-1.5 pl-4 text-xs font-semibold text-danger-700">{error}</p>}
                </form>
              )
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="text-sm font-semibold text-ink">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => <li key={l.label}><Link href={l.href} className="text-sm text-ink-mute transition hover:text-brand-link">{l.label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ink/[0.07] pt-6 text-xs text-ink-mute">
          <p>{legal ?? `© ${new Date().getFullYear()} ${brand.name}`}</p>
          <ThemeToggle />
        </div>
      </div>
      {/* ขนาดตามความยาวชื่อ ให้พอดีความกว้างจอเสมอ (ไม่โดนตัด) · สูงสุด 14rem */}
      <p
        aria-hidden className="pointer-events-none select-none overflow-hidden whitespace-nowrap px-4 text-center font-display font-bold leading-[0.8] tracking-tighter text-ink/[0.035]"
        style={{ fontSize: `min(14rem, calc((100vw - 2rem) / ${Math.max(4, brand.name.length * 0.62).toFixed(2)}))` }}
      >
        {brand.name}
      </p>
    </footer>
  );
}
