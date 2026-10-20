import { cn } from '@/lib/utils';

/**
 * ภาพประกอบ "ไม่มีข้อมูล" (โฟลเดอร์เปล่า + แว่นขยาย + ใบไม้) วาดเป็น SVG เอง ใช้โทเคนสีของระบบ
 * - สี brand ตามฝั่ง (แดงฝั่งผู้เรียน · Cerulean หลังบ้าน) และเปลี่ยนตามธีมสว่าง/มืดเอง
 * - โฟลเดอร์/ใบไม้ใช้เหลืองอำพันจากพาเลตเดียวกับ blob ของหน้า login
 */
const AMBER = '#F5A623';
const folder = `color-mix(in srgb, ${AMBER} 62%, rgb(var(--surface)))`;
const folderDark = `color-mix(in srgb, ${AMBER} 82%, rgb(var(--surface)))`;
const folderBack = `color-mix(in srgb, ${AMBER} 92%, rgb(var(--surface)))`;
const amberSoft = `color-mix(in srgb, ${AMBER} 45%, rgb(var(--surface)))`;
const WARN = 'rgb(var(--danger-500))';

function Q({ x, y, s = 1, stroke, w = 11 }: { x: number; y: number; s?: number; stroke: string; w?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-13 -13C-13 -28 13 -28 13 -11C13 2 0 5 0 19" />
      <circle cx="0" cy="36" r="1" fill={stroke} strokeWidth={w * 1.05} />
    </g>
  );
}

