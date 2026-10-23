'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * Checkbox · Radio/RadioGroup · Switch
 * ใช้ <input> จริงซ่อนไว้ใต้หน้าตาที่วาดเอง → ส่งค่าในฟอร์มได้ (name/value) · คีย์บอร์ด/screen reader ทำงานแบบ native
 * (Space ติ๊ก · ลูกศรเลื่อนในกลุ่ม radio) · สถานะต่างๆ วาดด้วย CSS peer ไม่ต้องมี state ซ้ำใน React
 */

type Size = 'sm' | 'md';

type ChoiceBase = Omit<React.ComponentProps<'input'>, 'type' | 'size'> & {
  label?: React.ReactNode;
  /** บรรทัดคำอธิบายใต้ชื่อ */
  description?: React.ReactNode;
  size?: Size;
};

/** ชื่อ + คำอธิบาย ข้างตัวเลือก */
function Text({ label, description, size }: { label?: React.ReactNode; description?: React.ReactNode; size: Size }) {
  if (!label && !description) return null;
  return (
    <span className="min-w-0">
      {label && <span className={cn('block font-medium text-ink', size === 'sm' ? 'text-xs' : 'text-sm')}>{label}</span>}
      {description && <span className={cn('block text-ink-mute', size === 'sm' ? 'text-[11px]' : 'text-xs')}>{description}</span>}
    </span>
  );
}

// input จริง: โปร่งใสทับเต็มพื้นที่หน้าตา (คลิกตรงไหนก็โดน · โฟกัสได้ · ตำแหน่ง screen reader ตรงกับที่เห็น)
const NATIVE = 'peer absolute inset-0 m-0 size-full cursor-[inherit] appearance-none opacity-0';
const FOCUS = 'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface';

/* ── Checkbox ── */
export type CheckboxProps = ChoiceBase & {
  /** สถานะ "เลือกบางส่วน" (ขีดกลาง) เช่น ช่อง "เลือกทั้งหมด" เมื่อเลือกไว้แค่บางแถว · กดแล้วเบราว์เซอร์ล้างสถานะนี้เองและส่ง onChange ตามปกติ */
  indeterminate?: boolean;
};

/**
 * Checkbox: เครื่องหมายถูกวาดเส้นตอนติ๊ก · กดแล้วยุบนิดหน่อย · `indeterminate` เป็นขีดกลาง (aria-checked="mixed")
 * ใช้แบบ controlled (`checked` + `onChange`) หรือ uncontrolled (`defaultChecked`) ได้เหมือน input ปกติ
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, size = 'md', className, disabled, ...props }, forwarded,
) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwarded, () => ref.current!);
  // indeterminate ตั้งผ่าน attribute ไม่ได้ ต้องตั้งที่ DOM property
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  const box = size === 'sm' ? 'size-4 rounded-[5px]' : 'size-5 rounded-md';
  return (
    <label className={cn('choice inline-flex items-start gap-2.5', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}>
      <span className={cn('relative grid shrink-0 place-items-center', size === 'sm' ? 'mt-px' : 'mt-0.5', box)}>
        <input
          ref={ref} type="checkbox" disabled={disabled} aria-checked={indeterminate ? 'mixed' : undefined} className={NATIVE} {...props}
        />
        <span
          aria-hidden
          className={cn(
            'cb-box grid size-full place-items-center border-2 border-ink/25 bg-surface text-white transition-[background-color,border-color,transform] duration-200',
            'peer-hover:border-brand-500 peer-active:scale-90',
            'peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-indeterminate:border-brand-600 peer-indeterminate:bg-brand-600',
            FOCUS, box,
          )}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="col-start-1 row-start-1 size-[85%]">
            <path className="cb-check" d="M3.5 8.5l3 3 6-7" pathLength={1} />
            <path className="cb-dash" d="M4 8h8" />
          </svg>
        </span>
      </span>
      <Text label={label} description={description} size={size} />
    </label>
  );
});

/* ── Radio ── */
export type RadioProps = ChoiceBase;

/** วงกลม radio + input จริง (ไม่มี label ครอบ — ให้ผู้ใช้ครอบเอง) */
const RadioMark = React.forwardRef<HTMLInputElement, Omit<RadioProps, 'label' | 'description'>>(function RadioMark(
  { size = 'md', className, ...props }, ref,
) {
  return (
    <span className={cn('relative grid shrink-0 place-items-center', size === 'sm' ? 'mt-px size-4' : 'mt-0.5 size-5', className)}>
      <input ref={ref} type="radio" className={NATIVE} {...props} />
      <span
        aria-hidden
        className={cn(
          'radio-dot grid size-full place-items-center rounded-full border-2 border-ink/25 bg-surface transition-[border-color,transform] duration-200',
          'peer-hover:border-brand-500 peer-active:scale-90 peer-checked:border-brand-600',
          FOCUS,
        )}
      >
        <span className="size-1/2 rounded-full bg-brand-600" />
      </span>
    </span>
  );
});

