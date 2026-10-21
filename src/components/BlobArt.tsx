import { cn } from '@/lib/utils';

/**
 * ลวดลาย blob แบบเรียบ (flat organic shapes) 2 ชั้น + จุดเล็ก — ใช้ตกแต่งหน้า login
 * สีกำหนดผ่าน className ของ Tailwind (fill-*) เพื่อให้เปลี่ยนตามธีมและฝั่งผู้เรียน/หลังบ้านได้
 */
const BACK = 'M246 52c36-6 78 4 92 38 12 30-10 56-34 76-26 22-46 54-86 66-42 12-92 0-114-34-18-28-2-60 18-84 26-30 62-56 124-62Z';
const FRONT = 'M170 70c46-10 100 6 124 42 22 34 10 78-22 106-28 24-66 26-100 20-38-6-80-14-98-48-16-30-4-68 22-94 20-18 46-20 74-26Z';

export function BlobArt({
  back = 'fill-brand-300', front = 'fill-brand-600', dots = 'fill-brand-600', className,
}: { back?: string; front?: string; dots?: string; className?: string }) {
  return (
    <svg viewBox="0 0 400 320" aria-hidden className={cn('pointer-events-none select-none', className)}>
      <path d={BACK} className={back} transform="translate(30 6) rotate(8 200 160)" />
      <path d={FRONT} className={front} transform="translate(-6 28)" />
      <circle cx="44" cy="96" r="9" className={dots} />
      <circle cx="74" cy="72" r="4.5" className={dots} />
      <circle cx="300" cy="262" r="11" className={dots} />
      <circle cx="334" cy="248" r="4" className={dots} />
    </svg>
  );
}

/** รูปทรง blob 3 แบบ (viewBox -100..100) — ใช้ต่างกันแต่ละมุม ไม่ให้ดูเป็นรูปเดียวหมุนซ้ำ */
const SHAPES = {
  round: 'M43.1,-57.3C55.4,-48.7,64.5,-35.2,69.3,-20.1C74.1,-5,74.6,11.8,68.4,25.6C62.2,39.4,49.3,50.2,34.9,58.5C20.5,66.8,4.6,72.6,-11.9,71.6C-28.4,70.6,-45.5,62.8,-57.6,49.9C-69.7,37,-76.8,19,-76.1,1.6C-75.4,-15.8,-66.9,-32.5,-54.3,-41.7C-41.7,-50.9,-25,-52.6,-9.7,-55.7C5.6,-58.8,30.8,-65.9,43.1,-57.3Z',
  wave: 'M39.9,-51.4C52.3,-45.6,63.4,-34.5,66.6,-21.4C69.8,-8.3,65.1,6.8,58.6,20.4C52.1,34,43.8,46.1,32.1,55.6C20.4,65.1,5.3,72,-11.8,73.6C-28.9,75.2,-48,71.5,-58.7,60.1C-69.4,48.7,-71.7,29.6,-71.9,12.1C-72.1,-5.4,-70.2,-21.3,-62.1,-33.5C-54,-45.7,-39.7,-54.2,-25.6,-59.4C-11.5,-64.6,2.4,-66.5,15.4,-63.6C28.4,-60.7,27.5,-57.2,39.9,-51.4Z',
  long: 'M48.6,-62.1C61.1,-56.4,68.6,-40.6,70.9,-24.9C73.2,-9.2,70.3,6.4,64.2,20.5C58.1,34.6,48.8,47.2,36.2,56.7C23.6,66.2,7.7,72.6,-9.3,74.3C-26.3,76,-44.4,73,-55.9,62.4C-67.4,51.8,-72.3,33.6,-73.4,16.3C-74.5,-1,-71.8,-17.4,-64.1,-31.2C-56.4,-45,-43.7,-56.2,-29.6,-61.5C-15.5,-66.8,0,-66.2,16.1,-66.4C32.2,-66.6,36.1,-67.8,48.6,-62.1Z',
} as const;

type Shape = keyof typeof SHAPES;

