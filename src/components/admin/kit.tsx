'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { AlertOctagon, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, Info, Lightbulb, Minus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { EmptyState } from '@/components/EmptyState';
import { HelpTip } from '@/components/HelpTip';
import { Select } from '@/components/Select';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Collapse } from '@/components/Accordion';
import { sparkPath } from '@/lib/chart-math';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, rowClass } from '@/components/Table';

/* ── ตาราง ── */
export type Column<T> = {
  key: string;
  header: string;
  /** ความกว้างคงที่ เช่น 'w-28' — เว้นว่างให้ยืดตามเนื้อหา */
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: number }>({
  columns,
  rows,
  loading,
  empty,
  onRowClick,
  paginate,
}: {
  columns: Column<T>[];
  rows: T[] | undefined | null;
  loading?: boolean;
  empty?: string;
  onRowClick?: (row: T) => void;
  /** แบ่งหน้าฝั่ง client สำหรับตารางที่โหลดข้อมูลมาทั้งชุด — ใส่เป็นจำนวนแถวต่อหน้าเริ่มต้น (เช่น 10) · ตารางที่แบ่งหน้าจาก server ไม่ต้องใส่ */
  paginate?: number;
}) {
  const t = useT();
  const [pg, setPg] = useState(1);
  const [size, setSize] = useState(paginate ?? 0);
  const all = rows ?? undefined;
  const pages = paginate && all ? Math.max(1, Math.ceil(all.length / size)) : 1;
  const cur = Math.min(pg, pages);
  const shown = paginate && all ? all.slice((cur - 1) * size, cur * size) : all;
  const reduce = useReducedMotion();
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-10 text-center text-ink-mute">
                {t('common.loading')}
              </TableCell>
            </TableRow>
          )}
          {!loading && all?.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState size="sm" title={empty ?? t('common.empty')} />
              </TableCell>
            </TableRow>
          )}
          <AnimatePresence initial={false}>
            {shown?.map((row, index) => (
              <motion.tr
                key={row.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -80 }}
                // หน่วงทีละแถวแต่จำกัดเพดาน ตารางยาวจะได้ไม่ต้องรอ
                transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
                onClick={() => onRowClick?.(row)}
                className={cn(rowClass, 'align-middle', onRowClick && 'cursor-pointer')}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn('align-middle', c.className)}>
                    {c.render(row)}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
      {paginate && all && all.length > Math.min(paginate, 10) && (
        <div className="border-t border-ink/8 px-4 py-3">
          <Pagination page={cur} pages={pages} total={all.length} onChange={setPg} perPage={size} onPerPageChange={(n) => { setSize(n); setPg(1); }} />
        </div>
      )}
    </div>
  );
}

