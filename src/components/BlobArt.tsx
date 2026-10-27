'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * ภาพประกอบนามธรรมสำหรับพื้นหลัง (login · แถบหัวหน้า · ภาพตกแต่ง) — มีสองสไตล์ผ่าน `variant`
 * - `3d` (ค่าตั้งต้น): blob/ทรงกลม/วงแหวนแบบมีแสงเงา ลอยขึ้นลงพร้อมเงาด้านล่าง · ประกายระยิบ · จุดลอยขึ้น
 * - `2d`: รูปทรงแบนสีเรียบ (สไตล์ abstract banner เดิม) + ลายเส้น
 * ทั้งสองแบบ: blob ค่อยๆ เปลี่ยนรูปทรง · ลอยช้าๆ · ขยับตามเมาส์เล็กน้อย (parallax ให้มีความลึก · ปิดได้ด้วย `interactive={false}`)
 * - ชิ้นที่มุมยึดมุมกล่องและขนาดตามด้านที่สั้นกว่าของกล่อง (cqmin) → เต็มจอ/การ์ดเล็ก/มือถือแนวตั้ง สัดส่วนเดิม
 * - สีจากโทเคน (brand / accent / accent2) จึงตามสี CI และโหมดมืด (`--blob-opacity`)
 * - ผู้ใช้ตั้งลดการเคลื่อนไหว = นิ่งทั้งหมด · aria-hidden และไม่รับคลิก · กลางกล่องเว้นไว้ให้เนื้อหา
 */
export type ArtVariant = '3d' | '2d';

/* ── รูปทรง blob: สร้างจากรัศมี 8 จุด (ทุกแบบมีโครงเดียวกัน จึงเปลี่ยนรูปทรงไปมาได้ลื่น) ── */

function blobPath(r: number[]): string {
  const n = r.length;
  const p = r.map((v, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [v * Math.cos(a), v * Math.sin(a)];
  });
  const f = (x: number) => Math.round(x * 10) / 10;
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)},${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)},${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
}

const RADII = {
  a: [74, 70, 62, 58, 64, 72, 76, 72],
  b: [62, 68, 76, 72, 64, 58, 62, 66],
  c: [70, 76, 72, 62, 58, 62, 70, 66],
  d: [64, 58, 64, 72, 76, 70, 62, 60],
} as const;
type Shape = keyof typeof RADII;
const PATH = Object.fromEntries(Object.entries(RADII).map(([k, v]) => [k, blobPath([...v])])) as Record<Shape, string>;
/** ลำดับรูปทรงที่ blob แต่ละแบบเปลี่ยนวนไป */
const CYCLE: Record<Shape, Shape[]> = { a: ['a', 'b', 'c', 'a'], b: ['b', 'd', 'a', 'b'], c: ['c', 'a', 'd', 'c'], d: ['d', 'c', 'b', 'd'] };

export const BLOB_PALETTE = {
  red: 'rgb(var(--brand-500))',
  amber: 'rgb(var(--accent-500))',
  teal: 'rgb(var(--accent2-500))',
};
type Tone = 'brand' | 'accent' | 'accent2';
const TONE: Record<Tone, string> = { brand: BLOB_PALETTE.red, accent: BLOB_PALETTE.amber, accent2: BLOB_PALETTE.teal };
const mix = (c: string, pct: number, base = 'rgb(var(--surface))') => `color-mix(in srgb, ${c} ${pct}%, ${base})`;
const vars = (o: Record<string, string | number>) => o as React.CSSProperties;

/* ── การเคลื่อนไหว ── */

const MotionCtx = React.createContext(true);

/** true = เล่นอนิเมชันได้ (ผู้ใช้ไม่ได้ตั้งลดการเคลื่อนไหว) */
function useAnimate() {
  return !useReducedMotion();
}

/** parallax: ตั้ง --px/--py (-1..1) ตามตำแหน่งเมาส์ทั้งหน้า ให้ชิ้นที่มีคลาส bf-par เลื่อนตามความลึก (--d) */
function useParallax(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || window.matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [ref, enabled]);
}

