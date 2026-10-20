'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * OTP 6 ช่อง (FR-L-02): เลื่อนช่องอัตโนมัติ · วางรหัส 6 หลักทีเดียว · Backspace ย้อนช่อง · กรอกครบแล้วเรียก onComplete เอง
 * `value` เป็นสตริงตัวเลขยาวไม่เกิน length — คอมโพเนนต์นี้ไม่เก็บ state เอง
 */
export function OtpInput({
  value, onChange, onComplete, length = 6, disabled, invalid, autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[Math.min(value.length, length - 1)]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus, value === '']);

  const set = (next: string) => {
    const v = next.replace(/\D/g, '').slice(0, length);
    onChange(v);
    if (v.length === length) onComplete?.(v);
    refs.current[Math.min(v.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="OTP">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ''}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length} // เผื่อวางทีเดียว/คีย์บอร์ด SMS autofill ใส่ทั้งชุดในช่องเดียว
          aria-label={`${i + 1}/${length}`}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, '');
            if (!typed) return set(value.slice(0, i) + value.slice(i + 1));
            // พิมพ์ทับช่องที่มีค่าอยู่แล้ว: เอาตัวท้ายสุดที่เพิ่งพิมพ์ · วาง/autofill หลายตัว: เริ่มตั้งแต่ช่องนี้
            const chunk = typed.length > 1 ? typed : typed.slice(-1);
            set(value.slice(0, i) + chunk + value.slice(i + 1));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              e.preventDefault();
              set(value.slice(0, i - 1));
            }
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-12 w-10 rounded-xl border bg-surface text-center text-xl font-bold outline-none transition sm:w-11',
            invalid ? 'border-danger-500' : 'border-ink/15 focus:border-brand-500',
          )}
        />
      ))}
    </div>
  );
}
