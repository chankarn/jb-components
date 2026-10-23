'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { formatNumber, normalize, parseNumber, stepValue } from '@/lib/number-input';
import { shake } from '@/lib/motion-fx';

type Variant = 'field' | 'compact';
const BOX: Record<Variant, { box: string; btn: string; icon: number }> = {
  field: { box: 'h-12 rounded-2xl text-sm', btn: 'w-11', icon: 16 },
  compact: { box: 'h-9 rounded-lg text-xs', btn: 'w-8', icon: 14 },
};

export type NumberInputProps = {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  /** ขั้นของปุ่ม +/− และลูกศร (Shift = ×10) */
  step?: number;
  /** ทศนิยมตายตัว เช่น 2 สำหรับเงิน (ไม่ระบุ = ตามที่พิมพ์) */
  precision?: number;
  /** ข้อความหน้า/หลังตัวเลข เช่น "฿" หรือ "ชิ้น" */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** ซ่อนปุ่ม +/− (เหลือช่องตัวเลขที่มี comma ให้) */
  hideButtons?: boolean;
  variant?: Variant;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
};

/**
 * NumberInput: ช่องตัวเลขที่ใส่ comma ให้เอง · ปุ่ม +/− (กดค้างแล้ววิ่งเร็วขึ้นเรื่อยๆ) · จำกัด min/max
 * - พิมพ์ได้อิสระระหว่างโฟกัส (รับ comma, เลขไทย) · ออกจากช่องแล้วจัดรูปแบบ ปัดทศนิยม และบีบให้อยู่ในช่วง
 * - ลบจนว่างได้ (ค่าเป็น null ไม่กลายเป็น 0) · ↑↓ ทีละ step · Shift+↑↓ ทีละ 10 step · PageUp/Down · Home/End (เมื่อมี min/max)
 * - ใช้ type="text" + inputMode → มือถือขึ้นแป้นตัวเลข แต่ไม่มีปัญหาแบบ type="number" (ล้อเมาส์เปลี่ยนค่า, comma ไม่ได้, "e" พิมพ์ได้)
 * - role="spinbutton" พร้อม aria-valuemin/max/now
 */
