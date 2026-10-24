'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, ImageOff, Maximize2, Play, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { formatDuration, mediaKind, stepIndex, swipeDirection } from '@/lib/media';
import { useModal } from '@/components/Overlay';
import { Loader } from '@/components/Loading';

export type MediaItem = {
  src: string;
  /** 'image' | 'video' หรือ MIME ของไฟล์ (เช่น 'video/mp4' จากไฟล์ที่อัปโหลด) · ไม่ระบุ = ดูจากนามสกุล */
  type?: string;
  title?: string;
  /** ข้อความแทนรูป (ไม่ระบุ = ใช้ title) */
  alt?: string;
  /** ภาพปกของวิดีโอ (ไม่ระบุ = ใช้เฟรมแรกของคลิป) */
  poster?: string;
  /** เครดิต/บรรทัดรองใต้ชื่อ */
  credit?: string;
};

type ListProps = { items: MediaItem[]; index: number; onIndexChange?: (i: number) => void; open?: boolean; onClose: () => void };
/** รูปแบบเดิม (ทีละไฟล์) — ยังใช้ได้ */
type LegacyProps = { src: string; video: boolean; title: string; onClose: () => void };

const ZOOM = 2.5;

/**
 * MediaLightbox: ดูรูป/วิดีโอเต็มจอ ทีละรายการหรือเป็นชุด
 * - เลื่อนดู: ปุ่ม ‹ › · ← → · ปัดซ้าย/ขวา (รูป) · แถบภาพย่อด้านล่าง · เปลี่ยนรายการแล้วเลื่อนเข้าตามทิศ
 * - รูป: คลิก/ดับเบิลคลิกหรือปุ่ม 🔍 ซูม 2.5 เท่า แล้วลากดูส่วนต่างๆ · Esc ครั้งแรกออกจากซูม ครั้งที่สองปิด
 * - วิดีโอ: เล่นเองพร้อมปุ่มควบคุมของเบราว์เซอร์ · เปลี่ยนรายการแล้วหยุดเอง · ใช้กับไฟล์ที่เพิ่งเลือกจากเครื่องได้ (URL.createObjectURL)
 * - ปุ่มเปิดไฟล์ต้นฉบับในแท็บใหม่ · โหลดรูปข้างเคียงไว้ก่อน (เลื่อนแล้วไม่ต้องรอ) · โหลดไม่ได้ → แจ้งในหน้าต่าง
 * - พฤติกรรมหน้าต่างเดียวกับ Dialog: ล็อกการเลื่อน · กัน Tab หลุด · ปิดแล้วคืนโฟกัส · ประกาศ "รายการที่ n จาก N"
 */
