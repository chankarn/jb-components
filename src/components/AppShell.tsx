'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ChevronsLeft, LogOut, Menu, Search, Settings, User } from 'lucide-react';
import { Kbd, useAriaShortcut, useShortcutLabel } from '@/components/Kbd';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';
import { Tooltip } from '@/components/Tooltip';
import { DropdownMenu } from '@/components/DropdownMenu';
import { Drawer } from '@/components/Overlay';
import { ThemeToggle } from '@/components/ThemeProvider';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** ตัวเลข/ป้ายท้ายเมนู เช่น จำนวนงานค้าง */
  badge?: string | number;
  /** `exact` = ตรงทั้ง path เท่านั้น (เช่น หน้าแรก) · ค่าตั้งต้น = path นี้และหน้าย่อย */
  match?: 'exact' | 'prefix';
};
export type NavGroup = { label?: string; items: NavItem[] };
export type ShellUser = { name: string; email?: string; role?: string; seed?: number };

const COLLAPSE_KEY = 'jb-shell-collapsed';

const isActive = (path: string, item: NavItem) =>
  item.match === 'exact' ? path === item.href : path === item.href || path.startsWith(`${item.href}/`);

/**
 * AppShell: โครงหน้าหลังบ้าน — sidebar + topbar + พื้นที่เนื้อหา
 * - sidebar พับเป็นแถบไอคอนได้ (จำไว้ในเครื่อง) · ตอนพับ ชี้ไอคอนแล้วขึ้นชื่อเมนู · เมนูที่อยู่มีแถบไฮไลต์เลื่อนตาม
 * - จอแคบ (< 1024px): sidebar ซ่อน กดปุ่ม ☰ แล้วเลื่อนออกมาจากซ้าย (ปัดกลับเพื่อปิด · เลือกเมนูแล้วปิดเอง)
 * - topbar ติดด้านบน พื้นเบลอ มีเส้นใต้ตอนเลื่อนหน้า · ปุ่มค้นหา ⌘K (`onCommand` — เปิด CommandPalette) · ช่องปุ่มเพิ่มเติม (`actions`) · สลับธีม · เมนูผู้ใช้
 * - ลิงก์ "ข้ามไปเนื้อหา" สำหรับคีย์บอร์ด · เปลี่ยนหน้าแล้วเนื้อหาจางเข้านุ่มๆ
 */
