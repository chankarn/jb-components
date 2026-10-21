'use client';

import { useT } from '@/lib/i18n/client';
import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from '@/components/feedback';
import { cn } from '@/lib/utils';
import { ZoomImage } from '@/components/MediaLightbox';

/**
 * ช่องแนบรูป — เก็บเป็นค่าสตริง (เช่น asset_key) · ผูกกับระบบอัปโหลดของโปรเจกต์ปลายทางผ่าน props
 * (ต้นทางเรียก uploadAsset/adminAssetUrl ของระบบอบรมตรงๆ — ที่นี่แยกออกมาเป็น `upload` และ `resolveUrl`)
 */
export function ImagePicker({
  value,
  onChange,
  upload,
  resolveUrl,
  size = 'md',
  label,
}: {
  value: string | null | undefined;
  onChange: (key: string | null) => void;
  /** อัปโหลดไฟล์แล้วคืนค่าที่จะเก็บ (เช่น asset_key) · โยน Error เพื่อแสดง toast */
  upload: (file: File) => Promise<string>;
  /** แปลงค่าที่เก็บเป็น URL สำหรับแสดงรูป */
  resolveUrl: (value: string) => string;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.img.failed'));
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className={cn('relative shrink-0 overflow-hidden rounded-xl border border-ink/10', size === 'sm' ? 'h-28 w-44' : 'h-52 w-full')}>
        <ZoomImage src={resolveUrl(value)} className="h-full w-full" imgClassName="h-full w-full bg-paper object-contain" />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t('admin.img.remove')}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white transition hover:bg-ink"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/25 text-[11px] font-semibold text-ink-mute transition',
        'hover:border-brand-500 hover:bg-brand-50 hover:text-brand-link focus-within:border-brand-500 focus-within:bg-brand-50 focus-within:text-brand-link',
        busy && 'pointer-events-none opacity-60',
        size === 'sm' ? 'h-10 shrink-0 px-3' : 'h-14 w-full',
      )}
    >
      <ImagePlus size={size === 'sm' ? 15 : 16} />
      <span>{busy ? t('admin.img.uploading') : label ?? t('admin.q.attach')}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pick(f);
          e.target.value = '';
        }}
      />
    </label>
  );
}