export function MediaLightbox(props: ListProps | LegacyProps) {
  const legacy = 'src' in props;
  const items: MediaItem[] = legacy ? [{ src: props.src, type: props.video ? 'video' : 'image', title: props.title }] : props.items;
  const open = legacy ? true : props.open ?? true;
  const [inner, setInner] = React.useState(legacy ? 0 : props.index);
  const index = legacy ? 0 : props.onIndexChange ? props.index : inner;
  const setIndex = (i: number) => { if (!legacy && props.onIndexChange) props.onIndexChange(i); else setInner(i); };
  React.useEffect(() => { if (!legacy && !props.onIndexChange) setInner(props.index); }, [legacy ? 0 : props.index]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = useT();
  const reduce = useReducedMotion();
  const panel = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const [zoom, setZoom] = React.useState(1);
  const [dir, setDir] = React.useState<1 | -1>(1);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const zoomed = zoom > 1;
  const zoomRef = React.useRef(zoom);
  zoomRef.current = zoom;

  // Esc: ซูมอยู่ → ออกจากซูมก่อน · ไม่ซูม → ปิด
  useModal(open, () => (zoomRef.current > 1 ? setZoom(1) : props.onClose()), panel, true, false);

  const count = items.length;
  const item = items[Math.min(index, count - 1)];
  const kind = item ? mediaKind(item.src, item.type) : 'image';

  const go = React.useCallback((d: 1 | -1) => {
    if (count < 2) return;
    setDir(d);
    setZoom(1);
    setIndex(stepIndex(index, d, count));
  }, [count, index]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => { setZoom(1); setStatus(kind === 'video' ? 'ready' : 'loading'); }, [index, kind]);

  // ← → เปลี่ยนรายการ (ยกเว้นตอนโฟกัสอยู่ที่ตัวเล่นวิดีโอ — ลูกศรใช้กรอเวลา)
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'VIDEO') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  // โหลดรูปข้างเคียงไว้ก่อน
  React.useEffect(() => {
    if (!open || count < 2) return;
    for (const d of [1, -1] as const) {
      const n = items[stepIndex(index, d, count)];
      if (n && mediaKind(n.src, n.type) === 'image') { const img = new Image(); img.src = n.src; }
    }
  }, [open, index, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const moved = React.useRef(false);
  function onDragEnd(_: unknown, info: PanInfo) {
    if (zoomed) return;
    const d = swipeDirection(info.offset.x, info.velocity.x, window.innerWidth);
    if (d) go(d);
  }

  if (!mounted || !item) return null;
  const title = item.title ?? '';
  const btn = 'grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-30';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel} role="dialog" aria-modal="true" aria-label={title || t('media.viewer')} tabIndex={-1}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex flex-col bg-black/90 text-white outline-none backdrop-blur-sm"
        >
          {/* แถบบน */}
          <div className="flex shrink-0 items-center gap-3 px-3 py-3 sm:px-5">
            <div className="min-w-0 flex-1">
              {count > 1 && <p className="text-xs font-semibold tabular-nums text-white/60">{t('media.count', { n: index + 1, total: count })}</p>}
              {title && <p className="truncate text-sm font-semibold">{title}</p>}
            </div>
            {kind === 'image' && status === 'ready' && (
              <button type="button" className={btn} onClick={() => setZoom(zoomed ? 1 : ZOOM)} aria-label={zoomed ? t('media.zoom_out') : t('media.zoom_in')} aria-pressed={zoomed}>
                {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
            )}
            <a href={item.src} target="_blank" rel="noopener noreferrer" className={btn} aria-label={t('media.open_original')} title={t('media.open_original')}>
              <ExternalLink size={17} />
            </a>
            <button type="button" className={btn} onClick={props.onClose} aria-label={t('common.close')}><X size={20} /></button>
          </div>

          {/* พื้นที่แสดง */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-16" onClick={(e) => { if (e.target === e.currentTarget) props.onClose(); }}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={index} custom={dir}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 90, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -90, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="flex max-h-full max-w-full items-center justify-center"
              >
                {kind === 'video' ? (
                  <video
                    key={item.src} src={item.src} poster={item.poster} controls autoPlay playsInline
                    onError={() => setStatus('error')}
                    className={cn('max-h-[calc(100dvh-11rem)] max-w-full rounded-xl bg-black shadow-2xl', status === 'error' && 'hidden')}
                  />
                ) : (
                  <motion.img
                    key={item.src} src={item.src} alt={item.alt ?? title} draggable={false}
                    onLoad={() => setStatus('ready')} onError={() => setStatus('error')}
                    animate={{ scale: zoom }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag={zoomed ? true : count > 1 ? 'x' : false}
                    dragConstraints={zoomed ? { left: -600, right: 600, top: -400, bottom: 400 } : { left: 0, right: 0 }}
                    dragElastic={zoomed ? 0.15 : 0.5} dragSnapToOrigin={!zoomed}
                    onDragStart={() => { moved.current = true; }}
                    onDragEnd={onDragEnd}
                    onPointerDown={() => { moved.current = false; }}
                    onClick={() => { if (!moved.current && status === 'ready') setZoom(zoomed ? 1 : ZOOM); }}
                    onDoubleClick={(e) => e.preventDefault()}
                    className={cn(
                      'max-h-[calc(100dvh-11rem)] max-w-full select-none rounded-xl object-contain shadow-2xl',
                      zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
                      status !== 'ready' && 'opacity-0',
                    )}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            {status === 'loading' && <div className="pointer-events-none absolute inset-0 grid place-items-center"><Loader size={34} tone="current" /></div>}
            {status === 'error' && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-2 text-white/70"><ImageOff size={32} /><p className="text-sm">{t('media.load_failed')}</p></div>
              </div>
            )}
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label={t('media.prev')} className={cn(btn, 'absolute left-2 top-1/2 size-11 -translate-y-1/2 sm:left-4')}><ChevronLeft size={22} /></button>
                <button type="button" onClick={() => go(1)} aria-label={t('media.next')} className={cn(btn, 'absolute right-2 top-1/2 size-11 -translate-y-1/2 sm:right-4')}><ChevronRight size={22} /></button>
              </>
            )}
          </div>

          {/* คำบรรยาย + แถบภาพย่อ */}
          <div className="shrink-0 space-y-3 px-3 pb-4 pt-3 sm:px-5">
            {item.credit && <p className="text-center text-xs text-white/60">{item.credit}</p>}
            {count > 1 && (
              <div className="no-scrollbar mx-auto flex max-w-full justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
                {items.map((it, i) => {
                  const v = mediaKind(it.src, it.type) === 'video';
                  return (
                    <button
                      key={i} type="button" aria-label={`${it.title ?? ''} (${t('media.count', { n: i + 1, total: count })})`} aria-current={i === index || undefined}
                      onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
                      className={cn('relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition', i === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90')}
                    >
                      {v && !it.poster ? (
                        <video src={`${it.src}#t=0.1`} preload="metadata" muted playsInline className="pointer-events-none size-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.poster ?? it.src} alt="" className="size-full object-cover" />
                      )}
                      {v && <Play aria-hidden size={14} className="absolute inset-0 m-auto fill-white text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p aria-live="polite" className="sr-only">{count > 1 ? t('media.count', { n: index + 1, total: count }) : ''}</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * MediaThumb: ภาพย่อของรูปหรือวิดีโอที่กดแล้วเปิด MediaLightbox (ใช้เดี่ยวๆ หรือผ่าน MediaGallery)
 * วิดีโอแสดงภาพปก (หรือเฟรมแรกของคลิป) + ปุ่ม ▶ + ความยาวคลิป
 */
export function MediaThumb({ item, onOpen, className }: { item: MediaItem; onOpen: () => void; className?: string }) {
  const t = useT();
  const video = mediaKind(item.src, item.type) === 'video';
  const [duration, setDuration] = React.useState<number | null>(null);
  const vid = React.useRef<HTMLVideoElement>(null);
  // วิดีโอที่ render จาก server อาจโหลด metadata เสร็จก่อน React ผูก onLoadedMetadata → อ่านค่าเองตอน mount ด้วย
  React.useEffect(() => { const v = vid.current; if (v && v.readyState >= 1) setDuration(v.duration); }, [item.src]);
  return (
    <button
      type="button" onClick={onOpen}
      aria-label={`${video ? t('media.play_video') : t('common.zoom')}${item.title ? `: ${item.title}` : ''}`}
      className={cn('group relative block overflow-hidden rounded-2xl bg-ink/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60', video ? 'cursor-pointer' : 'cursor-zoom-in', className)}
    >
      {video && !item.poster ? (
        <video
          ref={vid} src={`${item.src}#t=0.1`} preload="metadata" muted playsInline onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          className="pointer-events-none size-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster ?? item.src} alt={item.alt ?? item.title ?? ''} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      {video ? (
        <>
          <span aria-hidden className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:bg-brand-600">
            <Play size={20} className="ml-0.5 fill-current" />
          </span>
          {formatDuration(duration) && <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">{formatDuration(duration)}</span>}
        </>
      ) : (
        <span aria-hidden className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 size={14} />
        </span>
      )}
      {item.title && (
        <span className="absolute inset-x-0 bottom-0 translate-y-2 truncate px-3 pb-2 text-left text-xs font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {item.title}
        </span>
      )}
    </button>
  );
}

/**
 * MediaGallery: ตารางภาพย่อรูป+วิดีโอ กดแล้วเปิดดูเต็มจอเป็นชุด (เลื่อนดูต่อได้)
 * `columns` = จำนวนคอลัมน์บนจอกว้าง (จอแคบ 2 คอลัมน์) · `aspect` = สัดส่วนภาพย่อ
 */
export function MediaGallery({ items, columns = 3, aspect = 'aspect-[4/3]', className }: { items: MediaItem[]; columns?: 2 | 3 | 4 | 5; aspect?: string; className?: string }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5' }[columns];
  return (
    <>
      <ul className={cn('grid grid-cols-2 gap-2 sm:gap-3', cols, className)}>
        {items.map((it, i) => (
          <li key={`${it.src}-${i}`}><MediaThumb item={it} onOpen={() => setOpen(i)} className={cn('w-full', aspect)} /></li>
        ))}
      </ul>
      <MediaLightbox items={items} index={open ?? 0} onIndexChange={setOpen} open={open !== null} onClose={() => setOpen(null)} />
    </>
  );
}

/** รูปที่กดแล้วเปิดดูเต็มจอ (มีไอคอนขยายตอนวางเมาส์) — ใช้ใน ImagePicker */
export function ZoomImage({ src, alt = '', className, imgClassName }: { src: string; alt?: string; className?: string; imgClassName?: string }) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t('common.zoom')} className={`group relative block cursor-zoom-in ${className ?? ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClassName} />
        <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Maximize2 size={14} /></span>
      </button>
      <MediaLightbox items={[{ src, title: alt, type: 'image' }]} index={0} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
