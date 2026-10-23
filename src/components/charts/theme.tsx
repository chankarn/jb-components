'use client';

import { useId, useState } from 'react';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import { formatCompact, formatFull, niceTicks } from '@/lib/chart-math';

export { formatCompact, formatFull, niceTicks };

/**
 * ชิ้นส่วนที่กราฟทุกตัวใช้ร่วมกัน: สี (จากโทเคน --chart-N ที่ตามสี CI) · รูปแบบตัวเลข · tooltip · legend
 * กติกาจากสกิล dataviz: เส้นบาง 2px · เส้นกริดเป็นเส้นทึบบางเฉียบ · ตัวหนังสือใช้สีข้อความเสมอ (ไม่ใช้สีของซีรีส์)
 * · สีติดกับซีรีส์ตามลำดับเดิม ไม่ใช่ตามอันดับ (ซ่อนซีรีส์แล้วตัวที่เหลือไม่เปลี่ยนสี)
 */

/** ช่องสี 0–7 ของพาเลตกราฟ (เกินแปดวนกลับ — กราฟที่ซีรีส์เกินแปดควรรวมเป็น "อื่นๆ" ไม่ใช่ใช้สีเพิ่ม) */
export const seriesColor = (slot: number) => `rgb(var(--chart-${(slot % 8) + 1}))`;

/** สีโครงกราฟ ล้วนมาจากโทเคนข้อความ/พื้นผิว จึงเปลี่ยนตามธีมสว่าง/มืดเอง */
export const INK = {
  grid: 'rgb(var(--ink) / 0.08)',
  axis: 'rgb(var(--ink) / 0.18)',
  hover: 'rgb(var(--ink) / 0.05)',
  /** สี "ซีรีส์ที่ไม่ใช่จุดเด่น" (emphasis) และกลุ่ม "อื่นๆ" */
  muted: 'rgb(var(--ink) / 0.2)',
  text: 'rgb(var(--ink-mute))',
  textSoft: 'rgb(var(--ink-soft))',
  textStrong: 'rgb(var(--ink))',
  surface: 'rgb(var(--surface))',
};

/**
 * สเกลสีแบบแยกระดับ 0–4 ของ calendar heatmap (0 = ไม่มีกิจกรรม) — เฉดเดียวจากสีหลัก อ่อน→เข้ม ตามสี CI/ธีม/ฝั่งเอง
 * ระดับ 1–4 = สัดส่วนของ brand-700 ผสมลงใน brand-100
 */
const HEAT_MIX = [0, 22, 45, 72, 100];
export const heatLevelColor = (level: number) =>
  level <= 0 ? 'rgb(var(--ink) / 0.07)' : `color-mix(in srgb, rgb(var(--brand-700)) ${HEAT_MIX[Math.min(4, level)]}%, rgb(var(--brand-100)))`;

export type Series = {
  key: string;
  label: string;
  /** ช่องสี 0–7 — ไม่ใส่ = ตามลำดับในอาร์เรย์ (ตั้งค่านี้ถ้าอยากให้ซีรีส์เดิมคงสีเดิมข้ามหลายกราฟ) */
  slot?: number;
};

export const colorOf = (s: Series, index: number) => seriesColor(s.slot ?? index);

/** ซ่อน/แสดงซีรีส์ด้วย legend (กดเพื่อสลับ) — ซ่อนจนหมดไม่ได้ อย่างน้อยเหลือหนึ่ง */
export function useSeriesToggle(series: Series[]) {
  const [hidden, setHidden] = useState<string[]>([]);
  const toggle = (key: string) =>
    setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : h.length >= series.length - 1 ? h : [...h, key]));
  return { hidden, toggle, isVisible: (key: string) => !hidden.includes(key) };
}

/** id ไม่ซ้ำสำหรับ gradient/defs (useId มีเครื่องหมาย : ซึ่งใช้ใน url(#…) ไม่ได้) */
export const useUid = () => useId().replace(/:/g, '');

