'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { dictionaries, type DictKey } from '@/lib/i18n';

/** ป้ายสถานะกลาง — ใช้ทั้งหน้าบ้านและหลังบ้าน คำแปลอยู่ที่เดียว */
const tone: Record<string, string> = {
  passed: 'bg-ok-50 text-ok-700',
  completed: 'bg-ok-50 text-ok-700',
  published: 'bg-ok-50 text-ok-700',
  active: 'bg-ok-50 text-ok-700',
  resolved: 'bg-ok-50 text-ok-700',
  sent: 'bg-ok-50 text-ok-700',

  in_progress: 'bg-warn-50 text-warn-700',
  queued: 'bg-warn-50 text-warn-700',
  open: 'bg-warn-50 text-warn-700',

  not_started: 'bg-ink/8 text-ink-mute',
  draft: 'bg-warn-50 text-warn-700',
  archived: 'bg-ink/8 text-ink-mute',
  closed: 'bg-ink/8 text-ink-mute',
  skipped: 'bg-ink/8 text-ink-mute',

  overdue: 'bg-danger-50 text-danger-700',
  failed: 'bg-danger-50 text-danger-700',
  suspended: 'bg-danger-50 text-danger-700',
};



export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useT();
  const key = `badge.${status}` as DictKey;
  const text = key in dictionaries.th ? t(key) : status;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-bold',
        tone[status] ?? 'bg-ink/8 text-ink-soft',
        className,
      )}
    >
      {status === 'overdue' && <AlertTriangle size={11} />}
      {text}
    </span>
  );
}