/** blob เดี่ยว: สีเรียบหรือไล่เฉด วางตำแหน่งด้วย className (absolute) */
function Blob({ shape, fill, gradient, id, className, rotate = 0 }: { shape: Shape; fill?: string; gradient?: [string, string]; id?: string; className?: string; rotate?: number }) {
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden className={cn('pointer-events-none absolute select-none', className)}>
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={gradient[0]} />
            <stop offset="1" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      )}
      <path d={SHAPES[shape]} fill={gradient ? `url(#${id})` : fill} transform={`rotate(${rotate})`} />
    </svg>
  );
}

/**
 * กลุ่ม blob สีเดียว (flat): ชั้นหลังเป็นสีเดียวกันแบบอ่อน ชั้นหน้าเป็นสีเต็ม + วงกลมเล็กสีเดียวกัน
 * ไม่ผสมสีข้ามกลุ่ม ไม่ไล่เฉด — ตามสไตล์ abstract banner
 */
export function FlatCluster({ color, className, front = 'wave', back = 'round', rotate = 0, flip = false }: { color: string; className?: string; front?: Shape; back?: Shape; rotate?: number; flip?: boolean }) {
  const tint = `color-mix(in srgb, ${color} 55%, rgb(var(--surface)))`;
  return (
    <svg viewBox="-130 -130 260 260" aria-hidden className={cn('pointer-events-none absolute select-none', className)} style={{ transform: `rotate(${rotate}deg)${flip ? ' scaleX(-1)' : ''}`, opacity: 'var(--blob-opacity)' }}>
      <path d={SHAPES[back]} fill={tint} transform="translate(30 -26) rotate(40) scale(1.08)" />
      <path d={SHAPES[front]} fill={color} transform="translate(-8 8)" />
      <circle cx="88" cy="-92" r="13" fill={color} />
      <circle cx="112" cy="-118" r="7" fill={tint} />
      <circle cx="-96" cy="96" r="9" fill={tint} />
    </svg>
  );
}

export const BLOB_PALETTE = {
  red: 'rgb(var(--brand-500))',
  // ต้นทางฝัง hex (#F5A623 / #00B295) — ที่นี่อ้างโทเคนสีรอง/สีที่สามให้เปลี่ยนตามสี CI
  amber: 'rgb(var(--accent-500))',
  teal: 'rgb(var(--accent2-500))',
};

/**
 * พื้นหลังหน้า login ผู้เรียน: พื้นขาวลายจุดแบบ Demo + กลุ่ม blob สีเดียวต่อกลุ่ม
 * แดง (สีหลัก) ใหญ่สุดสองมุม · อำพัน/มิ้นต์จากพาเลตเป็นกลุ่มเล็กเสริม (จอใหญ่)
 */
export function LoginBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: 'rgb(var(--login-bg))' }}>
      <div className="absolute inset-0 [background-image:radial-gradient(rgb(var(--ink)/.07)_1px,transparent_1px)] [background-size:22px_22px]" />
      <LoginPattern />
      <FlatCluster color={BLOB_PALETTE.red} className="-right-24 -top-28 w-[22rem] sm:-right-16 sm:w-[32rem]" front="wave" back="round" rotate={-10} />
      <FlatCluster color={BLOB_PALETTE.red} className="-bottom-44 -left-28 w-[18rem] sm:-bottom-32 sm:-left-16 sm:w-[28rem]" front="round" back="long" rotate={160} />
      <FlatCluster color={BLOB_PALETTE.amber} className="left-[6%] top-[12%] hidden w-44 lg:block" front="long" back="wave" rotate={-20} />
      <FlatCluster color={BLOB_PALETTE.teal} className="bottom-[10%] right-[7%] hidden w-48 lg:block" front="wave" back="long" rotate={25} flip />
    </div>
  );
}

/**
 * ลายเส้นประกอบพื้นหลัง login: เส้นคลื่นไหลผ่านจอ วงโค้งซ้อน และสัญลักษณ์เล็กกระจาย (วง กากบาท ขีดหยัก สามเหลี่ยม)
 * ตำแหน่งกำหนดตายตัวแต่ไม่เรียงเป็นตาราง เว้นกลางจอไว้ให้การ์ด login · สีจากพาเลตเดียวกับ blob ความทึบต่ำ
 */