/** Radio เดี่ยว (ปกติใช้ผ่าน RadioGroup) · จุดกลางขยายออกแบบสปริงตอนเลือก */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, size = 'md', className, disabled, ...props }, ref,
) {
  return (
    <label className={cn('choice inline-flex items-start gap-2.5', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}>
      <RadioMark ref={ref} size={size} disabled={disabled} {...props} />
      <Text label={label} description={description} size={size} />
    </label>
  );
});

export type RadioOption = { value: string; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean; icon?: React.ReactNode };

/**
 * RadioGroup: เลือกหนึ่งจากหลายตัวเลือก
 * - `variant="list"` วงกลมเรียงกัน · `variant="card"` เป็นการ์ดทั้งใบกดได้ ใบที่เลือกขอบ/พื้นเป็นสีแบรนด์ (เหมาะกับแพ็กเกจ วิธีจัดส่ง)
 * - คีย์บอร์ดแบบ native: Tab เข้ากลุ่มครั้งเดียว ลูกศรเลื่อน/เลือก
 */
export function RadioGroup({
  options, value, onChange, name, label, variant = 'list', orientation = 'vertical', size = 'md', disabled, className,
}: {
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** ชื่อฟิลด์ตอนส่งฟอร์ม (ไม่ระบุ = สร้างให้) */
  name?: string;
  /** ชื่อกลุ่มสำหรับ screen reader (ถ้าไม่ได้ครอบด้วย Field) */
  label?: string;
  variant?: 'list' | 'card';
  orientation?: 'vertical' | 'horizontal';
  size?: Size;
  disabled?: boolean;
  className?: string;
}) {
  const auto = React.useId();
  const group = name ?? auto;
  return (
    <div
      role="radiogroup" aria-label={label} aria-disabled={disabled || undefined}
      className={cn(
        variant === 'card'
          ? cn('grid gap-2.5', orientation === 'horizontal' ? 'sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]' : '')
          : cn('flex', orientation === 'horizontal' ? 'flex-wrap gap-x-6 gap-y-2' : 'flex-col gap-3'),
        className,
      )}
    >
      {options.map((o) => {
        const off = disabled || o.disabled;
        const input = { name: group, value: o.value, checked: value === o.value, disabled: off, size, onChange: () => onChange(o.value) };
        if (variant !== 'card') return <Radio key={o.value} {...input} label={o.label} description={o.description} />;
        // การ์ด: label ครอบทั้งใบ → คลิกตรงไหนก็เลือก · has-[:checked] วาดกรอบใบที่เลือก
        return (
          <label
            key={o.value}
            className={cn(
              'relative flex items-start gap-3 rounded-2xl border border-ink/15 bg-surface p-3.5 transition',
              'has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:shadow-[0_0_0_1px_rgb(var(--brand-500))]',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/40',
              off ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-brand-500/60',
            )}
          >
            {o.icon && <span className="mt-0.5 shrink-0 text-brand-link">{o.icon}</span>}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{o.label}</span>
              {o.description && <span className="mt-0.5 block text-xs text-ink-mute">{o.description}</span>}
            </span>
            <RadioMark {...input} />
          </label>
        );
      })}
    </div>
  );
}

/* ── Switch ── */
export type SwitchProps = ChoiceBase & {
  /** `start` = ชื่ออยู่ซ้าย สวิตช์ชิดขวา (แถวตั้งค่า ใส่ `className="w-full"` ร่วมด้วย) */
  placement?: 'start' | 'end';
};

/**
 * Switch: เปิด/ปิดค่าที่มีผลทันที (ตั้งค่า แจ้งเตือน) — ถ้าต้องกด "บันทึก" ก่อนถึงมีผล ใช้ Checkbox แทน
 * - input checkbox ที่มี role="switch" → screen reader อ่านว่า "สวิตช์ เปิด/ปิด" · Space สลับ
 * - ปุ่มกลมเลื่อนแบบเด้งนิดๆ และยืดออกตอนกดค้าง
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, size = 'md', placement = 'end', className, disabled, ...props }, ref,
) {
  const md = size === 'md';
  return (
    <label
      className={cn(
        'choice inline-flex items-start gap-3',
        placement === 'start' && 'flex-row-reverse justify-between',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <span
        className={cn('relative shrink-0', md ? 'h-6 w-11' : '-mt-px h-5 w-9')}
        style={{ ['--sw-thumb' as string]: md ? '20px' : '16px', ['--sw-travel' as string]: md ? '20px' : '16px' }}
      >
        <input ref={ref} type="checkbox" role="switch" disabled={disabled} className={NATIVE} {...props} />
        <span
          aria-hidden
          className={cn(
            'switch-track block size-full rounded-pill bg-ink/20 transition-colors duration-200 peer-hover:bg-ink/30 peer-checked:bg-brand-600 peer-checked:peer-hover:bg-brand-700',
            FOCUS,
          )}
        />
        <span aria-hidden className={cn('switch-thumb pointer-events-none absolute left-0.5 top-0.5 rounded-pill bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)]', md ? 'h-5' : 'h-4')} />
      </span>
      <Text label={label} description={description} size={size} />
    </label>
  );
});
