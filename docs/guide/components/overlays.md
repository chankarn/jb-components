# หน้าต่างลอย · การแจ้งผล · เมนู

props ครบ: [docs/api/02-overlays.md](../../api/02-overlays.md)

## เลือกตัวไหนดี

| สถานการณ์ | ใช้ |
|---|---|
| บอกผลหลังทำอะไรเสร็จ (ไม่ต้องตอบ) | `toast` |
| ถามใช่/ไม่ใช่ก่อนทำสิ่งที่ย้อนไม่ได้ | `confirmDialog` |
| ฟอร์มสั้น 1–5 ช่อง / ข้อความที่ต้องอ่านก่อนไปต่อ | `Dialog` |
| รายละเอียดของแถว · ฟอร์มยาว · ตัวกรองบนมือถือ | `Drawer` |
| กล่องเล็กติดปุ่ม (ตัวกรองด่วน การ์ดข้อมูล ฟอร์มสั้นมาก) | `Popover` |
| รายการคำสั่งจากปุ่ม | `DropdownMenu` (ท้ายแถวตารางใช้ `RowMenu`) |
| ป้ายชื่อของปุ่มไอคอน | `Tooltip` |
| คำอธิบายยาวของช่องกรอก | `HelpTip` / `Field help` |
| ค้นหา + สั่งงานทั้งระบบ | `CommandPalette` |

ทุกตัว: Esc ปิดทีละชั้น (ชั้นบนสุดก่อน) · คืนโฟกัสที่ปุ่มเปิด · วาดผ่าน portal (ไม่ถูกตัดโดย `overflow-hidden`) · พลิกด้านเองเมื่อพื้นที่ไม่พอ

---

## toast