/** id ไม่ซ้ำสำหรับ gradient/filter (วางหลายชิ้นในหน้าเดียวได้) */
function useGid() {
  return React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

/** path ที่ค่อยๆ เปลี่ยนรูปทรงวนไป (SMIL — ปิดเมื่อลดการเคลื่อนไหว) */
function MorphPath({ shape, dur = 14, ...rest }: { shape: Shape; dur?: number } & React.SVGProps<SVGPathElement>) {
  const animate = React.useContext(MotionCtx);
  const cyc = CYCLE[shape];
  return (
    <path d={PATH[shape]} {...rest}>
      {animate && (
        <animate attributeName="d" dur={`${dur}s`} repeatCount="indefinite" values={cyc.map((s) => PATH[s]).join(';')}
          keyTimes="0;0.33;0.66;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1" />
      )}
    </path>
  );
}

/* ── โครงที่ใช้ร่วมกัน ── */

function Root({ children, interactive, className, bg = true, variant = '3d' }: { children: React.ReactNode; interactive: boolean; className?: string; bg?: boolean; variant?: ArtVariant }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const animate = useAnimate();
  useParallax(ref, interactive && animate);
  return (
    <MotionCtx.Provider value={animate}>
      <div ref={ref} aria-hidden data-art={variant} className={cn('pointer-events-none absolute inset-0 overflow-hidden [container-type:size]', className)} style={bg ? { background: 'rgb(var(--login-bg))' } : undefined}>
        {children}
      </div>
    </MotionCtx.Provider>
  );
}

/** ลายจุด · `fade` = จางเข้ากลางกล่อง (เว้นที่ให้การ์ด) */
function Dots({ fade = 'center', size = 22, alpha = 0.12 }: { fade?: 'center' | 'bottom' | 'none'; size?: number; alpha?: number }) {
  const mask = fade === 'center'
    ? 'radial-gradient(ellipse 55% 50% at 50% 50%, transparent 30%, black 78%)'
    : fade === 'bottom' ? 'linear-gradient(black 20%, transparent 95%)' : undefined;
  return (
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(rgb(var(--ink) / ${alpha}) 1px, transparent 1.2px)`,
      backgroundSize: `${size}px ${size}px`, maskImage: mask, WebkitMaskImage: mask,
    }} />
  );
}

/** ชิ้นที่ยึดมุมกล่อง (viewBox -200..200) · `depth` = ระยะ parallax (px ที่เลื่อนเมื่อเมาส์สุดขอบจอ) */
function Corner({ children, className, depth = 0 }: { children: React.ReactNode; className?: string; depth?: number }) {
  return (
    <svg viewBox="-200 -200 400 400" aria-hidden className={cn('bf-par absolute aspect-square overflow-visible select-none', className)}
      style={vars({ opacity: 'var(--blob-opacity)', '--d': depth })}>
      {children}
    </svg>
  );
}

/** svg เต็มกล่อง (viewBox 1440×900 slice) สำหรับของที่ถูกตัดขอบได้ */
function Field({ children, depth = 0, className }: { children: React.ReactNode; depth?: number; className?: string }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden className={cn('bf-par absolute inset-0 h-full w-full select-none', className)}
      style={vars({ opacity: 'var(--blob-opacity)', '--d': depth })}>
      {children}
    </svg>
  );
}

/** ลอยขึ้นลง: amp = ระยะ (หน่วยของ viewBox) · dur วินาที · delay วินาที */
function Float({ children, amp = 10, dur = 9, delay = 0, tilt = 3 }: { children: React.ReactNode; amp?: number; dur?: number; delay?: number; tilt?: number }) {
  return <g className="bf-float" style={vars({ '--amp': `${amp}px`, '--dur': `${dur}s`, '--delay': `${-delay}s`, '--tilt': `${tilt}deg` })}>{children}</g>;
}

/* ── วัสดุ 3D ── */

function Mat3D({ id }: { id: string }) {
  return (
    <defs>
      {(Object.keys(TONE) as Tone[]).map((t) => (
        <React.Fragment key={t}>
          {/* แสงจากซ้ายบน: สว่าง → สีจริง → เงาเข้มที่ขอบล่างขวา */}
          <radialGradient id={`${id}-${t}`} cx=".34" cy=".28" r=".9">
            <stop offset="0" stopColor={mix(TONE[t], 45, 'white')} />
            <stop offset=".42" stopColor={TONE[t]} />
            <stop offset="1" stopColor={mix(TONE[t], 62, 'black')} />
          </radialGradient>
          <linearGradient id={`${id}-${t}-rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={mix(TONE[t], 30, 'white')} />
            <stop offset=".5" stopColor={TONE[t]} />
            <stop offset="1" stopColor={mix(TONE[t], 55, 'black')} />
          </linearGradient>
        </React.Fragment>
      ))}
      <radialGradient id={`${id}-spec`}>
        <stop offset="0" stopColor="white" stopOpacity=".9" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
      {/* แสงสะท้อนจากพื้นที่ขอบล่าง (rim light) ให้ดูกลม */}
      <radialGradient id={`${id}-bounce`} cx=".7" cy=".85" r=".55">
        <stop offset="0" stopColor="white" stopOpacity=".28" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    </defs>
  );
}

/** blob 3D: เนื้อไล่แสง + จุดสะท้อนแสง + แสงสะท้อนขอบล่าง · ลอยขึ้นลง เงาด้านล่างหดตามความสูง */
function Blob3D({ id, tone, shape, x, y, s, r = 0, float = {}, shadow = true, dur = 14 }: {
  id: string; tone: Tone; shape: Shape; x: number; y: number; s: number; r?: number; float?: { amp?: number; dur?: number; delay?: number }; shadow?: boolean; dur?: number;
}) {
  const f = { amp: 10, dur: 9, delay: 0, ...float };
  return (
    <g transform={`translate(${x} ${y})`}>
      {shadow && (
        <ellipse className="bf-shadow" cx={8 * s} cy={86 * s} rx={56 * s} ry={9 * s} fill="rgb(0 0 0)" opacity=".18" filter={`url(#${id}-soft)`}
          style={vars({ '--dur': `${f.dur}s`, '--delay': `${-f.delay}s` })} />
      )}
      <Float {...f}>
        <g transform={`rotate(${r}) scale(${s})`}>
          <MorphPath shape={shape} dur={dur} fill={`url(#${id}-${tone})`} />
          <MorphPath shape={shape} dur={dur} fill={`url(#${id}-bounce)`} />
          <ellipse cx="-24" cy="-30" rx="22" ry="12" fill={`url(#${id}-spec)`} transform="rotate(-35 -24 -30)" />
          <circle cx="-8" cy="-44" r="3.5" fill="white" opacity=".8" />
        </g>
      </Float>
    </g>
  );
}

