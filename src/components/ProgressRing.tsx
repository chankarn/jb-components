'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * เส้นโค้งความเร็ว: เร็วตอนเริ่มแล้วชะลอลงต่อเนื่องจนถึงปลาย (ถึง ~75% ที่ครึ่งเวลา · ~94% ที่ 3 ใน 4)
 * ตัวเลขและวงใช้ค่าเดียวกัน จึงช้าลงพร้อมกัน — เส้นโค้งที่หนักช่วงต้นกว่านี้ (เช่น quint) ถึง ~96% ตั้งแต่ครึ่งเวลา
 * ครึ่งหลังเลยคลานจนดูเหมือนค้าง
 */
const EASE_OUT: [number, number, number, number] = [0.5, 1, 0.89, 1];

/**
 * วงแหวนความคืบหน้า (SVG) — ตัวเลขกลางวง · ใช้สีแบรนด์ปัจจุบัน
 * - วงเดินและตัวเลขนับขึ้นพร้อมกันตอนแสดงครั้งแรกและทุกครั้งที่ค่าเปลี่ยน (ต่อจากค่าเดิม ไม่เริ่มจาก 0 ใหม่)
 * - ปลายวงไล่เฉดจาก brand-400 ไปเป็น brand-600 · ครบ 100% วงเปลี่ยนเป็นสีเขียว (ok) พร้อมวงคลื่นเด้งออกหนึ่งครั้ง
 * - ผู้ใช้ตั้งลดการเคลื่อนไหวในระบบ → แสดงค่าสุดท้ายทันที ไม่เล่นอนิเมชัน
 * - เข้าถึงได้: role=progressbar บอกค่าจริงเสมอ (ไม่ใช่ค่าระหว่างนับ)
 * `animated={false}` ปิดอนิเมชัน · `completeTone={false}` ไม่เปลี่ยนเป็นสีเขียวเมื่อครบ
 */
export function ProgressRing({
  percent, size = 64, stroke = 7, duration = 1.4, animated = true, completeTone = true, className,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  /** วินาที ต่อการเดินหนึ่งครั้ง */
  duration?: number;
  animated?: boolean;
  completeTone?: boolean;
  className?: string;
}) {
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  const reduce = useReducedMotion();
  const still = reduce || !animated;
  const gid = useId().replace(/:/g, '');

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const value = useMotionValue(still ? p : 0);
  const offset = useTransform(value, (v) => c * (1 - v / 100));
  const shown = useTransform(value, (v) => Math.round(v));
  // ซ่อนปลายวงเมื่อค่าที่กำลังเดินถึง 0 (linecap round วาดจุดแม้ความยาวเป็น 0) — ผูกกับค่าที่เดินอยู่ ไม่ใช่ค่าเป้าหมาย วงจึงหดจนหมดก่อนค่อยหาย
  const arcOpacity = useTransform(value, (v) => (v < 0.5 ? 0 : 1));

  // เดินต่อจากค่าปัจจุบันไปค่าใหม่ · ระยะสั้นเดินสั้นลงตามสัดส่วน (เปลี่ยน 5% ไม่ต้องใช้เวลาเท่า 0→100)
  const first = useRef(true);
  useEffect(() => {
    if (still) { value.set(p); first.current = false; return; }
    const distance = Math.abs(p - value.get()) / 100;
    const controls = animate(value, p, { duration: Math.max(0.25, duration * Math.max(distance, 0.2)), ease: EASE_OUT, delay: first.current ? 0.08 : 0 });
    first.current = false;
    return () => controls.stop();
  }, [p, still, duration, value]);

  // เล่นวงคลื่นตอน "เพิ่งครบ" เท่านั้น (ไม่เล่นถ้าแสดงที่ 100% มาตั้งแต่ต้น แล้วค่าไม่เปลี่ยน)
  const done = completeTone && p >= 100;
  const [burst, setBurst] = useState(0);
  const wasDone = useRef(false);
  useEffect(() => {
    if (done && !wasDone.current && !still) {
      const t = window.setTimeout(() => setBurst((n) => n + 1), duration * 1000 * 0.9);
      wasDone.current = true;
      return () => window.clearTimeout(t);
    }
    wasDone.current = done;
  }, [done, still, duration]);

  const from = done ? '--ok-500' : '--brand-400';
  const to = done ? '--ok-600' : '--brand-600';

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p} aria-label={`${p}%`}
    >
      {burst > 0 && (
        <motion.span
          key={burst} aria-hidden
          className={cn('pointer-events-none absolute inset-0 rounded-full border-2', 'border-ok-500')}
          initial={{ opacity: 0.55, scale: 1 }} animate={{ opacity: 0, scale: 1.35 }} transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: `rgb(var(${from}))`, transition: 'stop-color .4s' }} />
            <stop offset="100%" style={{ stopColor: `rgb(var(${to}))`, transition: 'stop-color .4s' }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-ink/10" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={`url(#${gid})`} strokeDasharray={c} style={{ strokeDashoffset: offset, opacity: arcOpacity }}
        />
      </svg>
      <span
        className={cn('absolute inset-0 flex items-center justify-center font-extrabold tabular-nums transition-colors duration-500', done && 'text-ok-700')}
        style={{ fontSize: Math.max(11, Math.round(size * 0.22)) }}
      >
        <motion.span>{shown}</motion.span>%
      </span>
    </div>
  );
}