/* ── แถบเครื่องมือ: ค้นหา + ฟิลเตอร์ + ปุ่ม ── */
export function Toolbar({
  q,
  onSearch,
  placeholder,
  children,
}: {
  q: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const t = useT();
  const [text, setText] = useState(q);
  // q เปลี่ยนจากภายนอก (ล้างตัวกรอง · ย้อนกลับ · ค้นจาก topbar) → ช่องค้นหาตาม ไม่งั้น debounce ด้านล่างจะเขียนค่าเก่ากลับ
  useEffect(() => { setText(q); }, [q]);

  // debounce ไม่ให้ยิง API ทุกตัวอักษร
  useEffect(() => {
    const t = setTimeout(() => onSearch(text), 350);
    return () => clearTimeout(t);
  }, [text, onSearch]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder ?? t('admin.table.search')}
          className="h-10 w-full rounded-pill border border-ink/15 bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:shadow-glow"
        />
      </div>
      {children}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select variant="pill" value={value} onChange={(e) => onChange(e.target.value)} className="w-auto min-w-[8rem]">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}

/* ── แบ่งหน้า ── */
export const PAGE_SIZES = [10, 20, 50, 100];

/** เลขหน้าแบบย่อ: 1 … 4 5 [6] 7 8 … 20 */
function pageList(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((x, y) => x - y);
  const out: (number | '…')[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export function Pagination({
  page,
  pages,
  total,
  onChange,
  perPage,
  onPerPageChange,
  pageSizes = PAGE_SIZES,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (p: number) => void;
  /** ใส่คู่กับ onPerPageChange เพื่อให้เลือกจำนวนแถวต่อหน้าได้ */
  perPage?: number;
  onPerPageChange?: (n: number) => void;
  pageSizes?: number[];
}) {
  const t = useT();
  const from = total === 0 ? 0 : perPage ? (page - 1) * perPage + 1 : undefined;
  const to = perPage ? Math.min(page * perPage, total) : undefined;
  const nav = 'flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors disabled:opacity-30';
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <span className="text-ink-mute">
        {from !== undefined && to !== undefined ? t('admin.table.showing', { from, to, total }) : t('admin.table.total', { total })}
      </span>

      {perPage && onPerPageChange && (
        <span className="flex items-center gap-2 text-ink-mute">
          {t('admin.table.per_page')}
          <Select variant="compact" value={perPage} onChange={(e) => onPerPageChange(Number(e.target.value))} aria-label={t('admin.table.per_page')} className="w-[4.5rem]">
            {pageSizes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </span>
      )}

      {pages > 1 && (
        <nav aria-label={t('admin.table.pagination')} className="ml-auto flex items-center gap-1">
          <button onClick={() => onChange(1)} disabled={page <= 1} aria-label={t('admin.table.first')} className={cn(nav, 'hover:bg-ink/5')}>
            <ChevronsLeft size={15} />
          </button>
          <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label={t('admin.table.prev')} className={cn(nav, 'hover:bg-ink/5')}>
            <ChevronLeft size={15} />
          </button>
          {pageList(page, pages).map((n, i) =>
            n === '…' ? (
              <span key={`e${i}`} className="px-1 text-ink-mute">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onChange(n)}
                aria-current={n === page ? 'page' : undefined}
                className={cn(nav, n === page ? 'bg-brand-600 text-white' : 'hover:bg-ink/5')}
              >
                {n}
              </button>
            ),
          )}
          <button onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label={t('admin.table.next')} className={cn(nav, 'hover:bg-ink/5')}>
            <ChevronRight size={15} />
          </button>
          <button onClick={() => onChange(pages)} disabled={page >= pages} aria-label={t('admin.table.last')} className={cn(nav, 'hover:bg-ink/5')}>
            <ChevronsRight size={15} />
          </button>
        </nav>
      )}
    </div>
  );
}

/* ── Drawer / Dialog: ย้ายไปเป็นหน้าต่างชุดใหม่ใน components/Overlay.tsx (API เดิมใช้ได้ + ตัวเลือกใหม่) ── */
export { Dialog, Drawer } from '@/components/Overlay';

type Tone = 'default' | 'done' | 'warn' | 'danger';
const TONE_TILE: Record<Tone, string> = {
  default: 'bg-brand-100 text-brand-link',
  done: 'bg-ok-50 text-ok-600',
  warn: 'bg-warn-50 text-warn-700',
  danger: 'bg-danger-50 text-danger-600',
};
const TONE_RGB: Record<Tone, string> = { default: 'var(--brand-500)', done: 'var(--ok-500)', warn: 'var(--warn-500)', danger: 'var(--danger-500)' };
const TONE_DOT: Record<Tone, string> = { default: 'bg-ink/40', done: 'bg-ok-500', warn: 'bg-warn-500', danger: 'bg-danger-500' };

/**
 * การ์ดหัวข้อของฟอร์ม/หน้าตั้งค่า: หัว (ไอคอน · ชื่อ · คำอธิบาย · ปุ่มด้านขวา) แล้วเนื้อหาด้านล่าง
 * - `collapsible` กดหัวเพื่อพับ/กาง (ยืดหดนุ่ม · `defaultOpen`)
 * - `help` = คำอธิบายยาว แสดงเมื่อกดไอคอน ? ข้างหัวข้อ
 */
export function SectionCard({ title, hint, help, icon, actions, collapsible, defaultOpen = true, children, className }: {
  title: string;
  hint?: string;
  help?: string;
  icon?: React.ReactNode;
  /** ปุ่ม/ลิงก์ชิดขวาของหัวการ์ด */
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = React.useId();
  const heading = (
    <span className="flex min-w-0 items-start gap-3">
      {icon ? (
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-link">{icon}</span>
      ) : (
        <span aria-hidden className="mt-1 h-5 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-700" />
      )}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-base font-semibold leading-snug text-ink">{title}{help && <HelpTip text={help} />}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-mute">{hint}</span>}
      </span>
    </span>
  );
  return (
    <section className={cn('overflow-hidden rounded-card bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_0_0_1px_rgb(var(--ink)/0.06)]', className)}>
      <header className={cn('flex items-center gap-3 px-6 py-4', (!collapsible || open) && 'border-b border-ink/[0.06]')}>
        {collapsible ? (
          <button
            type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={bodyId}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
          >
            {heading}
            <ChevronDown aria-hidden size={18} className={cn('shrink-0 text-ink-mute transition-transform duration-300', open && 'rotate-180')} />
          </button>
        ) : (
          <h2 className="m-0 min-w-0 flex-1 font-sans">{heading}</h2>
        )}
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {collapsible ? (
        <Collapse open={open} id={bodyId}><div className="space-y-6 p-6">{children}</div></Collapse>
      ) : (
        <div className="space-y-6 p-6">{children}</div>
      )}
    </section>
  );
}

/** เส้นแนวโน้มจิ๋วในการ์ดตัวเลข (พื้นไล่สีจางลงล่าง) */
function MiniTrend({ values, tone }: { values: number[]; tone: Tone }) {
  const id = React.useId().replace(/:/g, '');
  const { line, area } = sparkPath(values, 100, 32, 3);
  if (!line) return null;
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden className="stat-trend h-9 w-full overflow-visible">
      <defs>
        <linearGradient id={`st${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgb(${TONE_RGB[tone]})`} stopOpacity="0.22" />
          <stop offset="100%" stopColor={`rgb(${TONE_RGB[tone]})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#st${id})`} />
      <path d={line} fill="none" stroke={`rgb(${TONE_RGB[tone]})`} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/**
 * การ์ดตัวเลขสรุป
 * - ตัวเลขวิ่งขึ้นตอนเลื่อนมาเห็น (เมื่อ value เป็นตัวเลข) · `format` กำหนดรูปแบบ เช่น `฿${n}`
 * - `icon` ในกรอบสีตาม `tone` · `delta` = % เปลี่ยนแปลง (ชิป ↑ เขียว / ↓ แดง · `deltaInverse` เมื่อ "ลด = ดี" เช่น จำนวนค้าง)
 * - `trend` = ชุดตัวเลขย้อนหลัง วาดเป็นเส้นจิ๋ว · `onClick` → การ์ดกดได้ ยกขึ้นตอนชี้พร้อมลูกศร
 * - การ์ดในแถวเดียวกันสูงเท่ากันเสมอ (มี/ไม่มี hint ก็ตรงกัน)
 */
export function StatCard({
  label, value, hint, tone = 'default', onClick, icon, delta, deltaInverse, trend, format,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  onClick?: () => void;
  icon?: React.ReactNode;
  delta?: number | null;
  deltaInverse?: boolean;
  trend?: number[];
  format?: (n: number) => string;
}) {
  const good = delta != null && (deltaInverse ? delta < 0 : delta > 0);
  const flat = delta === 0;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'stat-card group relative flex h-full min-h-[8.5rem] flex-col overflow-hidden rounded-card bg-surface p-4 text-left',
        'shadow-[0_1px_2px_rgb(0_0_0/0.04),0_0_0_1px_rgb(var(--ink)/0.06)] transition-[transform,box-shadow] duration-300',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      )}
      style={{ ['--stat' as string]: TONE_RGB[tone] }}
    >
      {/* แสงจางตามโทนที่มุมขวาบน */}
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle, rgb(${TONE_RGB[tone]} / 0.14), transparent 70%)` }} />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-ink-mute">{label}</p>
        {icon && <span aria-hidden className={cn('grid size-8 shrink-0 place-items-center rounded-lg', TONE_TILE[tone])}>{icon}</span>}
      </div>
      <p className={cn('relative mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight', tone === 'default' ? 'text-ink' : { done: 'text-ok-700', warn: 'text-warn-700', danger: 'text-danger-700' }[tone])}>
        {typeof value === 'number' ? <AnimatedNumber value={value} format={format} /> : value}
      </p>
      {trend && trend.length > 1 && <div className="relative -mx-1 mt-1"><MiniTrend values={trend} tone={tone} /></div>}
      <div className="relative mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2">
        {delta != null && (
          <span className={cn('inline-flex items-center gap-0.5 rounded-pill px-1.5 py-0.5 text-[11px] font-bold tabular-nums', flat ? 'bg-ink/[0.06] text-ink-mute' : good ? 'bg-ok-50 text-ok-700' : 'bg-danger-50 text-danger-700')}>
            {flat ? <Minus size={11} strokeWidth={3} /> : delta > 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
            {Math.abs(delta).toLocaleString()}%
          </span>
        )}
        {hint && <span className="text-[11px] text-ink-mute">{hint}</span>}
        {onClick && <ArrowRight aria-hidden size={15} className="ml-auto -translate-x-1 text-ink-mute opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />}
      </div>
    </Tag>
  );
}

/**
 * หัวหน้าทุกหน้าหลังบ้าน (FR-A-01 ข้อ 6): breadcrumb/eyebrow · H1 · คำอธิบาย · ชิปสรุปตัวเลข · ปุ่มด้านขวา
 */
export function AdminPageHeader({ title, stats, actions, description, breadcrumb }: {
  title: string;
  /** เช่น [{ label: 'คอร์สทั้งหมด', value: 8 }, { label: 'เผยแพร่', value: 6, tone: 'done' }] */
  stats?: { label: string; value: string | number; tone?: Tone }[];
  actions?: React.ReactNode;
  description?: React.ReactNode;
  /** วาง <Breadcrumb/> หรือข้อความเล็กเหนือหัวข้อ */
  breadcrumb?: React.ReactNode;
}) {
  return (
    <div className="mb-5 space-y-3">
      {breadcrumb}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-mute">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {stats && stats.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <li key={s.label} className="inline-flex items-center gap-2 rounded-pill bg-surface py-1 pl-2.5 pr-3 text-xs text-ink-soft shadow-[0_0_0_1px_rgb(var(--ink)/0.08)]">
              <span aria-hidden className={cn('size-1.5 rounded-full', TONE_DOT[s.tone ?? 'default'])} />
              {s.label}
              <b className="font-bold tabular-nums text-ink">{s.value}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const NOTE_TONE = {
  // info เป็นสีกลาง (ไม่ใช้สีแบรนด์ — แบรนด์สีแดงจะทำให้หมายเหตุธรรมดาดูเป็นข้อผิดพลาด)
  info: { box: 'bg-ink/[0.04] text-ink-soft', bar: 'bg-ink/25', icon: Info, iconC: 'text-ink-mute' },
  tip: { box: 'bg-accent-2/[0.08] text-ink-soft', bar: 'bg-accent-2', icon: Lightbulb, iconC: 'text-ok-700' },
  success: { box: 'bg-ok-50 text-ink-soft', bar: 'bg-ok-500', icon: CheckCircle2, iconC: 'text-ok-700' },
  warn: { box: 'bg-warn-50 text-ink-soft', bar: 'bg-warn-500', icon: AlertTriangle, iconC: 'text-warn-700' },
  danger: { box: 'bg-danger-50 text-ink-soft', bar: 'bg-danger-500', icon: AlertOctagon, iconC: 'text-danger-700' },
} as const;

/** กล่องคำแนะนำ/หมายเหตุ: แถบสีซ้าย + ไอคอนตาม `tone` (info · tip · success · warn · danger) + หัวข้อ (ไม่บังคับ) */
export function InfoNote({ children, tone = 'info', title, className }: {
  children: React.ReactNode;
  tone?: keyof typeof NOTE_TONE;
  title?: string;
  className?: string;
}) {
  const t = NOTE_TONE[tone];
  const Icon = t.icon;
  return (
    <div role={tone === 'danger' || tone === 'warn' ? 'note' : undefined} className={cn('relative mt-6 flex gap-3 overflow-hidden rounded-2xl py-3.5 pl-5 pr-4 text-sm leading-relaxed', t.box, className)}>
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', t.bar)} />
      <Icon aria-hidden size={18} className={cn('mt-0.5 shrink-0', t.iconC)} />
      <div className="min-w-0">
        {title && <p className="mb-0.5 font-semibold text-ink">{title}</p>}
        {children}
      </div>
    </div>
  );
}