export function NoDataArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 400" role="img" aria-hidden className={cn('select-none', className)}>
      {/* เงาพื้น */}
      <ellipse cx="240" cy="372" rx="196" ry="17" className="fill-brand-100" />

      {/* หน้าต่างด้านหลัง */}
      <g>
        <rect x="262" y="92" width="176" height="128" rx="6" className="fill-brand-50" />
        <rect x="262" y="92" width="176" height="15" rx="6" className="fill-brand-100" />
        {[274, 286, 298].map((cx) => <circle key={cx} cx={cx} cy="99.5" r="3" className="fill-surface" />)}
        <path d="M332 128l44 44M376 128l-44 44" className="stroke-brand-100" strokeWidth="11" strokeLinecap="round" />
        <rect x="38" y="160" width="164" height="136" rx="6" className="fill-brand-50" />
        <rect x="38" y="160" width="164" height="15" rx="6" className="fill-brand-100" />
        {[50, 62, 74].map((cx) => <circle key={cx} cx={cx} cy="167.5" r="3" className="fill-surface" />)}
      </g>

      {/* ใบไม้ซ้าย */}
      <path d="M64 268c-10-34 14-62 46-66 4 36-10 62-46 66z" fill={amberSoft} />
      <path d="M64 268c14-20 28-42 46-66" fill="none" stroke={folderDark} strokeWidth="3" strokeLinecap="round" />
      <path d="M44 322c-6-28 12-52 54-50 6 26-14 48-54 50z" className="fill-brand-500" />
      <path d="M44 322c20-16 38-30 54-50" fill="none" className="stroke-brand-200" strokeWidth="3" strokeLinecap="round" />

      {/* ใบไม้ขวา */}
      <path d="M396 332c-28-30-34-66-4-124 26 50 26 90 4 124z" className="fill-brand-500" />
      <path d="M396 332c-2-44 0-86 -4-124" fill="none" className="stroke-brand-200" strokeWidth="3" strokeLinecap="round" />
      <path d="M356 312c16-30 50-40 80-26-14 30-44 42-80 26z" fill={amberSoft} />
      <path d="M356 312c26-10 50-18 80-26" fill="none" stroke={folderDark} strokeWidth="3" strokeLinecap="round" />

      {/* โฟลเดอร์ด้านหลัง + เอกสาร */}
      <rect x="116" y="164" width="236" height="150" rx="9" fill={folderBack} />
      <path d="M156 130h112l32 32v134H156z" className="fill-brand-200" />
      <path d="M268 130l32 32h-32z" className="fill-brand-400" />
      <path d="M190 196l66 66M256 196l-66 66" className="stroke-brand-300" strokeWidth="13" strokeLinecap="round" />

      {/* โฟลเดอร์ด้านหน้า */}
      <path d="M104 222c0-8 6-14 14-14h54c7 0 12 3 16 8l10 12h132c8 0 14 6 14 14v70c0 18-14 32-32 32H134c-18 0-30-12-30-30z" fill={folder} />
      <path d="M170 332h138c18 0 32-14 32-32v-4c-30 22-110 30-170 36z" fill={folderDark} opacity=".55" />
      <path d="M126 240v82" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" />

      {/* ? บนโฟลเดอร์ */}
      <Q x={198} y={282} s={1.25} stroke="#fff" w={12} />

      {/* แว่นขยาย */}
      <path d="M312 312l34 34" className="stroke-brand-600" strokeWidth="9" strokeLinecap="round" />
      <circle cx="294" cy="294" r="34" fill={amberSoft} fillOpacity=".7" />
      <circle cx="294" cy="294" r="34" fill="none" stroke={WARN} strokeWidth="8" opacity=".9" />
      <path d="M274 282c4-9 12-14 22-14" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />

      {/* บับเบิลหน้าเศร้า */}
      <path d="M40 112a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H98l-18 14v-14H48a8 8 0 0 1-8-8z" fill={AMBER} />
      <circle cx="68" cy="128" r="3.5" fill="#fff" /><circle cx="92" cy="128" r="3.5" fill="#fff" />
      <path d="M70 148c6-7 16-7 22 0" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />

      {/* บับเบิลเตือน */}
      <path d="M412 142a30 30 0 1 1-28 40l-12 14 4-20a30 30 0 0 1 36-34z" fill={WARN} />
      <rect x="409" y="152" width="6" height="22" rx="3" fill="#fff" /><circle cx="412" cy="184" r="3.6" fill="#fff" />

      {/* ? และเครื่องหมายลอย */}
      <Q x={186} y={64} s={0.75} stroke="currentColor" w={10} />
      <Q x={258} y={56} s={1.05} stroke="currentColor" w={10} />
      <g className="stroke-brand-300" strokeWidth="3.5" strokeLinecap="round">
        <path d="M106 66v14M99 73h14" /><path d="M368 70v18M359 79h18" /><path d="M396 268v12M390 274h12" /><path d="M126 106v10M121 111h10" />
      </g>
      <g className="fill-brand-200"><circle cx="70" cy="86" r="3.5" /><circle cx="330" cy="62" r="3" /><circle cx="440" cy="248" r="3" /><circle cx="150" cy="236" r="2.5" /></g>
    </svg>
  );
}

/**
 * สถานะ "ไม่มีข้อมูล": ภาพประกอบ + หัวข้อ + คำอธิบาย + ปุ่ม (ไม่บังคับ)
 * size: md = ทั้งหน้า/การ์ดใหญ่ · sm = ในตาราง/กล่องเล็ก
 */
export function EmptyState({ title, description, action, size = 'md', card, className }: {
  title: string; description?: string; action?: React.ReactNode; size?: 'sm' | 'md'; className?: string;
  /** ห่อด้วยการ์ด — ใช้เมื่อสถานะว่างอยู่โดดๆ บนพื้นหน้า (ถ้าอยู่ในการ์ด/ตารางอยู่แล้วไม่ต้องใส่) */
  card?: boolean;
}) {
  return (
    <div className={cn('flex flex-col items-center text-center', size === 'md' ? 'gap-1 py-10' : 'gap-0.5 py-6', card && 'rounded-card bg-surface shadow-card', className)}>
      <NoDataArt className={cn('text-brand-300', size === 'md' ? 'w-64 sm:w-72' : 'w-44')} />
      <p className={cn('font-bold text-ink', size === 'md' ? 'mt-1 text-base' : 'text-sm')}>{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-mute">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