ต้องมี `<FeedbackHost />` ใน root layout ครั้งเดียว ([02-setup](../02-setup.md#3-root-layout)) แล้วเรียกจากที่ไหนก็ได้ (ไม่ต้องใช้ hook)

```tsx
'use client';

import { Button } from '@/components/ui';
import { toast } from '@/components/feedback';

async function saveDraft(): Promise<{ title: string }> {
  await new Promise((r) => setTimeout(r, 800));
  return { title: 'บทความใหม่' };
}

export function ToastExamples() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success('บันทึกแล้ว')}>สำเร็จ</Button>
      <Button variant="outline" onClick={() => toast.error('ลบไม่ได้', { description: 'มีคำสั่งซื้อที่ใช้สินค้านี้อยู่' })}>ผิดพลาด</Button>
      <Button variant="outline" onClick={() => toast.warning('สต็อกใกล้หมด', { duration: 8000 })}>เตือน</Button>
      <Button variant="outline" onClick={() => toast.info('ย้ายไปถังขยะแล้ว', { action: { label: 'เลิกทำ', onClick: () => toast.success('กู้คืนแล้ว') } })}>มีปุ่มเลิกทำ</Button>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            const doc = await toast.promise(saveDraft(), { loading: 'กำลังบันทึก…', success: (d) => `บันทึก "${d.title}" แล้ว`, error: 'บันทึกไม่สำเร็จ' });
            console.log(doc);
          } catch {
            /* toast.promise คืน promise เดิม — ต้อง catch เองไม่งั้นเป็น unhandled rejection */
          }
        }}
      >
        promise
      </Button>
      <Button variant="ghost" onClick={() => {
        const id = toast.loading('กำลังส่งออกไฟล์…', { duration: Infinity });
        setTimeout(() => toast.update(id, { kind: 'success', message: 'ส่งออกเสร็จแล้ว' }), 1500);
      }}>อัปเดตทีหลัง</Button>
    </div>
  );
}
```

ข้อควรระวัง
- ข้อความสั้น ขึ้นต้นด้วยผล ("บันทึกแล้ว" ไม่ใช่ "ระบบได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว") · รายละเอียดใส่ `description`
- error ที่ผู้ใช้ต้องแก้ในฟอร์ม → แสดงใต้ช่องด้วย `Field error` (toast แค่สรุป)
- แสดงพร้อมกันได้ 4 อัน · `duration: Infinity` = ค้างจนกดปิด · ใช้ใน server component ไม่ได้ (เรียกจาก client เท่านั้น)

## confirmDialog

```tsx
'use client';

import { Button } from '@/components/ui';
import { confirmDialog, toast } from '@/components/feedback';

export function DeleteButton({ name, onDelete }: { name: string; onDelete: () => Promise<void> }) {
  return (
    <Button
      variant="danger"
      onClick={async () => {
        const ok = await confirmDialog(`ลบ "${name}"?`, { danger: true, confirmLabel: 'ลบ', description: 'การลบย้อนกลับไม่ได้' });
        if (!ok) return;
        await onDelete();
        toast.success('ลบแล้ว', { description: name });
      }}
    >
      ลบ
    </Button>
  );
}
```

- ปุ่มยืนยันเขียนเป็น **กริยาที่จะเกิด** ("ลบสินค้า", "ออกจากระบบ") ไม่ใช่ "ตกลง"
- `danger: true` สำหรับการลบ/ทิ้งข้อมูล (ปุ่มแดง ไอคอนเตือน)
- ต้องการช่องกรอกยืนยัน (พิมพ์ชื่อเพื่อยืนยัน) → ทำ `Dialog variant="alert" tone="danger"` เอง

## Dialog

```tsx
'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';
import { Select } from '@/components/Select';
import { Dialog } from '@/components/Overlay';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { toast } from '@/components/feedback';

export function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<LoadingStatus>('idle');

  async function send() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError('รูปแบบอีเมลไม่ถูกต้อง'); return; }
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 700)); // await api.invite(email, role)
    setStatus('idle');
    setOpen(false);
    setEmail('');
    toast.success('ส่งคำเชิญแล้ว', { description: email });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><UserPlus size={16} /> เชิญสมาชิก</Button>
      <Dialog
        open={open} onClose={() => setOpen(false)} title="เชิญสมาชิก" description="ส่งลิงก์เข้าร่วมทีมทางอีเมล"
        icon={<UserPlus size={20} />} size="sm"
        dismissible={status !== 'loading'} // ระหว่างส่งห้ามปิด
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={status === 'loading'}>ยกเลิก</Button>
            <LoadingButton status={status} loadingText="กำลังส่ง" onClick={() => void send()}>ส่งคำเชิญ</LoadingButton>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="space-y-4">
          <Field label="อีเมล" error={error}>
            <Input type="email" autoFocus value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} />
          </Field>
          <Field label="สิทธิ์" as="div">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">พนักงาน</option>
              <option value="admin">ผู้ดูแล</option>
            </Select>
          </Field>
        </form>
      </Dialog>
    </>
  );
}
```

| prop | ใช้เมื่อ |
|---|---|
| `size` | `sm` ฟอร์ม 1–2 ช่อง · `md` (ค่าตั้งต้น) · `lg`/`xl` ตาราง/ตัวอย่าง |
| `icon` + `tone` | ไอคอนในกรอบสีที่หัว (`brand` · `success` · `danger`) |
| `variant="alert"` | กล่องยืนยันไอคอนใหญ่กลาง ปุ่มเต็มแถว (`role="alertdialog"`) |
| `dismissible={false}` | ปิดด้วย Esc/คลิกนอก/ปัดลงไม่ได้ และไม่มีปุ่ม × → **ต้องมีปุ่มใน footer ที่ปิดได้** |

ข้อควรระวัง
- เนื้อหายาว/รายการที่ต้องเลื่อน → `Drawer` แทน
- อย่าเปิด Dialog ซ้อน Dialog ถ้าเลี่ยงได้ (ถ้าจำเป็น ระบบรองรับ: Esc ปิดชั้นบนก่อน)
- มือถือกลายเป็น bottom sheet เอง ไม่ต้องทำเวอร์ชันมือถือแยก

## Drawer

```tsx
'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button, Field } from '@/components/ui';
import { Drawer } from '@/components/Overlay';
import { Checkbox } from '@/components/Choice';
import { Slider } from '@/components/Slider';

export function FilterDrawer({ onApply }: { onApply: (f: { inStock: boolean; price: [number, number] }) => void }) {
  const [open, setOpen] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [price, setPrice] = useState<[number, number]>([0, 2000]);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><SlidersHorizontal size={14} /> ตัวกรอง</Button>
      <Drawer
        open={open} onClose={() => setOpen(false)} title="ตัวกรอง" side="right" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setInStock(false); setPrice([0, 2000]); }}>ล้าง</Button>
            <Button onClick={() => { onApply({ inStock, price }); setOpen(false); }}>ใช้ตัวกรอง</Button>
          </>
        }
      >
        <div className="space-y-6">
          <Checkbox label="เฉพาะที่มีของ" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <Field label="ช่วงราคา" as="div">
            <Slider range label="ช่วงราคา" min={0} max={2000} step={50} value={price} onChange={setPrice} format={(v) => `฿${v}`} />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
```

- `side`: `right` (ค่าตั้งต้น · รายละเอียด/ฟอร์ม) · `left` (เมนู) · `bottom` (แผงตัวเลือกบนมือถือ)
- ตัวอย่างรายละเอียดแถว: [สูตร 8](../04-page-recipes.md#8-รายละเอียดใน-drawer)

## Popover

```tsx
'use client';

import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui';
import { Popover } from '@/components/Popover';

export function SnoozeButton({ onSnooze }: { onSnooze: (hours: number) => void }) {
  return (
    <Popover
      label="เลื่อนการแจ้งเตือน" side="bottom" align="end"
      trigger={<Button variant="outline" size="sm"><CalendarClock size={14} /> เลื่อน</Button>}
    >
      {(close) => (
        <div className="w-48 space-y-1 p-2">
          {[1, 3, 24].map((h) => (
            <button key={h} type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ink/[0.05]" onClick={() => { onSnooze(h); close(); }}>
              {h === 24 ? 'พรุ่งนี้' : `${h} ชั่วโมง`}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
```

- `trigger` ต้องเป็น element เดียวที่รับ ref ได้ (`<button>`, `Button`) — ห้ามเป็น Fragment หรือข้อความ
- ส่ง `children` เป็นฟังก์ชันเพื่อได้ `close` · controlled ได้ด้วย `open` + `onOpenChange`
- เป็นรายการคำสั่งล้วน → `DropdownMenu` (มีคีย์บอร์ดแบบเมนูให้)

## DropdownMenu

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Download, FileSpreadsheet, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { DropdownMenu, type MenuEntry } from '@/components/DropdownMenu';

export function ExportMenu() {
  const [cols, setCols] = useState({ price: true, stock: true, sku: false });
  const items: MenuEntry[] = [
    { type: 'label', label: 'ส่งออก' },
    { label: 'Excel (.xlsx)', icon: <FileSpreadsheet size={15} />, onSelect: () => console.log('xlsx') },
    { label: 'PDF', icon: <FileText size={15} />, description: 'เหมาะกับการพิมพ์', onSelect: () => console.log('pdf') },
    { label: 'คัดลอกลิงก์', icon: <Copy size={15} />, shortcut: 'mod+shift+C', onSelect: () => console.log('copy') },
    { type: 'separator' },
    { type: 'label', label: 'คอลัมน์ที่แสดง' },
    { type: 'checkbox', label: 'ราคา', checked: cols.price, onCheckedChange: (v) => setCols((c) => ({ ...c, price: v })) },
    { type: 'checkbox', label: 'สต็อก', checked: cols.stock, onCheckedChange: (v) => setCols((c) => ({ ...c, stock: v })) },
    { type: 'separator' },
    { label: 'ลบทั้งหมด', icon: <Trash2 size={15} />, danger: true, onSelect: () => console.log('delete') },
  ];
  return <DropdownMenu align="end" items={items} trigger={<Button variant="outline" size="sm"><Download size={14} /> ส่งออก <ChevronDown size={14} /></Button>} />;
}
```

- `shortcut` เขียนแบบ `'mod+…'` แสดงตามระบบ (⌘ / Ctrl) — **แสดงอย่างเดียว** ต้องผูกคีย์เองด้วย `useShortcut`
- `href` = รายการเป็นลิงก์ · `checkbox` กดแล้วเมนูไม่ปิด
- เมนูท้ายแถวตาราง: `RowMenu` (หุ้ม DropdownMenu ไว้ให้ คลิกไม่ลามเป็นคลิกแถว)

## Tooltip

```tsx
'use client';

import { Pencil } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { Kbd } from '@/components/Kbd';

export function EditIconButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip content={<span className="flex items-center gap-2">แก้ไข <Kbd keys="mod+E" variant="text" /></span>}>
      <button type="button" aria-label="แก้ไข" onClick={onClick} className="grid size-9 place-items-center rounded-lg hover:bg-ink/[0.06]">
        <Pencil size={16} />
      </button>
    </Tooltip>
  );
}
```

- ปุ่มไอคอนยังต้องมี `aria-label` เอง (tooltip เป็นคำอธิบายเสริม)
- จอสัมผัสไม่แสดง tooltip → ข้อมูลที่ผู้ใช้ต้องรู้ห้ามอยู่ใน tooltip อย่างเดียว
- ปุ่ม `disabled` ไม่ส่ง event เมาส์ → ครอบ `<span tabIndex={0}>` ก่อนส่งเข้า Tooltip

## CommandPalette

ดูการต่อกับ `AppShell` ที่ [สูตร 2](../04-page-recipes.md#2-โครงหลังบ้าน-appshell--k) · ใช้นอก AppShell ก็ได้:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search } from 'lucide-react';
import { CommandPalette, useCommandHotkey, type CommandItem } from '@/components/CommandPalette';
import { Kbd } from '@/components/Kbd';

export function DocsSearch({ pages }: { pages: { slug: string; title: string; section: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useCommandHotkey(() => setOpen((o) => !o));
  const items: CommandItem[] = pages.map((p) => ({
    id: p.slug, group: p.section, label: p.title, icon: <FileText size={16} />, onSelect: () => router.push(`/docs/${p.slug}`),
  }));
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-pill bg-ink/[0.05] px-4 py-2 text-sm text-ink-mute">
        <Search size={15} /> ค้นหาเอกสาร <Kbd keys="mod+K" />
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} placeholder="ค้นหาเอกสาร…" limit={{ เริ่มต้น: 5 }} />
    </>
  );
}
```

- กลุ่มเรียงตามลำดับที่เจอครั้งแรกใน `items` · `keywords` = คำค้นเพิ่ม (ไม่แสดง)
- ค้นจาก server: `onQueryChange={(q) => …}` + `loading` แล้วอัปเดต `items`

## HelpTip

```tsx
import { HelpTip } from '@/components/HelpTip';

export function MarginLabel() {
  return (
    <span className="inline-flex items-center gap-1">
      กำไรขั้นต้น <HelpTip text="ราคาขายลบต้นทุน หารด้วยราคาขาย คิดเป็นเปอร์เซ็นต์ ไม่รวมค่าขนส่งและภาษี" />
    </span>
  );
}
```

ใน `Field` ใช้ `help="…"` แทนได้เลย (วางไอคอน ? ให้ที่หัวช่อง)

## ทำหน้าต่าง/กล่องลอยแบบใหม่เอง (กรณีหายาก)

ถ้าต้องการหน้าตาที่ Dialog/Drawer/Popover ไม่รองรับจริงๆ ให้ใช้ hook กลาง **อย่าเขียน focus trap / Esc / ตำแหน่งเอง**:

| ต้องการ | ใช้ |
|---|---|
| หน้าต่างเต็มจอแบบใหม่ (lightbox, onboarding) | `useModal(open, onClose, panelRef, dismissible)` จาก `@/components/Overlay` — ได้ Esc ทีละชั้น · focus trap · ล็อกเลื่อน · คืนโฟกัส |
| กล่องลอยติดปุ่มแบบใหม่ | `useFloating(open, anchorRef, { side, align })` + `useDismiss` + `<Floating>` จาก `@/components/Popover` |

กล่องลอยที่ทำเองต้องมี attribute `data-floating` ที่กล่องนอกสุด (ให้ dialog/popover ที่ครอบอยู่รู้ว่าคลิกในกล่องนี้ไม่ใช่ "คลิกข้างนอก") — `<Floating>` ใส่ให้แล้ว