export function NumberInput({
  value, onChange, min, max, step = 1, precision, prefix, suffix, hideButtons, variant = 'field',
  placeholder, disabled, name, id, className, 'aria-label': ariaLabel,
}: NumberInputProps) {
  const t = useT();
  const v = BOX[variant];
  const input = React.useRef<HTMLInputElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const [draft, setDraft] = React.useState<string | null>(null); // ข้อความระหว่างพิมพ์ (null = แสดงค่าที่จัดรูปแบบแล้ว)
  const opts = { min, max, precision };
  const allowNegative = min == null || min < 0;
  const decimal = precision == null || precision > 0;

  const shown = draft ?? formatNumber(value, precision);
  const atMin = value != null && min != null && value <= min;
  const atMax = value != null && max != null && value >= max;

  function commit(text: string) {
    const n = parseNumber(text);
    const next = n == null ? null : normalize(n, opts);
    // พิมพ์เกินช่วงแล้วถูกบีบกลับ → สั่นบอกว่าค่าที่พิมพ์ใช้ไม่ได้ (ตัวเลขที่เห็นเปลี่ยนเป็นค่าขอบ)
    if (n != null && next != null && Math.abs(next - n) > 1e-9 && (next === min || next === max)) shake(box.current);
    if (next !== value) onChange(next);
    setDraft(null);
  }

  // ปุ่มกดค้าง: ขยับหนึ่งครั้งทันที → รอ 400ms → วิ่งต่อ เร่งความเร็วขึ้นเรื่อยๆ (ต่ำสุด 40ms)
  const hold = React.useRef<{ timer?: ReturnType<typeof setTimeout> }>({});
  function bump(dir: 1 | -1, current: number | null) {
    const next = stepValue(current, dir, step, opts);
    if (next !== current) onChange(next);
    else if (current != null) shake(box.current); // ชนขอบ min/max
    return next;
  }
  function startHold(dir: 1 | -1) {
    stopHold();
    const base = draft != null ? (parseNumber(draft) ?? value) : value;
    setDraft(null);
    let current = bump(dir, base);
    let delay = 400;
    const tick = () => {
      const next = bump(dir, current);
      if (next === current) return stopHold(); // ชนขอบแล้ว
      current = next;
      delay = Math.max(40, delay * 0.8);
      hold.current.timer = setTimeout(tick, delay);
    };
    hold.current.timer = setTimeout(tick, delay);
  }
  function stopHold() {
    if (hold.current.timer) clearTimeout(hold.current.timer);
    hold.current.timer = undefined;
  }
  React.useEffect(() => stopHold, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const base = draft != null ? (parseNumber(draft) ?? value) : value;
    const big = step * 10;
    let next: number | null | undefined;
    if (e.key === 'ArrowUp') next = stepValue(base, 1, e.shiftKey ? big : step, opts);
    else if (e.key === 'ArrowDown') next = stepValue(base, -1, e.shiftKey ? big : step, opts);
    else if (e.key === 'PageUp') next = stepValue(base, 1, big, opts);
    else if (e.key === 'PageDown') next = stepValue(base, -1, big, opts);
    else if (e.key === 'Home' && min != null) next = min;
    else if (e.key === 'End' && max != null) next = max;
    else if (e.key === 'Enter') { commit(e.currentTarget.value); return; }
    else if (e.key === 'Escape' && draft != null) { e.preventDefault(); e.stopPropagation(); setDraft(null); return; }
    if (next === undefined) return;
    e.preventDefault();
    if (next === base && base != null && (e.key.startsWith('Arrow') || e.key.startsWith('Page'))) shake(box.current);
    setDraft(null);
    if (next !== value) onChange(next);
  }

  const btn = cn(
    'flex shrink-0 items-center justify-center self-stretch text-ink-mute outline-none transition',
    'hover:bg-brand-50 hover:text-brand-link active:scale-90 disabled:pointer-events-none disabled:opacity-30',
    'focus-visible:bg-brand-50 focus-visible:text-brand-link', v.btn,
  );
  // ปุ่ม +/− ไม่รับ Tab (คีย์บอร์ดใช้ ↑↓ ในช่องแทน) · กดแล้วโฟกัสช่องไว้ ออกจากช่องทีหลังค่อยจัดรูปแบบ
  const holdHandlers = (dir: 1 | -1) => ({
    onPointerDown: (e: React.PointerEvent) => { if (e.button !== 0) return; e.preventDefault(); input.current?.focus({ preventScroll: true }); startHold(dir); },
    onPointerUp: stopHold, onPointerLeave: stopHold, onPointerCancel: stopHold,
  });

  return (
    <div
      ref={box} data-number-input
      className={cn(
        'flex w-full min-w-0 items-stretch overflow-hidden border border-ink/15 bg-surface transition focus-within:border-brand-500 focus-within:shadow-glow',
        v.box, disabled && 'pointer-events-none opacity-50', className,
      )}
    >
      {!hideButtons && (
        <button type="button" tabIndex={-1} aria-label={t('number.dec')} disabled={disabled || atMin} className={cn(btn, 'border-r border-ink/10')} {...holdHandlers(-1)}>
          <Minus size={v.icon} />
        </button>
      )}
      <div className={cn('flex min-w-0 flex-1 items-center gap-1.5', hideButtons ? 'px-4' : 'px-3')}>
        {prefix != null && <span className="shrink-0 text-ink-mute">{prefix}</span>}
        <input
          ref={input} id={id} name={name} type="text" inputMode={decimal ? 'decimal' : 'numeric'} autoComplete="off"
          role="spinbutton" aria-label={ariaLabel} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value ?? undefined}
          aria-valuetext={value == null ? undefined : formatNumber(value, precision)}
          value={shown} placeholder={placeholder} disabled={disabled}
          onChange={(e) => {
            // กรองตัวอักษรที่ไม่ใช่ตัวเลขทิ้งตั้งแต่พิมพ์ (ยังพิมพ์ comma/จุด/ลบ ได้)
            const text = e.target.value.replace(allowNegative ? /[^\d๐-๙.,\-−\s]/g : /[^\d๐-๙.,\s]/g, '');
            setDraft(decimal ? text : text.replace(/\./g, ''));
          }}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={onKeyDown}
          className={cn('h-full min-w-0 flex-1 border-0 bg-transparent tabular-nums outline-none placeholder:text-ink-mute/60', hideButtons ? 'text-left' : 'text-center')}
        />
        {suffix != null && <span className="shrink-0 text-ink-mute">{suffix}</span>}
      </div>
      {!hideButtons && (
        <button type="button" tabIndex={-1} aria-label={t('number.inc')} disabled={disabled || atMax} className={cn(btn, 'border-l border-ink/10')} {...holdHandlers(1)}>
          <Plus size={v.icon} />
        </button>
      )}
    </div>
  );
}