type Mark = { k: 'ring' | 'plus' | 'squiggle' | 'tri' | 'half' | 'dot'; x: number; y: number; s: number; r?: number; c: keyof typeof BLOB_PALETTE | 'ink' };
const MARKS: Mark[] = [
  { k: 'ring', x: 170, y: 250, s: 14, c: 'red' },
  { k: 'plus', x: 330, y: 120, s: 12, c: 'amber', r: 15 },
  { k: 'squiggle', x: 250, y: 470, s: 20, c: 'teal', r: -20 },
  { k: 'tri', x: 410, y: 330, s: 12, c: 'ink', r: 12 },
  { k: 'half', x: 120, y: 620, s: 16, c: 'amber', r: 40 },
  { k: 'plus', x: 360, y: 760, s: 10, c: 'red', r: -10 },
  { k: 'dot', x: 450, y: 560, s: 5, c: 'teal' },
  { k: 'ring', x: 1060, y: 120, s: 9, c: 'teal' },
  { k: 'squiggle', x: 1180, y: 430, s: 22, c: 'red', r: 25 },
  { k: 'tri', x: 1300, y: 600, s: 14, c: 'amber', r: -18 },
  { k: 'plus', x: 1050, y: 700, s: 12, c: 'ink', r: 30 },
  { k: 'half', x: 1340, y: 300, s: 14, c: 'teal', r: -60 },
  { k: 'ring', x: 1000, y: 820, s: 18, c: 'amber' },
  { k: 'dot', x: 1120, y: 260, s: 5, c: 'amber' },
  { k: 'dot', x: 560, y: 90, s: 4, c: 'red' },
  { k: 'squiggle', x: 700, y: 840, s: 18, c: 'amber', r: 0 },
  { k: 'tri', x: 820, y: 70, s: 10, c: 'teal', r: 45 },
];

function MarkShape({ k, s }: { k: Mark['k']; s: number }) {
  switch (k) {
    case 'ring': return <circle r={s} fill="none" strokeWidth={3} />;
    case 'plus': return <path d={`M${-s} 0H${s}M0 ${-s}V${s}`} strokeWidth={3.5} strokeLinecap="round" />;
    case 'squiggle': return <path d={`M${-s * 2} 0q${s / 2} ${-s} ${s} 0t${s} 0t${s} 0t${s} 0`} fill="none" strokeWidth={3} strokeLinecap="round" />;
    case 'tri': return <path d={`M0 ${-s}L${s * 0.9} ${s * 0.6}H${-s * 0.9}Z`} fill="none" strokeWidth={3} strokeLinejoin="round" />;
    case 'half': return <path d={`M${-s} 0a${s} ${s} 0 0 1 ${s * 2} 0Z`} stroke="none" />;
    case 'dot': return <circle r={s} stroke="none" />;
  }
}

