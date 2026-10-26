# แสดงข้อมูล · หลังบ้าน · สถานะโหลด

props ครบ: [docs/api/04-data.md](../../api/04-data.md) · ของจริง: `src/app/demo/(app)/products/ProductList.tsx`, `DemoHome.tsx`

## ชุดหน้ารายการ: DataTable · Toolbar · FilterSelect · Pagination · RowMenu

ตัวอย่างหน้าเต็ม (ตัวกรองใน URL · ลบแล้วเลิกทำ · ว่าง/โหลด): [สูตร 3](../04-page-recipes.md#3-หน้ารายการ-ค้นหา--กรอง--ตาราง) · แบบสั้น (ข้อมูลอยู่ฝั่ง client ทั้งหมด):

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, FilterSelect, Toolbar, type Column } from '@/components/admin/kit';
import { RowMenu } from '@/components/admin/RowMenu';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';

type Member = { id: number; name: string; email: string; role: 'admin' | 'staff'; status: 'active' | 'suspended' };

export function MemberTable({ members, onEdit, onRemove }: { members: Member[]; onEdit: (m: Member) => void; onRemove: (m: Member) => void }) {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const rows = useMemo(
    () => members.filter((m) => (role === 'all' || m.role === role) && (m.name + m.email).toLowerCase().includes(q.toLowerCase())),
    [members, q, role],
  );
  const columns: Column<Member>[] = [
    {
      key: 'name', header: 'สมาชิก',
      render: (m) => (
        <span className="flex items-center gap-3">
          <Avatar name={m.name} seed={m.id} size={32} muted={m.status === 'suspended'} />
          <span className="min-w-0"><span className="block truncate font-medium">{m.name}</span><span className="block truncate text-xs text-ink-mute">{m.email}</span></span>
        </span>
      ),
    },
    { key: 'role', header: 'สิทธิ์', className: 'w-28', render: (m) => (m.role === 'admin' ? 'ผู้ดูแล' : 'พนักงาน') },
    { key: 'status', header: 'สถานะ', className: 'w-28', render: (m) => <StatusBadge status={m.status} /> },
    {
      key: 'menu', header: '', className: 'w-12',
      render: (m) => <RowMenu items={[{ label: 'แก้ไข', icon: <Pencil size={15} />, onClick: () => onEdit(m) }, { label: 'ลบ', icon: <Trash2 size={15} />, danger: true, onClick: () => onRemove(m) }]} />,
    },
  ];
  return (
    <div className="space-y-4">
      <Toolbar q={q} onSearch={setQ} placeholder="ค้นหาชื่อหรืออีเมล…">
        <FilterSelect value={role} onChange={setRole} options={[{ value: 'all', label: 'ทุกสิทธิ์' }, { value: 'admin', label: 'ผู้ดูแล' }, { value: 'staff', label: 'พนักงาน' }]} />
      </Toolbar>
      <DataTable columns={columns} rows={rows} paginate={10} empty="ไม่พบสมาชิก" onRowClick={onEdit} />
    </div>
  );
}
```

| ตัว | สิ่งที่ต้องรู้ |
|---|---|
| `DataTable` | **ทุกแถวต้องมี `id: number`** · `rows={null/undefined}` + `loading` = โครงโหลด · `paginate={n}` แบ่งหน้าฝั่ง client · `onRowClick` ทั้งแถวกดได้ · ตารางกว้างขั้นต่ำ 720px (จอแคบเลื่อนแนวนอน) |
| `Column` | `{ key, header, className?, render(row) }` · `className` กำหนดความกว้าง/จัดชิด เช่น `'w-28 text-right'` |
| `Toolbar` | ช่องค้นหาที่หน่วงเวลาให้แล้ว (debounce 350ms) · **`onSearch` ต้องคงที่** (`setState` หรือ `useCallback`) ไม่งั้นนับเวลาใหม่ทุก render · `children` = ตัวกรองต่อท้าย · ค่า `q` เปลี่ยนจากภายนอก (ล้างตัวกรอง) ช่องจะตาม |
| `FilterSelect` | `options: {value,label}[]` · ใส่ "ทั้งหมด" เป็นตัวแรกเอง |
| `Pagination` | แบ่งหน้าฝั่ง server · `perPage` + `onPerPageChange` = เลือกจำนวนแถวต่อหน้าได้ |
| `RowMenu` | `{ label, icon?, onClick?, href?, danger?, hidden? }[]` · ใส่ในคอลัมน์สุดท้าย `className: 'w-12'` · คลิกไม่ลามเป็น `onRowClick` |

ไม่ใช้ `DataTable` เมื่อ: ต้องการเลือกหลายแถว · รวมเซลล์ · มีแถวสรุปท้าย · เรียงคอลัมน์โดยกดหัว → ใช้ `Table` ประกอบเอง

## Table (ประกอบเอง)

```tsx
'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/Choice';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/Table';