/** ทรงกลม 3D */
function Sphere({ id, tone, x, y, r, float = {}, shadow = true }: { id: string; tone: Tone; x: number; y: number; r: number; float?: { amp?: number; dur?: number; delay?: number }; shadow?: boolean }) {
  const f = { amp: 14, dur: 7, delay: 0, ...float };
  return (
    <g transform={`translate(${x} ${y})`}>
      {shadow && <ellipse className="bf-shadow" cx={r * 0.15} cy={r * 1.45} rx={r * 0.85} ry={r * 0.18} fill="rgb(0 0 0)" opacity=".18" filter={`url(#${id}-soft)`} style={vars({ '--dur': `${f.dur}s`, '--delay': `${-f.delay}s` })} />}
      <Float {...f} tilt={0}>
        <circle r={r} fill={`url(#${id}-${tone})`} />
        <circle r={r} fill={`url(#${id}-bounce)`} />
        <ellipse cx={-r * 0.35} cy={-r * 0.42} rx={r * 0.32} ry={r * 0.2} fill={`url(#${id}-spec)`} transform={`rotate(-35 ${-r * 0.35} ${-r * 0.42})`} />
      </Float>
    </g>
  );
}

/** วงแหวน 3D เอียง (torus มองเฉียง) แสงวิ่งรอบวง */
function Torus({ id, tone, x, y, r, w = 14, tiltDeg = -24, float = {} }: { id: string; tone: Tone; x: number; y: number; r: number; w?: number; tiltDeg?: number; float?: { amp?: number; dur?: number; delay?: number } }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tiltDeg})`}>
      <Float amp={12} dur={10} {...float} tilt={6}>
        <g transform="scale(1 .42)">
          <circle r={r} fill="none" stroke={mix(TONE[tone], 55, 'black')} strokeWidth={w} transform={`translate(0 ${w * 0.5})`} />
          <circle r={r} fill="none" stroke={`url(#${id}-${tone}-rim)`} strokeWidth={w} />
          <circle className="bf-spin" r={r} fill="none" stroke="white" strokeOpacity=".7" strokeWidth={w * 0.22} strokeLinecap="round"
            strokeDasharray={`${r * 0.9} ${r * 5.4}`} transform={`translate(0 ${-w * 0.25})`} />
        </g>
      </Float>
    </g>
  );
}

/** ประกาย 4 แฉกที่กะพริบระยิบ */
function Sparkle({ x, y, s = 10, delay = 0, color = 'white' }: { x: number; y: number; s?: number; delay?: number; color?: string }) {
  const c = s * 0.12;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="bf-twinkle" style={vars({ '--delay': `${-delay}s` })} fill={color}
        d={`M0 ${-s}C${c} ${-c} ${c} ${-c} ${s} 0C${c} ${c} ${c} ${c} 0 ${s}C${-c} ${c} ${-c} ${c} ${-s} 0C${-c} ${-c} ${-c} ${-c} 0 ${-s}Z`} />
    </g>
  );
}

/** จุดเล็กลอยขึ้นจากด้านล่างแล้วจางหาย (ฟองแสง) */
const MOTES = [
  { l: 8, s: 6, d: 0, t: 'brand' }, { l: 18, s: 4, d: 4, t: 'accent' }, { l: 31, s: 8, d: 9, t: 'accent2' }, { l: 44, s: 5, d: 2, t: 'brand' },
  { l: 57, s: 4, d: 7, t: 'accent' }, { l: 66, s: 7, d: 11, t: 'brand' }, { l: 78, s: 5, d: 5, t: 'accent2' }, { l: 90, s: 6, d: 13, t: 'accent' },
] as const;
function Motes() {
  return (
    <div className="absolute inset-0" style={{ opacity: 'var(--blob-opacity)' }}>
      {MOTES.map((m, i) => (
        <span key={i} className="bf-rise absolute bottom-0 rounded-full"
          style={vars({ left: `${m.l}%`, width: m.s, height: m.s, background: `radial-gradient(circle at 35% 30%, white, ${TONE[m.t]} 60%)`, '--delay': `${-m.d}s`, '--dur': `${14 + (i % 3) * 3}s` })} />
      ))}
    </div>
  );
}

/* ── ลายเส้น (ใช้ทั้ง 2D และ LoginPattern) ── */

