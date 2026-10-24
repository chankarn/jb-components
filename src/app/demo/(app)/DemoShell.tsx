'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, Bell, BarChart3, LayoutDashboard, LifeBuoy, LogOut, Milk, Moon, Package, PackagePlus, RotateCcw, Settings, ShoppingCart, Sun, Users } from 'lucide-react';
import { CommandPalette, useCommandHotkey, type CommandItem } from '@/components/CommandPalette';
import { useTheme } from '@/components/ThemeProvider';
import { AppShell, type NavGroup } from '@/components/AppShell';
import { DropdownMenu } from '@/components/DropdownMenu';
import { Skeleton } from '@/components/ui';
import { confirmDialog, toast } from '@/components/feedback';
import { api, getSession, signOut, type Session } from '../_lib/store';
import { categoryLabel, isLowStock, type Product } from '../_lib/products';

// คำค้นภาษาอังกฤษของแต่ละเมนู (ให้ค้นใน ⌘K ได้ทั้งไทย/อังกฤษ)
const NAV_KEYWORDS: Record<string, string[]> = {
  '/demo': ['dashboard', 'home', 'overview'], '/demo/products': ['products', 'items', 'stock'], '/demo/orders': ['orders'],
  '/demo/customers': ['customers', 'users'], '/demo/reports': ['reports', 'sales'], '/demo/settings': ['settings'], '/demo/help': ['help', 'support'],
};