type Line = { id: number; name: string; qty: number; price: number };

export function OrderLines({ lines }: { lines: Line[] }) {
  const [picked, setPicked] = useState<number[]>([]);
  const all = picked.length === lines.length && lines.length > 0;
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return (
    <div className="overflow-x-auto rounded-card bg-surface shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox aria-label="เลือกทั้งหมด" size="sm" checked={all} indeterminate={picked.length > 0 && !all} onChange={(e) => setPicked(e.target.checked ? lines.map((l) => l.id) : [])} />
            </TableHead>
            <TableHead>สินค้า</TableHead>
            <TableHead className="w-20 text-right">จำนวน</TableHead>
            <TableHead className="w-28 text-right">รวม</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((l) => (
            <TableRow key={l.id}>
              <TableCell>
                <Checkbox aria-label={`เลือก ${l.name}`} size="sm" checked={picked.includes(l.id)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, l.id] : p.filter((x) => x !== l.id)))} />
              </TableCell>
              <TableCell>{l.name}</TableCell>
              <TableCell className="text-right tabular-nums">{l.qty}</TableCell>
              <TableCell className="text-right tabular-nums">฿{(l.qty * l.price).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="text-right font-semibold">ยอดรวม</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">฿{total.toLocaleString()}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
```

ตัวเลขในตารางใส่ `tabular-nums` + `text-right` เสมอ (หลักตรงกัน)

## หัวหน้า · การ์ด · กล่องข้อความ

```tsx
import { Plus, Wallet, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { AdminPageHeader, InfoNote, SectionCard, StatCard } from '@/components/admin/kit';
import { Breadcrumb } from '@/components/Breadcrumb';

export function PageParts() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'ภาพรวม', href: '/admin' }, { label: 'คอร์ส' }]} />}
        title="คอร์สเรียน" description="จัดการคอร์สและบทเรียน"
        stats={[{ label: 'ทั้งหมด', value: 8 }, { label: 'เผยแพร่', value: 6, tone: 'done' }, { label: 'ร่าง', value: 2, tone: 'warn' }]}
        actions={<Button size="sm"><Plus size={14} /> สร้างคอร์ส</Button>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="รายได้เดือนนี้" value={128400} format={(n) => `฿${n.toLocaleString()}`} icon={<Wallet size={16} />} delta={12.4} hint="เทียบเดือนก่อน" trend={[80, 92, 88, 104, 110, 128]} />
        <StatCard label="งานค้าง" value={7} tone="warn" delta={-20} deltaInverse hint="ลดลง = ดี" onClick={() => console.log('ไปหน้างานค้าง')} />
      </div>
      <SectionCard title="การตั้งค่าคอร์ส" hint="มีผลกับผู้เรียนใหม่เท่านั้น" icon={<Settings2 size={18} />} actions={<Button size="sm" variant="ghost">รีเซ็ต</Button>} collapsible>
        <InfoNote tone="tip" title="เคล็ดลับ">ตั้งวันหมดอายุคอร์สเพื่อกระตุ้นให้ผู้เรียนเรียนจบ</InfoNote>
      </SectionCard>
    </div>
  );
}
```

| ตัว | ใช้เมื่อ | หมายเหตุ |
|---|---|---|
| `AdminPageHeader` | หัวของทุกหน้าหลังบ้าน | `stats[].tone`: default · done · warn · danger |
| `StatCard` | ตัวเลขสรุปหลังบ้าน | ตัวเลขวิ่งขึ้นเมื่อ `value` เป็น number · `delta` % · `deltaInverse` เมื่อลด = ดี · `trend` เส้นจิ๋ว · `onClick` กดได้ · การ์ดในแถวสูงเท่ากันเอง |
| `KpiCard` (charts) | KPI แบบรายงาน (มี `unit`, `deltaLabel`, `goodWhen`) | ดู [charts.md](./charts.md) |
| `SectionCard` | กลุ่มช่องในฟอร์ม/หน้าตั้งค่า | `collapsible` + `defaultOpen` · `help` = ไอคอน ? ข้างหัวข้อ |
| `InfoNote` | หมายเหตุในหน้า | `tone`: info (เทา) · tip · success · warn · danger |
| `Card` (ui) | การ์ดเปล่าทั่วไป | `rounded-card bg-surface shadow-card` |

## ป้าย · ผู้ใช้ · ความคืบหน้า

```tsx
import { Chip, Progress } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { ProgressRing } from '@/components/ProgressRing';
import { AnimatedNumber } from '@/components/AnimatedNumber';

