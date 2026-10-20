'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import { useT } from '@/lib/i18n/client';

/** ดูรูป/วิดีโอเต็มจอ: คลิกฉากหลัง ปุ่ม × หรือ Esc เพื่อปิด */
export function MediaLightbox({ src, video, title, onClose }: { src: string; video: boolean; title: string; onClose: () => void }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = prev; };
  }, [onClose]);
  const t = useT();
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 sm:p-8" onClick={onClose}>
      <button type="button" aria-label={t('common.close')} onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"><X size={20} /></button>
      <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {video ? (
          <video src={src} controls autoPlay className="max-h-[82vh] max-w-[92vw] rounded-lg bg-black" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain" />
        )}
        {title && <p className="max-w-[80vw] truncate text-sm font-semibold text-white">{title}</p>}
      </div>
    </div>,
    document.body,
  );
}

/** รูปที่กดแล้วเปิดดูเต็มจอ (มีไอคอนขยายตอนวางเมาส์) */
export function ZoomImage({ src, alt = '', className, imgClassName }: { src: string; alt?: string; className?: string; imgClassName?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t('common.zoom')} className={`group relative block cursor-zoom-in ${className ?? ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClassName} />
        <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Maximize2 size={14} /></span>
      </button>
      {open && <MediaLightbox src={src} video={false} title={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
