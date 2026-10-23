'use client';

import { useState, type ReactNode } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import type { ChartTable } from './theme';

/**
 * กรอบของกราฟ: หัวข้อ + คำอธิบาย + legend + ปุ่มสลับเป็นตาราง (ฝาแฝดที่เข้าถึงได้ของกราฟ)
 * - `loading`: กราฟเดิมค้างไว้แต่จางลง ไม่กระพริบเป็น skeleton และไม่ขยับเลย์เอาต์ (ตามสเปกการรีเฟรชของ dataviz)
 * - `empty`: แสดง EmptyState ขนาดเล็กแทนกราฟ
 * - ความสูงของกราฟอยู่ที่ตัวกราฟเอง (รวมแกน x แล้ว) กรอบจึงโตตามเนื้อหา ไม่เกิดสกรอลล์ซ้อน
 */
export function ChartCard({
  title, description, actions, legend, table, loading, empty, emptyText, footer, children, className,
}: {
  title: string;
  description?: string;
  /** ปุ่ม/ตัวควบคุมมุมขวาบน */
  actions?: ReactNode;
  legend?: ReactNode;
  /** มีค่า = แสดงปุ่ม กราฟ|ตาราง */
  table?: ChartTable;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const t = useT();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const showTable = view === 'table' && table;

  return (
    <figure className={cn('flex min-w-0 flex-col rounded-card bg-surface p-5 shadow-card', className)} aria-busy={loading || undefined}>
      <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ink-mute">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {table && !empty && (
            <div role="group" aria-label={t('chart.view_table')} className="flex rounded-pill bg-ink/[.06] p-0.5">
              {([['chart', BarChart3, t('chart.view_chart')], ['table', Table2, t('chart.view_table')]] as const).map(([k, Icon, label]) => (
                <button
                  key={k} type="button" aria-pressed={view === k} aria-label={label} title={label} onClick={() => setView(k)}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-pill text-ink-mute outline-none transition',
                    'focus-visible:ring-2 focus-visible:ring-brand-500/40', view === k ? 'bg-surface text-ink shadow-sm' : 'hover:text-ink',
                  )}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          )}
        </div>
      </figcaption>

      {legend && !showTable && !empty && <div className="mb-3">{legend}</div>}

      <div className={cn('min-w-0 flex-1 transition-opacity duration-300', loading && 'pointer-events-none opacity-50')}>
        {empty ? (
          <EmptyState size="sm" title={emptyText ?? t('common.empty')} />
        ) : showTable ? (
          <div className="max-h-80 overflow-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-ink/10">
                  {table.columns.map((c, i) => (
                    <th key={i} scope="col" className={cn('px-3 py-2 font-semibold text-ink-mute', i > 0 && 'text-right')}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, ri) => (
                  <tr key={ri} className="border-b border-ink/10 last:border-0">
                    {r.map((c, i) => (
                      <td key={i} className={cn('px-3 py-2', i === 0 ? 'font-medium text-ink' : 'text-right tabular-nums text-ink-soft')}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>

      {footer && <div className="mt-3 text-xs text-ink-mute">{footer}</div>}
    </figure>
  );
}