type Mark = { k: 'ring' | 'plus' | 'squiggle' | 'tri' | 'half' | 'dot'; x: number; y: number; s: number; r?: number; c: keyof typeof BLOB_PALETTE | 'ink' };
const MARKS: Mark[] = [
  { k: 'ring', x: 170, y: 270, s: 12, c: 'red' }, { k: 'plus', x: 340, y: 120, s: 10, c: 'amber', r: 15 },
  { k: 'squiggle', x: 230, y: 480, s: 16, c: 'teal', r: -20 }, { k: 'tri', x: 420, y: 350, s: 10, c: 'ink', r: 12 },
  { k: 'half', x: 130, y: 640, s: 13, c: 'amber', r: 40 }, { k: 'dot', x: 450, y: 580, s: 4, c: 'teal' },
  { k: 'ring', x: 1060, y: 130, s: 8, c: 'teal' }, { k: 'squiggle', x: 1190, y: 440, s: 18, c: 'red', r: 25 },
  { k: 'tri', x: 1300, y: 610, s: 12, c: 'amber', r: -18 }, { k: 'plus', x: 1040, y: 720, s: 10, c: 'ink', r: 30 },
  { k: 'half', x: 1340, y: 300, s: 12, c: 'teal', r: -60 }, { k: 'dot', x: 1120, y: 270, s: 4, c: 'amber' },
  { k: 'dot', x: 600, y: 90, s: 3.5, c: 'red' }, { k: 'tri', x: 840, y: 80, s: 9, c: 'teal', r: 45 },
  { k: 'ring', x: 760, y: 830, s: 10, c: 'amber' },
];
function MarkShape({ k, s }: { k: Mark['k']; s: number }) {
  switch (k) {
    case 'ring': return <circle r={s} fill="none" strokeWidth={2.5} />;
    case 'plus': return <path d={`M${-s} 0H${s}M0 ${-s}V${s}`} strokeWidth={3} strokeLinecap="round" />;
    case 'squiggle': return <path d={`M${-s * 2} 0q${s / 2} ${-s} ${s} 0t${s} 0t${s} 0t${s} 0`} fill="none" strokeWidth={2.5} strokeLinecap="round" />;
    case 'tri': return <path d={`M0 ${-s}L${s * 0.9} ${s * 0.6}H${-s * 0.9}Z`} fill="none" strokeWidth={2.5} strokeLinejoin="round" />;
    case 'half': return <path d={`M${-s} 0a${s} ${s} 0 0 1 ${s * 2} 0Z`} stroke="none" />;
    case 'dot': return <circle r={s} stroke="none" />;
  }
}
const markColor = (c: Mark['c']) => (c === 'ink' ? 'rgb(var(--ink))' : BLOB_PALETTE[c]);
function Marks({ marks, dy = 0, ky = 1 }: { marks: Mark[]; dy?: number; ky?: number }) {
  return (
    <>
      {marks.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${dy + m.y * ky})`}>
          <Float amp={6 + (i % 3) * 3} dur={6 + (i % 4)} delay={i * 0.7} tilt={m.k === 'dot' ? 0 : 12}>
            <g transform={`rotate(${m.r ?? 0})`} stroke={markColor(m.c)} fill={markColor(m.c)} opacity={m.c === 'ink' ? 0.2 : 0.6}>
              <MarkShape k={m.k} s={m.s} />
            </g>
          </Float>
        </g>
      ))}
    </>
  );
}

/** เส้นคอนทัวร์ (เส้นขนาน ระยะห่างกว้างขึ้นเรื่อยๆ) โยกไปมาช้าๆ */
function Contours({ d, n, dy, stroke, opacity, delay = 0 }: { d: string; n: number; dy: number; stroke: string; opacity: number; delay?: number }) {
  return (
    <g fill="none" stroke={stroke} strokeLinecap="round" className="bf-sway" style={vars({ '--delay': `${-delay}s` })}>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={d} transform={`translate(0 ${i * dy + i * i * 1.5})`} strokeOpacity={opacity * (1 - i / (n + 1))} strokeWidth={i === 0 ? 2 : 1.25} />
      ))}
    </g>
  );
}

/* ── BlobArt / FlatCluster (ภาพประกอบเดี่ยว) ── */

/**
 * ภาพประกอบ blob เดี่ยว (ในการ์ด/หน้าว่าง/ข้างหัวข้อ) — กำหนดขนาดด้วย className เช่น `w-64`
 * `variant="2d"` สีเรียบ (เปลี่ยนสีชั้นด้วยคลาส fill ของ Tailwind: `back` `front` `dots`) · `"3d"` มีแสงเงาและลอย
 */
export function BlobArt({
  variant = '3d', back = 'fill-brand-300', front = 'fill-brand-600', dots = 'fill-brand-600', className,
}: { variant?: ArtVariant; back?: string; front?: string; dots?: string; className?: string }) {
  const id = useGid();
  const animate = useAnimate();
  return (
    <MotionCtx.Provider value={animate}>
      <svg viewBox="0 0 400 320" aria-hidden data-art={variant} className={cn('pointer-events-none select-none overflow-visible', className)}>
        {variant === '2d' ? (
          <>
            <g transform="translate(236 150) rotate(30) scale(1.7)"><Float amp={6} dur={10}><MorphPath shape="b" className={back} dur={16} /></Float></g>
            <g transform="translate(180 170) scale(1.55)"><Float amp={8} dur={8} delay={2}><MorphPath shape="a" className={front} /></Float></g>
            <Float amp={10} dur={6}><circle cx="52" cy="96" r="9" className={dots} /><circle cx="80" cy="72" r="4.5" className={dots} /></Float>
            <Float amp={10} dur={7} delay={3}><circle cx="314" cy="264" r="11" className={dots} /><circle cx="346" cy="248" r="4" className={dots} /></Float>
          </>
        ) : (
          <>
            <Mat3D id={id} />
            <Torus id={id} tone="accent2" x={300} y={92} r={46} w={12} />
            <Blob3D id={id} tone="brand" shape="a" x={180} y={160} s={1.35} />
            <Sphere id={id} tone="accent" x={318} y={232} r={26} float={{ delay: 2 }} />
            <Sphere id={id} tone="brand" x={64} y={86} r={12} float={{ delay: 4 }} shadow={false} />
            <Sparkle x={96} y={232} s={9} color="rgb(var(--accent-500))" />
            <Sparkle x={250} y={46} s={7} delay={1.5} color="rgb(var(--brand-400))" />
          </>
        )}
      </svg>
    </MotionCtx.Provider>
  );
}

/**
 * กลุ่ม blob สีเดียวแบบแบน (2D) — วางเองแบบ absolute · `color` = สีของกลุ่ม
 * ชั้นหลังสีเดียวกันแบบอ่อน ชั้นหน้าสีเต็ม + วงกลมเล็ก · ค่อยๆ เปลี่ยนรูปทรงและลอย
 */
export function FlatCluster({ color, className, front = 'a', back = 'b', rotate = 0, flip = false }: { color: string; className?: string; front?: Shape; back?: Shape; rotate?: number; flip?: boolean }) {
  const animate = useAnimate();
  return (
    <MotionCtx.Provider value={animate}>
      <svg viewBox="-130 -130 260 260" aria-hidden className={cn('pointer-events-none absolute select-none overflow-visible', className)} style={{ transform: `rotate(${rotate}deg)${flip ? ' scaleX(-1)' : ''}`, opacity: 'var(--blob-opacity)' }}>
        <FlatGroup color={color} front={front} back={back} />
      </svg>
    </MotionCtx.Provider>
  );
}

function FlatGroup({ color, front, back, delay = 0 }: { color: string; front: Shape; back: Shape; delay?: number }) {
  const tint = mix(color, 55);
  return (
    <>
      <g transform="translate(30 -26) rotate(40) scale(1.1)"><Float amp={5} dur={11} delay={delay + 3}><MorphPath shape={back} fill={tint} dur={18} /></Float></g>
      <g transform="translate(-8 8)"><Float amp={7} dur={9} delay={delay}><MorphPath shape={front} fill={color} /></Float></g>
      <Float amp={9} dur={6} delay={delay + 1}><circle cx="88" cy="-92" r="13" fill={color} /><circle cx="112" cy="-118" r="7" fill={tint} /></Float>
      <Float amp={8} dur={7} delay={delay + 2}><circle cx="-96" cy="96" r="9" fill={tint} /></Float>
    </>
  );
}

/* ── พื้นหลังหน้า login ── */

/**
 * พื้นหลังหน้า login — วางเป็นลูกตัวแรกของกล่อง `relative overflow-hidden` (กลางกล่องเว้นไว้ให้การ์ด)
 * `variant="3d"` blob/ทรงกลม/วงแหวนมีแสงเงา ลอยพร้อมเงา + ประกาย + จุดลอยขึ้น · `"2d"` รูปทรงแบน + ลายเส้น (แบบเดิม)
 * `interactive` = ขยับตามเมาส์ (ค่าตั้งต้น true)
 */
export function LoginBackdrop({ variant = '3d', interactive = true }: { variant?: ArtVariant; interactive?: boolean }) {
  const id = useGid();
  if (variant === '2d') {
    return (
      <Root interactive={interactive} variant="2d">
        <Dots fade="none" alpha={0.07} />
        <LoginPatternSvg />
        <Corner className="-right-[20cqmin] -top-[22cqmin] w-[66cqmin]" depth={-14}>
          <g transform="rotate(-10) scale(1.5)"><FlatGroup color={BLOB_PALETTE.red} front="a" back="b" /></g>
        </Corner>
        <Corner className="-bottom-[24cqmin] -left-[18cqmin] w-[58cqmin]" depth={-10}>
          <g transform="rotate(160) scale(1.5)"><FlatGroup color={BLOB_PALETTE.red} front="b" back="c" delay={4} /></g>
        </Corner>
        <Corner className="left-[6%] top-[11%] w-[17cqmin]" depth={18}>
          <g transform="rotate(-20) scale(1.4)"><FlatGroup color={BLOB_PALETTE.amber} front="c" back="d" delay={2} /></g>
        </Corner>
        <Corner className="bottom-[9%] right-[6%] w-[18cqmin]" depth={22}>
          <g transform="rotate(25) scale(-1.4 1.4)"><FlatGroup color={BLOB_PALETTE.teal} front="d" back="a" delay={6} /></g>
        </Corner>
      </Root>
    );
  }
  return (
    <Root interactive={interactive}>
      <Dots />
      <Motes />
      <Field depth={8}>
        <Mat3D id={`${id}f`} />
        <g fill="none" stroke="rgb(var(--ink))" strokeOpacity=".07" strokeWidth="1.5">
          <circle className="bf-spin" cx="720" cy="450" r="380" strokeDasharray="2 14" />
          <circle className="bf-spin-rev" cx="720" cy="450" r="470" strokeDasharray="40 30" strokeOpacity=".05" />
        </g>
        <Sphere id={`${id}f`} tone="brand" x={430} y={230} r={9} float={{ delay: 1 }} shadow={false} />
        <Sphere id={`${id}f`} tone="accent2" x={1040} y={290} r={7} float={{ delay: 3 }} shadow={false} />
        <Sphere id={`${id}f`} tone="accent" x={520} y={740} r={6} float={{ delay: 5 }} shadow={false} />
        <Sparkle x={1120} y={180} s={11} color="rgb(var(--accent-500))" />
        <Sparkle x={330} y={620} s={9} delay={1.2} color="rgb(var(--brand-400))" />
        <Sparkle x={980} y={760} s={8} delay={2.4} color="rgb(var(--accent2-500))" />
        <Sparkle x={600} y={120} s={7} delay={3.1} color="rgb(var(--brand-400))" />
      </Field>
      {/* มุมขวาบน */}
      <Corner className="-right-[18cqmin] -top-[18cqmin] w-[62cqmin]" depth={-16}>
        <Mat3D id={`${id}a`} />
        <Torus id={`${id}a`} tone="accent2" x={-120} y={110} r={44} w={13} float={{ delay: 2 }} />
        <Blob3D id={`${id}a`} tone="brand" shape="a" x={10} y={-10} s={1.5} r={-14} />
      </Corner>
      {/* มุมซ้ายล่าง */}
      <Corner className="-bottom-[20cqmin] -left-[18cqmin] w-[58cqmin]" depth={-12}>
        <Mat3D id={`${id}b`} />
        <Blob3D id={`${id}b`} tone="brand" shape="c" x={-10} y={10} s={1.45} r={150} float={{ delay: 4, dur: 10 }} shadow={false} />
        <Sphere id={`${id}b`} tone="accent2" x={130} y={30} r={34} float={{ delay: 1 }} shadow={false} />
      </Corner>
      {/* ชิ้นเล็กลอยอิสระ (ใกล้ผู้ดู → parallax มากกว่า) */}
      <Corner className="left-[7%] top-[12%] w-[13cqmin]" depth={26}>
        <Mat3D id={`${id}c`} />
        <Blob3D id={`${id}c`} tone="accent" shape="d" x={0} y={-20} s={1.9} r={-20} float={{ amp: 16, dur: 7, delay: 3 }} />
      </Corner>
      <Corner className="bottom-[11%] right-[7%] w-[12cqmin]" depth={30}>
        <Mat3D id={`${id}d`} />
        <Sphere id={`${id}d`} tone="accent2" x={0} y={-30} r={90} float={{ amp: 18, dur: 8, delay: 5 }} />
      </Corner>
    </Root>
  );
}

/**
 * ลายเส้นอย่างเดียว (ซ้อนบนพื้นอะไรก็ได้): เส้นคอนทัวร์โยกช้าๆ + สัญลักษณ์เล็กลอย (วง กากบาท ขีดหยัก สามเหลี่ยม) · เว้นกลางจอ
 * ใช้คู่กับ LoginBackdrop (3D) หรือพื้นสีเรียบ — LoginBackdrop แบบ 2D มีลายนี้อยู่แล้ว
 */
export function LoginPattern() {
  return (
    <Root interactive bg={false} variant="2d">
      <LoginPatternSvg />
    </Root>
  );
}

function LoginPatternSvg() {
  return (
    <Field depth={6} className="pointer-events-none">
      <Contours d="M-60 330C140 270 260 400 420 360S660 230 840 280 1120 420 1300 350 1480 290 1520 310" n={5} dy={16} stroke={BLOB_PALETTE.red} opacity={0.3} />
      <Contours d="M-60 700C200 640 340 770 570 730S910 630 1110 680 1390 770 1520 730" n={4} dy={14} stroke={BLOB_PALETTE.teal} opacity={0.3} delay={5} />
      <path className="bf-dash" d="M-40 140C180 190 330 80 530 120S870 200 1010 150" fill="none" stroke={BLOB_PALETTE.amber} strokeOpacity=".45" strokeWidth="2" strokeDasharray="12 10" strokeLinecap="round" />
      <Marks marks={MARKS} />
    </Field>
  );
}

/* ── พื้นหลังหน้า login หลังบ้าน ── */

const NODES: [number, number][] = [
  [90, 300], [220, 230], [310, 360], [180, 470], [380, 520], [260, 640], [120, 720],
  [1110, 170], [1240, 250], [1330, 140], [1180, 400], [1320, 470], [1080, 560], [1230, 680], [1360, 760],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6], [3, 6],
  [7, 8], [8, 9], [7, 10], [8, 10], [10, 11], [10, 12], [11, 13], [12, 13], [13, 14], [11, 14],
];

/** เครือข่ายจุดเชื่อมเส้น: สัญญาณวิ่งไปตามเส้น · จุดหลักมีวงเรืองเต้น */
function Network({ id, glow }: { id: string; glow: boolean }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-halo`}><stop offset="0" stopColor="rgb(var(--brand-500))" stopOpacity=".4" /><stop offset="1" stopColor="rgb(var(--brand-500))" stopOpacity="0" /></radialGradient>
      </defs>
      <g stroke="rgb(var(--ink))" strokeOpacity=".14" strokeWidth="1.25">
        {LINKS.map(([a, b]) => <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />)}
      </g>
      {/* สัญญาณวิ่งบนบางเส้น */}
      <g stroke="rgb(var(--brand-500))" strokeWidth="2" strokeLinecap="round">
        {LINKS.filter((_, i) => i % 3 === 0).map(([a, b], i) => (
          <line key={`p${a}-${b}`} className="bf-pulse-line" x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} pathLength={100} style={vars({ '--delay': `${-i * 1.3}s` })} />
        ))}
      </g>
      {NODES.map(([x, y], i) => (
        i % 4 === 0 ? (
          <g key={i} transform={`translate(${x} ${y})`}>
            {glow && <circle className="bf-beat" r="26" fill={`url(#${id}-halo)`} style={vars({ '--delay': `${-i * 0.4}s` })} />}
            <circle r="7" fill="rgb(var(--login-bg))" stroke="rgb(var(--brand-500))" strokeWidth="2.5" />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4.5 : 3} fill={i % 2 ? 'rgb(var(--brand-500))' : BLOB_PALETTE.teal} opacity=".75" />
        )
      ))}
      <g stroke="rgb(var(--ink))" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" fill="none">
        {[[470, 120], [980, 820], [520, 800], [960, 90]].map(([x, y]) => <path key={`${x}${y}`} d={`M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}`} />)}
      </g>
    </>
  );
}

