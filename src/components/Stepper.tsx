'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { Collapse } from '@/components/Accordion';

export type Step = {
  title: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  /** ขั้นนี้มีปัญหา (วงกลมเป็น ! สีแดง) */
  error?: boolean;
  /** เนื้อหาของขั้น — แสดงใต้ขั้นปัจจุบันในแนวตั้ง (ยืดออกแบบนุ่ม) */
  content?: React.ReactNode;
};

type State = 'done' | 'current' | 'upcoming' | 'error';

/**
 * Stepper: แถบบอกขั้นตอน 1 → 2 → 3 (การแสดงผลอย่างเดียว ไม่ได้คุมฟอร์มให้ — คนละอย่างกับ Wizard ของระบบอบรม)
 * - สถานะ: เสร็จแล้ว (ติ๊กวาดเส้น) · ปัจจุบัน (วงแหวนกระเพื่อมเบาๆ) · ยังไม่ถึง · มีปัญหา (`error`)
 * - เส้นเชื่อมระหว่างขั้นเติมสีไล่ตามเมื่อผ่านขั้น
 * - `orientation="horizontal"` (จอแคบซ่อนชื่อขั้นอื่น เหลือ "ขั้นที่ n จาก N" + ชื่อขั้นปัจจุบัน) · `vertical` (มี `content` ใต้ขั้นปัจจุบันได้)
 * - `onStepClick` → ขั้นที่ผ่านแล้วกดย้อนกลับได้ (ขั้นข้างหน้ากดไม่ได้ เว้นแต่ `clickable="all"`)
 * - `<ol>` + aria-current="step" · สถานะของแต่ละขั้นมีข้อความซ่อนให้ screen reader อ่าน
 */
export function Stepper({
  steps, current, orientation = 'horizontal', onStepClick, clickable = 'done', className,
}: {
  steps: Step[];
  /** ขั้นปัจจุบัน (เริ่ม 0) · เท่ากับ steps.length = เสร็จครบทุกขั้น */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (index: number) => void;
  clickable?: 'done' | 'all';
  className?: string;
}) {
  const t = useT();
  const stateOf = (i: number): State => (steps[i].error ? 'error' : i < current ? 'done' : i === current ? 'current' : 'upcoming');
  const canClick = (i: number) => !!onStepClick && i !== current && (clickable === 'all' || i < current);
  const srState: Record<State, string> = { done: t('stepper.done'), current: t('stepper.current'), upcoming: t('stepper.upcoming'), error: t('stepper.error') };
  const vertical = orientation === 'vertical';
  const curStep = steps[Math.min(current, steps.length - 1)];

  return (
    <div className={className}>
      {!vertical && (
        <p className="mb-3 text-xs font-semibold text-ink-mute sm:hidden">
          {t('stepper.progress', { n: Math.min(current + 1, steps.length), total: steps.length })}
          {current < steps.length && <span className="text-ink"> · {curStep.title}</span>}
        </p>
      )}
      <ol className={cn(vertical ? 'flex flex-col' : 'flex items-start')}>
        {steps.map((s, i) => {
          const st = stateOf(i);
          const lastStep = i === steps.length - 1;
          const filled = i < current; // เส้นต่อจากขั้นนี้เติมสีแล้ว
          const Tag = canClick(i) ? 'button' : 'div';
          const label = (
            <span className={cn('min-w-0', vertical ? 'pb-1 pt-1' : 'mt-2.5 block px-1 text-center max-sm:hidden')}>
              <span className={cn('block text-sm font-semibold leading-snug', st === 'upcoming' ? 'text-ink-mute' : st === 'error' ? 'text-danger-700' : 'text-ink')}>
                {s.title}
              </span>
              {(s.description || s.optional) && (
                <span className="mt-0.5 block text-xs text-ink-mute">
                  {s.description}{s.description && s.optional ? ' · ' : ''}{s.optional ? t('stepper.optional') : ''}
                </span>
              )}
            </span>
          );
          return (
            <li
              key={i} aria-current={st === 'current' ? 'step' : undefined}
              className={cn('relative', vertical ? 'pb-6 last:pb-0' : 'flex min-w-0 flex-1 flex-col items-center')}
            >
              {/* เส้นเชื่อมไปขั้นถัดไป: รางเทา + แถบสีที่ยืดตามเมื่อผ่านขั้น */}
              {!lastStep && (
                <span
                  aria-hidden
                  className={cn('absolute overflow-hidden rounded-pill bg-ink/10', vertical ? 'bottom-1 left-[15px] top-10 w-0.5' : 'left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[15px] h-0.5')}
                >
                  <span className={cn('step-fill block size-full bg-brand-500', vertical ? 'origin-top' : 'origin-left')} data-filled={filled || undefined} data-axis={vertical ? 'y' : 'x'} />
                </span>
              )}
              <Tag
                {...(Tag === 'button' ? { type: 'button' as const, onClick: () => onStepClick?.(i) } : {})}
                className={cn(
                  'group/step relative flex shrink-0 outline-none',
                  vertical ? 'items-start gap-3.5 text-left' : 'flex-col items-center',
                  Tag === 'button' && 'cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-brand-500/50',
                )}
              >
                <span
                  data-state={st}
                  className={cn(
                    'step-dot relative z-[1] grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums transition-[background-color,border-color,color,box-shadow] duration-300',
                    st === 'done' && 'bg-brand-600 text-white',
                    st === 'current' && 'border-2 border-brand-600 bg-surface text-brand-link',
                    st === 'upcoming' && 'border-2 border-ink/15 bg-surface text-ink-mute',
                    st === 'error' && 'bg-danger-600 text-white',
                    Tag === 'button' && 'group-hover/step:shadow-[0_0_0_4px_rgb(var(--brand-500)/0.15)]',
                  )}
                >
                  {st === 'done' ? (
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path className="step-check" d="M3.5 8.5l3 3 6-7" pathLength={1} />
                    </svg>
                  ) : st === 'error' ? <AlertTriangle size={14} strokeWidth={2.6} /> : i + 1}
                </span>
                {vertical ? label : null}
                <span className="sr-only">({srState[st]})</span>
              </Tag>
              {!vertical && label}
              {vertical && s.content != null && (
                <Collapse open={st === 'current' || (st === 'error' && i === current)}>
                  <div className="pb-1 pl-[46px] pt-3">{s.content}</div>
                </Collapse>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
