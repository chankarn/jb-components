'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildCalendar, type CalCell, type DayValue } from '@/lib/calendar-heatmap';
import { MONTHS_SHORT, WEEKDAYS, formatYmd, parseYmd } from '@/lib/calendar';
import { useLang, useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import { TooltipCard, formatFull, heatLevelColor, type ChartTable } from './theme';

const GAP = 3;
const LABEL_DOWS = [1, 3, 5]; // แสดงป้ายวันเฉพาะ จ./พ./ศ. (แบบ GitHub) ไม่ให้แน่น

/**
 * Calendar heatmap ทั้งปี (แบบ GitHub): คอลัมน์ = สัปดาห์ · แถว = วันในสัปดาห์ · ช่องสี่เหลี่ยมจัตุรัส
 * - สี 5 ระดับ (0 = ไม่มีกิจกรรม · 1–4 จากควอร์ไทล์ของวันที่มีกิจกรรม) เฉดเดียวจากสีหลัก จึงตามสี CI/ธีม/ฝั่งเอง
 * - ช่องก่อนวันแรก/หลังวันสุดท้ายที่ไม่เต็มสัปดาห์เป็น "ช่องว่าง" (ต่างจากวันที่มีแต่ไม่มีกิจกรรม = สีเทาจาง)
 * - ป้ายเดือนตรงสัปดาห์ที่มีวันที่ 1 · วันที่แสดงปี พ.ศ. ในภาษาไทย (lib/calendar)
 * - ชี้/โฟกัสช่องเพื่อดูวันที่และค่า · คีย์บอร์ด: ลูกศรเลื่อนทีละวัน/สัปดาห์ Home/End ไปวันแรก/วันสุดท้าย (โฟกัสได้ทีละช่อง ไม่ใช่ 365 จุด)
 * - จอแคบเลื่อนแนวนอนได้ (ช่องไม่เล็กกว่า `cellMin` px) และเริ่มที่ช่วงล่าสุด · ควรมีตารางข้อมูลแทนคู่กันเสมอ (ดู `calendarTable` กับ ChartCard)
 */
export function CalendarHeatmap({
  days, from, to, weekStart = 0, valueLabel, valueFormat = formatFull, cellMin = 13, label, className,
}: {
  days: DayValue[];
  from?: string;
  to?: string;
  /** 0 = สัปดาห์เริ่มวันอาทิตย์ (แบบ GitHub) · 1 = เริ่มวันจันทร์ */
  weekStart?: 0 | 1;
  /** ชื่อหน่วยใน tooltip เช่น "บทเรียน" */
  valueLabel?: string;
  valueFormat?: (n: number) => string;
  /** ความกว้างช่องขั้นต่ำ (px) — ต่ำกว่านี้จะเลื่อนแนวนอนแทนการบีบช่อง */
  cellMin?: number;
  /** ชื่อกราฟสำหรับ screen reader */
  label?: string;
  className?: string;
}) {
  const t = useT();
  const { lang } = useLang();
  const grid = useMemo(() => buildCalendar(days, { from, to, weekStart }), [days, from, to, weekStart]);
  const W = grid.weeks.length;

  // เคอร์เซอร์คีย์บอร์ด (roving tabindex) เริ่มที่วันล่าสุด
  const lastPos = useMemo(() => {
    for (let w = W - 1; w >= 0; w--) for (let d = 6; d >= 0; d--) if (grid.weeks[w][d]) return { w, d };
    return { w: 0, d: 0 };
  }, [grid, W]);
  const [cursor, setCursor] = useState<{ w: number; d: number } | null>(null);
  const cur = cursor ?? lastPos;
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // จอแคบ: เริ่มที่ช่วงล่าสุด (ท้ายปี) เพราะเป็นข้อมูลที่คนอยากเห็นก่อน
  useEffect(() => { const el = scroller.current; if (el) el.scrollLeft = el.scrollWidth; }, [W]);
  const [tip, setTip] = useState<{ w: number; d: number; x: number; y: number } | null>(null);

  const cellAt = (w: number, d: number): CalCell => grid.weeks[w]?.[d] ?? null;
  const focusCell = (w: number, d: number) => { setCursor({ w, d }); refs.current.get(`${w}-${d}`)?.focus(); };

  function onKey(e: React.KeyboardEvent, w: number, d: number) {
    let nw = w;
    let nd = d;
    if (e.key === 'ArrowDown') nd++;
    else if (e.key === 'ArrowUp') nd--;
    else if (e.key === 'ArrowRight') nw++;
    else if (e.key === 'ArrowLeft') nw--;
    else if (e.key === 'Home') { for (let ww = 0; ww < W; ww++) { const dd = grid.weeks[ww].findIndex(Boolean); if (dd >= 0) return (e.preventDefault(), focusCell(ww, dd)); } return; }
    else if (e.key === 'End') { e.preventDefault(); return focusCell(lastPos.w, lastPos.d); }
    else return;
    e.preventDefault();
    if (nd < 0 || nd > 6 || nw < 0 || nw >= W) return;
    if (cellAt(nw, nd)) return focusCell(nw, nd);
    if (nw !== w) { // ข้ามคอลัมน์แล้วชนช่องว่าง: ไปช่องที่ใกล้แถวเดิมที่สุดในคอลัมน์นั้น
      const rows = [0, 1, 2, 3, 4, 5, 6].filter((r) => cellAt(nw, r)).sort((a, b) => Math.abs(a - d) - Math.abs(b - d));
      if (rows.length) focusCell(nw, rows[0]);
    }
  }

  function show(el: HTMLElement, w: number, d: number) {
    const b = box.current!.getBoundingClientRect();
    const c = el.getBoundingClientRect();
    setTip({ w, d, x: Math.min(Math.max(c.left - b.left + c.width / 2, 84), Math.max(84, b.width - 84)), y: c.top - b.top });
  }

  if (!W) return null;
  const dowAt = (row: number) => (weekStart + row) % 7;
  const tipCell = tip ? cellAt(tip.w, tip.d) : null;

  return (
    <div ref={box} className={cn('relative', className)} onMouseLeave={() => setTip(null)}>
      <div ref={scroller} className="overflow-x-auto pb-1">
        <div
          role="group" aria-label={label}
          className="grid" style={{ gap: GAP, minWidth: W * cellMin + (W - 1) * GAP + 28, gridTemplateColumns: `auto repeat(${W}, minmax(0, 1fr))` }}
        >
          {/* ป้ายเดือน (แถวบนสุด) */}
          {grid.months.map((m) => (
            <span key={`${m.week}-${m.month}`} aria-hidden className="whitespace-nowrap text-[11px] leading-none text-ink-mute" style={{ gridRow: 1, gridColumn: `${m.week + 2} / span 3` }}>
              {MONTHS_SHORT[lang][m.month - 1]}
            </span>
          ))}
          {/* ป้ายวันในสัปดาห์ (จ./พ./ศ.) */}
          {[0, 1, 2, 3, 4, 5, 6].map((row) =>
            LABEL_DOWS.includes(dowAt(row)) ? (
              <span key={`dow${row}`} aria-hidden className="flex items-center pr-1.5 text-[11px] leading-none text-ink-mute" style={{ gridRow: row + 2, gridColumn: 1 }}>
                {WEEKDAYS[lang][dowAt(row)]}
              </span>
            ) : null,
          )}
          {/* ช่อง (null = ช่องว่าง ไม่วาด) */}
          {grid.weeks.flatMap((wk, w) =>
            wk.map((c, d) =>
              c ? (
                <button
                  key={c.date} type="button" ref={(el) => { if (el) refs.current.set(`${w}-${d}`, el); else refs.current.delete(`${w}-${d}`); }}
                  tabIndex={cur.w === w && cur.d === d ? 0 : -1}
                  aria-label={`${formatYmd(parseYmd(c.date)!, lang)}: ${valueFormat(c.value)}${valueLabel ? ` ${valueLabel}` : ''}`}
                  onMouseEnter={(e) => show(e.currentTarget, w, d)} onFocus={(e) => { setCursor({ w, d }); show(e.currentTarget, w, d); }} onBlur={() => setTip(null)}
                  onKeyDown={(e) => onKey(e, w, d)}
                  className="aspect-square w-full rounded-[3px] outline-none transition-shadow hover:ring-2 hover:ring-ink/30 focus-visible:ring-2 focus-visible:ring-ink/60"
                  style={{ gridColumn: w + 2, gridRow: d + 2, background: heatLevelColor(c.level) }}
                />
              ) : null,
            ),
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-ink-mute" aria-hidden>
        <span>{t('chart.less')}</span>
        {[0, 1, 2, 3, 4].map((l) => <span key={l} className="size-3 rounded-[3px]" style={{ background: heatLevelColor(l) }} />)}
        <span>{t('chart.more')}</span>
      </div>

      {tip && tipCell && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-2" style={{ left: tip.x, top: tip.y }}>
          <TooltipCard
            title={formatYmd(parseYmd(tipCell.date)!, lang)}
            rows={[{ key: 'v', label: valueLabel ?? '', value: valueFormat(tipCell.value), color: heatLevelColor(tipCell.level) }]}
            className="min-w-[7rem]"
          />
        </div>
      )}
    </div>
  );
}

/** ตารางข้อมูลแทนกราฟ (ฝาแฝดที่เข้าถึงได้) สำหรับ ChartCard · เรียงจากวันแรกไปวันสุดท้าย วันที่ตามภาษา */
export function calendarTable(days: DayValue[], opts: { lang: 'th' | 'en'; dateLabel: string; valueLabel: string; from?: string; to?: string; format?: (n: number) => string }): ChartTable {
  const fmt = opts.format ?? formatFull;
  const rows = buildCalendar(days, { from: opts.from, to: opts.to }).weeks.flat().filter((c): c is NonNullable<CalCell> => !!c);
  return { columns: [opts.dateLabel, opts.valueLabel], rows: rows.map((c) => [formatYmd(parseYmd(c.date)!, opts.lang), fmt(c.value)]) };
}
