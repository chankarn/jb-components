'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { trickle } from '@/lib/tags';
import { Button } from '@/components/ui';

/* ─────────────────────────────────────────────────────────────
 * ชุดโหลด: Loader (6 แบบ) · LoadingButton · TopProgress · LoadingOverlay
 * อนิเมชันเป็น CSS ล้วน (globals.css ส่วน "Loading") — ลื่นแม้ JS กำลังยุ่ง · สีตามสี CI
 * ผู้ใช้ตั้งลดการเคลื่อนไหว → เหลือการกะพริบช้าๆ แทนการหมุน/เด้ง
 * ───────────────────────────────────────────────────────────── */

export type LoaderVariant = 'ring' | 'dots' | 'bars' | 'orbit' | 'pulse' | 'grid';

/**
 * Loader: ตัวบอกกำลังโหลด
 * - `ring` วงแหวนไล่สีหมุนพร้อมเส้นยืดหด · `dots` จุดเด้งเป็นคลื่น · `bars` แท่งอีควอไลเซอร์
 * - `orbit` ดาวเทียมสองดวงโคจรรอบจุดกลาง · `pulse` วงเรดาร์กระเพื่อม · `grid` ตาราง 3×3 ยุบพองเป็นคลื่นทแยง
 * - role="status" + ข้อความซ่อนสำหรับ screen reader (`label`) · ขนาดด้วย `size` (px) · สีตาม `currentColor` ถ้าใส่ `tone="current"`
 */
