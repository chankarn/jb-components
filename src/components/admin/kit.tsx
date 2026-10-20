'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
          className="h-10 w-full rounded-pill border border-ink/15 bg-surface pl-9 pr-3 text-sm outline-none focus:border-brand-500"
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

/* ── Drawer ── */
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  // ปิด scroll ของหน้าหลังระหว่างเปิด drawer ไม่งั้นเลื่อนทะลุไปโดนตารางข้างหลัง
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  /**
   * ต้อง portal ไป body — ถ้าปล่อยไว้ใน tree ของหน้า drawer จะโดน layout ของ parent เล่นงาน
   * เคสที่เจอจริง: หน้าเพจครอบด้วย `space-y-*` ซึ่งยัด margin-top ให้ลูกทุกตัวยกเว้นตัวแรก
   * drawer (position: fixed) เลยถูกดันลงมาจากขอบบน กลายเป็นแถบขาวโผล่ด้านบน
   * portal ตัดปัญหาทั้งตระกูลนี้ (margin ของ parent, transform, overflow, stacking context)
   */
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-surface">
        <header className="flex items-center gap-3 bg-brand-600 px-5 py-3 text-white">
          <h2 className="flex-1 text-base font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
          >
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-ink/10 bg-paper px-5 py-3">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

/**
 * หน้าต่างกลางจอ (dialog) สำหรับฟอร์มสั้นๆ เช่นสร้างรายการใหม่ · เนื้อหายาว/มีรายการให้เลื่อนดู ใช้ Drawer ด้านข้างแทน
 * portal ไป body เหมือน Drawer · ปิดด้วย Esc หรือคลิกฉากหลัง · โฟกัสย้ายเข้าหน้าต่างตอนเปิด
 */
export function Dialog({
  open, title, onClose, children, footer, size = 'md',
}: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!mounted) return null;
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-4xl' }[size];
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={cn('relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[24px] bg-surface shadow-lift', width)}
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <header className="flex items-center gap-3 bg-brand-600 px-8 py-5 text-white">
              <h2 className="flex-1 text-xl font-extrabold">{title}</h2>
              <button onClick={onClose} aria-label={t('common.close')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30">
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 space-y-7 overflow-y-auto px-8 py-7">{children}</div>
            {footer && <footer className="border-t border-ink/8 bg-paper px-8 py-5">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

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
