import { cn } from '@/lib/utils';
import { HelpTip } from '@/components/HelpTip';
import { EmptyState } from '@/components/EmptyState';

/* ── Card ── */
export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-card bg-surface p-4 shadow-card', className)} {...props} />;
}

/* ── Button ── */
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition disabled:pointer-events-none disabled:opacity-40',
        size === 'md' ? 'h-12 px-6 text-sm' : 'h-9 px-4 text-xs',
        {
          primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-ink/10 disabled:text-ink-mute disabled:opacity-100',
          dark: 'bg-ink text-paper hover:bg-ink-soft',
          outline: 'border border-ink/15 bg-surface text-ink hover:border-brand-500 hover:text-brand-link',
          ghost: 'bg-ink/5 text-ink-soft hover:bg-ink/10',
          danger: 'bg-state-overdue text-white hover:opacity-90',
        }[variant],
        className,
      )}
      {...props}
    />
  );
}

/* ── Chip ── */
export function Chip({
  className,
  tone = 'brand',
  ...props
}: React.ComponentProps<'span'> & { tone?: 'brand' | 'dark' | 'mute' | 'done' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-[11px] font-semibold',
        {
          brand: 'bg-brand-100 text-brand-link',
          dark: 'bg-ink text-paper',
          mute: 'bg-ink/8 text-ink-mute',
          done: 'bg-ok-50 text-ok-700',
        }[tone],
        className,
      )}
      {...props}
    />
  );
}

/* ── Tabs: ดู components/Tabs.tsx ── */
export { Tabs } from '@/components/Tabs';

/* ── Form ── */
export function Field({
  label,
  hint,
  children,
  as: Tag = 'label',
  field,
  error,
  help,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  /** ใช้ 'div' เมื่อในช่องมีปุ่ม/ช่องกรอกหลายอัน (เช่น ชิป) — ถ้าเป็น label เบราว์เซอร์จะส่ง hover/คลิกไปที่ปุ่มแรกที่เจอ */
  as?: 'label' | 'div';
  /** รหัสช่อง (data-field) ให้ summary ของ wizard เลื่อนมาหา */
  field?: string;
  /** ข้อความผิดพลาดใต้ช่อง — มีค่าแล้วกรอบช่องกรอกเป็นสีแดง */
  error?: string;
  /** คำอธิบายเพิ่มเติม แสดงเมื่อกดไอคอน ? ที่มุมขวาของหัวช่อง (ข้อจำกัดสั้นๆ ให้ใช้ hint) */
  help?: string;
}) {
  return (
    <Tag
      data-field={field} data-invalid={error ? 'true' : undefined}
      className="block min-w-0 scroll-mt-24 space-y-1.5 [&[data-invalid=true]_input]:border-danger-500 [&[data-invalid=true]_textarea]:border-danger-500 [&[data-invalid=true]_[aria-haspopup=listbox]]:border-danger-500 [&[data-invalid=true]_[data-bank-picker]]:border-danger-500"
    >
      <span className="flex items-center gap-1 text-xs font-semibold text-ink-soft">{label}{help && <HelpTip text={help} />}</span>
      {children}
      {error ? <span role="alert" className="block text-[11px] font-semibold text-danger-700">{error}</span> : hint && <span className="block text-[11px] text-ink-mute">{hint}</span>}
    </Tag>
  );
}

const inputBase =
  'w-full min-w-0 rounded-2xl border border-ink/15 bg-surface px-4 text-sm outline-none transition placeholder:text-ink-mute/60 focus:border-brand-500';

export function Input(props: React.ComponentProps<'input'>) {
  return <input {...props} className={cn(inputBase, 'h-12', props.className)} />;
}

export function Textarea(props: React.ComponentProps<'textarea'>) {
  return <textarea {...props} className={cn(inputBase, 'py-3', props.className)} />;
}

export { Select } from '@/components/Select';

/* ── Progress bar ── */
export function Progress({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-pill bg-ink/8', className)}>
      <div
        className="h-full rounded-pill bg-brand-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

/* ── Empty / Skeleton ── */
export function Empty({ text, description, action }: { text: string; description?: string; action?: React.ReactNode }) {
  return <EmptyState card title={text} description={description} action={action} />;
}

/** กล่องโครงตอนโหลด มีแถบแสงไล่ผ่าน (shimmer) · กำหนดขนาด/ทรงด้วย className เช่น `h-4 w-40` `size-10 rounded-full` */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton rounded-xl', className)} />;
}

/** โครงข้อความหลายบรรทัด (บรรทัดสุดท้ายสั้นกว่า) */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5 rounded-md', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