export function Loader({ variant = 'ring', size = 28, label, tone = 'brand', className }: {
  variant?: LoaderVariant;
  size?: number;
  label?: string;
  /** `brand` = สีแบรนด์ (ไล่เฉด) · `current` = ใช้สีตัวอักษรรอบข้าง (เช่น ในปุ่ม) */
  tone?: 'brand' | 'current';
  className?: string;
}) {
  const t = useT();
  const gid = React.useId().replace(/:/g, '');
  return (
    <span role="status" className={cn('ld inline-grid shrink-0 place-items-center', tone === 'current' && 'ld-current', className)} style={{ width: size, height: size, ['--s' as string]: `${size}px` }}>
      <span className="sr-only">{label ?? t('loading.label')}</span>
      <span aria-hidden className={`ld-${variant} relative block size-full`}>
        {variant === 'ring' && (
          <svg viewBox="0 0 50 50" className="ld-ring-svg size-full">
            <defs>
              <linearGradient id={`g${gid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--ld-c2)" />
                <stop offset="100%" stopColor="var(--ld-c1)" />
              </linearGradient>
            </defs>
            <circle cx="25" cy="25" r="20" fill="none" stroke="var(--ld-track)" strokeWidth="5" />
            <circle className="ld-ring-arc" cx="25" cy="25" r="20" fill="none" stroke={`url(#g${gid})`} strokeWidth="5" strokeLinecap="round" />
          </svg>
        )}
        {variant === 'dots' && [0, 1, 2].map((i) => <span key={i} className="ld-dot" style={{ ['--i' as string]: i }} />)}
        {variant === 'bars' && [0, 1, 2, 3, 4].map((i) => <span key={i} className="ld-bar" style={{ ['--i' as string]: i }} />)}
        {variant === 'orbit' && (<><span className="ld-core" /><span className="ld-sat ld-sat-a" /><span className="ld-sat ld-sat-b" /></>)}
        {variant === 'pulse' && (<>{[0, 1, 2].map((i) => <span key={i} className="ld-wave" style={{ ['--i' as string]: i }} />)}<span className="ld-core" /></>)}
        {variant === 'grid' && Array.from({ length: 9 }, (_, i) => <span key={i} className="ld-cell" style={{ ['--d' as string]: (i % 3) + Math.floor(i / 3) }} />)}
      </span>
    </span>
  );
}

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  status?: LoadingStatus;
  /** ข้อความตอนโหลด (ไม่ใส่ = มีแต่วงหมุน) — ควรสั้นไม่เกินความยาวป้ายปกติ เพราะปุ่มกว้างเท่าเดิม */
  loadingText?: React.ReactNode;
  successText?: React.ReactNode;
  errorText?: React.ReactNode;
};

/**
 * LoadingButton: ปุ่มที่แปลงร่างตามสถานะ (ความกว้างคงเดิม ปุ่มข้างๆ ไม่ขยับ)
 * - `loading` ป้ายเลื่อนขึ้นหาย วงหมุนเลื่อนขึ้นมาแทน · กดซ้ำไม่ได้ (aria-busy) แต่ยังโฟกัสอยู่
 * - `success` ปุ่มเป็นสีเขียว ติ๊กวาดเส้น + ประกายกระจาย · `error` สีแดงและปุ่มสั่น
 * - คุมสถานะเองจากภายนอก (เช่น ตั้ง success แล้ว setTimeout กลับเป็น idle)
 */
export function LoadingButton({ status = 'idle', loadingText, successText, errorText, children, className, onClick, ...rest }: LoadingButtonProps) {
  const t = useT();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLButtonElement>(null);
  const busy = status === 'loading';
  React.useEffect(() => {
    if (status === 'error' && !reduce) ref.current?.animate([0, -8, 8, -6, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 450, easing: 'ease-out' });
  }, [status, reduce]);
  return (
    <Button
      ref={ref} data-status={status} aria-busy={busy || undefined} aria-live="polite"
      onClick={(e) => { if (busy) { e.preventDefault(); return; } onClick?.(e); }}
      className={cn(
        'lb relative overflow-hidden transition-[background-color,transform,box-shadow] duration-300',
        busy && 'cursor-progress',
        status === 'success' && '!bg-ok-600 !text-white',
        status === 'error' && '!bg-danger-600 !text-white',
        className,
      )}
      {...rest}
    >
      <span className="lb-idle inline-flex items-center gap-2">{children}</span>
      <span aria-hidden={status !== 'loading'} className="lb-layer lb-loading">
        <Loader variant="ring" size={18} tone="current" label={typeof loadingText === 'string' ? loadingText : undefined} />
        {loadingText}
      </span>
      <span aria-hidden={status !== 'success'} className="lb-layer lb-success">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path className="lb-check" d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
        </svg>
        {successText ?? <span className="sr-only">{t('loading.done')}</span>}
        {status === 'success' && !reduce && (
          <span className="lb-burst" aria-hidden>{Array.from({ length: 8 }, (_, i) => <span key={i} style={{ ['--a' as string]: `${i * 45}deg` }} />)}</span>
        )}
      </span>
      <span aria-hidden={status !== 'error'} className="lb-layer lb-error">
        <AlertTriangle size={16} strokeWidth={2.6} />
        {errorText ?? <span className="sr-only">{t('loading.failed')}</span>}
      </span>
    </Button>
  );
}

/**
 * TopProgress: แถบโหลดบางๆ ชิดขอบบนจอ (แบบ YouTube/GitHub) — วางครั้งเดียวในหน้า คุมด้วย `active`
 * - เริ่มแล้วคืบเข้าหา ~94% ช้าลงเรื่อยๆ (ไม่รู้ว่าเหลือเท่าไรจึงไม่หยุดนิ่ง) · เสร็จ → พุ่งเต็มแล้วจางหาย
 * - ปลายแถบมีแสงเรือง + แถบแสงวิ่งผ่าน · โหลดเร็วกว่า 150ms ไม่แสดงเลย (ไม่กะพริบ)
 */
export function TopProgress({ active, className }: { active: boolean; className?: string }) {
  const [p, setP] = React.useState(0);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (active) {
      let iv: ReturnType<typeof setInterval> | undefined;
      const start = setTimeout(() => {
        setShown(true);
        setP(0.08);
        iv = setInterval(() => setP((v) => trickle(v)), 260);
      }, 150);
      return () => { clearTimeout(start); clearInterval(iv); };
    }
    if (!shown) return;
    setP(1);
    const hide = setTimeout(() => setShown(false), 420);
    const reset = setTimeout(() => setP(0), 800);
    return () => { clearTimeout(hide); clearTimeout(reset); };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      aria-hidden className={cn('top-progress pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] transition-opacity duration-300', shown ? 'opacity-100' : 'opacity-0', className)}
    >
      <div className="top-progress-bar h-full origin-left" style={{ transform: `scaleX(${p})` }} />
      {p > 0 && <div className="top-progress-tip" style={{ left: `${p * 100}%` }} />}
    </div>
  );
}

/**
 * LoadingOverlay: ห่อการ์ด/ตาราง ระหว่างโหลดข้อมูลใหม่ — ของเดิมยังเห็นจางๆ ใต้ม่านเบลอ (ไม่กระโดดเป็นโครงว่าง)
 * - ข้อความมีจุด … วิ่ง · เนื้อหาข้างใต้ aria-busy และกด Tab เข้าไม่ได้ระหว่างโหลด
 * - โหลดครั้งแรกที่ยังไม่มีข้อมูลเลย ใช้ Skeleton แทนจะดีกว่า
 */
export function LoadingOverlay({ show, label, variant = 'ring', children, className }: {
  show: boolean;
  label?: string;
  variant?: LoaderVariant;
  children: React.ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <div className={cn('relative rounded-card', className)} aria-busy={show || undefined}>
      <div inert={show || undefined} className={cn('transition-[filter,opacity] duration-300', show && 'opacity-60 saturate-50')}>{children}</div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 grid place-items-center rounded-[inherit] bg-surface/50 backdrop-blur-[3px]"
          >
            <motion.div
              initial={{ scale: 0.85, y: 6 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="flex flex-col items-center gap-3 rounded-2xl bg-surface/90 px-6 py-4 shadow-lift"
            >
              <Loader variant={variant} size={34} label={label} />
              <span className="ld-ellipsis text-xs font-semibold text-ink-soft">{label ?? t('loading.label')}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
