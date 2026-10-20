'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * สวิตช์แคปซูลสองฝั่ง — ใช้ร่วมกันทั้งปุ่มเปลี่ยนภาษาและเปลี่ยนธีม ให้หน้าตาเป็นชุดเดียวกัน
 * (รูปแบบเดียวกับ jb-protfolio): ตัวเลือกที่ไม่ได้ใช้อยู่จางๆ ในราง ปุ่มกลมเลื่อนไปอยู่ฝั่งที่เลือกและแสดงตัวเลือกปัจจุบัน
 */
export function PillSwitch({
  options,
  index,
  onChange,
  label,
  className,
}: {
  options: [ReactNode, ReactNode];
  index: 0 | 1;
  onChange: (next: 0 | 1) => void;
  label: string;
  className?: string;
}) {
  // ไม่เล่นอนิเมชันตอนโหลดหน้า (ค่าที่จำไว้ถูกอ่านหลัง mount ปุ่มจะได้ไม่เลื่อนให้เห็น)
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={index === 1}
      aria-label={label}
      title={label}
      onClick={() => onChange(index === 0 ? 1 : 0)}
      className={cn(
        'relative flex h-8 w-16 shrink-0 items-center rounded-full border border-ink/15 bg-surface p-1 text-[10px] font-bold text-ink-mute',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <span className={cn('transition-opacity', index === 0 ? 'opacity-0' : 'opacity-100')}>{options[0]}</span>
        <span className={cn('transition-opacity', index === 1 ? 'opacity-0' : 'opacity-100')}>{options[1]}</span>
      </span>
      <span
        className={cn(
          'relative flex size-6 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm',
          animate && 'transition-transform duration-300',
          index === 1 ? 'translate-x-8' : 'translate-x-0',
        )}
      >
        {options[index]}
      </span>
    </button>
  );
}
