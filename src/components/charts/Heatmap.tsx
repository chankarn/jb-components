'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TooltipCard, formatFull } from './theme';

/**
 * Heatmap (แถว × คอลัมน์ เช่น วัน × ชั่วโมง): ความเข้มของสีเดียว = ปริมาณ (เฉดเดียว อ่อน→เข้ม ไม่ใช่รุ้ง)
 * สีมาจากสเกล brand จึงตามสี CI เอง · ช่องว่าง/ค่า 0 = เฉดอ่อนสุดที่ยังเห็นเป็นช่อง · มีแถบสเกลบอกช่วงค่า
 * ทุกช่องเป็นเป้า hover/โฟกัสเอง (tooltip บอกแถว/คอลัมน์/ค่า) และมี aria-label ครบ
 */
export function Heatmap({
  data, rowLabels, colLabels, colTickEvery = 1, valueFormat = formatFull, valueLabel, lowLabel, highLabel, className,
}: {
  /** data[แถว][คอลัมน์] */
  data: number[][];
  rowLabels: string[];
  colLabels: string[];
  /** แสดงป้ายคอลัมน์ทุกๆ n ช่อง (กันป้ายชนกันตอนมีคอลัมน์เยอะ) */
  colTickEvery?: number;
  valueFormat?: (n: number) => string;
  /** ชื่อหน่วยใน tooltip เช่น "คน" */
  valueLabel?: string;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ r: number; c: number; x: number; y: number } | null>(null);
  const flat = data.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const level = (v: number) => (max === min ? 0 : (v - min) / (max - min));
  // เฉดเดียวของสีแบรนด์: 50 (อ่อนสุด) → 700 (เข้มสุด) · ตามสี CI/ธีม/ฝั่งเอง
  const bg = (v: number) => `color-mix(in srgb, rgb(var(--brand-700)) ${Math.round(level(v) * 100)}%, rgb(var(--brand-100)))`;

  const show = (el: HTMLElement, r: number, c: number) => {
    const b = box.current!.getBoundingClientRect();
    const cell = el.getBoundingClientRect();
    setTip({ r, c, x: cell.left - b.left + cell.width / 2, y: cell.top - b.top });
  };

  return (
    <div ref={box} className={cn('relative', className)} onMouseLeave={() => setTip(null)}>
      <div className="flex gap-2">
        <div className="flex flex-col justify-around gap-[3px] pt-0 text-[11px] text-ink-mute" aria-hidden>
          {rowLabels.map((l) => <span key={l} className="flex h-7 items-center">{l}</span>)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${colLabels.length}, minmax(0, 1fr))` }} role="grid">
            {data.map((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`} role="gridcell" tabIndex={0}
                  aria-label={`${rowLabels[r]} ${colLabels[c]}: ${valueFormat(v)}${valueLabel ? ` ${valueLabel}` : ''}`}
                  onMouseEnter={(e) => show(e.currentTarget, r, c)} onFocus={(e) => show(e.currentTarget, r, c)} onBlur={() => setTip(null)}
                  className="h-7 rounded-[5px] outline-none transition-transform duration-150 hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-ink/50"
                  style={{ background: bg(v) }}
                />
              )),
            )}
          </div>
          <div className="mt-1.5 grid text-[11px] text-ink-mute" style={{ gridTemplateColumns: `repeat(${colLabels.length}, minmax(0, 1fr))` }} aria-hidden>
            {colLabels.map((l, c) => <span key={c} className="text-center">{c % colTickEvery === 0 ? l : ''}</span>)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-ink-mute" aria-hidden>
        <span>{lowLabel ?? valueFormat(min)}</span>
        <span className="h-2 w-28 rounded-pill" style={{ background: 'linear-gradient(90deg, rgb(var(--brand-100)), rgb(var(--brand-700)))' }} />
        <span>{highLabel ?? valueFormat(max)}</span>
      </div>

      {tip && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-2" style={{ left: tip.x, top: tip.y }}>
          <TooltipCard
            title={`${rowLabels[tip.r]} · ${colLabels[tip.c]}`}
            rows={[{ key: 'v', label: valueLabel ?? '', value: valueFormat(data[tip.r][tip.c]), color: bg(data[tip.r][tip.c]) }]}
            className="min-w-[7rem]"
          />
        </div>
      )}
    </div>
  );
}
