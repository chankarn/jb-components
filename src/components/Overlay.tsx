'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

/* ─────────────────────────────────────────────────────────────
 * Dialog · Drawer — หน้าต่างซ้อนทับ (modal)
 * พฤติกรรมร่วม (useModal):
 * - ซ้อนกันได้ (drawer → dialog → confirm) · Esc/คลิกฉากหลังปิดแค่ชั้นบนสุด
 * - กัน Tab หลุดออกนอกหน้าต่าง (focus trap) · เปิดแล้วโฟกัสช่องแรก (หรือ [data-autofocus]) · ปิดแล้วคืนโฟกัสปุ่มที่กดเปิด
 * - ล็อกการเลื่อนหน้าหลัง โดยชดเชยความกว้าง scrollbar (หน้าไม่กระตุกไปทางขวา)
 * - `dismissible={false}` (เช่น ฟอร์มที่ยังไม่บันทึก): Esc/คลิกฉากหลัง/ปัดลง → หน้าต่างเด้งเตือนแทนการปิด
 * - portal ไป body · ฉากหลังเบลอ · ผู้ใช้ตั้งลดการเคลื่อนไหว = จางเข้าออกเท่านั้น
 * ───────────────────────────────────────────────────────────── */

const stack: symbol[] = [];
const FOCUSABLE = 'input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';

/** จอแคบ (< 640px) — Dialog กลายเป็น bottom sheet */
function useNarrow() {
  return React.useSyncExternalStore(
    (cb) => { const m = window.matchMedia('(max-width: 639px)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia('(max-width: 639px)').matches,
    () => false,
  );
}

function useModal(open: boolean, onClose: () => void, panel: React.RefObject<HTMLElement | null>, dismissible: boolean, focusField = true) {
  const close = React.useRef(onClose);
  close.current = onClose;
  const canDismiss = React.useRef(dismissible);
  canDismiss.current = dismissible;

  /** ปิดไม่ได้ → หน้าต่างเด้งเตือน */
  const nudge = React.useCallback(() => {
    const p = panel.current;
    if (!p || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    p.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.025)' }, { transform: 'scale(0.995)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
  }, [panel]);

  const dismiss = React.useCallback(() => { if (canDismiss.current) close.current(); else nudge(); }, [nudge]);

  React.useEffect(() => {
    if (!open) return;
    const id = Symbol('modal');
    stack.push(id);
    const opener = document.activeElement as HTMLElement | null;

    // ล็อกการเลื่อน (ชั้นแรกเท่านั้น) + ชดเชย scrollbar
    let unlock: (() => void) | undefined;
    if (stack.length === 1) {
      const b = document.body;
      const sw = window.innerWidth - document.documentElement.clientWidth;
      const prev = { overflow: b.style.overflow, pr: b.style.paddingRight };
      b.style.overflow = 'hidden';
      if (sw > 0) b.style.paddingRight = `${sw}px`;
      unlock = () => { b.style.overflow = prev.overflow; b.style.paddingRight = prev.pr; };
    }

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); return; }
      if (e.key !== 'Tab') return;
      const p = panel.current;
      if (!p) return;
      const active = document.activeElement;
      if (active instanceof Element && active.closest('[data-floating]')) return; // อยู่ในเมนู/ปฏิทินที่ลอยจากในหน้าต่าง
      const items = [...p.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === active);
      if (!items.length) { e.preventDefault(); p.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (active === first || !p.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !p.contains(active))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);

    // โฟกัสแรก: [data-autofocus] → ช่องกรอกแรกในเนื้อหา (Dialog เท่านั้น — Drawer มักเป็นหน้ารายละเอียด เริ่มที่ตัวแผง) → ตัวหน้าต่าง (ไม่เริ่มที่ปุ่มปิด)
    const raf = requestAnimationFrame(() => {
      const p = panel.current;
      if (!p || p.contains(document.activeElement)) return;
      const target = p.querySelector<HTMLElement>('[data-autofocus]')
        ?? (focusField ? p.querySelector<HTMLElement>('[data-modal-body] input:not([disabled]):not([type=hidden]), [data-modal-body] textarea, [data-modal-body] select') : null)
        ?? p;
      target.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      unlock?.();
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, dismiss, panel, focusField]);

  return { dismiss, nudge };
}

/** เงาบน/ล่างตอนเนื้อหาเลื่อนอยู่ (บอกว่ามีต่อ) */
function useScrollEdges() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ top: false, bottom: false });
  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.scrollTop > 2;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    setEdges((s) => (s.top === top && s.bottom === bottom ? s : { top, bottom }));
  }, []);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  });
  return { ref, edges, onScroll: measure };
}

