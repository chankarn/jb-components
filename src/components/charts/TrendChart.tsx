'use client';

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useReducedMotion } from 'framer-motion';
import { ChartLegend, INK, SeriesTooltip, colorOf, formatCompact, formatFull, niceTicks, useSeriesToggle, useUid, type Series } from './theme';

/**
 * กราฟเส้น/พื้นที่ตามเวลา (หลายซีรีส์ได้)
 * - เส้น 2px · พื้นที่เป็นแค่ "ฝ้า" ไล่จาง (ไม่ทึบ) · กริดแนวนอนเส้นทึบบางเฉียบ ไม่มีกริดแนวตั้ง
 * - เลื่อนเมาส์: เส้นแนวตั้งจับที่จุดข้อมูลใกล้สุด + tooltip แสดงทุกซีรีส์พร้อมกัน (ไม่ต้องเล็งเส้น)
 * - จุดปลายเส้นมีวงแหวนสีพื้น 2px ให้เห็นชัดตรงที่ทับกัน · legend กดซ่อน/แสดงซีรีส์ได้ โดยสีไม่เปลี่ยน
 * - `variant="area"` มีฝ้าใต้เส้น · `"line"` เส้นล้วน (ซีรีส์เดียวใช้ area ดูดี หลายซีรีส์ใช้ line จะเห็นชัดกว่า)
 */
export function TrendChart<T extends Record<string, unknown>>({
  data, xKey, series, variant = 'area', height = 280, xFormat, yFormat = formatCompact, valueFormat = formatFull,
  target, showLegend = true, className,
}: {
  data: T[];
  xKey: string;
  series: Series[];
  variant?: 'area' | 'line';
  /** ความสูงรวมแกน x แล้ว */
  height?: number;
  /** ป้ายบนแกน x และหัว tooltip */
  xFormat?: (x: string) => string;
  yFormat?: (n: number) => string;
  valueFormat?: (n: number) => string;
  /** เส้นเป้าหมาย (เส้นประ = ค่าอ้างอิง ไม่ใช่ข้อมูล) */
  target?: { value: number; label: string };
  showLegend?: boolean;
  className?: string;
}) {
  const uid = useUid();
  const reduce = useReducedMotion();
  const { hidden, toggle } = useSeriesToggle(series);
  const last = data.length - 1;
  const peak = Math.max(target?.value ?? 0, ...data.flatMap((d) => series.filter((s) => !hidden.includes(s.key)).map((s) => Number(d[s.key]) || 0)));
  const ticks = niceTicks(peak);

  return (
    <div className={className}>
      {showLegend && series.length > 1 && <ChartLegend series={series} hidden={hidden} onToggle={toggle} kind="line" className="mb-3" />}
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 640, height }}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: colorOf(s, i) }} stopOpacity={0.2} />
                <stop offset="100%" style={{ stopColor: colorOf(s, i) }} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke={INK.grid} />
          <XAxis
            dataKey={xKey} tickFormatter={xFormat} tickLine={false} axisLine={{ stroke: INK.axis }} tickMargin={10} minTickGap={28}
            tick={{ fill: INK.text, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={yFormat} tickLine={false} axisLine={false} width={44} tickMargin={4} ticks={ticks} domain={[0, ticks[ticks.length - 1]]}
            tick={{ fill: INK.text, fontSize: 11 }}
          />
          <Tooltip
            isAnimationActive={false} cursor={{ stroke: INK.axis, strokeWidth: 1 }}
            content={(p) => <SeriesTooltip active={p.active} payload={p.payload} label={p.label} series={series} labelFormat={xFormat} valueFormat={valueFormat} />}
          />
          {target && (
            <ReferenceLine
              y={target.value} stroke={INK.text} strokeDasharray="4 4" strokeOpacity={0.7}
              label={{ value: target.label, position: 'insideTopRight', fill: INK.text, fontSize: 11 }}
            />
          )}
          {series.map((s, i) =>
            hidden.includes(s.key) ? null : (
              <Area
                key={s.key} type="monotone" dataKey={s.key} name={s.label}
                stroke={colorOf(s, i)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                fill={variant === 'area' ? `url(#${uid}-${s.key})` : 'none'} fillOpacity={1}
                isAnimationActive={!reduce} animationDuration={900} animationEasing="ease-out"
                dot={(p: { cx?: number; cy?: number; index?: number }) =>
                  p.index === last && p.cx != null && p.cy != null
                    ? <circle key={`e${s.key}`} cx={p.cx} cy={p.cy} r={4.5} fill={colorOf(s, i)} stroke={INK.surface} strokeWidth={2} />
                    : <g key={`n${s.key}${p.index}`} />}
                activeDot={{ r: 5, fill: colorOf(s, i), stroke: INK.surface, strokeWidth: 2 }}
              />
            ),
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
