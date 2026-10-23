'use client';

import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

/**
 * การ์ดตัวเลขสรุป (stat tile): ป้าย · ค่า · เปลี่ยนแปลงเทียบช่วงก่อน · แนวโน้ม
 * - ค่าเป็นตัวเลขตัวเดียวที่เด่นที่สุดในการ์ด ใช้ฟอนต์เดียวกับหน้า (ไม่ใช้ฟอนต์หัวข้อ) และตัวเลขสัดส่วนปกติ (ไม่ tabular)
 * - delta: สีบอกว่า "ดีหรือไม่ดี" (ตาม `goodWhen`) ไม่ใช่แค่ขึ้น/ลง · มีลูกศรและเครื่องหมาย +/− กำกับเสมอ ไม่พึ่งสีอย่างเดียว
 *   (ค่าใช้จ่ายขึ้น = แย่ → goodWhen="down")
 * - `trend`: เส้นเล็กท้ายการ์ด · `onClick` ทำให้กดได้ (เช่น ไปหน้ารายละเอียด)
 */
export function KpiCard({
  label, value, unit, delta, deltaLabel, goodWhen = 'up', trend, icon, hint, onClick, className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  /** เปลี่ยนแปลงเป็นเปอร์เซ็นต์ เช่น 12.4 หรือ -3 */
  delta?: number;
  /** ชื่อช่วงที่เทียบ เช่น "เทียบเดือนก่อน" — ต้องมีเมื่อมี delta ไม่งั้นตัวเลขไม่มีความหมาย */
  deltaLabel?: string;
  goodWhen?: 'up' | 'down';
  trend?: number[];
  icon?: ReactNode;
  hint?: string;
  onClick?: () => void;
  className?: string;
}) {
  const dir = delta == null || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
  const good = dir === 'flat' ? null : dir === goodWhen;
  const Arrow = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-card bg-surface p-5 text-left shadow-card',
        onClick && 'outline-none transition hover:shadow-lift focus-visible:ring-2 focus-visible:ring-brand-500/40',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-link">{icon}</span>}
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-mute">{label}</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <div className="shrink-0">
          <p className="flex items-baseline gap-1 text-[32px] font-bold leading-none text-ink">
            <span className="whitespace-nowrap">{value}</span>
            {unit && <span className="text-sm font-semibold text-ink-mute">{unit}</span>}
          </p>
          {(delta != null || hint) && (
            <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-mute">
              {delta != null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-pill px-1.5 py-0.5 font-bold tabular-nums',
                    good == null ? 'bg-ink/[.06] text-ink-soft' : good ? 'bg-ok-50 text-ok-700' : 'bg-danger-50 text-danger-700',
                  )}
                >
                  <Arrow size={12} strokeWidth={2.5} aria-hidden />
                  {delta > 0 ? '+' : delta < 0 ? '−' : ''}{Math.abs(delta)}%
                </span>
              )}
              {deltaLabel && delta != null && <span>{deltaLabel}</span>}
              {hint && <span>{hint}</span>}
            </p>
          )}
        </div>
        {trend && trend.length > 1 && <Sparkline data={trend} className="h-11 min-w-24 flex-1" height={44} />}
      </div>
    </Tag>
  );
}
