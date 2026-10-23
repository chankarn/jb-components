'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { shake } from '@/lib/motion-fx';
import { Loader } from '@/components/Loading';
import { dismissToast, getToasts, subscribeToasts, type ToastItem, type ToastKind } from '@/lib/toast-store';

const KIND: Record<ToastKind, { tile: string; bar: string }> = {
  success: { tile: 'bg-ok-50 text-ok-600', bar: 'bg-ok-500' },
  error: { tile: 'bg-danger-50 text-danger-600', bar: 'bg-danger-500' },
  warning: { tile: 'bg-warn-50 text-warn-700', bar: 'bg-warn-500' },
  info: { tile: 'bg-brand-100 text-brand-link', bar: 'bg-brand-500' },
  loading: { tile: 'bg-brand-100 text-brand-link', bar: 'bg-brand-500' },
};

function KindIcon({ kind }: { kind: ToastKind }) {
  if (kind === 'loading') return <Loader size={18} tone="current" />;
  if (kind === 'success') {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path className="toast-check" d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
      </svg>
    );
  }
  const Icon = kind === 'error' ? XCircle : kind === 'warning' ? AlertTriangle : Info;
  return <Icon size={18} strokeWidth={2.4} aria-hidden />;
}

/**
 * Toaster: แสดง toast จาก lib/toast-store (วางครั้งเดียวผ่าน <FeedbackHost/>)
 * - เข้าแบบสปริงจากเบลอเป็นคม ซ้อนเรียงลื่นๆ (ตัวใหม่ดันตัวเก่า) · ออกแบบเลื่อนหาย
 * - เส้นนับถอยหลังด้านล่าง · ชี้เมาส์/โฟกัสที่กลุ่ม = หยุดนับทุกตัว (อ่านทัน) · ปัดซ้าย/ขวาทิ้งได้
 * - success ติ๊กวาดเส้น · error สั่นตอนเข้า · loading หมุนแล้วแปลงร่างเป็นผลลัพธ์ (toast.promise)
 * - ปุ่ม action ในกล่อง (เช่น "เลิกทำ") · error เป็น role="alert" ตัวอื่นเป็น role="status"
 */
export function Toaster() {
  const t = useT();
  const list = React.useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  const [paused, setPaused] = React.useState(false);

  return (
    <section
      aria-label={t('toast.region')}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }}
      className="pointer-events-none fixed inset-x-3 top-3 z-[200] sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[22rem]"
    >
      <ol className="flex flex-col items-center gap-2 sm:items-stretch">
        <AnimatePresence initial={false}>
          {list.map((item) => <ToastCard key={item.id} item={item} paused={paused} />)}
        </AnimatePresence>
      </ol>
    </section>
  );
}

function ToastCard({ item, paused }: { item: ToastItem; paused: boolean }) {
  const t = useT();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLLIElement>(null);
  const [exitX, setExitX] = React.useState(0);
  const finite = Number.isFinite(item.duration);

  // นับถอยหลัง: หยุดนับตอน paused แล้วนับต่อจากที่เหลือ · เปลี่ยนเวอร์ชัน (เช่น loading → success) = เริ่มนับใหม่
  const remaining = React.useRef(item.duration);
  React.useEffect(() => { remaining.current = item.duration; }, [item.version, item.duration]);
  React.useEffect(() => {
    if (!finite || paused) return;
    const started = performance.now();
    const id = window.setTimeout(() => dismissToast(item.id), remaining.current);
    return () => { window.clearTimeout(id); remaining.current -= performance.now() - started; };
  }, [paused, finite, item.id, item.version]);

  React.useEffect(() => { if (item.kind === 'error') shake(ref.current); }, [item.kind, item.version]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) {
      setExitX(info.offset.x > 0 ? 400 : -400);
      dismissToast(item.id);
    }
  }

  const k = KIND[item.kind];
  return (
    <motion.li
      ref={ref} layout={!reduce}
      role={item.kind === 'error' ? 'alert' : 'status'} aria-atomic="true"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.94, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: exitX || 40, scale: exitX ? 1 : 0.96, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 460, damping: 32, mass: 0.8 }}
      drag={reduce ? false : 'x'} dragSnapToOrigin dragElastic={0.6} onDragEnd={onDragEnd}
      className={cn(
        'group pointer-events-auto relative flex w-full max-w-[24rem] list-none items-start gap-3 overflow-hidden rounded-2xl bg-surface/95 p-3 pr-2 backdrop-blur',
        'shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3),0_0_0_1px_rgb(var(--ink)/0.07)] cursor-grab active:cursor-grabbing',
      )}
    >
      <span key={`${item.kind}-${item.version}`} className={cn('toast-icon grid size-9 shrink-0 place-items-center rounded-xl', k.tile)}>
        <KindIcon kind={item.kind} />
      </span>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="whitespace-pre-line text-sm font-semibold leading-snug text-ink">{item.message}</p>
        {item.description && <p className="mt-0.5 text-xs leading-relaxed text-ink-mute">{item.description}</p>}
        {item.action && (
          <button
            type="button"
            onClick={() => { item.action!.onClick(); dismissToast(item.id); }}
            className="mt-1.5 rounded-md text-xs font-bold text-brand-link underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button" onClick={() => dismissToast(item.id)} aria-label={t('common.close')}
        className="grid size-7 shrink-0 place-items-center rounded-full text-ink-mute opacity-60 transition hover:bg-ink/[0.06] hover:text-ink hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
      >
        <X size={15} />
      </button>
      {finite && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-ink/[0.05]">
          <span
            key={item.version}
            className={cn('toast-countdown block h-full origin-left', k.bar)}
            style={{ animationDuration: `${item.duration}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </span>
      )}
    </motion.li>
  );
}