export function Badges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusBadge status="completed" />
      <StatusBadge status="overdue" />
      <Chip tone="brand">ใหม่</Chip>
      <Chip tone="mute">เก็บถาวร</Chip>
      <Avatar name="นภา ศรีสุข" seed={42} />
      <Progress percent={64} className="w-40" />
      <ProgressRing percent={80} size={56} />
      <AnimatedNumber value={12840} format={(n) => `฿${Math.round(n).toLocaleString()}`} className="text-2xl font-bold" />
    </div>
  );
}
```

- `StatusBadge` รู้จัก: `passed completed published active resolved sent` (เขียว) · `in_progress queued open draft` (อำพัน) · `not_started archived closed skipped` (เทา) · `overdue failed suspended` (แดง + ไอคอนสำหรับ overdue) — ข้อความแปลจาก dict `badge.<status>` · สถานะอื่นแสดงข้อความดิบสีเทา → เพิ่ม tone + คำแปลใน `StatusBadge.tsx` และ `dict.th.ts`/`dict.en.ts`
- `Chip tone`: `brand` · `dark` · `mute` · `done` — สีอื่นใส่ `className="bg-warn-50 text-warn-700"`
- `Avatar seed` ต้องคงที่ต่อคน (id) ไม่งั้นสีเปลี่ยนทุก render

## ว่าง · โหลด

| สถานการณ์ | ใช้ |
|---|---|
| โหลดครั้งแรก ยังไม่มีข้อมูล | `Skeleton` / `SkeletonText` ตามรูปทรงจริง (หรือ `DataTable loading`) |
| มีข้อมูลแล้ว กำลังโหลดใหม่ (เปลี่ยนตัวกรอง/หน้า) | `LoadingOverlay show` ห่อของเดิม |
| ปุ่มที่กดแล้วรอ | `LoadingButton status="loading"` |
| เปลี่ยนหน้า/งานเบื้องหลังทั้งหน้า | `TopProgress active` (วางครั้งเดียว) |
| ตัวหมุนในพื้นที่เล็ก | `Loader variant="ring" \| dots \| bars \| orbit \| pulse \| grid` |
| ไม่มีข้อมูล / ค้นไม่เจอ | `EmptyState` (ค้นไม่เจอ → ปุ่ม "ล้างตัวกรอง" · ยังไม่มีเลย → ปุ่ม "เพิ่ม…") |

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, Skeleton, SkeletonText } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay, TopProgress } from '@/components/Loading';

type Note = { id: number; title: string; body: string };

export function NotesPanel({ load }: { load: () => Promise<Note[]> }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [busy, setBusy] = useState(true);
  const refresh = () => { setBusy(true); void load().then((n) => { setNotes(n); setBusy(false); }); };
  useEffect(refresh, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TopProgress active={busy} />
      {notes === null ? (
        <Card className="space-y-3 p-5"><Skeleton className="h-5 w-40" /><SkeletonText lines={3} /></Card>
      ) : notes.length === 0 ? (
        <EmptyState card title="ยังไม่มีบันทึก" description="บันทึกช่วยให้ทีมรู้บริบทของลูกค้า" action={<Button size="sm"><Plus size={14} /> เพิ่มบันทึก</Button>} />
      ) : (
        <LoadingOverlay show={busy} label="กำลังโหลด">
          <Card className="divide-y divide-ink/[0.06]">
            {notes.map((n) => <div key={n.id} className="p-4"><p className="font-medium">{n.title}</p><p className="text-sm text-ink-soft">{n.body}</p></div>)}
          </Card>
          <Button size="sm" variant="ghost" className="mt-2" onClick={refresh}>รีเฟรช</Button>
        </LoadingOverlay>
      )}
    </>
  );
}
```

- `EmptyState card` เมื่ออยู่โดดๆ บนพื้นหน้า · ในการ์ด/ตารางอยู่แล้วไม่ต้องใส่ `card` · `size="sm"` ในกล่องเล็ก
- `TopProgress` โหลดเร็วกว่า 150ms ไม่แสดง (ไม่กระพริบ)

## ปุ่มพิเศษ

| ตัว | ใช้เมื่อ |
|---|---|
| `ShareButtons url?` | ปุ่มแชร์ LINE + Facebook (สิ่งที่โชว์ในโพสต์มาจาก Open Graph ของหน้า — ตั้ง `metadata.openGraph` ด้วย) |
| `ExpandButton icon label href?/onClick?` | ปุ่มกลมยืดเป็นแคปซูลตอนชี้ เช่น ปุ่ม LINE ลอยมุมจอ |
