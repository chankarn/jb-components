'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatFull, seriesColor } from './theme';

/**
 * ลิสต์อันดับ (Top N): ชื่อ + ค่า + แท่งบางใต้ชื่อ — อ่านง่ายกว่ากราฟแท่งนอนเมื่อมีชื่อยาวหรือเป็นแค่ 5–10 อันดับ
 * ทุกแท่งใช้สีเดียว (ช่อง `slot`) เพราะเป็นซีรีส์เดียว ไม่ไล่สีตามค่า — ความยาวแท่งบอกค่าอยู่แล้ว
 * แท่งโตขึ้นจาก 0 ตอนแสดงครั้งแรก (ผู้ใช้ตั้งลดการเคลื่อนไหวในระบบ = แสดงเลย)
 */
export function RankList({
  items, valueFormat = formatFull, slot = 0, showRank = true, className,
}: {
  items: { label: string; value: number; hint?: string }[];
  valueFormat?: (n: number) => string;
  slot?: number;
  showRank?: boolean;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(id); }, []);
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol className={cn('space-y-3.5', className)}>
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="flex items-baseline gap-2.5 text-sm">
            {showRank && <span className="w-4 shrink-0 text-xs font-semibold tabular-nums text-ink-mute">{i + 1}</span>}
            <span className="min-w-0 flex-1 truncate font-medium text-ink">{it.label}</span>
            {it.hint && <span className="shrink-0 text-xs text-ink-mute">{it.hint}</span>}
            <span className="shrink-0 font-bold tabular-nums text-ink">{valueFormat(it.value)}</span>
          </div>
          <div className={cn('mt-1.5 h-1.5 overflow-hidden rounded-pill bg-ink/8', showRank && 'ml-[1.625rem]')}>
            <div
              className="h-full rounded-pill transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: ready ? `${(it.value / max) * 100}%` : 0, background: seriesColor(slot), transitionDelay: `${Math.min(i, 8) * 50}ms` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