function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

type Tone = 'brand' | 'danger' | 'success';
const TONE: Record<Tone, { icon: string; aurora: string }> = {
  brand: { icon: 'bg-brand-100 text-brand-link ring-brand-500/15', aurora: 'var(--brand-200)' },
  danger: { icon: 'bg-danger-50 text-danger-600 ring-danger-500/20', aurora: 'var(--danger-100)' },
  success: { icon: 'bg-ok-50 text-ok-600 ring-ok-500/20', aurora: 'var(--ok-50)' },
};

function CloseButton({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button" onClick={onClick} aria-label={t('common.close')}
      className="group/close relative -mr-1.5 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-mute transition hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
    >
      <X size={18} className="transition-transform duration-300 group-hover/close:rotate-90" />
    </button>
  );
}

/** แสงนุ่มไล่สีด้านบนของหน้าต่าง (แทนหัวสีทึบ) */
function Aurora({ tone }: { tone: Tone }) {
  return (
    <div
      aria-hidden
      className="modal-aurora pointer-events-none absolute inset-x-0 top-0 h-44"
      style={{
        background: `radial-gradient(55% 100% at 12% 0%, rgb(${TONE[tone].aurora} / 0.75), transparent 72%), radial-gradient(45% 90% at 92% 0%, rgb(var(--accent2-500) / 0.14), transparent 70%)`,
      }}
    />
  );
}

type Common = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** บรรทัดรองใต้หัวข้อ */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** ปุ่มด้านล่าง (ชิดขวา · จอแคบยืดเต็มแถว) */
  footer?: React.ReactNode;
  /** false = ปิดด้วย Esc/คลิกฉากหลัง/ปัดลงไม่ได้ (หน้าต่างเด้งเตือนแทน) และไม่มีปุ่ม × (Dialog) — ต้องมีปุ่มใน footer ที่พาออกได้เอง */
  dismissible?: boolean;
  className?: string;
};

/**
 * Dialog: หน้าต่างกลางจอ สำหรับฟอร์มสั้น/ยืนยัน · เนื้อหายาวหรือรายการให้เลื่อนดูใช้ Drawer
 * - เข้าแบบสปริงจากเบลอเป็นคม · ฉากหลังเบลอ · หัวเป็นแสงไล่สีนุ่มๆ (+ `icon` ในกรอบสี ตาม `tone`)
 * - เนื้อหาค่อยๆ ลอยขึ้นทีละบล็อก · เลื่อนแล้วมีเงาที่หัว/ท้ายบอกว่ามีต่อ
 * - จอแคบ: เป็น bottom sheet เลื่อนขึ้นจากล่าง มีที่จับ ปัดลงเพื่อปิด
 * - `variant="alert"`: แบบกล่องยืนยัน ไอคอนใหญ่ตรงกลาง ปุ่มเต็มแถว (role="alertdialog")
 */
