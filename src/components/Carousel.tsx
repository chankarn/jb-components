'use client';

import * as React from 'react';
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { clampIndex, loopSnap, maxIndex, normalizeLoop, perViewFor, slideSize, snapTarget, trackOffset, type PerView } from '@/lib/carousel';

type Props = {
  /** สไลด์แต่ละใบ (children แต่ละตัว = 1 ใบ) */
  children: React.ReactNode;
  /** จำนวนใบต่อหน้า: ตัวเลข หรือตามความกว้างกล่อง `{ 0: 1, 640: 2, 1024: 3 }` */
  perView?: PerView;
  /** ช่องไฟระหว่างใบ (px) */
  gap?: number;
  /** วนไม่รู้จบ: ใบสุดท้าย → ใบแรกเลื่อนต่อไปทางเดิมแบบไร้รอยต่อ (ไม่กรอย้อนกลับ) · ลากเลยขอบได้ทั้งสองทาง */
  loop?: boolean;
  /** เลื่อนเองทุกกี่มิลลิวินาที (false = ไม่เลื่อนเอง) · หยุดเมื่อชี้/โฟกัส/ลาก/สลับแท็บ/ผู้ใช้ตั้งลดการเคลื่อนไหว */
  autoplay?: number | false;
  arrows?: boolean;
  dots?: boolean;
  /** ชื่อของ carousel สำหรับ screen reader */
  label?: string;
  onIndexChange?: (index: number) => void;
  className?: string;
  /** คลาสของแต่ละใบ (เช่น ความสูง/มุมมน) */
  slideClassName?: string;
};

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 32, mass: 0.9 };

/**
 * Carousel: ลาก/ปัดได้ (นิ้ว/เมาส์) ปล่อยแล้ว snap ด้วยสปริงนุ่ม · ปุ่มก่อน/ถัดไป · จุดบอกตำแหน่ง (จุดที่เลือกยืดเป็นแคปซูล และมีแถบเวลาเมื่อเลื่อนเอง)
 * - หลายใบต่อหน้าได้ตามความกว้าง "ของกล่องเอง" (ใช้ในการ์ดแคบหรือกว้างก็ถูก) · ไม่เหลือช่องว่างท้ายแถว
 * - `loop`: วาดใบสำเนาไว้หัวและท้าย เลื่อนเลยใบสุดท้ายไปบนสำเนาของใบแรก แล้วสลับไปใบจริงเงียบๆ ตอนหยุด (หน้าตาเหมือนกันจึงไม่เห็นรอยต่อ)
 * - autoplay หยุดเองเมื่อชี้/โฟกัส/ลาก/สลับไปแท็บอื่น
 * - ปุ่มลูกศรซ่อนบนจอเล็ก (ปัดนิ้วแทน · ไม่ทับคำบรรยายบนภาพที่เตี้ยลง) · คีย์บอร์ด: โฟกัสที่ carousel แล้วใช้ ← → · ใบที่อยู่นอกจอถูกซ่อนจาก screen reader และกด Tab เข้าไม่ได้ (inert)
 * - ลากแล้วปล่อยบนลิงก์ไม่ถือเป็นคลิก · ผู้ใช้ตั้งลดการเคลื่อนไหว = เปลี่ยนใบทันทีและไม่เลื่อนเอง
 * - ใส่คลาส `kenburns` ที่รูป = ซูมออกช้าๆ ตอนใบนั้นถูกเลือก · ใส่ `data-caption` = ค่อยๆ เลื่อนขึ้นมา (CSS ใน globals.css)
 */