/** แคปซูล 3D: ไล่แสงตามความกว้าง + แถบสะท้อนแสงยาว */
function Capsule({ id, tone, x, y, w, h, rot }: { id: string; tone: Tone; x: number; y: number; w: number; h: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <linearGradient id={`${id}-cap-${tone}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(TONE[tone], 40, 'white')} />
          <stop offset=".45" stopColor={TONE[tone]} />
          <stop offset="1" stopColor={mix(TONE[tone], 55, 'black')} />
        </linearGradient>
      </defs>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w / 2} fill={`url(#${id}-cap-${tone})`} />
      <rect x={-w * 0.3} y={-h / 2 + w * 0.3} width={w * 0.16} height={h - w * 0.6} rx={w * 0.08} fill="white" opacity=".45" />
    </g>
  );
}

/**
 * พื้นหลังหน้า login หลังบ้าน: แนวเรขาคณิต (คนละไอเดียกับฝั่งผู้ใช้) — ตารางเส้นจางขอบ · ควอเตอร์วงกลม · แคปซูล · เครือข่ายจุดที่มีสัญญาณวิ่ง
 * `variant="3d"` แคปซูล/ทรงกลมมีแสงเงา ลอย · `"2d"` รูปทรงแบนสีเรียบ (แบบเดิม)
 */
export function AdminLoginBackdrop({ variant = '3d', interactive = true }: { variant?: ArtVariant; interactive?: boolean }) {
  const id = useGid();
  const flat = variant === '2d';
  const brand = 'rgb(var(--brand-600))';
  const tint = mix('rgb(var(--brand-600))', 40);
  return (
    <Root interactive={interactive} variant={variant}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgb(var(--ink) / .06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--ink) / .06) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: flat ? undefined : 'radial-gradient(ellipse 60% 55% at 50% 50%, transparent 30%, black 80%)',
          WebkitMaskImage: flat ? undefined : 'radial-gradient(ellipse 60% 55% at 50% 50%, transparent 30%, black 80%)',
        }}
      />
      <Field depth={6}><Network id={`${id}n`} glow={!flat} /></Field>
      {/* มุมขวาบน (จุดกำเนิด = มุมกล่อง) */}
      <Corner className="right-0 top-0 w-[48cqmin]" depth={-12}>
        {!flat && <Mat3D id={`${id}a`} />}
        <g transform="translate(200 -200)">
          {/* วงกลมเต็มวงที่มุม (ล้นขอบ) — parallax เลื่อนแล้วไม่เห็นช่องที่ขอบกล่อง */}
          <circle r="340" fill={flat ? tint : mix('rgb(var(--brand-300))', 45)} />
          <circle className="bf-spin" r="250" fill="none" stroke="rgb(var(--brand-500))" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="4 8" />
          <Float amp={10} dur={9} tilt={2}>
            {flat ? <rect x="-260" y="-70" width="120" height="340" rx="60" fill={brand} transform="rotate(35 -200 100)" /> : <Capsule id={`${id}a`} tone="brand" x={-200} y={100} w={120} h={340} rot={35} />}
          </Float>
          <Float amp={14} dur={7} delay={3} tilt={4}>
            {flat ? <rect x="-140" y="210" width="70" height="200" rx="35" fill={BLOB_PALETTE.amber} transform="rotate(35 -105 310)" /> : <Capsule id={`${id}a`} tone="accent" x={-105} y={310} w={70} h={200} rot={35} />}
          </Float>
        </g>
      </Corner>
      {/* มุมซ้ายล่าง */}
      <Corner className="bottom-0 left-0 w-[46cqmin]" depth={-10}>
        {!flat && <Mat3D id={`${id}b`} />}
        <g transform="translate(-200 200)">
          <circle r="310" fill={flat ? tint : mix('rgb(var(--brand-300))', 45)} />
          <Float amp={10} dur={10} delay={5} tilt={2}>
            {flat ? <rect x="70" y="-250" width="110" height="300" rx="55" fill={brand} transform="rotate(-30 125 -100)" /> : <Capsule id={`${id}b`} tone="brand" x={125} y={-100} w={110} h={300} rot={-30} />}
          </Float>
          <Float amp={14} dur={8} delay={1} tilt={4}>
            {flat ? <rect x="230" y="-140" width="64" height="180" rx="32" fill={BLOB_PALETTE.teal} transform="rotate(-30 262 -50)" /> : <Capsule id={`${id}b`} tone="accent2" x={262} y={-50} w={64} h={180} rot={-30} />}
          </Float>
        </g>
      </Corner>
      <Corner className="left-[9%] top-[10%] w-[8cqmin]" depth={24}>
        {!flat && <Mat3D id={`${id}c`} />}
        <Float amp={18} dur={7} tilt={10}>
          {flat ? <rect x="-120" y="-120" width="240" height="240" rx="64" fill={BLOB_PALETTE.amber} transform="rotate(18)" /> : <Sphere id={`${id}c`} tone="accent" x={0} y={0} r={130} shadow={false} />}
        </Float>
      </Corner>
      <Corner className="bottom-[10%] right-[11%] w-[7cqmin]" depth={28}>
        {!flat && <Mat3D id={`${id}d`} />}
        <Float amp={16} dur={8} delay={2} tilt={10}>
          {flat ? <rect x="-120" y="-120" width="240" height="240" rx="64" fill={BLOB_PALETTE.teal} transform="rotate(-14)" /> : <Sphere id={`${id}d`} tone="accent2" x={0} y={0} r={130} shadow={false} />}
        </Float>
      </Corner>
    </Root>
  );
}