export function AppShell({
  brand, nav, user, onSignOut, onCommand, commandLabel = 'ค้นหา…', actions, userMenu, children,
}: {
  brand: { name: string; mark?: React.ReactNode; href?: string };
  nav: NavGroup[];
  user: ShellUser;
  onSignOut?: () => void;
  /** มีค่า = แสดงปุ่มค้นหา "⌘K" ใน topbar (ให้เปิด CommandPalette · ผูกปุ่มลัดเองด้วย useCommandHotkey) */
  onCommand?: () => void;
  commandLabel?: string;
  /** ปุ่มเพิ่มเติมใน topbar ก่อนปุ่มธีม เช่น การแจ้งเตือน */
  actions?: React.ReactNode;
  /** รายการเพิ่มในเมนูผู้ใช้ (ก่อน "ออกจากระบบ") */
  userMenu?: { label: string; icon?: React.ReactNode; href?: string; onSelect?: () => void }[];
  children: React.ReactNode;
}) {
  const path = usePathname() ?? '';
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const cmdKeys = useShortcutLabel('mod+K');
  const cmdAria = useAriaShortcut('mod+K');

  React.useEffect(() => {
    try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1'); } catch { /* ignore */ }
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  React.useEffect(() => { setMobileOpen(false); }, [path]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1'); } catch { /* ignore */ }
      return !c;
    });
  }

  const menuEntries = [
    { type: 'label' as const, label: user.email ?? user.name },
    ...(userMenu ?? [{ label: 'โปรไฟล์', icon: <User size={15} /> }, { label: 'ตั้งค่า', icon: <Settings size={15} /> }]),
    ...(onSignOut ? [{ type: 'separator' as const }, { label: 'ออกจากระบบ', icon: <LogOut size={15} />, onSelect: onSignOut, danger: true }] : []),
  ];

  return (
    // --shell-w = ความกว้าง sidebar ตอนนี้ (ให้แถบที่ fixed อยู่ในหน้า เช่น แถบบันทึก จัดตำแหน่งตามได้: lg:pl-[var(--shell-w)])
    <div className="min-h-dvh bg-paper" style={{ ['--shell-w' as string]: collapsed ? '76px' : '256px' }}>
      <a href="#main" className="sr-only z-[100] rounded-lg bg-surface px-4 py-2 text-sm font-semibold shadow-lift focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        ข้ามไปเนื้อหา
      </a>

      {/* sidebar จอกว้าง */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-ink/[0.06] bg-surface transition-[width] duration-300 ease-out lg:flex',
          collapsed ? 'w-[76px]' : 'w-64',
        )}
      >
        <SidebarBody brand={brand} nav={nav} path={path} collapsed={collapsed} user={user} />
        <button
          type="button" onClick={toggleCollapsed} aria-label={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'} aria-expanded={!collapsed}
          className="absolute -right-3 top-[4.5rem] grid size-6 place-items-center rounded-full border border-ink/10 bg-surface text-ink-mute shadow-card transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          <ChevronsLeft size={14} className={cn('transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* sidebar จอแคบ */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" size="sm" title={brand.name}>
        <SidebarNav nav={nav} path={path} collapsed={false} idPrefix="m" />
      </Drawer>

      <div className={cn('transition-[padding] duration-300 ease-out', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header
          className={cn(
            'sticky top-0 z-30 flex h-16 items-center gap-2 bg-paper/80 px-4 backdrop-blur-md transition-shadow sm:gap-3 sm:px-6 lg:px-8',
            scrolled && 'shadow-[0_1px_0_rgb(var(--ink)/0.07),0_8px_24px_-16px_rgb(0_0_0/0.25)]',
          )}
        >
          <button
            type="button" onClick={() => setMobileOpen(true)} aria-label="เปิดเมนู"
            className="grid size-10 place-items-center rounded-xl text-ink-soft transition hover:bg-ink/[0.06] lg:hidden"
          >
            <Menu size={20} />
          </button>
          {onCommand && (
            <>
              <button
                type="button" onClick={onCommand} aria-label={`${commandLabel} (${cmdKeys})`} aria-keyshortcuts={cmdAria}
                className="group hidden h-9 w-64 items-center gap-2.5 rounded-pill border border-ink/10 bg-surface/70 pl-3 pr-1.5 text-sm text-ink-mute transition hover:border-ink/20 hover:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 sm:flex"
              >
                <Search aria-hidden size={15} className="shrink-0" />
                <span className="flex-1 truncate text-left">{commandLabel}</span>
                <Kbd keys="mod+K" className="pointer-events-none" />
              </button>
              <button
                type="button" onClick={onCommand} aria-label={commandLabel}
                className="grid size-10 place-items-center rounded-full text-ink-soft transition hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 sm:hidden"
              >
                <Search size={19} />
              </button>
            </>
          )}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {actions}
            <ThemeToggle />
            <DropdownMenu
              align="end" label="เมนูผู้ใช้" items={menuEntries}
              trigger={
                <button type="button" aria-label="เมนูผู้ใช้" className="flex items-center gap-2 rounded-pill p-1 transition hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 sm:pr-3">
                  <Avatar name={user.name} seed={user.seed ?? 3} size={32} />
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{user.name}</span>
                    {user.role && <span className="block max-w-[10rem] truncate text-[11px] text-ink-mute">{user.role}</span>}
                  </span>
                </button>
              }
            />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={path}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarBody({ brand, nav, path, collapsed, user }: { brand: { name: string; mark?: React.ReactNode; href?: string }; nav: NavGroup[]; path: string; collapsed: boolean; user: ShellUser }) {
  return (
    <>
      <Link href={brand.href ?? '/'} className={cn('flex h-16 shrink-0 items-center gap-3 px-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/50', collapsed && 'justify-center px-0')}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-black text-white shadow-[0_6px_16px_-6px_rgb(var(--brand-600)/0.6)]">
          {brand.mark ?? brand.name.slice(0, 1)}
        </span>
        {!collapsed && <span className="truncate text-[15px] font-bold tracking-tight text-ink">{brand.name}</span>}
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        <SidebarNav nav={nav} path={path} collapsed={collapsed} idPrefix="d" />
      </div>
      <div className={cn('flex shrink-0 items-center gap-3 border-t border-ink/[0.06] p-4', collapsed && 'justify-center px-0')}>
        <Avatar name={user.name} seed={user.seed ?? 3} size={36} />
        {!collapsed && (
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
            {user.role && <span className="block truncate text-[11px] text-ink-mute">{user.role}</span>}
          </span>
        )}
      </div>
    </>
  );
}

function SidebarNav({ nav, path, collapsed, idPrefix }: { nav: NavGroup[]; path: string; collapsed: boolean; idPrefix: string }) {
  const reduce = useReducedMotion();
  return (
    <LayoutGroup id={`nav-${idPrefix}`}>
      <nav aria-label="เมนูหลัก" className="space-y-5">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.label && (
              <p className={cn('mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-mute/80 transition-opacity', collapsed && 'h-0 overflow-hidden opacity-0')}>
                {g.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(path, item);
                const link = (
                  <Link
                    href={item.href} aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-colors',
                      'focus-visible:ring-2 focus-visible:ring-brand-500/50',
                      active ? 'text-brand-link' : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active" aria-hidden
                        className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-500/15"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    {active && !collapsed && <motion.span layoutId="nav-bar" aria-hidden className="absolute -left-3 top-2 h-6 w-1 rounded-r-full bg-brand-600" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
                    <span className="relative flex shrink-0">{item.icon}</span>
                    {!collapsed && <span className="relative min-w-0 flex-1 truncate">{item.label}</span>}
                    {item.badge != null && !collapsed && (
                      <span className="relative rounded-pill bg-brand-600 px-1.5 py-px text-[10px] font-bold tabular-nums text-white">{item.badge}</span>
                    )}
                    {item.badge != null && collapsed && <span aria-hidden className="absolute right-3 top-2 size-2 rounded-full bg-brand-600 ring-2 ring-surface" />}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {collapsed ? <Tooltip content={item.label} side="right">{link}</Tooltip> : link}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </LayoutGroup>
  );
}
