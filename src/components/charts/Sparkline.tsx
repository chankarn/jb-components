'use client';

import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { useReducedMotion } from 'framer-motion';
import { INK, seriesColor, useUid } from './theme';

/**
 * เส้นเล็กๆ แสดงแนวโน้ม (ไม่มีแกน ไม่มี tooltip — ตัวเลขจริงอยู่ในการ์ดข้างๆ จึงเป็นของตกแต่งที่ซ่อนจาก screen reader)
 * เส้น 2px + ฝ้าจางใต้เส้น + จุดปลายมีวงแหวนสีพื้น · สีตามช่องกราฟ (ค่าตั้งต้น = สีหลัก)
 */
export function Sparkline({ data, slot = 0, height = 40, className }: { data: number[]; slot?: number; height?: number; className?: string }) {
  const uid = useUid();
  const reduce = useReducedMotion();
  const color = seriesColor(slot);
  const rows = data.map((v, i) => ({ i, v }));
  const last = rows.length - 1;
  return (
    <div aria-hidden className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 120, height }}>
        <AreaChart data={rows} margin={{ top: 6, right: 6, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: color }} stopOpacity={0.22} />
              <stop offset="100%" style={{ stopColor: color }} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area
            type="monotone" dataKey="v" stroke={color} strokeWidth={2} strokeLinecap="round" fill={`url(#${uid})`}
            isAnimationActive={!reduce} animationDuration={900} animationEasing="ease-out"
            dot={(p: { cx?: number; cy?: number; index?: number }) =>
              p.index === last && p.cx != null && p.cy != null
                ? <circle key="end" cx={p.cx} cy={p.cy} r={3.5} fill={color} stroke={INK.surface} strokeWidth={2} />
                : <g key={`n${p.index}`} />}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