export function LoginPattern() {
  const col = (c: Mark['c']) => (c === 'ink' ? 'rgb(var(--ink))' : BLOB_PALETTE[c]);
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full select-none" style={{ opacity: 'var(--blob-opacity)' }}>
      {/* เส้นคลื่นไหลผ่านจอ ความหนาและระยะต่างกันเล็กน้อยให้ดูวาดมือ */}
      <g fill="none" strokeLinecap="round">
        <path d="M-40 360C140 300 240 420 400 380S640 250 820 300 1100 430 1280 360 1480 300 1500 320" stroke={BLOB_PALETTE.red} strokeOpacity=".18" strokeWidth="2" />
        <path d="M-40 400C150 340 250 460 410 420S650 290 830 340 1110 470 1290 400 1490 340 1500 360" stroke={BLOB_PALETTE.red} strokeOpacity=".1" strokeWidth="1.5" />
        <path d="M-40 720C200 660 330 780 560 740S900 640 1100 690 1380 780 1500 740" stroke={BLOB_PALETTE.teal} strokeOpacity=".22" strokeWidth="2" strokeDasharray="2 10" />
        <path d="M-40 150C180 200 320 90 520 130S860 210 1000 160" stroke={BLOB_PALETTE.amber} strokeOpacity=".25" strokeWidth="2" strokeDasharray="14 10" />
      </g>
      {/* วงโค้งซ้อนรอบมุม blob ใหญ่ */}
      <g fill="none" stroke="rgb(var(--ink))" strokeOpacity=".07" strokeWidth="1.5">
        {[150, 190, 230].map((r) => <circle key={r} cx="1330" cy="70" r={r} />)}
        {[130, 170].map((r) => <circle key={r} cx="90" cy="860" r={r} strokeDasharray="4 8" />)}
      </g>
      {MARKS.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.r ?? 0})`} stroke={col(m.c)} fill={col(m.c)} opacity={m.c === 'ink' ? 0.18 : 0.55}>
          <MarkShape k={m.k} s={m.s} />
        </g>
      ))}
    </svg>
  );
}

/**
 * พื้นหลังหน้า login หลังบ้าน: แนวเดียวกับฝั่งผู้เรียน (พื้นเรียบ + รูปทรงแบนสีเดียว + ลายเส้น) แต่คนละไอเดีย
 * ผู้เรียน = blob ออร์แกนิก + เส้นคลื่น · หลังบ้าน = รูปทรงเรขาคณิต (แคปซูล ควอเตอร์วงกลม) + เครือข่ายจุดเชื่อมเส้น
 * แทนภาพ "ข้อมูลที่เชื่อมกัน" ของงานดูแลระบบ · สี brand เป็น Cerulean อัตโนมัติในหลังบ้าน
 */
const NODES: [number, number][] = [
  [90, 300], [220, 230], [310, 360], [180, 470], [380, 520], [260, 640], [120, 720],
  [1110, 170], [1240, 250], [1330, 140], [1180, 400], [1320, 470], [1080, 560], [1230, 680], [1360, 760],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6], [3, 6],
  [7, 8], [8, 9], [7, 10], [8, 10], [10, 11], [10, 12], [11, 13], [12, 13], [13, 14], [11, 14],
];

export function AdminLoginBackdrop() {
  const brand = 'rgb(var(--brand-600))';
  const tint = 'color-mix(in srgb, rgb(var(--brand-600)) 40%, rgb(var(--surface)))';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: 'rgb(var(--login-bg))' }}>
      {/* ตารางเส้นบางแทนลายจุดของฝั่งผู้เรียน */}
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(var(--ink)/.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink)/.045)_1px,transparent_1px)] [background-size:44px_44px]" />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full select-none" style={{ opacity: 'var(--blob-opacity)' }}>
        {/* รูปทรงเรขาคณิตใหญ่ที่มุม: ควอเตอร์วงกลม + แคปซูลเอียง */}
        <path d="M1440 0V330A330 330 0 0 1 1110 0Z" fill={tint} />
        <rect x="1180" y="-60" width="120" height="330" rx="60" fill={brand} transform="rotate(35 1240 105)" />
        <rect x="1300" y="210" width="70" height="200" rx="35" fill={BLOB_PALETTE.amber} transform="rotate(35 1335 310)" />
        <path d="M0 900V600A300 300 0 0 1 300 900Z" fill={tint} />
        <rect x="70" y="650" width="110" height="300" rx="55" fill={brand} transform="rotate(-30 125 800)" />
        <rect x="230" y="760" width="64" height="180" rx="32" fill={BLOB_PALETTE.teal} transform="rotate(-30 262 850)" />
        <rect x="140" y="80" width="54" height="54" rx="14" fill={BLOB_PALETTE.amber} transform="rotate(18 167 107)" />
        <rect x="1250" y="790" width="46" height="46" rx="12" fill={BLOB_PALETTE.teal} transform="rotate(-14 1273 813)" />

        {/* เครือข่ายจุดเชื่อมเส้น */}
        <g stroke="rgb(var(--ink))" strokeOpacity=".14" strokeWidth="1.5">
          {LINKS.map(([a, b]) => <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />)}
        </g>
        {NODES.map(([x, y], i) => (
          i % 4 === 0
            ? <circle key={i} cx={x} cy={y} r="8" fill="rgb(var(--login-bg))" stroke={brand} strokeWidth="3" />
            : <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.5} fill={i % 2 ? brand : BLOB_PALETTE.teal} opacity=".7" />
        ))}

        {/* เครื่องหมายเล็งมุม (crosshair) กับสี่เหลี่ยมโปร่งซ้อน */}
        <g stroke="rgb(var(--ink))" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" fill="none">
          {[[470, 120], [980, 820], [520, 800], [960, 90]].map(([x, y]) => (
            <path key={`${x}${y}`} d={`M${x - 10} ${y}H${x + 10}M${x} ${y - 10}V${y + 10}`} />
          ))}
          <rect x="980" y="300" width="36" height="36" rx="8" transform="rotate(20 998 318)" stroke={BLOB_PALETTE.amber} strokeOpacity=".7" />
          <rect x="420" y="250" width="26" height="26" rx="6" transform="rotate(-15 433 263)" stroke={brand} strokeOpacity=".6" />
        </g>
        {/* เส้นประแนวทแยง */}
        <path d="M560 40L900 -60M520 880L960 760" stroke={brand} strokeOpacity=".2" strokeWidth="2" strokeDasharray="10 10" fill="none" />
      </svg>
    </div>
  );
}

/**
 * ลายเส้นสำหรับแถบหัวหน้า (หน้าแรก / โปรไฟล์ฝั่งผู้เรียน) — ไอเดียเดียวกับ LoginPattern แต่จัดวางสำหรับกรอบกว้างเตี้ย
 * พื้นลายจุด + เส้นคลื่น + สัญลักษณ์เล็กกระจายตามขอบและช่องว่างระหว่างเนื้อหา
 */
const HERO_MARKS: Mark[] = [
  { k: 'ring', x: 60, y: 70, s: 9, c: 'amber' },
  { k: 'plus', x: 610, y: 52, s: 9, c: 'red', r: 15 },
  { k: 'squiggle', x: 690, y: 370, s: 14, c: 'teal', r: -10 },
  { k: 'tri', x: 820, y: 120, s: 10, c: 'amber', r: 20 },
  { k: 'dot', x: 760, y: 250, s: 4, c: 'red' },
  { k: 'half', x: 950, y: 360, s: 11, c: 'teal', r: 30 },
  { k: 'plus', x: 1000, y: 60, s: 8, c: 'ink', r: 30 },
  { k: 'ring', x: 1380, y: 360, s: 12, c: 'teal' },
  { k: 'tri', x: 1260, y: 395, s: 9, c: 'red', r: -25 },
  { k: 'dot', x: 40, y: 330, s: 5, c: 'teal' },
  { k: 'squiggle', x: 700, y: 40, s: 12, c: 'amber', r: 5 },
];

export function HeroPattern({ h = 420, top = 0 }: { h?: number; top?: number }) {
  const k = (h - top) / 420;
  const col = (c: Mark['c']) => (c === 'ink' ? 'rgb(var(--ink))' : BLOB_PALETTE[c]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 [background-image:radial-gradient(rgb(var(--ink)/.06)_1px,transparent_1px)] [background-size:22px_22px]" />
      <svg viewBox={`0 0 1440 ${h}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full select-none" style={{ opacity: 'var(--blob-opacity)' }}>
        <g fill="none" strokeLinecap="round" transform={`translate(0 ${top}) scale(1 ${k})`}>
          <path d="M-40 300C160 250 300 350 500 310S820 200 1020 250 1300 340 1500 280" stroke={BLOB_PALETTE.red} strokeOpacity=".14" strokeWidth="2" />
          <path d="M-40 330C170 280 310 380 510 340S830 230 1030 280 1310 370 1500 310" stroke={BLOB_PALETTE.red} strokeOpacity=".08" strokeWidth="1.5" />
          <path d="M-40 90C200 140 380 40 620 80S980 150 1200 100" stroke={BLOB_PALETTE.amber} strokeOpacity=".22" strokeWidth="2" strokeDasharray="14 10" />
          <path d="M600 410C760 370 900 430 1080 395S1320 360 1500 390" stroke={BLOB_PALETTE.teal} strokeOpacity=".22" strokeWidth="2" strokeDasharray="2 10" />
        </g>
        {HERO_MARKS.map((m, i) => (
          <g key={i} transform={`translate(${m.x} ${top + m.y * k}) rotate(${m.r ?? 0})`} stroke={col(m.c)} fill={col(m.c)} opacity={m.c === 'ink' ? 0.18 : 0.55}>
            <MarkShape k={m.k} s={m.s} />
          </g>
        ))}
      </svg>
    </div>
  );
}
