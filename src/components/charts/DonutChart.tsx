'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import { useReducedMotion } from 'framer-motion';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import { sliceAt } from '@/lib/chart-math';
import { INK, formatCompact, formatFull, seriesColor } from './theme';

export type DonutItem = { label: string; value: number; /** ช่องสี 0–7 — ไม่ใส่ = ตามลำดับที่ส่งเข้ามา (สีติดกับรายการ ไม่ใช่กับอันดับ) */ slot?: number };

type Slice = { label: string; value: number; color: string; other?: boolean };

/**
 * Donut: ส่วนต่อของทั้งหมด (part-to-whole) ที่มีไม่เกิน ~6 ชิ้น
 * - ส่วนที่เกิน `maxSlices` รวมเป็น "อื่นๆ" สีเทา (ไม่สร้างสีเพิ่ม) · เรียงจากมากไปน้อยตามเข็มนาฬิกา
 * - ชิ้นคั่นด้วยช่องว่าง 2px ปลายโค้ง · ตรงกลางโชว์ยอดรวม แล้วเปลี่ยนเป็นชิ้นที่ชี้ (ทั้งชี้วงและชี้รายการข้างๆ)
 * - คลิกชิ้นหรือรายการเพื่อปักหมุด (ตัวเลขกลางวงค้างที่ชิ้นนั้น) คลิกซ้ำหรือกด Esc เพื่อปล่อย · ชี้ชิ้นอื่นระหว่างปักหมุดดูชั่วคราวได้
 * - รายการข้างวงบอกชื่อ/ค่า/เปอร์เซ็นต์ครบ จึงไม่ต้องพึ่ง tooltip หรือสีอย่างเดียว · โฟกัสด้วยคีย์บอร์ดได้
 * - ค่าใกล้กันมากหรือต้องเทียบขนาด → ใช้ BarsChart จะอ่านง่ายกว่า (เทียบความยาวง่ายกว่าเทียบมุม)
 */
export function DonutChart({
  data, maxSlices = 6, valueFormat = formatFull, centerLabel, centerValue, size = 208, className,
}: {
  data: DonutItem[];
  maxSlices?: number;
  valueFormat?: (n: number) => string;
  /** ป้ายใต้ตัวเลขกลางวงตอนไม่ได้ชี้ชิ้นไหน (ค่าตั้งต้น "รวม") */
  centerLabel?: string;
  /** ตัวเลขกลางวง (ค่าตั้งต้น = ยอดรวม) */
  centerValue?: string;
  size?: number;
  className?: string;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  // hover = ดูชั่วคราวตามเมาส์/โฟกัส · pinned = คลิกเพื่อปักหมุดค้างไว้ (คลิกซ้ำ/กด Esc เพื่อปล่อย) · ที่แสดงคือ hover ก่อน ไม่งั้นตัวที่ปักไว้
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const active = hover ?? pinned;
  const togglePin = (i: number | null) => setPinned((cur) => (i == null || cur === i ? null : i));
  useEffect(() => {
    if (pinned == null) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPinned(null); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [pinned]);

  const { slices, total } = useMemo(() => {
    const items = data.map((d, i) => ({ ...d, color: seriesColor(d.slot ?? i) })).filter((d) => d.value > 0);
    items.sort((a, b) => b.value - a.value);
    const head: Slice[] = items.slice(0, Math.max(1, maxSlices - (items.length > maxSlices ? 1 : 0)));
    const tail = items.slice(head.length);
    if (tail.length) head.push({ label: t('chart.other'), value: tail.reduce((s, x) => s + x.value, 0), color: INK.muted, other: true });
    return { slices: head, total: head.reduce((s, x) => s + x.value, 0) };
  }, [data, maxSlices, t]);

  const sel = active == null ? null : slices[active];
  const pct = (v: number) => `${Math.round((v / total) * 1000) / 10}%`;

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-8 gap-y-5', className)}>
      <div
        className="relative shrink-0" style={{ width: size, height: size }}
        // mousedown (ไม่ใช่ click): ตอนสถานะ hover เปลี่ยนระหว่างกด Recharts วาด element ใหม่ จน mousedown/mouseup ตกคนละ element แล้วเบราว์เซอร์ไม่ยิง click
        // · การแตะบนจอสัมผัสก็มี mousedown ตามหลัง · ตำแหน่งที่กดคำนวณชิ้นเอง จึงไม่พึ่ง hover ที่มาไม่ทันบนจอสัมผัส
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          const r = e.currentTarget.getBoundingClientRect();
          const hit = sliceAt(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), Math.min(r.width, r.height) / 2, slices.map((x) => x.value));
          if (hit === 'hole') setPinned(null);
          else if (hit != null) togglePin(hit);
        }}
      >
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: size, height: size }}>
          <PieChart>
            <Pie
              data={slices} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="96%" paddingAngle={slices.length > 1 ? 2 : 0}
              cornerRadius={5} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={!reduce} animationDuration={800} animationEasing="ease-out"
              shape={(p: { cx?: number; cy?: number; innerRadius?: number; outerRadius?: number; startAngle?: number; endAngle?: number; cornerRadius?: number; index?: number; payload?: Slice }) => (
                <Sector
                  cx={p.cx} cy={p.cy} innerRadius={p.innerRadius} outerRadius={(p.outerRadius ?? 0) + (p.index === active ? 5 : 0)} startAngle={p.startAngle} endAngle={p.endAngle} cornerRadius={p.cornerRadius}
                  fill={p.payload?.color} opacity={active == null || p.index === active ? 1 : 0.45} style={{ transition: 'opacity .2s', cursor: 'pointer', outline: 'none' }}
                  focusable="false" onMouseEnter={() => setHover(p.index ?? null)} onMouseLeave={() => setHover(null)}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="max-w-full truncate text-[28px] font-bold leading-none text-ink">{sel ? valueFormat(sel.value) : (centerValue ?? formatCompact(total))}</span>
          <span className="mt-1.5 max-w-full truncate text-xs font-medium text-ink-mute">{sel ? `${sel.label} · ${pct(sel.value)}` : (centerLabel ?? t('chart.total'))}</span>
        </div>
      </div>

      <ul className="min-w-[11rem] flex-1 space-y-0.5" onMouseLeave={() => setHover(null)}>
        {slices.map((s, i) => (
          <li key={s.label}>
            <button
              type="button" aria-pressed={pinned === i} onClick={() => togglePin(i)} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              onKeyDown={(e) => { if (e.key === 'Escape') setPinned(null); }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm outline-none transition',
                'focus-visible:ring-2 focus-visible:ring-brand-500/40', pinned === i ? 'bg-ink/[.08] ring-1 ring-ink/15' : active === i ? 'bg-ink/[.06]' : active != null && 'opacity-50',
              )}
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
              <span className="flex-1 truncate text-ink-soft">{s.label}</span>
              <span className="font-bold tabular-nums text-ink">{valueFormat(s.value)}</span>
              <span className="w-11 text-right text-xs tabular-nums text-ink-mute">{pct(s.value)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
