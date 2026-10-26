# การนำทาง · โครงหน้า · ปุ่มลัด

props ครบ: [docs/api/03-navigation.md](../../api/03-navigation.md)

## AppShell

โครงหลังบ้านครบชุด: sidebar (พับได้ จำค่าในเครื่อง · ตอนพับชี้แล้วขึ้นชื่อ) · จอ < 1024px เป็น drawer ☰ · topbar (ปุ่ม ⌘K · `actions` · สลับธีม · เมนูผู้ใช้) · skip link · ตั้งตัวแปร `--shell-w` (ความกว้าง sidebar) ให้ของที่ `fixed` เว้นที่ได้

ตัวอย่างเต็ม: [สูตร 2](../04-page-recipes.md#2-โครงหลังบ้าน-appshell--k) · ของจริง `src/app/demo/(app)/DemoShell.tsx`

| prop | หมายเหตุ |
|---|---|
| `nav: NavGroup[]` | `{ label?, items: { href, label, icon, badge?, match? }[] }` · หน้าแรก (`/admin`) ใส่ `match: 'exact'` ไม่งั้นไฮไลต์ทุกหน้า |
| `user` | `{ name, email?, role?, seed? }` · `seed` = เลขคงที่ของผู้ใช้ (สี avatar) |
| `onCommand` | มีค่า = แสดงปุ่มค้นหา ⌘K → เปิด `CommandPalette` (ผูกคีย์ด้วย `useCommandHotkey` เอง) |
| `actions` | ปุ่มเพิ่มใน topbar (กระดิ่ง = `DropdownMenu`) |
| `userMenu` | รายการเพิ่มในเมนูผู้ใช้ก่อน "ออกจากระบบ" |

ข้อควรระวัง
- วางใน `layout.tsx` ของกลุ่มหน้า ไม่ใช่ในแต่ละ page (จะ mount ใหม่ทุกครั้งที่เปลี่ยนหน้า → sidebar กระพริบ)
- ไอคอนเมนูใช้ `lucide-react` ขนาด 18 · ชื่อเมนูสั้น 1–2 คำ
- แถบ/ปุ่มที่ `fixed bottom-0` ในหน้า ให้ใส่ `lg:pl-[var(--shell-w,0px)]` (ดูแถบบันทึกในสูตรฟอร์ม)
- หน้าบ้านไม่ใช้ AppShell → `SiteNav` ([blocks.md](./blocks.md))

## Tabs

**ใช้เมื่อ:** สลับเนื้อหาหลายส่วนในหน้าเดียว / กรองตามสถานะพร้อมตัวเลข · **ไม่ใช้เมื่อ:** เป็นตัวเลือกค่าของฟอร์ม (→ `SegmentedControl` / `RadioGroup`)

```tsx
'use client';

import { useState } from 'react';
import { Tabs } from '@/components/Tabs';

type Tab = 'overview' | 'orders' | 'notes';

export function CustomerTabs() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <div>
      <Tabs<Tab>
        aria-label="ข้อมูลลูกค้า" value={tab} onChange={setTab}
        items={[{ key: 'overview', label: 'ภาพรวม' }, { key: 'orders', label: 'คำสั่งซื้อ', count: 12 }, { key: 'notes', label: 'บันทึก' }]}
      />
      <div role="tabpanel" className="pt-5">
        {tab === 'overview' && <p>ภาพรวม…</p>}
        {tab === 'orders' && <p>คำสั่งซื้อ…</p>}
        {tab === 'notes' && <p>บันทึก…</p>}
      </div>
    </div>
  );
}
```

- แท็บที่เป็นตัวกรองของรายการ ให้เก็บค่าใน URL (`?status=…`) แบบ [สูตร 3](../04-page-recipes.md#3-หน้ารายการ-ค้นหา--กรอง--ตาราง)
- `count: undefined` = ไม่แสดงตัวเลข (ใช้ตอนกำลังโหลด)

## Breadcrumb

```tsx
import { Home } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';

export function ProductCrumb({ name }: { name: string }) {
  return (
    <Breadcrumb items={[
      { label: 'หน้าแรก', href: '/admin', icon: <Home size={14} /> },
      { label: 'สินค้า', href: '/admin/products' },
      { label: 'นม', href: '/admin/products?cat=milk' },
      { label: name }, // ตัวสุดท้าย = หน้าปัจจุบัน ไม่ต้องมี href
    ]} />
  );
}
```

- ส่วนใหญ่วางใน `AdminPageHeader breadcrumb={…}`
- ยาวเกิน `maxItems` (4) ยุบกลางเป็น … · จอแคบย่อเป็น "… › หน้าแม่ › หน้าปัจจุบัน" เอง

## Stepper

แสดงขั้นตอนอย่างเดียว — ไม่คุมฟอร์ม · ตัวอย่างฟอร์มหลายขั้นเต็ม: [สูตร 6](../04-page-recipes.md#6-ฟอร์มหลายขั้น-stepper)

```tsx
import { Stepper } from '@/components/Stepper';

export function ShipmentStatus({ stage, failed }: { stage: number; failed?: boolean }) {
  return (
    <Stepper
      orientation="vertical" current={stage}
      steps={[
        { title: 'ได้รับคำสั่งซื้อ', description: '24 ต.ค. 09:12' },
        { title: 'กำลังแพ็ก' },
        { title: 'กำลังจัดส่ง', error: failed, description: failed ? 'ติดต่อผู้รับไม่ได้' : undefined },
        { title: 'ส่งถึงแล้ว' },
      ]}
    />
  );
}
```

- `current` เริ่ม 0 · `current === steps.length` = เสร็จครบทุกขั้น
- `onStepClick` → กดย้อนขั้นที่ผ่านแล้วได้ · `clickable="all"` กดข้ามไปข้างหน้าได้ด้วย
- `vertical` + `content` ในแต่ละ step = เนื้อหาใต้ขั้นปัจจุบัน
- ขั้นตอนการใช้งานบน landing ใช้บล็อก `Steps` (คนละตัว)

## Accordion · Collapse

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Accordion, Collapse } from '@/components/Accordion';

export function FaqAndMore() {
  const [more, setMore] = useState(false);
  return (
    <div className="space-y-6">
      <Accordion
        type="single" variant="separated" headingLevel={3} defaultValue="ship"
        items={[
          { id: 'ship', title: 'จัดส่งกี่วัน?', content: 'กรุงเทพฯ 1 วัน ต่างจังหวัด 2–3 วันทำการ' },
          { id: 'return', title: 'คืนสินค้าได้ไหม?', subtitle: 'ภายใน 7 วัน', content: 'คืนได้ถ้ายังไม่เปิดใช้ พร้อมใบเสร็จ' },
        ]}
      />
      <div>
        <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-link">
          ตัวเลือกขั้นสูง <ChevronDown size={14} className={more ? 'rotate-180 transition' : 'transition'} />
        </button>
        <Collapse open={more}><div className="pt-3 text-sm">…ช่องตั้งค่าเพิ่มเติม…</div></Collapse>
      </div>
    </div>
  );
}
```

- `variant`: `card` (ใบเดียวมีเส้นคั่น) · `separated` (แยกใบ) · `flush` (ไม่มีพื้น — วางในการ์ดอื่น)
- `headingLevel` ให้ตรงกับโครงหัวข้อของหน้า (ใต้ h2 ใช้ 3)
- หน้า FAQ ของเว็บหน้าบ้าน → บล็อก `FaqSection`

## ThemeProvider · ThemeToggle · useTheme

- ต้องมี `ThemeProvider` + `THEME_INIT_SCRIPT` ใน root layout ([02-setup](../02-setup.md#3-root-layout))
- ค่าเริ่มต้นคือ **สว่าง** (ไม่ตามระบบเครื่อง) · ผู้ใช้เลือกแล้วจำใน localStorage
- `ThemeToggle` มีใน `AppShell` และ `SiteFooter` แล้ว · ต้องการเองที่อื่น: `<ThemeToggle />` หรือ `const { choice, setChoice } = useTheme()`
- โหมดมืดทำงานผ่าน `data-theme="dark"` ที่ `<html>` และตัวแปรสี — **ห้ามใช้คลาส `dark:`** ของ Tailwind (ไม่ได้ตั้ง darkMode) ใช้ token ที่เปลี่ยนเองแทน ([05-rules](../05-rules.md#สี-และโหมดมืด))

## PillSwitch

สวิตช์สองฝั่งแบบแคปซูล (ภาษา TH/EN · ☀/☾) — ตัวอย่างปุ่มสลับภาษา: [02-setup](../02-setup.md#5-ภาษา-i18n)

## ปุ่มลัดคีย์บอร์ด (Kbd · useShortcut · useShortcutLabel)

ทุกปุ่มลัดเขียนแบบ `'mod+<ปุ่ม>'` — `mod` = ⌘ บน Mac · Ctrl บน Windows/Linux

```tsx
'use client';

import { useState } from 'react';
import { Kbd, useShortcut, useShortcutLabel } from '@/components/Kbd';
import { Button } from '@/components/ui';
import { toast } from '@/components/feedback';

export function Editor() {
  const [text, setText] = useState('');
  const saveLabel = useShortcutLabel('mod+S'); // "⌘S" หรือ "Ctrl+S"
  useShortcut('s', () => toast.success('บันทึกแล้ว')); // ผูก ⌘S / Ctrl+S และกันเบราว์เซอร์เปิด "บันทึกหน้าเว็บ"
  useShortcut('enter', () => toast.info('ส่งแล้ว'), text.length > 0); // อาร์กิวเมนต์ที่ 3 = เปิด/ปิดการฟัง
  return (
    <div className="space-y-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-ink/15 bg-surface p-3" />
      <div className="flex items-center gap-3 text-sm text-ink-mute">
        <Button size="sm" title={`บันทึก (${saveLabel})`}>บันทึก</Button>
        กด <Kbd keys="mod+Enter" /> เพื่อส่ง
      </div>
    </div>
  );
}
```

ข้อควรระวัง
- **ห้ามเขียน "Ctrl+K" ตายตัว** ในข้อความ — ใช้ `<Kbd keys="mod+K">` / `useShortcutLabel` (Mac ต้องเห็น ⌘K)
- **ห้ามเช็ก `e.ctrlKey || e.metaKey` เอง** — ใช้ `useShortcut` หรือ `isModEvent(e, mac)` จาก `@/lib/platform` (Mac ไม่นับ Ctrl · Windows ไม่นับปุ่ม Win · กด Alt ร่วมไม่นับ)
- `useShortcut` รับปุ่มเดียวตามหลัง mod (`'s'`, `'k'`, `'enter'`) และ **ไม่ทำงานเมื่อกด Shift ร่วม** — ต้องการ `mod+shift+…` ให้ฟัง `keydown` เองโดยใช้ `isModEvent` + `e.shiftKey`
- ⌘K ใช้ `useCommandHotkey` (มีอยู่แล้ว ไม่ต้องผูกเอง)
- เลี่ยงปุ่มที่เบราว์เซอร์จองไว้และกันไม่ได้: `mod+W` `mod+T` `mod+N` (บางเบราว์เซอร์) `mod+Q`