/* ── แถบหัวหน้า ── */

const HERO_MARKS: Mark[] = [
  { k: 'ring', x: 70, y: 80, s: 8, c: 'amber' }, { k: 'plus', x: 610, y: 52, s: 8, c: 'red', r: 15 },
  { k: 'squiggle', x: 700, y: 360, s: 12, c: 'teal', r: -10 }, { k: 'tri', x: 830, y: 130, s: 9, c: 'amber', r: 20 },
  { k: 'dot', x: 760, y: 250, s: 3.5, c: 'red' }, { k: 'half', x: 960, y: 350, s: 10, c: 'teal', r: 30 },
  { k: 'plus', x: 1010, y: 70, s: 7, c: 'ink', r: 30 }, { k: 'dot', x: 50, y: 320, s: 4, c: 'teal' },
];

/**
 * พื้นลายสำหรับแถบหัวหน้า (กรอบกว้างเตี้ย) — ลายเว้นด้านซ้ายให้ข้อความ ของเด่นอยู่ขวา
 * `h` = ความสูงของแถบ (px) · `top` = เว้นด้านบน (เช่น ความสูง topbar) · `variant` 3d/2d
 */
export function HeroPattern({ h = 420, top = 0, variant = '3d', interactive = true }: { h?: number; top?: number; variant?: ArtVariant; interactive?: boolean }) {
  const id = useGid();
  const k = (h - top) / 420;
  const sk = Math.max(k, 0.6);
  return (
    <Root interactive={interactive} bg={false} variant={variant}>
      <Dots fade="bottom" alpha={variant === '2d' ? 0.07 : 0.1} />
      <svg viewBox={`0 0 1440 ${h}`} preserveAspectRatio="xMaxYMid slice" className="bf-par absolute inset-0 h-full w-full select-none" style={vars({ opacity: 'var(--blob-opacity)', '--d': -10 })}>
        {variant === '3d' && <Mat3D id={id} />}
        <g transform={`translate(0 ${top}) scale(1 ${k})`}>
          <Contours d="M-60 290C160 240 300 340 500 300S820 190 1020 240 1300 330 1520 270" n={4} dy={14} stroke={BLOB_PALETTE.red} opacity={0.25} />
          <path className="bf-dash" d="M-40 90C200 140 380 40 620 80S980 150 1200 100" fill="none" stroke={BLOB_PALETTE.amber} strokeOpacity=".4" strokeWidth="2" strokeDasharray="12 10" strokeLinecap="round" />
        </g>
        <Marks marks={HERO_MARKS} dy={top} ky={k} />
        {variant === '3d' ? (
          <>
            <Blob3D id={id} tone="brand" shape="a" x={1370} y={top + 70 * k} s={1.7 * sk} r={-20} shadow={false} />
            <Torus id={id} tone="accent2" x={1180} y={top + 120 * k} r={34 * sk} w={10 * sk} float={{ delay: 2 }} />
            <Sphere id={id} tone="accent" x={1250} y={top + 330 * k} r={22 * sk} float={{ delay: 4 }} shadow={false} />
            <Sparkle x={1090} y={top + 300 * k} s={9} color="rgb(var(--accent-500))" />
            <Sparkle x={880} y={top + 220 * k} s={7} delay={1.6} color="rgb(var(--brand-400))" />
          </>
        ) : (
          <g transform={`translate(1360 ${top + 110 * k}) scale(${1.25 * sk}) rotate(-15)`}><FlatGroup color={BLOB_PALETTE.red} front="a" back="b" /></g>
        )}
      </svg>
    </Root>
  );
}
