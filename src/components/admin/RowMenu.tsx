'use client';

import { MoreHorizontal } from 'lucide-react';
import { useT } from '@/lib/i18n/client';
import { DropdownMenu, type MenuEntry } from '@/components/DropdownMenu';

export type RowMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  hidden?: boolean;
};

/**
 * เมนู "…" ท้ายแถวตาราง รวม action หลายอันไว้ที่เดียว
 * ใช้ DropdownMenu กลาง: ตามปุ่มตอนเลื่อนหน้า (เดิมปิดทิ้ง) · คีย์บอร์ด ↑↓/พิมพ์ตัวอักษร/Esc · รายการอันตรายมีเส้นคั่นก่อน
 * คลิกในเมนูไม่ลามไปเป็นคลิกแถว (แถวที่กดเปิดรายละเอียดได้)
 */
export function RowMenu({ items, label }: { items: RowMenuItem[]; label?: string }) {
  const t = useT();
  const visible = items.filter((i) => !i.hidden);
  if (!visible.length) return null;
  const entries: MenuEntry[] = visible.flatMap((i, n): MenuEntry[] => {
    const item: MenuEntry = { label: i.label, icon: i.icon, href: i.href, danger: i.danger, onSelect: i.onClick };
    return i.danger && n > 0 && !visible[n - 1].danger ? [{ type: 'separator' }, item] : [item];
  });
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu
        align="end" label={label ?? t('admin.menu.actions')} items={entries}
        trigger={
          <button
            type="button" aria-label={label ?? t('admin.menu.actions')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mute transition hover:bg-ink/8 hover:text-ink aria-expanded:bg-ink/8 aria-expanded:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
          >
            <MoreHorizontal size={18} />
          </button>
        }
      />
    </div>
  );
}