export function Dialog({
  open, onClose, title, description, children, footer, dismissible = true, className,
  size = 'md', icon, tone = 'brand', variant = 'default',
}: Common & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  tone?: Tone;
  variant?: 'default' | 'alert';
}) {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const narrow = useNarrow();
  const panel = React.useRef<HTMLDivElement>(null);
  const { dismiss } = useModal(open, onClose, panel, dismissible);
  const scroll = useScrollEdges();
  const ids = React.useId();
  const controls = useDragControls();
  if (!mounted) return null;

  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-4xl' }[size];
  const alert = variant === 'alert';
  const sheet = narrow && !reduce;
  const anim = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : sheet
      ? { initial: { y: '100%' }, animate: { y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 36 } }, exit: { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const } } }
      : {
          initial: { opacity: 0, scale: 0.92, y: 24, filter: 'blur(8px)' },
          animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 360, damping: 28, mass: 0.9 } },
          exit: { opacity: 0, scale: 0.96, y: 12, filter: 'blur(4px)', transition: { duration: 0.16 } },
        };

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 110 || info.velocity.y > 600) dismiss();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-50 flex justify-center', sheet ? 'items-end' : 'items-center p-4 sm:p-6')}>
          <motion.div
            aria-hidden onClick={dismiss}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[6px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={panel} tabIndex={-1}
            role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby={`${ids}-t`} aria-describedby={description ? `${ids}-d` : undefined}
            {...anim}
            // ปัดลงได้จากที่จับ/หัวเท่านั้น (ลากในเนื้อหา = เลื่อน/เลือกข้อความตามปกติ)
            {...(sheet ? { drag: 'y' as const, dragControls: controls, dragListener: false, dragConstraints: { top: 0, bottom: 0 }, dragElastic: { top: 0, bottom: 0.5 }, dragSnapToOrigin: true, onDragEnd } : {})}
            className={cn(
              'relative flex w-full flex-col overflow-hidden bg-surface outline-none',
              'shadow-[0_24px_60px_-12px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.06)]',
              sheet ? 'max-h-[92dvh] rounded-t-[28px] pb-[env(safe-area-inset-bottom)]' : 'max-h-[min(90dvh,860px)] rounded-[28px]',
              alert ? 'sm:max-w-sm' : width,
              className,
            )}
          >
            {sheet && <div aria-hidden onPointerDown={(e) => controls.start(e)} className="relative z-10 mx-auto -mb-2 flex h-6 w-24 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"><span className="h-1.5 w-10 rounded-full bg-ink/15" /></div>}
            <Aurora tone={tone} />
            <header
              onPointerDown={(e) => { if (sheet && !(e.target as HTMLElement).closest('button')) controls.start(e); }}
              className={cn(
                sheet && 'touch-none',
                'relative z-[1] flex shrink-0 gap-4 transition-shadow duration-200',
                alert ? 'flex-col items-center px-6 pb-2 pt-8 text-center' : 'items-start px-6 pb-4 pt-6 sm:px-8 sm:pt-7',
                scroll.edges.top && 'shadow-[0_8px_16px_-12px_rgb(0_0_0/0.25)]',
              )}
            >
              {icon && (
                <span className={cn('modal-icon relative grid shrink-0 place-items-center ring-1', alert ? 'size-14 rounded-full' : 'size-11 rounded-2xl', TONE[tone].icon)}>
                  {alert && <span aria-hidden className="modal-icon-ring absolute inset-0 rounded-full" />}
                  {icon}
                </span>
              )}
              <div className={cn('min-w-0 flex-1', icon && !alert && 'pt-0.5')}>
                <h2 id={`${ids}-t`} className={cn('font-semibold leading-snug text-ink', alert ? 'text-lg' : 'text-xl')}>{title}</h2>
                {description && <p id={`${ids}-d`} className="mt-1 text-sm leading-relaxed text-ink-mute">{description}</p>}
              </div>
              {!alert && dismissible && <CloseButton onClick={onClose} />}
            </header>
            {children != null && (
              <div
                ref={scroll.ref} onScroll={scroll.onScroll} data-modal-body
                className={cn('relative min-h-0 flex-1 overflow-y-auto overscroll-contain', alert ? 'px-6 pb-2 text-center' : 'px-6 pb-6 sm:px-8')}
              >
                <div className="modal-body space-y-5">{children}</div>
              </div>
            )}
            {footer && (
              <footer
                className={cn(
                  'relative z-[1] flex shrink-0 flex-wrap gap-2 transition-shadow duration-200',
                  alert ? 'px-6 pb-6 pt-4 [&>*]:flex-1' : 'justify-end px-6 py-4 max-sm:[&>*]:flex-1 sm:px-8',
                  scroll.edges.bottom ? 'border-t border-ink/[0.06] shadow-[0_-8px_16px_-12px_rgb(0_0_0/0.25)]' : '',
                )}
              >
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type Side = 'right' | 'left' | 'bottom';

/**
 * Drawer: แผงเลื่อนออกจากขอบจอ สำหรับรายละเอียด/ฟอร์มยาว/ตัวกรอง
 * - จอกว้างเป็นแผงลอยมุมมนห่างขอบเล็กน้อย · จอแคบชิดขอบเต็มความสูง
 * - เลื่อนเข้าแบบสปริง · ปัดกลับทางขอบ (ขวา/ซ้าย/ลง) เพื่อปิด · เนื้อหาค่อยๆ ลอยขึ้นทีละบล็อก · หัว/ท้ายติดอยู่กับที่มีเงาตอนเลื่อน
 * - `side`: right (ค่าตั้งต้น) · left · bottom
 */
export function Drawer({
  open, onClose, title, description, children, footer, dismissible = true, className,
  side = 'right', size = 'md',
}: Common & { side?: Side; size?: 'sm' | 'md' | 'lg' }) {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const panel = React.useRef<HTMLElement>(null);
  const { dismiss } = useModal(open, onClose, panel, dismissible, false);
  const scroll = useScrollEdges();
  const ids = React.useId();
  const controls = useDragControls();
  if (!mounted) return null;

  const off = side === 'right' ? { x: '105%' } : side === 'left' ? { x: '-105%' } : { y: '105%' };
  const anim = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: off,
        animate: { x: 0, y: 0, transition: { type: 'spring' as const, stiffness: 340, damping: 34, mass: 0.9 } },
        exit: { ...off, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] as const } },
      };
  const axis: 'x' | 'y' = side === 'bottom' ? 'y' : 'x';
  const drag = reduce ? {} : {
    drag: axis,
    dragControls: controls,
    dragListener: false, // ลากได้จากหัวแผงเท่านั้น (เนื้อหาเลื่อน/เลือกข้อความได้ตามปกติ)
    dragConstraints: { top: 0, bottom: 0, left: 0, right: 0 },
    dragElastic: side === 'right' ? { right: 0.5, left: 0 } : side === 'left' ? { left: 0.5, right: 0 } : { bottom: 0.5, top: 0 },
    dragSnapToOrigin: true,
    onDragEnd: (_: unknown, info: PanInfo) => {
      const o = side === 'right' ? info.offset.x : side === 'left' ? -info.offset.x : info.offset.y;
      const v = side === 'right' ? info.velocity.x : side === 'left' ? -info.velocity.x : info.velocity.y;
      if (o > 120 || v > 600) dismiss();
    },
  };
  const width = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-50 flex', side === 'right' ? 'justify-end' : side === 'left' ? 'justify-start' : 'items-end justify-center')}>
          <motion.div
            aria-hidden onClick={dismiss}
            className="absolute inset-0 bg-ink/35 backdrop-blur-[4px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
          />
          <motion.aside
            ref={panel as React.RefObject<HTMLElement>} tabIndex={-1}
            role="dialog" aria-modal="true" aria-labelledby={`${ids}-t`} aria-describedby={description ? `${ids}-d` : undefined}
            {...anim} {...drag}
            className={cn(
              'relative flex w-full flex-col overflow-hidden bg-surface outline-none',
              'shadow-[0_24px_60px_-12px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.06)]',
              side === 'bottom'
                ? 'max-h-[88dvh] rounded-t-[28px] sm:max-w-3xl'
                : cn('h-full sm:m-3 sm:h-[calc(100%-1.5rem)] sm:rounded-[24px]', width),
              className,
            )}
          >
            {side === 'bottom' && <div aria-hidden onPointerDown={(e) => !reduce && controls.start(e)} className="relative z-10 mx-auto -mb-2 flex h-6 w-24 shrink-0 cursor-grab touch-none items-center justify-center"><span className="h-1.5 w-10 rounded-full bg-ink/15" /></div>}
            <Aurora tone="brand" />
            <header
              onPointerDown={(e) => { if (!reduce && !(e.target as HTMLElement).closest('button')) controls.start(e); }}
              className={cn('relative z-[1] flex shrink-0 touch-none select-none items-start gap-3 px-6 pb-4 pt-6 transition-shadow duration-200', scroll.edges.top && 'shadow-[0_8px_16px_-12px_rgb(0_0_0/0.25)]')}>
              <div className="min-w-0 flex-1">
                <h2 id={`${ids}-t`} className="text-lg font-semibold leading-snug text-ink">{title}</h2>
                {description && <p id={`${ids}-d`} className="mt-1 text-sm text-ink-mute">{description}</p>}
              </div>
              <CloseButton onClick={onClose} />
            </header>
            <div ref={scroll.ref} onScroll={scroll.onScroll} data-modal-body className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
              <div className="modal-body space-y-4">{children}</div>
            </div>
            {footer && (
              <footer className={cn('relative z-[1] flex shrink-0 flex-wrap justify-end gap-2 px-6 py-4 transition-shadow duration-200', scroll.edges.bottom && 'border-t border-ink/[0.06] shadow-[0_-8px_16px_-12px_rgb(0_0_0/0.25)]')}>
                {footer}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
