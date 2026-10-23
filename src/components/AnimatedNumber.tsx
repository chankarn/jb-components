'use client';

import * as React from 'react';
import { countUp } from '@/lib/chart-math';

/**
 * AnimatedNumber: ตัวเลขวิ่งขึ้นตอนเลื่อนมาเห็นครั้งแรก (เร็วตอนต้น ช้าลงตอนท้าย) · ค่าเปลี่ยน → วิ่งจากค่าเดิมไปค่าใหม่
 * - `format` กำหนดรูปแบบ (ค่าตั้งต้น: comma + ทศนิยมเท่าค่าปลายทาง) · ตัวเลขกว้างเท่ากัน (tabular-nums) ข้อความไม่สั่นตอนวิ่ง
 * - screen reader อ่านค่าสุดท้ายทันที (ค่าที่วิ่งอยู่ซ่อนไว้) · ผู้ใช้ตั้งลดการเคลื่อนไหว = แสดงค่าจริงเลย
 */
export function AnimatedNumber({ value, format, duration = 1100, className }: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const decimals = (String(value).split('.')[1] ?? '').length;
  const fmt = React.useCallback(
    (n: number) => (format ? format(n) : n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })),
    [format, decimals],
  );
  const [shown, setShown] = React.useState<number | null>(null); // null = ยังไม่เริ่ม (แสดง 0)
  const from = React.useRef(0);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!seen) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || duration <= 0) { setShown(value); from.current = value; return; }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      const v = countUp(a, value, t);
      setShown(t >= 1 ? value : v);
      from.current = t >= 1 ? value : v;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, duration]);

  const display = shown == null ? 0 : shown;
  // ระหว่างวิ่งปัดตามทศนิยมของค่าปลายทาง (ไม่ให้เห็น 12.3456…)
  const rounded = Math.round(display * 10 ** decimals) / 10 ** decimals;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden className="tabular-nums">{fmt(rounded)}</span>
      <span className="sr-only">{fmt(value)}</span>
    </span>
  );
}