export function Carousel({
  children, perView = 1, gap = 16, loop = true, autoplay = false, arrows = true, dots = true, label, onIndexChange, className, slideClassName,
}: Props) {
  const t = useT();
  const reduce = useReducedMotion();
  const slides = React.Children.toArray(children);
  const count = slides.length;

  const viewport = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pv = Math.min(perViewFor(width, perView), Math.max(1, count));
  const slide = slideSize(width, pv, gap);
  const last = maxIndex(count, pv);
  const looping = loop && count > pv;
  const clones = looping ? pv : 0; // จำนวนใบสำเนาที่หัวและท้ายราง
  const step = slide + gap;
  // pos = ตำแหน่ง "เสมือน" (โหมดวนอาจเป็น -pv…count ชั่วคราวระหว่างเลื่อนบนสำเนา) · index = ใบจริง
  const [pos, setPos] = React.useState(0);
  const index = looping ? normalizeLoop(pos, count) : pos;
  const posRef = React.useRef(0);
  const x = useMotionValue(0);
  const offsetOf = React.useCallback((p: number) => trackOffset(p + clones, slide, gap), [clones, slide, gap]);

  const commit = (p: number) => { posRef.current = p; setPos(p); };

  /** อยู่บนสำเนาอยู่ → ย้ายไปใบจริงที่หน้าตาเหมือนกันทันที (ขยับ x เท่ากันพอดี ภาพไม่กระตุก) */
  const settle = React.useCallback(() => {
    const p = posRef.current;
    if (!looping || (p >= 0 && p < count)) return p;
    const real = normalizeLoop(p, count);
    x.stop();
    x.set(x.get() + (p - real) * step);
    commit(real);
    return real;
  }, [looping, count, step, x]);

  const goTo = React.useCallback((target: number, instant = false) => {
    settle();
    // โหมดวน: ไปต่อบนสำเนาได้หนึ่งหน้า (-pv…count) · ไม่วน: บีบอยู่ในใบจริง
    const p = looping ? Math.min(count, Math.max(-pv, target)) : clampIndex(target, count, pv);
    commit(p);
    const to = offsetOf(p);
    if (instant || reduce) { x.set(to); settle(); return; }
    animate(x, to, { ...SPRING, onComplete: () => { if (posRef.current === p) settle(); } });
  }, [settle, looping, count, pv, offsetOf, reduce, x]);

  // ขนาดเปลี่ยน (ย่อขยายจอ/จำนวนใบต่อหน้าเปลี่ยน) → จัดตำแหน่งใหม่ทันที ไม่เล่นอนิเมชัน
  React.useEffect(() => { goTo(normalizeLoop(posRef.current, Math.max(count, 1)), true); }, [slide, pv, clones]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { onIndexChange?.(index); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => { const p = settle(); goTo(p + 1); };
  const prev = () => { const p = settle(); goTo(p - 1); };

  // ลาก: แยก "ลาก" ออกจาก "คลิก" — ลากเกิน 6px แล้วปล่อยบนลิงก์/ปุ่มในสไลด์จะไม่ถือเป็นคลิก
  const dragged = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  function onDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    const o = { index: posRef.current, offset: info.offset.x, velocity: info.velocity.x, slide, gap, count, perView: pv };
    goTo(looping ? loopSnap(o) : snapTarget(o));
  }

  // autoplay: หยุดเมื่อชี้/โฟกัส/ลาก/แท็บถูกซ่อน/ลดการเคลื่อนไหว
  const [hovered, setHovered] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  const autoplayOn = !!autoplay && !reduce && count > pv;
  const paused = !autoplayOn || hovered || focusWithin || dragging || hidden;
  const canPrev = looping || index > 0;
  const canNext = looping || index < last;

  // รางสไลด์: [สำเนาท้าย] + ใบจริง + [สำเนาหัว]
  const track = [
    ...slides.slice(count - clones).map((node, i) => ({ node, real: count - clones + i, clone: true })),
    ...slides.map((node, i) => ({ node, real: i, clone: false })),
    ...slides.slice(0, clones).map((node, i) => ({ node, real: i, clone: true })),
  ];
  const visibleReal = new Set(Array.from({ length: pv }, (_, k) => (looping ? normalizeLoop(pos + k, count) : pos + k)));

  const progress = autoplayOn ? (
    <span
      key={`p-${index}`} aria-hidden onAnimationEnd={() => next()}
      className="carousel-progress absolute inset-0 rounded-pill bg-brand-600"
      style={{ ['--carousel-interval' as string]: `${autoplay}ms`, animationPlayState: paused ? 'paused' : 'running' }}
    />
  ) : null;

  return (
    <div
      role="region" aria-roledescription="carousel" aria-label={label ?? t('carousel.label')}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // ปุ่ม/ลิงก์ในสไลด์ใช้ลูกศรของตัวเองได้
        if (e.key === 'ArrowRight') { e.preventDefault(); if (canNext) next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); if (canPrev) prev(); }
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false); }}
      className={cn('group/carousel relative rounded-card outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper', className)}
    >
      <div ref={viewport} className="overflow-hidden rounded-[inherit]">
        <motion.div
          className={cn('flex touch-pan-y select-none', dragging ? 'cursor-grabbing' : 'cursor-grab')}
          style={{ x, gap }}
          drag={count > pv ? 'x' : false}
          dragConstraints={looping ? { left: offsetOf(count), right: offsetOf(-pv) } : { left: trackOffset(last, slide, gap), right: 0 }}
          dragElastic={0.14} dragMomentum={false}
          // ย้ายจากสำเนาไปใบจริงตอนกด (ก่อน framer จดจุดเริ่มลาก) ไม่งั้นรางกระโดดตอนเริ่มลาก
          onPointerDownCapture={() => { settle(); }}
          onDragStart={() => { dragged.current = false; setDragging(true); }}
          onDrag={(_, info) => { if (Math.abs(info.offset.x) > 6) dragged.current = true; }}
          onDragEnd={onDragEnd}
          onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}
          aria-live={autoplayOn && !paused ? 'off' : 'polite'}
        >
          {track.map(({ node, real, clone }, k) => {
            // ใบจริงกับสำเนาของมันได้สถานะ active พร้อมกัน (ซูม/คำบรรยายเล่นตรงกัน ตอนสลับจากสำเนาไปใบจริงจึงไม่เห็นรอยต่อ)
            const active = visibleReal.has(real);
            const a11yVisible = !clone && active;
            return (
              <div
                key={k} role={clone ? undefined : 'group'} aria-roledescription={clone ? undefined : 'slide'}
                aria-label={clone ? undefined : t('carousel.slide', { n: real + 1, total: count })}
                aria-hidden={!a11yVisible || undefined} inert={!a11yVisible || undefined} data-active={active}
                onDragStart={(e) => e.preventDefault()} // กันเบราว์เซอร์ลากรูป/ลิงก์ออกไปเอง
                className={cn('carousel-slide relative shrink-0 overflow-hidden', slideClassName)}
                style={{ width: slide || `${100 / pv}%` }}
              >
                {node}
              </div>
            );
          })}
        </motion.div>
      </div>

      {arrows && count > pv && (
        <>
          <button
            type="button" onClick={prev} disabled={!canPrev} aria-label={t('carousel.prev')}
            className="absolute left-3 top-1/2 hidden size-10 sm:flex -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-lift backdrop-blur transition hover:scale-105 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 disabled:pointer-events-none disabled:opacity-0 sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:group-focus-within/carousel:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button" onClick={next} disabled={!canNext} aria-label={t('carousel.next')}
            className="absolute right-3 top-1/2 hidden size-10 sm:flex -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-lift backdrop-blur transition hover:scale-105 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 disabled:pointer-events-none disabled:opacity-0 sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:group-focus-within/carousel:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {(dots || autoplayOn) && count > pv && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {dots ? (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: looping ? count : last + 1 }, (_, i) => (
                <button
                  key={i} type="button" onClick={() => goTo(i)} aria-label={t('carousel.goto', { n: i + 1 })} aria-current={i === index || undefined}
                  className={cn(
                    'relative h-2 overflow-hidden rounded-pill transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60',
                    i === index ? 'w-7 bg-ink/15' : 'w-2 bg-ink/20 hover:bg-ink/35',
                  )}
                >
                  {i === index && (progress ?? <span aria-hidden className="absolute inset-0 rounded-pill bg-brand-600" />)}
                </button>
              ))}
            </div>
          ) : (
            <span className="relative h-1 w-24 overflow-hidden rounded-pill bg-ink/10">{progress}</span>
          )}
        </div>
      )}
    </div>
  );
}
