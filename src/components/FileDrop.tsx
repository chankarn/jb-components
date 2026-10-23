'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Archive, Check, CloudUpload, File as FileIcon, FileSpreadsheet, FileText, Film, Image as ImageIcon, Music, RotateCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { fileKind, formatBytes, validateFiles, type Rejection } from '@/lib/file-drop';
import { shake } from '@/lib/motion-fx';

/** อัปโหลดไฟล์หนึ่งไฟล์ แล้วคืนค่าที่จะเก็บ (เช่น asset_key หรือ URL) · เรียก onProgress(0..1) ระหว่างทาง · ยกเลิกได้ผ่าน signal · โยน Error = ไม่สำเร็จ */
export type UploadFn = (file: File, ctx: { onProgress: (ratio: number) => void; signal: AbortSignal }) => Promise<string>;
export type UploadedFile = { id: string; name: string; size: number; type: string; value: string };

type Item = {
  id: string;
  file: File;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  value?: string;
  error?: string;
  preview?: string;
  ctrl?: AbortController;
};

const KIND_ICON = { image: ImageIcon, video: Film, audio: Music, pdf: FileText, sheet: FileSpreadsheet, doc: FileText, archive: Archive, other: FileIcon };
const KIND_TONE: Record<keyof typeof KIND_ICON, string> = {
  image: 'bg-brand-100 text-brand-link', video: 'bg-brand-100 text-brand-link', audio: 'bg-brand-100 text-brand-link',
  pdf: 'bg-danger-50 text-danger-700', sheet: 'bg-ok-50 text-ok-700', doc: 'bg-ink/8 text-ink-soft', archive: 'bg-warn-50 text-warn-700', other: 'bg-ink/8 text-ink-soft',
};

let seq = 0;

/**
 * FileDrop: ลากไฟล์มาวางหรือกดเลือก · หลายไฟล์ · แถบความคืบหน้ารายไฟล์ · ยกเลิก/ลองใหม่/ลบ
 * - ผูกกับระบบอัปโหลดของโปรเจกต์ผ่าน `upload` (ดู UploadFn) · ได้รายการไฟล์ที่อัปโหลดเสร็จทาง `onChange`
 * - ตรวจชนิด (`accept` แบบเดียวกับ <input accept>) ขนาด (`maxSize` ไบต์) จำนวน (`maxFiles`) ก่อนอัปโหลด — ไฟล์ที่ไม่ผ่านแจ้งเป็นรายไฟล์ ไม่ทำให้ไฟล์อื่นตก
 * - รูปภาพมีภาพย่อ · ไฟล์อื่นมีไอคอนตามชนิด · แถวเข้า/ออกแบบนุ่มๆ
 * - กล่องวางไฟล์กด Tab ถึงและกด Enter/Space เปิดหน้าต่างเลือกไฟล์ได้ · สถานะอัปโหลดประกาศผ่าน aria-live
 */
