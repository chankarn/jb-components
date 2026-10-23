'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { EmptyState } from '@/components/EmptyState';
import { HelpTip } from '@/components/HelpTip';
import { Select } from '@/components/Select';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

/** การ์ดหัวข้อของฟอร์ม: หัวเรียบ (ขีดสี brand ซ้ายหัวข้อ + เส้นคั่นบางๆ) แล้วเนื้อหาด้านล่าง */
export function SectionCard({ title, hint, help, children, className }: { title: string; hint?: string; /** คำอธิบายยาว แสดงเมื่อกดไอคอน ? ข้างหัวข้อ */ help?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-card bg-surface shadow-card', className)}>
      <header className="border-b border-ink/8 px-6 py-4">
        <h2 className="flex items-center gap-2.5 text-base font-bold leading-tight">
          <span aria-hidden className="h-5 w-1 rounded-full bg-brand-600" />
          {title}
          {help && <HelpTip text={help} />}
        </h2>
        {hint && <p className="mt-1 pl-[14px] text-xs text-ink-mute">{hint}</p>}
      </header>
      <div className="space-y-6 p-6">{children}</div>
    </section>
  );
}

/* ── การ์ดตัวเลขสรุป ── */
export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'done' | 'warn' | 'danger';
  onClick?: () => void;
}) {
  const color = {
    default: 'text-ink',
    done: 'text-ok-600',
    warn: 'text-warn-600',
    danger: 'text-danger-600',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'rounded-card bg-surface p-4 text-left shadow-card transition',
        onClick && 'hover:shadow-lift',
      )}
    >
      <p className="text-xs font-semibold text-ink-mute">{label}</p>
      <p className={cn('mt-1 text-2xl font-extrabold', color)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-ink-mute">{hint}</p>}
    </button>
  );
}

/* ── หัวหน้าทุกหน้าหลังบ้าน (FR-A-01 ข้อ 6): H1 + แถบสรุปตัวเลข + ปุ่มด้านขวา ── */
export function AdminPageHeader({
  title,
  stats,
  actions,
}: {
  title: string;
  /** เช่น [{ label: 'คอร์สทั้งหมด', value: 8 }, { label: 'เผยแพร่', value: 6, tone: 'done' }] */
  stats?: { label: string; value: string | number; tone?: 'default' | 'done' | 'warn' | 'danger' }[];
  actions?: React.ReactNode;
}) {
  const tone = { default: 'text-ink', done: 'text-ok-700', warn: 'text-warn-700', danger: 'text-danger-700' };
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        {stats && stats.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-mute">
            {stats.map((s) => (
              <span key={s.label}>
                {s.label} <b className={cn('ml-1 font-bold', tone[s.tone ?? 'default'])}>{s.value}</b>
              </span>
            ))}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── กล่องคำแนะนำท้ายหน้า (note info) ── */
export function InfoNote({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-soft">{children}</div>;
}