/** Legend: ตัวคีย์สีตรงตามชนิดของ mark (เส้น = ขีดสั้น · แท่ง/พื้นที่ = สี่เหลี่ยมมน) · กดสลับแสดง/ซ่อนได้ */
export function ChartLegend({
  series, hidden = [], onToggle, kind = 'rect', className,
}: {
  series: Series[];
  hidden?: string[];
  onToggle?: (key: string) => void;
  kind?: 'line' | 'rect';
  className?: string;
}) {
  const t = useT();
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {series.map((s, i) => {
        const off = hidden.includes(s.key);
        return (
          <li key={s.key}>
            <button
              type="button" disabled={!onToggle} aria-pressed={!off}
              aria-label={onToggle ? t('chart.toggle_series', { name: s.label }) : undefined}
              onClick={() => onToggle?.(s.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md py-0.5 text-xs font-medium text-ink-soft outline-none transition',
                'focus-visible:ring-2 focus-visible:ring-brand-500/40', off && 'opacity-40', onToggle && 'hover:text-ink',
              )}
            >
              <span aria-hidden className={cn('shrink-0', kind === 'line' ? 'h-[3px] w-3.5 rounded-full' : 'size-2.5 rounded-[3px]')} style={{ background: colorOf(s, i) }} />
              <span className={cn(off && 'line-through')}>{s.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type TooltipRow = { key: string; label: string; value: string; color: string };

/** กล่อง tooltip: ค่าเป็นตัวเด่น ชื่อซีรีส์เป็นรอง · คีย์เป็นขีดสั้นสีของซีรีส์ (ไม่ใช่กล่องสี) */
export function TooltipCard({ title, rows, className }: { title?: string; rows: TooltipRow[]; className?: string }) {
  return (
    <div className={cn('min-w-[9rem] rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-xs shadow-lift', className)}>
      {title && <p className="mb-1.5 font-semibold text-ink-mute">{title}</p>}
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-3 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="flex-1 text-ink-soft">{r.label}</span>
            <span className="font-bold tabular-nums text-ink">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** ตัวห่อ tooltip สำหรับ <Tooltip content={...}> ของ Recharts — แปลง payload เป็นแถวตามซีรีส์ที่ระบุ */
export function SeriesTooltip({
  active, payload, label, series, labelFormat, valueFormat = formatFull,
}: {
  active?: boolean;
  payload?: readonly { dataKey?: unknown; value?: unknown }[];
  label?: unknown;
  series: Series[];
  labelFormat?: (label: string) => string;
  valueFormat?: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const rows: TooltipRow[] = payload.flatMap((p) => {
    const i = series.findIndex((s) => s.key === p.dataKey);
    if (i < 0 || typeof p.value !== 'number') return [];
    return [{ key: series[i].key, label: series[i].label, value: valueFormat(p.value), color: colorOf(series[i], i) }];
  });
  const title = label == null ? undefined : labelFormat ? labelFormat(String(label)) : String(label);
  return rows.length ? <TooltipCard title={title} rows={rows} /> : null;
}

/** แปลงข้อมูลกราฟเป็นตารางสำหรับปุ่ม "ตาราง" (ฝาแฝดที่เข้าถึงได้ของกราฟ) */
export function seriesTable<T extends Record<string, unknown>>(
  data: T[], xKey: string, series: Series[], opts: { xLabel?: string; format?: (n: number) => string } = {},
): ChartTable {
  const fmt = opts.format ?? formatFull;
  return {
    columns: [opts.xLabel ?? '', ...series.map((s) => s.label)],
    rows: data.map((d) => [String(d[xKey] ?? ''), ...series.map((s) => (typeof d[s.key] === 'number' ? fmt(d[s.key] as number) : '—'))]),
  };
}

export type ChartTable = { columns: string[]; rows: string[][] };
