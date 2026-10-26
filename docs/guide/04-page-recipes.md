# 04 · สูตรประกอบหน้า

แต่ละสูตร = หน้าที่เว็บส่วนใหญ่ต้องมี · โค้ดทุกบล็อกเป็นไฟล์สมบูรณ์ที่ compile ผ่านจริง (ตรวจด้วย `npm run docs:check`)
บรรทัดแรกของบล็อก `// src/...` = ชื่อไฟล์ที่ควรวาง · ของจริงที่รันได้อยู่ใน `src/app/demo/**` และ `src/app/landing/**`

| # | สูตร | ใช้เมื่อ requirement มี |
|---|---|---|
| 1 | [หน้าเข้าสู่ระบบ](#1-หน้าเข้าสู่ระบบ) | login, sign in |
| 2 | [โครงหลังบ้าน (AppShell + ⌘K)](#2-โครงหลังบ้าน-appshell--k) | หลังบ้าน, sidebar, เมนู, ค้นหาทั้งระบบ |
| 3 | [หน้ารายการ (ค้นหา + กรอง + ตาราง)](#3-หน้ารายการ-ค้นหา--กรอง--ตาราง) | รายการ, จัดการข้อมูล, CRUD |
| 4 | [ฟอร์มเพิ่ม/แก้ไข](#4-ฟอร์มเพิ่มแก้ไข) | เพิ่ม, แก้ไข, กรอกข้อมูล |
| 5 | [แดชบอร์ด](#5-แดชบอร์ด) | ภาพรวม, รายงาน, KPI, กราฟ |
| 6 | [ฟอร์มหลายขั้น (Stepper)](#6-ฟอร์มหลายขั้น-stepper) | สมัคร, จอง, checkout, wizard |
| 7 | [หน้าตั้งค่า](#7-หน้าตั้งค่า) | ตั้งค่า, โปรไฟล์, การแจ้งเตือน |
| 8 | [รายละเอียดใน Drawer](#8-รายละเอียดใน-drawer) | ดูรายละเอียดโดยไม่ออกจากรายการ |
| 9 | [Landing page](#9-landing-page) | หน้าบ้าน, marketing, หน้าแรกบริษัท |
| 10 | [หน้าบ้านที่ยังไม่มีบล็อก](#10-สิ่งที่หน้าบ้านมักขอแต่ยังไม่มีบล็อก) | ราคา/แพ็กเกจ, ติดต่อเรา, บทความ |

ข้อมูลตัวอย่างที่ใช้ร่วมกันในสูตร 3, 5, 8 (ของจริงให้แทน `fetchOrders` ด้วยการเรียก API ของโปรเจกต์):

```tsx
// src/app/(admin)/orders/data.ts
export type OrderStatus = 'open' | 'in_progress' | 'completed' | 'failed';
/** DataTable ต้องการ `id: number` ในทุกแถว — รหัสที่เป็นข้อความเก็บแยก (code) */
export type Order = { id: number; code: string; customer: string; total: number; status: OrderStatus; createdAt: string; items: number };
export type OrderQuery = { q: string; status: OrderStatus | 'all'; page: number; perPage: number };
export type OrderPage = { rows: Order[]; total: number; pages: number; page: number; counts: Record<OrderStatus | 'all', number> };

const NAMES = ['สมชาย ใจดี', 'นภา ศรีสุข', 'กิตติ วงศ์ใหญ่', 'มาลี รักษ์ไทย', 'อนันต์ ศักดิ์ดี'];
const STATUSES: OrderStatus[] = ['open', 'in_progress', 'completed', 'failed'];
const ALL: Order[] = Array.from({ length: 57 }, (_, i) => ({
  id: i + 1, code: `A-${20900 + i}`, customer: NAMES[i % NAMES.length], total: 120 + ((i * 731) % 4800),
  status: STATUSES[i % 4], createdAt: new Date(Date.UTC(2026, 9, 23 - (i % 30))).toISOString(), items: 1 + (i % 6),
}));

/** แทนด้วย fetch('/api/orders?…') ของจริง — คืนรูปแบบเดียวกัน */
export async function fetchOrders(query: OrderQuery): Promise<OrderPage> {
  await new Promise((r) => setTimeout(r, 300));
  const q = query.q.trim().toLowerCase();
  const matched = ALL.filter((o) => !q || o.code.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
  const counts = { all: matched.length } as OrderPage['counts'];
  for (const s of STATUSES) counts[s] = matched.filter((o) => o.status === s).length;
  const rows = query.status === 'all' ? matched : matched.filter((o) => o.status === query.status);
  const pages = Math.max(1, Math.ceil(rows.length / query.perPage));
  const page = Math.min(query.page, pages);
  return { rows: rows.slice((page - 1) * query.perPage, page * query.perPage), total: rows.length, pages, page, counts };
}

export const baht = (n: number) => `฿${n.toLocaleString('th-TH')}`;
```

---

## 1. หน้าเข้าสู่ระบบ

**คอมโพเนนต์:** `Field` + `Input` · `PasswordInput` · `Checkbox` · `LoadingButton` · `shake` · `toast` · `LoginBackdrop` · `ThemeToggle`
**ของจริง:** `src/app/demo/login/LoginForm.tsx`

กฎ: ตรวจช่องว่าง/รูปแบบก่อนส่ง (ข้อความใต้ช่อง) · ผิดจาก server = แถบแดงเหนือปุ่ม + การ์ดสั่น · สำเร็จ = ปุ่มเขียวแล้วค่อยเปลี่ยนหน้า

```tsx
// src/app/login/LoginForm.tsx
'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Field, Input } from '@/components/ui';
import { Checkbox } from '@/components/Choice';
import { PasswordInput } from '@/components/admin/PasswordFields';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { LoginBackdrop } from '@/components/BlobArt';
import { ThemeToggle } from '@/components/ThemeProvider';
import { toast } from '@/components/feedback';
import { shake } from '@/lib/motion-fx';

/** แทนด้วยการเรียก API จริง — โยน Error พร้อมข้อความที่ผู้ใช้อ่านเข้าใจ */
async function signIn(email: string, password: string): Promise<{ name: string }> {
  await new Promise((r) => setTimeout(r, 700));
  if (password !== 'demo1234') throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  return { name: email.split('@')[0] };
}

export function LoginForm() {
  const router = useRouter();
  const card = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingStatus>('idle');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    const err: typeof errors = {};
    if (!email.trim()) err.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) err.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) err.password = 'กรุณากรอกรหัสผ่าน';
    setErrors(err);
    setFailure(null);
    if (Object.keys(err).length) return;
    setStatus('loading');
    try {
      const user = await signIn(email, password);
      setStatus('success');
      toast.success(`ยินดีต้อนรับ ${user.name}`);
      setTimeout(() => router.replace('/admin'), 600);
    } catch (ex) {
      setStatus('error');
      setFailure(ex instanceof Error ? ex.message : 'เข้าสู่ระบบไม่สำเร็จ');
      shake(card.current);
      setTimeout(() => setStatus('idle'), 1400);
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <LoginBackdrop />
      <ThemeToggle className="absolute right-4 top-4" />
      <div ref={card} className="relative w-full max-w-[26rem] rounded-[28px] bg-surface/95 p-7 shadow-lift backdrop-blur sm:p-9">
        <h1 className="mb-6 text-center text-2xl font-bold">เข้าสู่ระบบ</h1>
        <form noValidate onSubmit={submit} className="space-y-4">
          <Field label="อีเมล" error={errors.email}>
            <Input type="email" autoComplete="username" value={email} placeholder="name@company.com"
              onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
          </Field>
          {/* PasswordInput มีปุ่มข้างใน → as="div" */}
          <Field label="รหัสผ่าน" error={errors.password} as="div">
            <PasswordInput value={password} autoComplete="current-password"
              onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: undefined })); }} />
          </Field>
          <Checkbox size="sm" label="จดจำการเข้าสู่ระบบ" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          {failure && <p role="alert" className="rounded-xl bg-danger-50 px-3 py-2.5 text-sm font-medium text-danger-700">{failure}</p>}
          <LoadingButton type="submit" status={status} loadingText="กำลังตรวจสอบ" successText="สำเร็จ" errorText="ไม่สำเร็จ" className="w-full">
            เข้าสู่ระบบ
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
```

---

## 2. โครงหลังบ้าน (AppShell + ⌘K)

**คอมโพเนนต์:** `AppShell` · `CommandPalette` + `useCommandHotkey` · `DropdownMenu` (กระดิ่ง) · `confirmDialog` · `useTheme`
**ของจริง:** `src/app/demo/(app)/DemoShell.tsx` (มีตรวจ session + ค้นข้อมูลใน ⌘K)

วาง shell ใน `layout.tsx` ของกลุ่มหน้าหลังบ้าน → ทุกหน้าในกลุ่มได้ sidebar/topbar อัตโนมัติ

```tsx
// src/app/(admin)/layout.tsx
import { AdminShell } from './AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
```

```tsx
// src/app/(admin)/AdminShell.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LayoutDashboard, LogOut, Moon, Plus, Settings, ShoppingCart, Sun, Users } from 'lucide-react';
import { AppShell, type NavGroup } from '@/components/AppShell';
import { CommandPalette, useCommandHotkey, type CommandItem } from '@/components/CommandPalette';
import { DropdownMenu } from '@/components/DropdownMenu';
import { useTheme } from '@/components/ThemeProvider';
import { confirmDialog, toast } from '@/components/feedback';

const NAV: NavGroup[] = [
  {
    items: [
      { href: '/admin', label: 'ภาพรวม', icon: <LayoutDashboard size={18} />, match: 'exact' },
      { href: '/admin/orders', label: 'คำสั่งซื้อ', icon: <ShoppingCart size={18} />, badge: 12 },
      { href: '/admin/customers', label: 'ลูกค้า', icon: <Users size={18} /> },
    ],
  },
  { label: 'ระบบ', items: [{ href: '/admin/settings', label: 'ตั้งค่า', icon: <Settings size={18} /> }] },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { choice, setChoice } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);
  useCommandHotkey(() => setCmdOpen((o) => !o)); // ⌘K บน Mac · Ctrl+K บน Windows

  async function signOut() {
    if (!(await confirmDialog('ออกจากระบบ?', { confirmLabel: 'ออกจากระบบ' }))) return;
    toast.info('ออกจากระบบแล้ว');
    router.replace('/login');
  }

  const commands: CommandItem[] = useMemo(() => [
    // ทุกเมนูค้นได้ใน ⌘K · keywords ให้ค้นด้วยภาษาอังกฤษได้ด้วย
    ...NAV.flatMap((g) => g.items).map((it) => ({ id: it.href, group: 'ไปที่', label: it.label, icon: it.icon, onSelect: () => router.push(it.href) })),
    { id: 'new-order', group: 'การทำงาน', label: 'สร้างคำสั่งซื้อ', icon: <Plus size={16} />, keywords: ['new', 'create'], shortcut: 'mod+N', onSelect: () => router.push('/admin/orders/new') },
    { id: 'theme', group: 'การทำงาน', label: choice === 'dark' ? 'ธีมสว่าง' : 'ธีมมืด', icon: choice === 'dark' ? <Sun size={16} /> : <Moon size={16} />, keywords: ['theme', 'dark'], onSelect: () => setChoice(choice === 'dark' ? 'light' : 'dark') },
    { id: 'logout', group: 'การทำงาน', label: 'ออกจากระบบ', icon: <LogOut size={16} />, keywords: ['logout'], onSelect: () => void signOut() },
  ], [choice]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <AppShell
        brand={{ name: 'ร้านของฉัน', href: '/admin' }}
        nav={NAV}
        user={{ name: 'สมชาย ใจดี', email: 'somchai@example.com', role: 'ผู้ดูแล', seed: 7 }}
        onSignOut={signOut}
        onCommand={() => setCmdOpen(true)}
        commandLabel="ค้นหาเมนูหรือคำสั่ง…"
        actions={
          <DropdownMenu
            align="end" label="การแจ้งเตือน"
            items={[
              { type: 'label', label: 'การแจ้งเตือน' },
              { label: 'คำสั่งซื้อใหม่ #A-20931', description: '5 นาทีที่แล้ว', icon: <ShoppingCart size={15} />, href: '/admin/orders' },
            ]}
            trigger={
              <button type="button" aria-label="การแจ้งเตือน" className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-ink/[0.06]">
                <Bell size={19} />
              </button>
            }
          />
        }
      >
        {children}
      </AppShell>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} items={commands} />
    </>
  );
}
```

- ต้องการค้นข้อมูลจริงใน ⌘K (สินค้า ลูกค้า): โหลดตอน `open` เปลี่ยนเป็น true แล้วเพิ่มเป็น `CommandItem` กลุ่มใหม่ · ใช้ `onQueryChange` + `loading` ถ้าค้นฝั่ง server · `limit={{ สินค้า: 6 }}`
- ตรวจสิทธิ์/ล็อกอิน: ทำใน middleware หรือ server layout ก่อนถึง shell (ตัวอย่าง client-side ดู `DemoShell.tsx`)
- ข้อความ "ปุ่มลัด" ใน `CommandItem.shortcut` แสดงอย่างเดียว — ต้องผูกคีย์เองด้วย `useShortcut('n', …)`

---

## 3. หน้ารายการ (ค้นหา + กรอง + ตาราง)

**คอมโพเนนต์:** `AdminPageHeader` + `Breadcrumb` · `Tabs` (สถานะ+ตัวเลข) · `Toolbar` + `FilterSelect` · `DataTable` + `RowMenu` · `Pagination` · `LoadingOverlay` · `EmptyState` · `confirmDialog` → `toast` พร้อม "เลิกทำ" · `StatusBadge`
**ของจริง:** `src/app/demo/(app)/products/ProductList.tsx`

กฎ: **ตัวกรองทุกตัวเก็บใน URL** (แชร์ลิงก์ได้ · ปุ่มย้อนกลับใช้ได้ · รีเฟรชไม่หาย) · เปลี่ยนตัวกรองแล้วกลับหน้า 1 · โหลดครั้งแรกใช้ skeleton ของตาราง โหลดครั้งต่อไปใช้ `LoadingOverlay` (ไม่กระพริบ)

```tsx
// src/app/(admin)/orders/page.tsx
import { Suspense } from 'react';
import { OrderList } from './OrderList';

// useSearchParams ใน client component ต้องห่อ Suspense
export default function OrdersPage() {
  return <Suspense><OrderList /></Suspense>;
}
```

```tsx
// src/app/(admin)/orders/OrderList.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Eye, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { AdminPageHeader, DataTable, FilterSelect, Pagination, Toolbar, type Column } from '@/components/admin/kit';
import { RowMenu } from '@/components/admin/RowMenu';
import { Tabs } from '@/components/Tabs';
import { Breadcrumb } from '@/components/Breadcrumb';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/Loading';
import { confirmDialog, toast } from '@/components/feedback';
import { baht, fetchOrders, type Order, type OrderPage, type OrderQuery, type OrderStatus } from './data';

/** อ่าน/เขียนตัวกรองใน URL */
function useOrderQuery() {
  const params = useSearchParams();
  const router = useRouter();
  const query: OrderQuery = {
    q: params.get('q') ?? '',
    status: (params.get('status') as OrderStatus | null) ?? 'all',
    page: Number(params.get('page')) || 1,
    perPage: Number(params.get('per')) || 10,
  };
  const set = useCallback((patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '' || v === 'all' || (k === 'page' && v === 1)) next.delete(k);
      else next.set(k, String(v));
    }
    if (!('page' in patch)) next.delete('page'); // เปลี่ยนตัวกรอง → หน้า 1
    router.replace(`?${next.toString()}`, { scroll: false });
  }, [params, router]);
  return { query, set, key: params.toString() };
}

export function OrderList() {
  const router = useRouter();
  const { query, set, key } = useOrderQuery();
  const [data, setData] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  // Toolbar หน่วงเวลาค้นหาด้วย useEffect ที่ขึ้นกับ onSearch → ต้องเป็นฟังก์ชันที่คงที่ (useCallback)
  const onSearch = useCallback((v: string) => { if (v !== query.q) set({ q: v }); }, [query.q, set]);

  useEffect(() => {
    let live = true; // กันผลของคำขอเก่ามาทับคำขอใหม่
    setLoading(true);
    void fetchOrders(query).then((r) => { if (live) { setData(r); setLoading(false); } });
    return () => { live = false; };
  }, [key, reload]); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove(o: Order) {
    if (!(await confirmDialog(`ลบคำสั่งซื้อ ${o.code}?`, { danger: true, confirmLabel: 'ลบ', description: 'ลบแล้วกดเลิกทำได้ภายในไม่กี่วินาที' }))) return;
    // await api.remove(o.id)
    setReload((n) => n + 1);
    toast.success('ลบคำสั่งซื้อแล้ว', { description: o.code, action: { label: 'เลิกทำ', onClick: () => { /* await api.restore(o) */ setReload((n) => n + 1); } } });
  }

  const columns: Column<Order>[] = [
    { key: 'code', header: 'เลขที่', className: 'w-28', render: (o) => <span className="font-mono text-sm">{o.code}</span> },
    { key: 'customer', header: 'ลูกค้า', render: (o) => <span className="font-medium">{o.customer}</span> },
    { key: 'total', header: 'ยอดรวม', className: 'w-28 text-right', render: (o) => <span className="font-semibold tabular-nums">{baht(o.total)}</span> },
    { key: 'status', header: 'สถานะ', className: 'w-32', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'date', header: 'วันที่', className: 'w-32', render: (o) => <span className="whitespace-nowrap text-xs text-ink-mute">{new Date(o.createdAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}</span> },
    {
      key: 'menu', header: '', className: 'w-12',
      render: (o) => (
        <RowMenu items={[
          { label: 'ดูรายละเอียด', icon: <Eye size={15} />, href: `/admin/orders/${o.id}` },
          { label: 'ลบ', icon: <Trash2 size={15} />, danger: true, onClick: () => void remove(o) },
        ]} />
      ),
    },
  ];

  const counts = data?.counts;
  const filtered = !!query.q;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'ภาพรวม', href: '/admin' }, { label: 'คำสั่งซื้อ' }]} />}
        title="คำสั่งซื้อ" description="ติดตามและจัดการคำสั่งซื้อทั้งหมด"
        stats={counts ? [{ label: 'ทั้งหมด', value: counts.all }, { label: 'สำเร็จ', value: counts.completed, tone: 'done' }] : undefined}
        actions={
          <>
            <Button size="sm" variant="outline"><Download size={14} /> ส่งออก</Button>
            <Button size="sm" onClick={() => router.push('/admin/orders/new')}><Plus size={14} /> สร้างคำสั่งซื้อ</Button>
          </>
        }
      />

      <Tabs
        aria-label="สถานะคำสั่งซื้อ" value={query.status} onChange={(v) => set({ status: v })}
        items={[
          { key: 'all', label: 'ทั้งหมด', count: counts?.all },
          { key: 'open', label: 'รอดำเนินการ', count: counts?.open },
          { key: 'in_progress', label: 'กำลังจัดส่ง', count: counts?.in_progress },
          { key: 'completed', label: 'สำเร็จ', count: counts?.completed },
          { key: 'failed', label: 'ล้มเหลว', count: counts?.failed },
        ]}
      />

      <Toolbar q={query.q} onSearch={onSearch} placeholder="ค้นหาเลขที่หรือชื่อลูกค้า…">
        <FilterSelect value={String(query.perPage)} onChange={(v) => set({ per: v })} options={[{ value: '10', label: '10 แถว' }, { value: '25', label: '25 แถว' }]} />
      </Toolbar>

      {data && data.total === 0 && !loading ? (
        <EmptyState
          card title={filtered ? 'ไม่พบคำสั่งซื้อที่ค้นหา' : 'ยังไม่มีคำสั่งซื้อ'}
          description={filtered ? 'ลองเปลี่ยนคำค้นหรือล้างตัวกรอง' : undefined}
          action={filtered ? <Button size="sm" variant="outline" onClick={() => router.replace('?')}>ล้างตัวกรอง</Button> : undefined}
        />
      ) : (
        <LoadingOverlay show={loading && !!data} label="กำลังโหลด">
          <DataTable columns={columns} rows={data?.rows} loading={!data} onRowClick={(o) => router.push(`/admin/orders/${o.id}`)} />
          {data && data.total > 0 && (
            <div className="mt-3 px-1">
              <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => set({ page: p })} perPage={query.perPage} onPerPageChange={(n) => set({ per: n })} />
            </div>
          )}
        </LoadingOverlay>
      )}
    </div>
  );
}
```

- **`DataTable` บังคับให้ทุกแถวมี `id: number`** (ใช้เป็น key) — ถ้ารหัสของระบบเป็นข้อความ/UUID ให้ map เพิ่ม `id` เป็นเลขลำดับ หรือใช้ `Table` ประกอบเอง
- ข้อมูลไม่เยอะและโหลดมาทั้งชุด → ข้าม URL/Pagination แล้วใช้ `<DataTable rows={all} paginate={10} />` ได้เลย
- เลือกหลายแถว (ลบหลายรายการ): ใช้ `Table` ประกอบเอง + `Checkbox` (หัวคอลัมน์ใช้ `indeterminate`) — `DataTable` ไม่มีโหมดเลือกแถว
- ตัวกรองเยอะเกิน 3 ตัวบนมือถือ → ปุ่ม "ตัวกรอง" เปิด `Drawer side="right"` ที่มีฟอร์มตัวกรอง

---

## 4. ฟอร์มเพิ่ม/แก้ไข

**คอมโพเนนต์:** `AdminPageHeader` · `SectionCard` · `Field` + ช่องกรอกต่างๆ · `LoadingButton` · `useShortcut('s')` + `Kbd` · `confirmDialog` (ทิ้งการแก้ไข) · `toast`
**ของจริง:** `src/app/demo/(app)/products/ProductForm.tsx` (มี SKU อัตโนมัติ กำไรสด อัปโหลดรูป ลบ)

กฎของฟอร์มทุกฟอร์ม:
1. ตรวจตอนกด "บันทึก" → เลื่อนไปช่องแรกที่ผิดแล้วโฟกัส + `toast.error` บอกจำนวนช่องที่ผิด
2. หลังจากนั้นแก้ช่องไหน ข้อความผิดของช่องนั้นหายทันที
3. มีการแก้ไขค้าง → แถบบันทึกบอกสถานะ · กดยกเลิก/ปิดแท็บต้องถามก่อน
4. ใช้ `Field field="ชื่อช่อง"` เพื่อให้หาช่องเจอด้วย `[data-field=…]`

```tsx
// src/app/(admin)/customers/CustomerForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Contact, Settings2 } from 'lucide-react';
import { Button, Field, Input, Textarea } from '@/components/ui';
import { AdminPageHeader, SectionCard } from '@/components/admin/kit';
import { Combobox } from '@/components/Combobox';
import { TagInput } from '@/components/TagInput';
import { DatePicker } from '@/components/DatePicker';
import { NumberInput } from '@/components/NumberInput';
import { RadioGroup, Switch } from '@/components/Choice';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { Kbd, useShortcut } from '@/components/Kbd';
import { confirmDialog, toast } from '@/components/feedback';

type Customer = {
  name: string; email: string; province: string | null; tags: string[]; birthday: string;
  creditLimit: number | null; tier: 'basic' | 'gold' | 'vip'; newsletter: boolean; note: string;
};
type Errors = Partial<Record<keyof Customer, string>>;

const EMPTY: Customer = { name: '', email: '', province: null, tags: [], birthday: '', creditLimit: null, tier: 'basic', newsletter: true, note: '' };
const PROVINCES = ['กรุงเทพมหานคร', 'เชียงใหม่', 'ขอนแก่น', 'ภูเก็ต', 'สงขลา'].map((p) => ({ value: p, label: p }));

/** ตรวจฝั่ง client (ฝั่ง server ต้องตรวจซ้ำเสมอ) — คืนข้อความที่บอกวิธีแก้ */
function validate(c: Customer): Errors {
  const e: Errors = {};
  if (!c.name.trim()) e.name = 'กรุณากรอกชื่อลูกค้า';
  if (!c.email.trim()) e.email = 'กรุณากรอกอีเมล';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง เช่น name@company.com';
  if (!c.province) e.province = 'กรุณาเลือกจังหวัด';
  return e;
}

export function CustomerForm({ initial }: { initial?: Customer }) {
  const router = useRouter();
  const editing = !!initial;
  const [base, setBase] = useState<Customer>(initial ?? EMPTY);
  const [form, setForm] = useState<Customer>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const dirty = JSON.stringify(form) !== JSON.stringify(base);

  // เตือนก่อนปิดแท็บ/รีเฟรชตอนมีการแก้ไขค้าง
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function patch<K extends keyof Customer>(k: K, v: Customer[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _removed, ...rest }) => rest as Errors);
  }

  async function save() {
    if (status === 'loading') return;
    const e = validate(form);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true });
      toast.error('ยังบันทึกไม่ได้', { description: `แก้ไขช่องที่ผิด ${Object.keys(e).length} ช่อง` });
      return;
    }
    setStatus('loading');
    try {
      await new Promise((r) => setTimeout(r, 800)); // await api.save(form)
      setStatus('success');
      setBase(form);
      toast.success(editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มลูกค้าแล้ว', { description: form.name });
      setTimeout(() => router.push('/admin/customers'), 700);
    } catch {
      setStatus('error');
      toast.error('บันทึกไม่สำเร็จ ลองอีกครั้ง');
      setTimeout(() => setStatus('idle'), 1500);
    }
  }
  useShortcut('s', () => void save()); // ⌘S / Ctrl+S

  async function cancel() {
    if (dirty && !(await confirmDialog('ทิ้งการแก้ไข?', { description: 'สิ่งที่แก้ไว้ยังไม่ได้บันทึก', confirmLabel: 'ทิ้งการแก้ไข', danger: true }))) return;
    setBase(form);
    router.push('/admin/customers');
  }

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-5 pb-24">
      <AdminPageHeader title={editing ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้า'} description="ช่องที่มี * ต้องกรอก" />

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SectionCard title="ข้อมูลติดต่อ" icon={<Contact size={18} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อลูกค้า *" field="name" error={errors.name}>
                <Input value={form.name} onChange={(e) => patch('name', e.target.value)} />
              </Field>
              <Field label="อีเมล *" field="email" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => patch('email', e.target.value)} />
              </Field>
              <Field label="จังหวัด *" field="province" error={errors.province} as="div">
                <Combobox options={PROVINCES} value={form.province} onChange={(v) => patch('province', v)} placeholder="ค้นหาจังหวัด" />
              </Field>
              <Field label="วันเกิด" as="div">
                <DatePicker value={form.birthday} onChange={(v) => patch('birthday', v)} max="2026-12-31" clearable />
              </Field>
            </div>
            <Field label="แท็ก" hint="กด Enter หรือ comma เพื่อเพิ่ม · สูงสุด 5" as="div">
              <TagInput aria-label="แท็ก" value={form.tags} onChange={(v) => patch('tags', v)} max={5} />
            </Field>
            <Field label="หมายเหตุ" hint={`${form.note.length}/500`}>
              <Textarea rows={3} maxLength={500} value={form.note} onChange={(e) => patch('note', e.target.value)} />
            </Field>
          </SectionCard>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <SectionCard title="บัญชี" icon={<Settings2 size={18} />}>
            <RadioGroup
              label="ระดับลูกค้า" value={form.tier} onChange={(v) => patch('tier', v as Customer['tier'])}
              options={[
                { value: 'basic', label: 'ทั่วไป' },
                { value: 'gold', label: 'Gold', description: 'ส่วนลด 5%' },
                { value: 'vip', label: 'VIP', description: 'ส่วนลด 10% + ส่งฟรี' },
              ]}
            />
            <Field label="วงเงินเครดิต" hint="เว้นว่าง = ไม่ให้เครดิต" as="div">
              <NumberInput aria-label="วงเงินเครดิต" value={form.creditLimit} onChange={(v) => patch('creditLimit', v)} min={0} step={1000} precision={0} prefix="฿" />
            </Field>
            <Switch className="w-full" placement="start" label="รับข่าวสาร" description="ส่งโปรโมชันทางอีเมล" checked={form.newsletter} onChange={(e) => patch('newsletter', e.target.checked)} />
          </SectionCard>
        </div>
      </div>

      {/* แถบบันทึกติดล่างจอ — lg:pl-[var(--shell-w)] เว้นที่ให้ sidebar ของ AppShell */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 lg:pl-[var(--shell-w,0px)]">
        <div className="pointer-events-auto mx-auto mb-3 flex max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center gap-3 rounded-2xl bg-surface/90 px-4 py-3 shadow-lift backdrop-blur">
            <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink-soft">
              <span aria-hidden className={`size-2 shrink-0 rounded-full ${dirty ? 'bg-warn-500' : 'bg-ok-500'}`} />
              <span className="truncate">{dirty ? 'มีการแก้ไขที่ยังไม่บันทึก' : 'บันทึกแล้วทั้งหมด'}</span>
              <Kbd keys="mod+S" className="hidden md:inline-flex" />
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => void cancel()}>ยกเลิก</Button>
            <LoadingButton type="submit" size="sm" status={status} loadingText="กำลังบันทึก" successText="บันทึกแล้ว">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
            </LoadingButton>
          </div>
        </div>
      </div>
    </form>
  );
}
```

- อัปโหลดรูปหลายรูป: `<FileDrop upload={upload} accept="image/*" maxFiles={4} maxSize={5 * 1024 * 1024} />` ใน `SectionCard` · รูปเดียว: `ImagePicker` — ดู [components/forms.md](./components/forms.md#filedrop)
- ฟอร์มสั้น 1–3 ช่อง (เปลี่ยนชื่อ เชิญสมาชิก) → ใส่ใน `Dialog` แทนการทำหน้าใหม่ (ดูตัวอย่างใน [AGENTS.md](../../AGENTS.md))

---

## 5. แดชบอร์ด

**คอมโพเนนต์:** `AdminPageHeader` + `SegmentedControl` (ช่วงเวลา) · `StatCard` ×4 · `ChartCard` + `TrendChart` / `DonutChart` / `BarsChart` / `RankList` · `seriesTable`
**ของจริง:** `src/app/demo/(app)/DemoHome.tsx` · กราฟทุกแบบ: `src/app/dashboard/DashboardDemo.tsx`

เลย์เอาต์มาตรฐาน: แถว KPI 4 ใบ (`grid-cols-2 lg:grid-cols-4`) → กราฟหลักกว้าง 2/3 + กราฟรอง 1/3 → อันดับ/รายการล่าสุด

```tsx
// src/app/(admin)/Dashboard.tsx
'use client';

import { useState } from 'react';
import { ShoppingCart, Users, Wallet, AlertTriangle } from 'lucide-react';
import { AdminPageHeader, StatCard } from '@/components/admin/kit';
import { SegmentedControl } from '@/components/SegmentedControl';
import { BarsChart, ChartCard, DonutChart, RankList, TrendChart, seriesTable, type Series } from '@/components/charts';
import { baht } from './orders/data';

// ข้อมูลจำลองแบบคงที่ (server/client ได้ค่าเดียวกัน — ห้ามใช้ Math.random ตอน render)
const DAILY = Array.from({ length: 90 }, (_, i) => ({
  day: `${(i % 30) + 1}/${10 - Math.floor((89 - i) / 30)}`,
  sales: Math.round(38000 + 9000 * Math.sin(i / 3) + i * 120),
  orders: Math.round(260 + 60 * Math.sin(i / 5) + i),
}));
const SALES: Series[] = [{ key: 'sales', label: 'ยอดขาย (บาท)' }];
const CHANNELS: Series[] = [{ key: 'store', label: 'หน้าร้าน' }, { key: 'online', label: 'ออนไลน์' }];
const BY_BRANCH = [
  { branch: 'สาขาสยาม', store: 420, online: 310 }, { branch: 'สาขาอารีย์', store: 380, online: 220 },
  { branch: 'สาขาบางนา', store: 290, online: 260 }, { branch: 'สาขาลาดพร้าว', store: 250, online: 180 },
];

type Range = '7' | '30' | '90';

export function Dashboard() {
  const [range, setRange] = useState<Range>('30');
  const n = Number(range);
  const rows = DAILY.slice(-n);
  const prev = DAILY.slice(-n * 2, -n);
  const sum = (xs: typeof DAILY, k: 'sales' | 'orders') => xs.reduce((a, r) => a + r[k], 0);
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : null);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ภาพรวม" description="ยอดขายและคำสั่งซื้อของร้าน"
        actions={<SegmentedControl size="sm" label="ช่วงเวลา" value={range} onChange={setRange} options={[{ value: '7', label: '7 วัน' }, { value: '30', label: '30 วัน' }, { value: '90', label: '90 วัน' }]} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ยอดขาย" value={sum(rows, 'sales')} format={baht} icon={<Wallet size={16} />} delta={pct(sum(rows, 'sales'), sum(prev, 'sales'))} hint="เทียบช่วงก่อน" trend={rows.map((r) => r.sales)} />
        <StatCard label="คำสั่งซื้อ" value={sum(rows, 'orders')} tone="done" icon={<ShoppingCart size={16} />} delta={pct(sum(rows, 'orders'), sum(prev, 'orders'))} hint="เทียบช่วงก่อน" />
        <StatCard label="รอจัดส่ง" value={18} tone="warn" icon={<AlertTriangle size={16} />} delta={-12} deltaInverse hint="ลดลง = ดี" />
        <StatCard label="ลูกค้าใหม่" value={Math.round(48 * (n / 30))} icon={<Users size={16} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="ยอดขายรายวัน" table={seriesTable(rows, 'day', SALES, { xLabel: 'วันที่' })}>
          <TrendChart data={rows} xKey="day" series={SALES} variant="area" valueFormat={baht} showLegend={false} height={260} />
        </ChartCard>
        <ChartCard title="ช่องทางการขาย">
          <DonutChart data={[{ label: 'หน้าร้าน', value: 1340 }, { label: 'ออนไลน์', value: 970 }, { label: 'LINE', value: 410 }]} centerLabel="คำสั่งซื้อ" size={180} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="ยอดขายตามสาขา" description="จำนวนคำสั่งซื้อ" table={seriesTable(BY_BRANCH, 'branch', CHANNELS, { xLabel: 'สาขา' })}>
          <BarsChart data={BY_BRANCH} xKey="branch" series={CHANNELS} stacked orientation="bar" categoryWidth={110} />
        </ChartCard>
        <ChartCard title="สินค้าขายดี">
          <RankList items={[{ label: 'นมสดรสจืด', value: 4820 }, { label: 'โยเกิร์ตกรีก', value: 3910 }, { label: 'ชาเขียวนม', value: 2470 }]} />
        </ChartCard>
      </div>
    </div>
  );
}
```

- ตัวเลขที่ "ลดลง = ดี" (ของค้าง ค่าใช้จ่าย เวลาตอบ) → `StatCard deltaInverse` / `KpiCard goodWhen="down"`
- เลือกช่วงวันที่อิสระ → `DateRangePicker` แทน `SegmentedControl`
- กราฟตัวเลือกตามข้อมูล ดู [components/charts.md](./components/charts.md)

---

## 6. ฟอร์มหลายขั้น (Stepper)

**คอมโพเนนต์:** `Stepper` (แสดงขั้น) + ฟอร์มของแต่ละขั้นเอง · `RadioGroup variant="card"` · `Card` · `Button` / `LoadingButton`
`Stepper` ไม่คุมฟอร์มให้ — เก็บ `step` ใน state ตรวจเฉพาะช่องของขั้นนั้นก่อนกด "ถัดไป"

```tsx
// src/app/booking/BookingWizard.tsx
'use client';

import { useState } from 'react';
import { Truck, Store, Zap } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';
import { Stepper } from '@/components/Stepper';
import { RadioGroup } from '@/components/Choice';
import { DatePicker } from '@/components/DatePicker';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { toast } from '@/components/feedback';

const STEPS = [{ title: 'ข้อมูลผู้จอง' }, { title: 'วิธีรับสินค้า' }, { title: 'ยืนยัน' }];

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<LoadingStatus>('idle');

  /** ตรวจเฉพาะช่องของขั้นปัจจุบัน */
  function check(s: number) {
    const e: Record<string, string> = {};
    if (s === 0 && !name.trim()) e.name = 'กรุณากรอกชื่อ';
    if (s === 0 && !/^0\d{8,9}$/.test(phone)) e.phone = 'เบอร์โทร 9–10 หลัก ขึ้นต้นด้วย 0';
    if (s === 1 && !method) e.method = 'กรุณาเลือกวิธีรับสินค้า';
    if (s === 1 && !date) e.date = 'กรุณาเลือกวันที่';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 900)); // await api.book(...)
    setStatus('success');
    toast.success('จองสำเร็จ', { description: `${name} · ${date}` });
    setStep(STEPS.length); // current = steps.length → ทุกขั้นเป็น "เสร็จแล้ว"
  }

  return (
    <Card className="mx-auto max-w-2xl space-y-6 p-6">
      <Stepper steps={STEPS.map((s, i) => ({ ...s, error: i === step && Object.keys(errors).length > 0 }))} current={step} onStepClick={setStep} />

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อ-นามสกุล" error={errors.name}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="เบอร์โทร" error={errors.phone}><Input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} /></Field>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <Field label="วิธีรับสินค้า" error={errors.method} as="div">
            <RadioGroup
              variant="card" value={method} onChange={setMethod}
              options={[
                { value: 'pickup', label: 'รับที่ร้าน', description: 'ฟรี', icon: <Store size={18} /> },
                { value: 'ship', label: 'จัดส่ง', description: '฿40 · 1–2 วัน', icon: <Truck size={18} /> },
                { value: 'express', label: 'ด่วนภายในวัน', description: '฿120', icon: <Zap size={18} /> },
              ]}
            />
          </Field>
          <Field label="วันที่รับ" error={errors.date} as="div"><DatePicker value={date} onChange={setDate} min="2026-10-24" /></Field>
        </div>
      )}
      {step === 2 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-ink-mute">ผู้จอง</dt><dd>{name} · {phone}</dd>
          <dt className="text-ink-mute">วิธีรับ</dt><dd>{method}</dd>
          <dt className="text-ink-mute">วันที่</dt><dd>{date}</dd>
        </dl>
      )}
      {step === STEPS.length && <p className="text-center text-lg font-semibold text-ok-700">จองเรียบร้อยแล้ว</p>}

      {step < STEPS.length && (
        <div className="flex justify-between gap-3">
          <Button variant="ghost" disabled={step === 0} onClick={() => { setErrors({}); setStep(step - 1); }}>ย้อนกลับ</Button>
          {step < STEPS.length - 1
            ? <Button onClick={() => check(step) && setStep(step + 1)}>ถัดไป</Button>
            : <LoadingButton status={status} loadingText="กำลังจอง" successText="สำเร็จ" onClick={() => void submit()}>ยืนยันการจอง</LoadingButton>}
        </div>
      )}
    </Card>
  );
}
```

- ขั้นตอนยาว/มีเนื้อหาใต้แต่ละขั้น → `orientation="vertical"` และใส่ `content` ในแต่ละ step
- แสดงสถานะคำสั่งซื้อ (ไม่ใช่ฟอร์ม) → `Stepper` อย่างเดียวโดยไม่ใส่ `onStepClick`

---

## 7. หน้าตั้งค่า

**คอมโพเนนต์:** `SectionCard` (`collapsible` ได้) · `Switch placement="start"` (มีผลทันที → toast) · `Select` · `SegmentedControl` · `InfoNote` · `confirmDialog` (โซนอันตราย)

```tsx
// src/app/(admin)/settings/SettingsPage.tsx
'use client';

import { useState } from 'react';
import { Bell, Palette, ShieldAlert } from 'lucide-react';
import { Button, Field } from '@/components/ui';
import { AdminPageHeader, InfoNote, SectionCard } from '@/components/admin/kit';
import { Switch } from '@/components/Choice';
import { Select } from '@/components/Select';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useTheme } from '@/components/ThemeProvider';
import { confirmDialog, toast } from '@/components/feedback';

export function SettingsPage() {
  const { choice, setChoice } = useTheme();
  const [notify, setNotify] = useState({ email: true, line: false, weekly: true });
  const [digest, setDigest] = useState('08:00');

  /** Switch มีผลทันที → บันทึกเลยแล้วแจ้งผล (ไม่มีปุ่มบันทึก) */
  function toggle(key: keyof typeof notify, value: boolean) {
    setNotify((n) => ({ ...n, [key]: value }));
    // void api.updateSettings({ [key]: value })
    toast.success(value ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว');
  }

  async function deleteShop() {
    if (!(await confirmDialog('ลบร้านค้านี้ถาวร?', { danger: true, confirmLabel: 'ลบร้านค้า', description: 'ข้อมูลสินค้าและคำสั่งซื้อทั้งหมดจะหายและกู้คืนไม่ได้' }))) return;
    toast.success('ลบร้านค้าแล้ว');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <AdminPageHeader title="ตั้งค่า" />

      <SectionCard title="การแจ้งเตือน" hint="เปลี่ยนแล้วมีผลทันที" icon={<Bell size={18} />}>
        <div className="divide-y divide-ink/[0.06]">
          <Switch className="w-full py-3" placement="start" label="อีเมล" description="คำสั่งซื้อใหม่และสต็อกใกล้หมด" checked={notify.email} onChange={(e) => toggle('email', e.target.checked)} />
          <Switch className="w-full py-3" placement="start" label="LINE" description="ต้องเชื่อมบัญชี LINE ก่อน" checked={notify.line} onChange={(e) => toggle('line', e.target.checked)} />
          <Switch className="w-full py-3" placement="start" label="สรุปรายสัปดาห์" checked={notify.weekly} onChange={(e) => toggle('weekly', e.target.checked)} />
        </div>
        <Field label="เวลาส่งสรุปประจำวัน" as="div">
          <Select value={digest} onChange={(e) => setDigest(e.target.value)}>
            <option value="08:00">08:00 น.</option>
            <option value="12:00">12:00 น.</option>
            <option value="18:00">18:00 น.</option>
          </Select>
        </Field>
      </SectionCard>

      <SectionCard title="หน้าตา" icon={<Palette size={18} />} collapsible>
        <Field label="ธีม" as="div">
          <SegmentedControl label="ธีม" value={choice} onChange={setChoice} options={[{ value: 'light', label: 'สว่าง' }, { value: 'dark', label: 'มืด' }]} />
        </Field>
      </SectionCard>

      <SectionCard title="โซนอันตราย" icon={<ShieldAlert size={18} />}>
        <InfoNote tone="danger" title="การลบร้านค้าย้อนกลับไม่ได้">ส่งออกข้อมูลเก็บไว้ก่อนลบ</InfoNote>
        <Button variant="danger" onClick={() => void deleteShop()}>ลบร้านค้า</Button>
      </SectionCard>
    </div>
  );
}
```

- ตั้งค่าที่ต้องกด "บันทึก" ทีเดียว (ฟอร์มโปรไฟล์) → ใช้สูตร 4 และ `Checkbox` แทน `Switch`
- เปลี่ยนรหัสผ่าน → `PasswordInput` ×3 + `PasswordRules` ใน `SectionCard`

---

## 8. รายละเอียดใน Drawer

ใช้เมื่อผู้ใช้ต้องดูรายละเอียดทีละแถวแล้วกลับมารายการเดิม (ไม่เสียตัวกรอง/ตำแหน่งเลื่อน)
**คอมโพเนนต์:** `DataTable onRowClick` → `Drawer` (`footer` มีปุ่ม) · `StatusBadge` · `Stepper vertical` (ไทม์ไลน์)

```tsx
// src/app/(admin)/orders/OrderDrawer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { DataTable, type Column } from '@/components/admin/kit';
import { Drawer } from '@/components/Overlay';
import { StatusBadge } from '@/components/StatusBadge';
import { Stepper } from '@/components/Stepper';
import { toast } from '@/components/feedback';
import { baht, type Order } from './data';

const PROGRESS = { open: 0, in_progress: 1, completed: 3, failed: 1 } as const;

export function OrdersWithDrawer({ rows }: { rows: Order[] }) {
  const [selected, setSelected] = useState<Order | null>(null);
  const columns: Column<Order>[] = [
    { key: 'code', header: 'เลขที่', render: (o) => o.code },
    { key: 'customer', header: 'ลูกค้า', render: (o) => o.customer },
    { key: 'status', header: 'สถานะ', render: (o) => <StatusBadge status={o.status} /> },
  ];

  return (
    <>
      <DataTable columns={columns} rows={rows} paginate={10} onRowClick={setSelected} />
      <Drawer
        open={!!selected} onClose={() => setSelected(null)}
        title={selected ? `คำสั่งซื้อ ${selected.code}` : ''} description={selected?.customer}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>ปิด</Button>
            <Button onClick={() => { toast.success('พิมพ์ใบเสร็จแล้ว'); setSelected(null); }}>พิมพ์ใบเสร็จ</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-6">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-ink-mute">สถานะ</dt><dd><StatusBadge status={selected.status} /></dd>
              <dt className="text-ink-mute">จำนวนสินค้า</dt><dd>{selected.items} ชิ้น</dd>
              <dt className="text-ink-mute">ยอดรวม</dt><dd className="font-semibold">{baht(selected.total)}</dd>
            </dl>
            <Stepper
              orientation="vertical" current={PROGRESS[selected.status]}
              steps={[
                { title: 'รับคำสั่งซื้อ' },
                { title: 'กำลังจัดส่ง', error: selected.status === 'failed', description: selected.status === 'failed' ? 'จัดส่งไม่สำเร็จ' : undefined },
                { title: 'ส่งถึงแล้ว' },
              ]}
            />
          </div>
        )}
      </Drawer>
    </>
  );
}
```

---

## 9. Landing page

**คอมโพเนนต์:** ทั้งหมดจาก `@/components/blocks` + `MediaLightbox` (วิดีโอแนะนำ)
**ของจริง:** `src/app/landing/LandingPage.tsx` (มีภาพประกอบในการ์ดจุดเด่น + รีวิว 8 อัน)

กฎ: `Hero title` เป็นอาร์เรย์บรรทัด (ภาษาไทยตัดคำเองไม่สวย) · `highlight` ต้องเป็นข้อความที่อยู่ใน title จริง · ปุ่มที่เป็นลิงก์ใช้ `<Link className=…>` (ห้ามซ้อน `<button>` ใน `<a>`) · ใส่ `data-smooth-scroll` ที่กล่องนอกสุดให้ลิงก์ `#id` เลื่อนนุ่ม

```tsx
// src/app/(site)/HomePage.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Bell, Boxes, PlayCircle, Rocket, Upload, UserPlus, Leaf, Gem, Orbit } from 'lucide-react';
import { CtaBand, FaqSection, FeatureBento, Hero, LogoCloud, SiteFooter, SiteNav, StatsBand, Steps, Testimonials } from '@/components/blocks';
import { MediaLightbox } from '@/components/MediaLightbox';

const BTN = 'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-6 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60';
const primary = `${BTN} bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-700`;
const secondary = `${BTN} bg-surface/80 text-ink shadow-[0_0_0_1px_rgb(var(--ink)/0.12)] backdrop-blur hover:bg-surface`;

export function HomePage() {
  const [video, setVideo] = useState(false);
  return (
    <div data-smooth-scroll className="min-h-dvh overflow-x-clip bg-paper">
      <SiteNav
        brand={{ name: 'ShopFlow', href: '#' }}
        links={[{ href: '#features', label: 'จุดเด่น' }, { href: '#how', label: 'วิธีใช้' }, { href: '#faq', label: 'คำถาม' }]}
        actions={<Link href="/login" className="inline-flex h-10 items-center rounded-pill bg-ink px-4 text-sm font-semibold text-paper">เริ่มใช้ฟรี</Link>}
      />
      <main>
        <Hero
          badge={{ tag: 'ใหม่', label: 'รายงานเรียลไทม์', href: '#features' }}
          title={['ขายของออนไลน์', 'ง่ายขึ้นในที่เดียว']} highlight="ในที่เดียว"
          description="สต็อก คำสั่งซื้อ และลูกค้า จัดการได้จากมือถือ"
          actions={<><Link href="/login" className={primary}>ทดลองใช้ฟรี <ArrowRight size={16} /></Link><button type="button" onClick={() => setVideo(true)} className={secondary}><PlayCircle size={18} /> ดูวิดีโอ</button></>}
          trust={{ avatars: ['นภา', 'กิตติ', 'สมศรี'], rating: 4.9, text: 'ร้านค้ากว่า 1,200 ร้านไว้วางใจ' }}
          chips={[{ icon: <Bell size={16} />, label: 'คำสั่งซื้อใหม่', value: '+12' }]}
        />
        <LogoCloud title="ได้รับความไว้วางใจจาก" logos={[{ name: 'Pine & Co', icon: <Leaf size={22} /> }, { name: 'Vertex', icon: <Gem size={22} /> }, { name: 'Orbit', icon: <Orbit size={22} /> }]} />
        <StatsBand stats={[{ value: 1200, suffix: '+', label: 'ร้านค้า' }, { value: 98, suffix: '%', label: 'พึงพอใจ' }, { value: 3.2, decimals: 1, suffix: ' ล้าน', label: 'คำสั่งซื้อ/เดือน' }]} />
        <FeatureBento
          id="features" eyebrow="จุดเด่น" title="ทุกอย่างที่ร้านต้องการ" highlight="ร้านต้องการ"
          features={[
            { icon: <Boxes size={20} />, title: 'สต็อกเรียลไทม์', description: 'เห็นของคงเหลือทุกสาขา', wide: true },
            { icon: <Bell size={20} />, title: 'แจ้งเตือนก่อนหมด', description: 'ตั้งเกณฑ์รายสินค้า' },
            { icon: <BarChart3 size={20} />, title: 'รายงานยอดขาย', description: 'รู้ว่าอะไรขายดี' },
          ]}
        />
        <Steps
          id="how" eyebrow="วิธีใช้" title="เริ่มได้ในไม่กี่นาที" highlight="ไม่กี่นาที"
          steps={[
            { icon: <UserPlus size={22} />, title: 'สมัคร', description: 'ไม่ต้องผูกบัตร' },
            { icon: <Upload size={22} />, title: 'นำเข้าสินค้า', description: 'จาก Excel ได้ทันที' },
            { icon: <Rocket size={22} />, title: 'เริ่มขาย', description: 'ติดตามได้ทุกที่' },
          ]}
        />
        <Testimonials id="reviews" title="ลูกค้าพูดถึงเรา" items={[{ quote: 'ประหยัดเวลาวันละชั่วโมง', name: 'คุณนภา', role: 'เจ้าของร้าน', rating: 5 }, { quote: 'ทีมเรียนรู้ได้ในวันเดียว', name: 'คุณกิตติ', role: 'ผู้จัดการ', rating: 5 }]} />
        <FaqSection id="faq" title="คำถามที่พบบ่อย" items={[{ id: 'trial', title: 'ทดลองฟรีกี่วัน?', content: '14 วัน ไม่ต้องผูกบัตร' }, { id: 'cancel', title: 'ยกเลิกได้ไหม?', content: 'ยกเลิกได้ทุกเมื่อ' }]} />
        <CtaBand title="พร้อมเริ่มหรือยัง?" actions={<Link href="/login" className={`${BTN} bg-white text-brand-700`}>เริ่มฟรี</Link>} points={['ไม่ต้องผูกบัตร', 'ยกเลิกได้ทุกเมื่อ']} />
      </main>
      <SiteFooter
        brand={{ name: 'ShopFlow' }} description="ระบบหลังร้านสำหรับร้านค้าออนไลน์"
        columns={[{ title: 'ผลิตภัณฑ์', links: [{ label: 'จุดเด่น', href: '#features' }] }, { title: 'ช่วยเหลือ', links: [{ label: 'คำถาม', href: '#faq' }] }]}
        onSubscribe={async (email) => { await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) }); }}
        legal="© 2026 ShopFlow"
      />
      <MediaLightbox open={video} onClose={() => setVideo(false)} index={0} items={[{ src: '/intro.mp4', type: 'video/mp4', title: 'วิดีโอแนะนำ' }]} />
    </div>
  );
}
```

- ภาพหลักของ Hero: ไม่ใส่ `visual` = ภาพจำลองแดชบอร์ด (`ProductMock`) · เว็บร้านอาหาร/โรงแรม/องค์กร ใส่ `visual={<img … className="rounded-3xl" />}` แทน
- เว็บที่ไม่ใช่ SaaS (บริษัท ร้านอาหาร โรงเรียน): ตัด `LogoCloud`/`StatsBand` ที่ไม่เกี่ยว · เปลี่ยน `FeatureBento` เป็น "บริการของเรา" · ใช้ `Carousel` + `MediaGallery` แสดงผลงาน/เมนู/บรรยากาศ
- SEO: หน้า `page.tsx` เป็น server component ใส่ `export const metadata` แล้ว render `<HomePage />`

---

## 10. สิ่งที่หน้าบ้านมักขอแต่ยังไม่มีบล็อก

ประกอบจากของที่มี (อย่าติดตั้ง UI kit อื่น) — ถ้าใช้ซ้ำหลายโปรเจกต์ให้ย้ายเข้า `src/components/blocks/` ทีหลัง

### ราคา/แพ็กเกจ

```tsx
// src/app/(site)/Pricing.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Reveal, RevealItem, SectionHeading } from '@/components/blocks';
import { SegmentedControl } from '@/components/SegmentedControl';
import { cn } from '@/lib/utils';

const PLANS = [
  { name: 'เริ่มต้น', monthly: 0, features: ['สินค้า 50 รายการ', 'ผู้ใช้ 1 คน'] },
  { name: 'ธุรกิจ', monthly: 590, features: ['สินค้าไม่จำกัด', 'ผู้ใช้ 5 คน', 'รายงานขั้นสูง'], popular: true },
  { name: 'องค์กร', monthly: 1490, features: ['ทุกอย่างในธุรกิจ', 'ผู้ใช้ไม่จำกัด', 'ผู้ดูแลเฉพาะ'] },
];

export function Pricing() {
  const [cycle, setCycle] = useState<'month' | 'year'>('month');
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="ราคา" title="เลือกแพ็กเกจที่ใช่" highlight="ที่ใช่" />
      <div className="mt-8 flex justify-center">
        <SegmentedControl label="รอบบิล" value={cycle} onChange={setCycle} options={[{ value: 'month', label: 'รายเดือน' }, { value: 'year', label: 'รายปี (ลด 20%)' }]} />
      </div>
      <Reveal stagger className="mt-10 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = cycle === 'month' ? p.monthly : Math.round(p.monthly * 12 * 0.8);
          return (
            <RevealItem key={p.name} className={cn('rounded-3xl bg-surface p-7 shadow-card', p.popular && 'ring-2 ring-brand-500')}>
              {p.popular && <span className="mb-3 inline-block rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-link">ยอดนิยม</span>}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-3 text-4xl font-bold tabular-nums">฿{price.toLocaleString()}<span className="text-sm font-normal text-ink-mute">/{cycle === 'month' ? 'เดือน' : 'ปี'}</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok-600" />{f}</li>)}
              </ul>
              <Link href="/signup" className={cn('mt-7 inline-flex h-11 w-full items-center justify-center rounded-pill text-sm font-semibold', p.popular ? 'bg-brand-600 text-white' : 'bg-ink/[0.06] text-ink')}>เลือกแพ็กเกจนี้</Link>
            </RevealItem>
          );
        })}
      </Reveal>
    </section>
  );
}
```

### ฟอร์มติดต่อเรา

```tsx
// src/app/(site)/ContactForm.tsx
'use client';

import { useState } from 'react';
import { Field, Input, Textarea } from '@/components/ui';
import { Select } from '@/components/Select';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { toast } from '@/components/feedback';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'sales', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const set = (k: keyof typeof form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!form.name.trim()) err.name = 'กรุณากรอกชื่อ';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) err.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (form.message.trim().length < 10) err.message = 'พิมพ์ข้อความอย่างน้อย 10 ตัวอักษร';
    setErrors(err);
    if (Object.keys(err).length) return;
    setStatus('loading');
    try {
      await fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      setStatus('success');
      toast.success('ส่งข้อความแล้ว', { description: 'ทีมงานจะติดต่อกลับภายใน 1 วันทำการ' });
      setForm({ name: '', email: '', topic: 'sales', message: '' });
    } catch {
      setStatus('error');
      toast.error('ส่งไม่สำเร็จ ลองอีกครั้ง');
    }
    setTimeout(() => setStatus('idle'), 1500);
  }

  return (
    <form noValidate onSubmit={submit} className="mx-auto grid max-w-xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อ" error={errors.name}><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="อีเมล" error={errors.email}><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
      </div>
      <Field label="เรื่อง" as="div">
        <Select value={form.topic} onChange={(e) => set('topic', e.target.value)}>
          <option value="sales">สอบถามราคา</option>
          <option value="support">แจ้งปัญหาการใช้งาน</option>
          <option value="other">อื่นๆ</option>
        </Select>
      </Field>
      <Field label="ข้อความ" error={errors.message}><Textarea rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} /></Field>
      <LoadingButton type="submit" status={status} loadingText="กำลังส่ง" successText="ส่งแล้ว">ส่งข้อความ</LoadingButton>
    </form>
  );
}
```

### อื่นๆ ที่ประกอบได้

| ต้องการ | ประกอบจาก |
|---|---|
| รายการบทความ/ข่าว | `Reveal stagger` + การ์ด (`Card`) + `Chip` หมวด · หน้าแรกเด่นใช้ `Carousel` |
| ผลงาน/พอร์ตโฟลิโอ | `MediaGallery` (กดดูเต็มจอ) หรือ `Carousel perView={{0:1,768:2,1200:3}}` |
| ทีมงาน | `Avatar` หรือรูปจริง + `Reveal stagger` |
| เมนูอาหาร/รายการสินค้าหน้าร้าน | `Tabs` (หมวด) + กริดการ์ด + `ZoomImage` |
| แบนเนอร์โปรโมชันหมุน | `Carousel autoplay={5000}` + รูปใส่คลาส `kenburns` |
| แถบประกาศบนสุด | `Marquee` (ข้อความยาว) หรือ div ธรรมดา |
| ปุ่มแชร์บทความ | `ShareButtons` |
| ปุ่ม LINE ลอยมุมจอ | `ExpandButton href="https://line.me/…" className="bg-[#06C755] text-white"` (สีแบรนด์ภายนอกใส่ hex ได้) |
