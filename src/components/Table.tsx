import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * ตารางแบบ shadcn (Table / TableHeader / TableBody / TableRow / TableHead / TableCell)
 * พอร์ตจาก 21st.dev (animated-table-rows) แล้วปรับให้ใช้โทเคนสีของระบบนี้ (ink / brand / surface) เพื่อให้ dark mode และธีมแอดมินเปลี่ยนตามเอง
 */

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b [&_tr]:border-ink/10', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('border-b border-ink/8 transition-colors hover:bg-brand-50/60', className)} {...props} />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn('h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold text-ink-mute', className)} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-3 align-middle', className)} {...props} />
));
TableCell.displayName = 'TableCell';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t border-ink/10 bg-ink/[.03] font-medium [&>tr]:last:border-b-0', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-ink-mute', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

/** แถวที่เลื่อนเข้า/ออกแบบมีอนิเมชัน (framer-motion) — ใช้ภายใน <AnimatePresence> · ค่าอนิเมชันกำหนดเองได้ผ่าน props ของ motion.tr */
const rowClass = 'border-b border-ink/8 transition-colors hover:bg-brand-50/60';

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, rowClass };
