'use client';

import { useState } from 'react';
import { Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import type { Translate } from '@/lib/i18n';

/** ช่องรหัสผ่าน: ไอคอนกุญแจซ้าย ปุ่มแสดง/ซ่อนขวา (ใช้แบบเดียวกับหน้า login แอดมิน) */
export function PasswordInput({ value, onChange, autoComplete, autoFocus }: { value: string; onChange: (v: string) => void; autoComplete: string; autoFocus?: boolean }) {
  const t = useT();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <KeyRound size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
      <Input className="pl-11 pr-12" type={show ? 'text' : 'password'} autoComplete={autoComplete} autoFocus={autoFocus} required value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t('admin.pw.hide') : t('admin.pw.show')} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-mute hover:bg-ink/5">
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

/** เงื่อนไขรหัสผ่านใหม่ติ๊กเขียวทีละข้อตามที่พิมพ์ (กติกาเดียวกับ server: ≥ 10 ตัว มีตัวอักษรและตัวเลข) */
export function passwordChecks(next: string, again: string, t: Translate) {
  return [
    { ok: next.length >= 10, label: t('admin.pw.rule_len') },
    { ok: /[A-Za-z\u0E00-\u0E7F]/.test(next), label: t('admin.pw.rule_letter') },
    { ok: /\d/.test(next), label: t('admin.pw.rule_digit') },
    { ok: next.length > 0 && next === again, label: t('admin.pw.rule_match') },
  ];
}

export function PasswordRules({ next, again }: { next: string; again: string }) {
  const t = useT();
  const checks = passwordChecks(next, again, t);
  return (
    <ul className="grid gap-2.5 rounded-2xl bg-ink/[.04] p-4 text-sm">
      {checks.map((c) => (
        <li key={c.label} className={cn('flex items-center gap-2 transition', c.ok ? 'font-semibold text-ok-700' : 'text-ink-mute')}>
          <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition', c.ok ? 'bg-ok-500 text-white' : 'bg-ink/10')}>
            {c.ok && <Check size={12} strokeWidth={3} />}
          </span>
          {c.label}
        </li>
      ))}
    </ul>
  );
}
