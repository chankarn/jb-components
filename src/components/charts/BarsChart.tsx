'use client';

import { Bar, BarChart, CartesianGrid, LabelList, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useReducedMotion } from 'framer-motion';
import { ChartLegend, INK, SeriesTooltip, colorOf, formatCompact, formatFull, niceTicks, useSeriesToggle, type Series } from './theme';

const RADIUS = 4;

/**
 * กราฟแท่ง: คอลัมน์ (`orientation="column"`) หรือแท่งนอน (`"bar"` — เหมาะกับชื่อหมวดยาว/หมวดเยอะ)
 * - แท่งบางไม่เกิน 24px ปลายด้านข้อมูลโค้ง 4px ฝั่งฐานเหลี่ยม · แท่งที่ชนกัน/ซ้อนกันคั่นด้วยช่องว่างสีพื้น 2px (ไม่มีกรอบสี)
 * - `stacked`: ซ้อนกัน (ส่วนต่อของทั้งก้อน) · ปลายโค้งเฉพาะชิ้นบนสุดที่มีค่า
 * - `highlight`: เน้นแท่งเดียว (ค่า x นั้น) ที่เหลือเทาจาง — ใช้เมื่อเรื่องที่จะเล่าคือ "ตัวนี้" (ซีรีส์เดียวเท่านั้น)
 * - `labels`: ตัวเลขที่ปลายแท่ง (ซีรีส์เดียวเท่านั้น · ควรใช้กับแท่งไม่เกิน ~8) ที่เหลืออ่านจากแกนและ tooltip
 */
export function BarsChart<T extends Record<string, unknown>>({
  data, xKey, series, orientation = 'column', stacked = false, highlight, labels = false, height = 280,
  xFormat, yFormat = formatCompact, valueFormat = formatFull, categoryWidth = 96, showLegend = true, className,
}: {
  data: T[];
  /** คีย์ของหมวด (แกนที่เป็นชื่อ) */
  xKey: string;
  series: Series[];
  orientation?: 'column' | 'bar';
  stacked?: boolean;
  highlight?: string;
  labels?: boolean;
  /** ความสูงรวมแกนแล้ว */
  height?: number;
  xFormat?: (x: string) => string;
  /** ป้ายแกนตัวเลข */
  yFormat?: (n: number) => string;
  valueFormat?: (n: number) => string;
  /** ความกว้างป้ายหมวดเมื่อเป็นแท่งนอน */
  categoryWidth?: number;
  showLegend?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { hidden, toggle } = useSeriesToggle(series);
  const visible = series.filter((s) => !hidden.includes(s.key));
  const horizontal = orientation === 'bar';
  const emphasis = highlight != null && series.length === 1;
  const barSize = stacked || series.length > 1 ? 18 : 22;
  const rowMax = (d: T) => (stacked ? visible.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0) : Math.max(0, ...visible.map((s) => Number(d[s.key]) || 0)));
  const ticks = niceTicks(Math.max(0, ...data.map(rowMax)));
  const domain: [number, number] = [0, ticks[ticks.length - 1]];

  return (
    <div className={className}>
      {showLegend && series.length > 1 && <ChartLegend series={series} hidden={hidden} onToggle={toggle} className="mb-3" />}
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 640, height }}>
        <BarChart
          data={data} layout={horizontal ? 'vertical' : 'horizontal'} barGap={2} barCategoryGap="28%"
          margin={{ top: labels && !horizontal ? 18 : 8, right: horizontal && labels ? 36 : 12, left: 0, bottom: 0 }} accessibilityLayer
        >
          <CartesianGrid horizontal={!horizontal} vertical={horizontal} stroke={INK.grid} />
          {horizontal ? (
            <>
              <XAxis type="number" ticks={ticks} domain={domain} tickFormatter={yFormat} tickLine={false} axisLine={false} tickMargin={6} tick={{ fill: INK.text, fontSize: 11 }} />
              <YAxis
                type="category" dataKey={xKey} tickFormatter={xFormat} width={categoryWidth} tickLine={false} axisLine={{ stroke: INK.axis }}
                tickMargin={8} tick={{ fill: INK.textSoft, fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tickFormatter={xFormat} tickLine={false} axisLine={{ stroke: INK.axis }} tickMargin={10} tick={{ fill: INK.text, fontSize: 11 }} />
              <YAxis ticks={ticks} domain={domain} tickFormatter={yFormat} tickLine={false} axisLine={false} width={44} tickMargin={4} tick={{ fill: INK.text, fontSize: 11 }} />
            </>
          )}
          <Tooltip
            isAnimationActive={false} cursor={{ fill: INK.hover, radius: 6 }}
            content={(p) => <SeriesTooltip active={p.active} payload={p.payload} label={p.label} series={series} labelFormat={xFormat} valueFormat={valueFormat} />}
          />
          {series.map((s, i) => {
            if (hidden.includes(s.key)) return null;
            const color = colorOf(s, i);
            return (
              <Bar
                key={s.key} dataKey={s.key} name={s.label} stackId={stacked ? 'stack' : undefined} barSize={barSize}
                isAnimationActive={!reduce} animationDuration={700} animationEasing="ease-out"
                shape={(p: { x?: number; y?: number; width?: number; height?: number; payload?: Record<string, unknown> }) => {
                  const row = p.payload ?? {};
                  // ชิ้นบนสุดของก้อน = series ที่แสดงอยู่ตัวสุดท้ายที่มีค่ามากกว่า 0 ในแถวนี้
                  const topKey = [...visible].reverse().find((v) => Number(row[v.key]) > 0)?.key;
                  const rounded = !stacked || topKey === s.key;
                  const radius: [number, number, number, number] = !rounded ? [0, 0, 0, 0] : horizontal ? [0, RADIUS, RADIUS, 0] : [RADIUS, RADIUS, 0, 0];
                  const fill = emphasis && row[xKey] !== highlight ? INK.muted : color;
                  return (
                    <Rectangle
                      x={p.x} y={p.y} width={p.width} height={p.height} radius={radius} fill={fill}
                      stroke={stacked ? INK.surface : 'none'} strokeWidth={stacked ? 2 : 0}
                    />
                  );
                }}
              >
                {labels && series.length === 1 && (
                  <LabelList dataKey={s.key} position={horizontal ? 'right' : 'top'} offset={6} formatter={(v: unknown) => (typeof v === 'number' ? yFormat(v) : '')} fill={INK.textSoft} fontSize={11} fontWeight={600} />
                )}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
