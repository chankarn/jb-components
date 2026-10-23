'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { DropdownMenu } from '@/components/DropdownMenu';

export type Crumb = { label: string; href?: string; icon?: React.ReactNode };

/**
 * Breadcrumb: เส้นทางนำทางบอกว่าอยู่หน้าไหนในโครงสร้าง
 * - รายการสุดท้าย = หน้าปัจจุบัน (aria-current="page" · ไม่เป็นลิงก์)
 * - ยาวเกิน `maxItems` → ยุบตรงกลางเป็นปุ่ม "…" กดแล้วเป็นเมนูของหน้าที่ซ่อน (เก็บตัวแรก + ท้ายๆ ไว้)
 * - จอแคบ (`mobileCollapse`): เหลือ "… › หน้าแม่ › หน้าปัจจุบัน" (หน้าที่เหลืออยู่ในเมนู …) · ชื่อยาวตัดด้วย … ชี้ดูชื่อเต็มได้
 * - `<nav aria-label>` + `<ol>` ตามแนวทาง ARIA breadcrumb · ตัวคั่นซ่อนจาก screen reader
 */
export function Breadcrumb({
  items, maxItems = 4, separator = 'chevron', mobileCollapse = true, className,
}: {
  items: Crumb[];
  maxItems?: number;
  separator?: 'chevron' | 'slash';
  mobileCollapse?: boolean;
  className?: string;
}) {
  const t = useT();
  const n = items.length;

  // จอกว้าง: ตัวแรก + "…" + ท้าย (maxItems - 2) ตัว
  const collapse = n > maxItems && maxItems >= 3;
  const keepTail = maxItems - 2;
  const wide: Entry[] = collapse
    ? [{ crumb: items[0] }, { more: items.slice(1, n - keepTail) }, ...items.slice(n - keepTail).map((crumb) => ({ crumb }))]
    : items.map((crumb) => ({ crumb }));
  // จอแคบ: "…" (ทุกหน้าก่อนหน้าแม่) + หน้าแม่ + หน้าปัจจุบัน
  const narrow: Entry[] = n > 2 ? [{ more: items.slice(0, n - 2) }, { crumb: items[n - 2] }, { crumb: items[n - 1] }] : wide;

  return (
    <nav aria-label={t('breadcrumb.label')} className={cn('min-w-0', className)}>
      <Trail entries={wide} separator={separator} className={mobileCollapse && n > 2 ? 'max-sm:hidden' : undefined} />
      {mobileCollapse && n > 2 && <Trail entries={narrow} separator={separator} compact className="sm:hidden" />}
    </nav>
  );
}

type Entry = { crumb: Crumb } | { more: Crumb[] };

function Trail({ entries, separator, compact, className }: { entries: Entry[]; separator: 'chevron' | 'slash'; compact?: boolean; className?: string }) {
  const t = useT();
  return (
    <ol className={cn('flex min-w-0 items-center text-sm', className)}>
      {entries.map((e, i) => {
        const last = i === entries.length - 1;
        return (
          <li
            key={i}
            className={cn(
              'flex min-w-0 items-center',
              // หน้าปัจจุบันได้ที่ก่อน · ลิงก์ก่อนหน้ายอมหดก่อน (จอแคบให้หน้าแม่กว้างได้ราว 40%)
              last ? 'flex-1' : 'more' in e ? 'shrink-0' : compact ? 'max-w-[40%] shrink-0' : 'shrink-[2]',
            )}
          >
            {i > 0 && (
              <span aria-hidden className="mx-1.5 flex shrink-0 text-ink-mute/60">
                {separator === 'chevron' ? <ChevronRight size={14} /> : <span className="text-sm">/</span>}
              </span>
            )}
            {'more' in e ? (
              <DropdownMenu
                label={t('breadcrumb.more')}
                items={e.more.map((h) => ({ label: h.label, href: h.href, icon: h.icon }))}
                trigger={
                  <button type="button" aria-label={t('breadcrumb.more')} className="grid h-7 w-8 place-items-center rounded-lg text-ink-mute transition hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50">
                    <MoreHorizontal size={16} />
                  </button>
                }
              />
            ) : last ? (
              <span aria-current="page" title={e.crumb.label} className="flex min-w-0 items-center gap-1.5 font-semibold text-ink">
                {e.crumb.icon && <span className="flex shrink-0">{e.crumb.icon}</span>}
                <span className="truncate">{e.crumb.label}</span>
              </span>
            ) : (
              <CrumbLink crumb={e.crumb} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CrumbLink({ crumb }: { crumb: Crumb }) {
  const cls = 'group flex min-w-0 items-center gap-1.5 rounded-md text-ink-mute transition-colors hover:text-brand-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50';
  const inner = (
    <>
      {crumb.icon && <span className="flex shrink-0">{crumb.icon}</span>}
      <span className="max-w-[14rem] truncate underline-offset-4 group-hover:underline">{crumb.label}</span>
    </>
  );
  return crumb.href
    ? <Link href={crumb.href} title={crumb.label} className={cls}>{inner}</Link>
    : <span title={crumb.label} className={cls}>{inner}</span>;
}