export function FileDrop({
  upload, onChange, accept, maxSize, maxFiles, multiple = true, disabled, hint, className,
}: {
  upload: UploadFn;
  onChange?: (files: UploadedFile[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** ข้อความใต้หัวกล่อง (ไม่ระบุ = สรุปจาก maxFiles/maxSize ให้) */
  hint?: string;
  className?: string;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const inputId = React.useId();
  const [items, setItems] = React.useState<Item[]>([]);
  const [rejected, setRejected] = React.useState<Rejection[]>([]);
  const [over, setOver] = React.useState(false);
  const zone = React.useRef<HTMLLabelElement>(null);
  const depth = React.useRef(0); // dragenter/leave ยิงซ้ำตอนผ่านลูกข้างใน → นับชั้นกันกระพริบ
  const limit = multiple ? maxFiles : 1;
  const full = limit != null && items.length >= limit;

  // ส่งรายการที่เสร็จแล้วออกไปทุกครั้งที่เปลี่ยน
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const doneKey = items.filter((i) => i.status === 'done').map((i) => i.id).join();
  React.useEffect(() => {
    onChangeRef.current?.(items.filter((i) => i.status === 'done').map((i) => ({ id: i.id, name: i.file.name, size: i.file.size, type: i.file.type, value: i.value! })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey]);

  // คืนหน่วยความจำของภาพย่อเมื่อออกจากหน้า
  const itemsRef = React.useRef(items);
  itemsRef.current = items;
  React.useEffect(() => () => itemsRef.current.forEach((i) => { i.ctrl?.abort(); if (i.preview) URL.revokeObjectURL(i.preview); }), []);

  const patch = (id: string, p: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...p } : i)));

  function start(item: Item) {
    const ctrl = new AbortController();
    patch(item.id, { status: 'uploading', progress: 0, error: undefined, ctrl });
    upload(item.file, { signal: ctrl.signal, onProgress: (r) => patch(item.id, { progress: Math.max(0, Math.min(1, r)) }) })
      .then((value) => { if (!ctrl.signal.aborted) patch(item.id, { status: 'done', progress: 1, value, ctrl: undefined }); })
      .catch((e: unknown) => { if (!ctrl.signal.aborted) patch(item.id, { status: 'error', error: e instanceof Error ? e.message : undefined, ctrl: undefined }); });
  }

  function add(list: FileList | File[]) {
    if (disabled) return;
    const { accepted, rejected: bad } = validateFiles(Array.from(list), { accept, maxSize, maxFiles: limit, existing: items.length });
    setRejected(bad);
    if (bad.length) shake(zone.current);
    const fresh: Item[] = accepted.map((file) => ({
      id: `f${++seq}`, file, status: 'uploading', progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    if (!fresh.length) return;
    setItems((cur) => [...cur, ...fresh]);
    fresh.forEach(start);
  }

  function remove(item: Item) {
    item.ctrl?.abort();
    if (item.preview) URL.revokeObjectURL(item.preview);
    setItems((list) => list.filter((i) => i.id !== item.id));
  }

  const reason = (r: Rejection) =>
    r.reason === 'type' ? t('file.reject_type', { name: r.name })
      : r.reason === 'size' ? t('file.reject_size', { name: r.name, size: formatBytes(maxSize ?? 0) })
        : t('file.reject_count', { name: r.name, n: String(limit ?? 0) });

  const summary = hint ?? [limit != null && limit > 1 ? t('file.limit_count', { n: String(limit) }) : null, maxSize != null ? t('file.limit_size', { size: formatBytes(maxSize) }) : null]
    .filter(Boolean).join(' · ');
  const uploading = items.filter((i) => i.status === 'uploading').length;
  const off = disabled || full;

  return (
    <div className={cn('space-y-3', className)}>
      <label
        ref={zone} htmlFor={inputId}
        data-dropzone data-over={over || undefined}
        onDragEnter={(e) => { e.preventDefault(); if (off) return; depth.current++; setOver(true); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = off ? 'none' : 'copy'; }}
        onDragLeave={() => { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setOver(false); }}
        onDrop={(e) => { e.preventDefault(); depth.current = 0; setOver(false); if (!off) add(e.dataTransfer.files); }}
        className={cn(
          'dropzone group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-[border-color,background-color] duration-200',
          over ? 'border-brand-500 bg-brand-50' : 'border-ink/15 bg-surface',
          off ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-500/70 hover:bg-brand-50/60',
          'has-[:focus-visible]:border-brand-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/30',
        )}
      >
        <span className={cn('dropzone-icon grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-link transition-transform duration-300', over && 'scale-110')}>
          <CloudUpload size={24} />
        </span>
        <span className="text-sm font-semibold text-ink">
          {full ? t('file.full', { n: String(limit) }) : over ? t('file.release') : (
            <>{t('file.drop')} <span className="text-brand-link underline decoration-brand-500/40 underline-offset-4 group-hover:decoration-brand-500">{t('file.browse')}</span></>
          )}
        </span>
        {summary && <span className="text-xs text-ink-mute">{summary}</span>}
        <input
          id={inputId} type="file" className="sr-only" accept={accept} multiple={multiple} disabled={off}
          onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }}
        />
      </label>

      <AnimatePresence initial={false}>
        {rejected.length > 0 && (
          <motion.div
            key="rejected" role="alert"
            initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={reduce ? undefined : { opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 rounded-xl bg-danger-50 px-3 py-2 text-xs text-danger-700">
              <ul className="min-w-0 flex-1 space-y-0.5">{rejected.map((r, i) => <li key={i} className="break-words">{reason(r)}</li>)}</ul>
              <button type="button" onClick={() => setRejected([])} aria-label={t('file.dismiss')} className="-m-1 shrink-0 rounded-full p-1 transition hover:bg-danger-100">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="sr-only">{uploading > 0 ? t('file.uploading_n', { n: String(uploading) }) : ''}</p>

      {items.length > 0 && (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const kind = fileKind(item.file);
              const Icon = KIND_ICON[kind];
              const pct = Math.round(item.progress * 100);
              return (
                <motion.li
                  key={item.id} layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className={cn('relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-surface p-2.5 pr-3', item.status === 'error' ? 'border-danger-500/40' : 'border-ink/10')}
                >
                  {item.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt="" className="size-11 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', KIND_TONE[kind])}><Icon size={20} /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink" title={item.file.name}>{item.file.name}</p>
                    <p className={cn('mt-0.5 flex items-center gap-1.5 text-[11px]', item.status === 'error' ? 'text-danger-700' : 'text-ink-mute')}>
                      <span className="tabular-nums">{formatBytes(item.file.size)}</span>
                      <span aria-hidden>·</span>
                      {item.status === 'uploading' && <span className="tabular-nums">{t('file.uploading', { p: String(pct) })}</span>}
                      {item.status === 'done' && <span className="inline-flex items-center gap-1 font-semibold text-ok-700"><Check size={12} strokeWidth={3} />{t('file.done')}</span>}
                      {item.status === 'error' && <span className="truncate">{item.error || t('file.failed')}</span>}
                    </p>
                    {item.status === 'uploading' && (
                      <div className="mt-1.5 h-1 overflow-hidden rounded-pill bg-ink/8">
                        <div className="file-progress h-full origin-left rounded-pill bg-brand-500" style={{ transform: `scaleX(${item.progress})` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {item.status === 'error' && (
                      <button type="button" onClick={() => start(item)} aria-label={t('file.retry')} title={t('file.retry')} className="grid size-8 place-items-center rounded-full text-ink-mute transition hover:bg-brand-50 hover:text-brand-link">
                        <RotateCw size={15} />
                      </button>
                    )}
                    <button
                      type="button" onClick={() => remove(item)}
                      aria-label={item.status === 'uploading' ? t('file.cancel_name', { name: item.file.name }) : t('file.remove', { name: item.file.name })}
                      title={item.status === 'uploading' ? t('file.cancel') : undefined}
                      className="grid size-8 place-items-center rounded-full text-ink-mute transition hover:bg-danger-50 hover:text-danger-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