const NAV: NavGroup[] = [
  {
    items: [
      { href: '/demo', label: 'ภาพรวม', icon: <LayoutDashboard size={18} />, match: 'exact' },
      { href: '/demo/products', label: 'สินค้า', icon: <Package size={18} /> },
      { href: '/demo/orders', label: 'คำสั่งซื้อ', icon: <ShoppingCart size={18} />, badge: 12 },
      { href: '/demo/customers', label: 'ลูกค้า', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'รายงาน',
    items: [{ href: '/demo/reports', label: 'ยอดขาย', icon: <BarChart3 size={18} /> }],
  },
  {
    label: 'ระบบ',
    items: [
      { href: '/demo/settings', label: 'ตั้งค่า', icon: <Settings size={18} /> },
      { href: '/demo/help', label: 'ช่วยเหลือ', icon: <LifeBuoy size={18} /> },
    ],
  },
];

/**
 * โครงหน้าหลังบ้านของ flow ตัวอย่าง: ตรวจว่าเข้าสู่ระบบแล้ว (ไม่งั้นส่งไปหน้า login พร้อม ?next=)
 * แล้วห่อทุกหน้าด้วย AppShell · เมนู คำสั่งซื้อ/ลูกค้า/รายงาน/ตั้งค่า เป็นหน้า "ยังไม่มีในตัวอย่าง"
 */
export function DemoShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname() ?? '/demo';
  const [session, setSession] = React.useState<Session | null | undefined>(undefined);
  const { choice, setChoice } = useTheme();
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [cmdQuery, setCmdQuery] = React.useState('');
  const [products, setProducts] = React.useState<Product[] | null>(null);
  useCommandHotkey(() => setCmdOpen((o) => !o));
  // เปิด ⌘K → โหลดสินค้าล่าสุด (ทุกครั้งที่เปิด เผื่อเพิ่ง เพิ่ม/แก้ไข)
  React.useEffect(() => { if (cmdOpen) void api.all().then(setProducts); }, [cmdOpen]);

  React.useEffect(() => {
    const s = getSession();
    if (!s) router.replace(`/demo/login?next=${encodeURIComponent(path)}`);
    setSession(s);
  }, [router, path]);

  async function resetData() {
    if (!(await confirmDialog('รีเซ็ตข้อมูลตัวอย่าง?', { description: 'สินค้าที่เพิ่ม/แก้ไขในเครื่องนี้จะกลับเป็นค่าตั้งต้น', confirmLabel: 'รีเซ็ต', danger: true }))) return;
    api.reset();
    toast.success('รีเซ็ตข้อมูลแล้ว');
    router.refresh();
    if (path.startsWith('/demo/products')) router.replace('/demo/products');
  }

  const commands: CommandItem[] = React.useMemo(() => [
    ...NAV.flatMap((g) => g.items).map((it) => ({
      id: `nav:${it.href}`, group: 'ไปที่', label: it.label, icon: it.icon, keywords: NAV_KEYWORDS[it.href],
      description: path === it.href ? 'หน้าปัจจุบัน' : undefined, onSelect: () => router.push(it.href),
    })),
    { id: 'act:new', group: 'การทำงาน', label: 'เพิ่มสินค้าใหม่', icon: <PackagePlus size={16} />, keywords: ['new', 'create', 'add'], onSelect: () => router.push('/demo/products/new') },
    { id: 'act:low', group: 'การทำงาน', label: 'ดูสินค้าใกล้หมด', icon: <AlertTriangle size={16} />, keywords: ['low stock'], description: products ? `${products.filter(isLowStock).length} รายการ` : undefined, onSelect: () => router.push('/demo/products?low=1') },
    { id: 'act:theme', group: 'การทำงาน', label: choice === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด', icon: choice === 'dark' ? <Sun size={16} /> : <Moon size={16} />, keywords: ['theme', 'dark', 'light', 'โหมด'], onSelect: () => setChoice(choice === 'dark' ? 'light' : 'dark') },
    { id: 'act:reset', group: 'การทำงาน', label: 'รีเซ็ตข้อมูลตัวอย่าง', icon: <RotateCcw size={16} />, keywords: ['reset'], onSelect: () => void resetData() },
    { id: 'act:logout', group: 'การทำงาน', label: 'ออกจากระบบ', icon: <LogOut size={16} />, keywords: ['logout', 'sign out'], onSelect: () => void logout() },
    ...(products ?? [])
      .slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((p) => ({
        id: `p:${p.id}`, group: cmdQuery ? 'สินค้า' : 'สินค้าที่แก้ไขล่าสุด', label: p.name, icon: <Package size={16} />,
        description: `${p.sku} · ${categoryLabel(p.category)} · ฿${p.price.toLocaleString()}${isLowStock(p) ? ' · ใกล้หมด' : ''}`,
        keywords: [p.sku, categoryLabel(p.category), ...p.tags],
        onSelect: () => router.push(`/demo/products/${p.id}`),
      })),
  ], [products, cmdQuery, choice, path]); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    if (!(await confirmDialog('ออกจากระบบ?', { confirmLabel: 'ออกจากระบบ' }))) return;
    signOut();
    toast.info('ออกจากระบบแล้ว');
    router.replace('/demo/login');
  }

  // ยังไม่รู้ว่าเข้าสู่ระบบหรือยัง → โครงโหลด (ไม่กระพริบเนื้อหาก่อนเด้งไปหน้า login)
  if (!session) {
    return (
      <div className="flex min-h-dvh bg-paper">
        <div className="hidden w-64 border-r border-ink/[0.06] bg-surface p-4 lg:block"><Skeleton className="mb-6 h-9 w-36" />{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="mb-2 h-9 w-full" />)}</div>
        <div className="flex-1 p-8"><Skeleton className="mb-6 h-8 w-56" /><div className="grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}</div></div>
      </div>
    );
  }

  return (
    <>
    <AppShell
      brand={{ name: 'Dairy Admin', mark: <Milk size={18} />, href: '/demo' }}
      nav={NAV}
      user={{ name: session.name, email: session.email, role: session.role, seed: 3 }}
      onSignOut={logout}
      onCommand={() => setCmdOpen(true)}
      commandLabel="ค้นหาสินค้า เมนู หรือคำสั่ง…"
      userMenu={[
        { label: 'เพิ่มสินค้าใหม่', icon: <PackagePlus size={15} />, href: '/demo/products/new' },
        { label: 'รีเซ็ตข้อมูลตัวอย่าง', icon: <RotateCcw size={15} />, onSelect: () => void resetData() },
      ]}
      actions={
        <DropdownMenu
          align="end" label="การแจ้งเตือน"
          items={[
            { type: 'label', label: 'การแจ้งเตือน' },
            { label: 'สต็อกใกล้หมด 6 รายการ', description: 'โยเกิร์ตกรีก, นมโปรตีน และอีก 4', icon: <Package size={15} />, href: '/demo/products?low=1' },
            { label: 'คำสั่งซื้อใหม่ #A-20931', description: '5 นาทีที่แล้ว', icon: <ShoppingCart size={15} /> },
            { label: 'ลูกค้าใหม่ 3 ราย', description: 'วันนี้', icon: <Users size={15} /> },
          ]}
          trigger={
            <button type="button" aria-label="การแจ้งเตือน (มี 3 รายการใหม่)" className="relative grid size-10 place-items-center rounded-full text-ink-soft transition hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50">
              <Bell size={19} />
              <span aria-hidden className="absolute right-2 top-2 size-2 rounded-full bg-danger-500 ring-2 ring-paper" />
            </button>
          }
        />
      }
    >
      {children}
    </AppShell>
    <CommandPalette
      open={cmdOpen} onOpenChange={setCmdOpen} items={commands} onQueryChange={setCmdQuery}
      limit={{ สินค้า: 6, สินค้าที่แก้ไขล่าสุด: 4 }} loading={cmdOpen && !products}
      placeholder="ค้นหาสินค้า เมนู หรือคำสั่ง…" emptyText="ไม่พบสินค้าหรือคำสั่งที่ตรงกัน"
    />
    </>
  );
}
