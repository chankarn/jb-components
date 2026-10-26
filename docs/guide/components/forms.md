# ฟอร์มและช่องกรอก

props ครบ: [docs/api/01-forms.md](../../api/01-forms.md) · ตัวอย่างรันได้: Gallery (`/`) และ `src/app/demo/(app)/products/ProductForm.tsx`

## หลักของทุกช่อง

1. **ห่อด้วย `Field` เสมอ** — ได้ป้าย, `hint`, `error` (กรอบแดง + ไอคอน + ช่องสั่นตอน error ใหม่), `help` (ไอคอน ?)
2. **`Field as="div"`** เมื่อข้างในไม่ใช่ `<input>`/`<textarea>` เดี่ยวๆ (Combobox, Select, DatePicker, NumberInput, TagInput, RadioGroup, PasswordInput, ช่อง+ปุ่ม) — ถ้าเป็น `<label>` เบราว์เซอร์ส่งคลิกไปที่ปุ่มแรกข้างใน
3. **controlled ทั้งหมด** — คลังไม่เก็บค่าให้ (ยกเว้น `Checkbox`/`Switch` ที่ใช้ `defaultChecked` ได้แบบ input ปกติ)
4. **ชนิดค่าของแต่ละตัวไม่เหมือนกัน** — ดูตารางนี้ก่อนเขียน state:

| คอมโพเนนต์ | ชนิด `value` | `onChange` ได้อะไร |
|---|---|---|
| `Input` / `Textarea` | `string` | `ChangeEvent` → `e.target.value` |
| `Select` | `string \| number` | `ChangeEvent` → `e.target.value` (เหมือน `<select>`) |
| `Combobox` | `string \| null` | `string \| null` |
| `Combobox multiple` | `string[]` | `string[]` |
| `NumberInput` | `number \| null` | `number \| null` (ลบจนว่าง = `null` ไม่ใช่ 0) |
| `Slider` | `number` | `number` |
| `Slider range` | `[number, number]` | `[number, number]` |
| `DatePicker` | `string` `'YYYY-MM-DD'` (`''` = ยังไม่เลือก) | `string` |
| `DatePicker withTime` | `string` `'YYYY-MM-DDTHH:mm'` | `string` |
| `DateRangePicker` | `{ from, to } \| null` | `{ from, to } \| null` |
| `TagInput` | `string[]` | `string[]` |
| `RadioGroup` | `string \| null` | `string` |
| `SegmentedControl` | `V extends string` | `V` |
| `Checkbox` / `Switch` | `checked: boolean` | `ChangeEvent` → `e.target.checked` |
| `OtpInput` | `string` (ตัวเลข) | `string` |
| `PasswordInput` | `string` | `string` |
| `ImagePicker` | `string \| null` (asset key) | `string \| null` |
| `FileDrop` | (ไม่มี value) | `UploadedFile[]` ที่อัปโหลดเสร็จ |

---

## Field + Input + Textarea

**ใช้เมื่อ:** ข้อความทั่วไป · **ไม่ใช้เมื่อ:** ตัวเลข/เงิน (→ `NumberInput`), วันที่ (→ `DatePicker`), รหัสผ่าน (→ `PasswordInput`)

```tsx
'use client';

import { useState } from 'react';
import { Field, Input, Textarea } from '@/components/ui';

export function ProfileFields() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const error = name && name.trim().length < 2 ? 'ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร' : undefined;
  return (
    <div className="space-y-4">
      <Field label="ชื่อที่แสดง" hint="แสดงต่อสาธารณะ" error={error} help="ชื่อนี้จะแสดงบนรีวิวและความคิดเห็นของคุณ เปลี่ยนได้เดือนละครั้ง">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
      </Field>
      <Field label="แนะนำตัว" hint={`${bio.length}/280`}>
        <Textarea rows={3} maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} />
      </Field>
    </div>
  );
}
```

ข้อควรระวัง
- ข้อความ error บอก **วิธีแก้** ("รูปแบบอีเมลไม่ถูกต้อง เช่น name@company.com") ไม่ใช่ "invalid"
- error ที่มาจาก server ตอนโหลดหน้า: ส่ง `error` ได้เลย (ไม่สั่น — สั่นเฉพาะ error ที่เพิ่งเกิด)
- ไอคอนในช่อง: ห่อ `<div className="relative">` + ไอคอน `absolute left-4` + `Input className="pl-11"` (ดู LoginForm)
- `field="ชื่อ"` ใส่ `data-field` ให้เลื่อนไปหาช่องที่ผิดได้ ([สูตรฟอร์ม](../04-page-recipes.md#4-ฟอร์มเพิ่มแก้ไข))

## Select

**ใช้เมื่อ:** เลือก 1 จากรายการสั้น (≤ ~10) ที่ไม่ต้องค้น · **ไม่ใช้เมื่อ:** รายการยาว/ต้องค้น (→ `Combobox`), 2–5 ตัวเลือกที่ควรเห็นทั้งหมด (→ `RadioGroup` / `SegmentedControl`)

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { Select } from '@/components/Select';

export function SortSelect() {
  const [sort, setSort] = useState('newest');
  return (
    <Field label="เรียงตาม" as="div">
      <Select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="newest">ใหม่ล่าสุด</option>
        <option value="price-asc">ราคาต่ำ → สูง</option>
        <option value="price-desc">ราคาสูง → ต่ำ</option>
      </Select>
    </Field>
  );
}
```

- `variant="pill"` ในแถวตัวกรอง · `"compact"` ในตาราง · ตัวกรองหลังบ้านใช้ `FilterSelect` (ใน `admin/kit`) ที่รับ `options` เป็นอาร์เรย์แทน
- เมนูวาดผ่าน portal — ใช้ใน Dialog/Drawer/ตารางได้ไม่ถูกตัด

## Combobox

**ใช้เมื่อ:** รายการยาว · ต้องพิมพ์ค้น · เลือกหลายอัน · อยากให้ "เพิ่มตัวเลือกใหม่" ได้

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { Combobox, type ComboOption } from '@/components/Combobox';

const PEOPLE: ComboOption[] = [
  { value: 'u1', label: 'สมชาย ใจดี', description: 'ฝ่ายขาย', keywords: ['somchai'] },
  { value: 'u2', label: 'นภา ศรีสุข', description: 'ฝ่ายบัญชี', keywords: ['napa'] },
  { value: 'u3', label: 'กิตติ วงศ์ใหญ่', description: 'ฝ่ายคลัง', keywords: ['kitti'], disabled: true },
];

export function AssignFields() {
  const [owner, setOwner] = useState<string | null>(null);
  const [watchers, setWatchers] = useState<string[]>([]);
  const [labels, setLabels] = useState<ComboOption[]>([{ value: 'urgent', label: 'ด่วน' }]);
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div className="space-y-4">
      <Field label="ผู้รับผิดชอบ" as="div">
        <Combobox options={PEOPLE} value={owner} onChange={setOwner} placeholder="ค้นหาชื่อ" clearable />
      </Field>
      <Field label="ผู้ติดตาม" hint="สูงสุด 5 คน" as="div">
        <Combobox multiple options={PEOPLE} value={watchers} onChange={setWatchers} maxSelected={5} />
      </Field>
      <Field label="ป้ายกำกับ" hint="พิมพ์ชื่อใหม่แล้วกด Enter เพื่อสร้าง" as="div">
        <Combobox
          multiple options={labels} value={picked} onChange={setPicked}
          onCreate={(label) => {
            const value = `new-${Date.now()}`;
            setLabels((l) => [...l, { value, label }]); // ต้องเพิ่ม option เอง
            setPicked((p) => [...p, value]); // และเลือกให้เอง
          }}
        />
      </Field>
    </div>
  );
}
```

ข้อควรระวัง
- ค้นจาก `label` + `description` + `keywords` (ไม่สนตัวพิมพ์/วรรณยุกต์) — ใส่ชื่ออังกฤษ/รหัสใน `keywords`
- `onCreate` ไม่เพิ่ม option ให้อัตโนมัติ
- ข้อมูลหลักพัน+ ที่ต้องค้นจาก server: กรองฝั่ง server แล้วส่ง `options` ใหม่ตามคำค้น (ยังไม่มี prop `onSearch` — ห่อด้วย state ของคุณเอง)

## NumberInput

**ใช้เมื่อ:** จำนวน ราคา เปอร์เซ็นต์ · **ไม่ใช้เมื่อ:** เบอร์โทร/รหัสไปรษณีย์/เลขบัตร (เป็น "ข้อความที่เป็นตัวเลข" → `Input inputMode="numeric"`)

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { NumberInput } from '@/components/NumberInput';

export function PriceFields() {
  const [price, setPrice] = useState<number | null>(null);
  const [qty, setQty] = useState<number | null>(1);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="ราคา" as="div">
        <NumberInput aria-label="ราคา" value={price} onChange={setPrice} min={0} precision={2} prefix="฿" placeholder="0.00" />
      </Field>
      <Field label="จำนวน" as="div">
        <NumberInput aria-label="จำนวน" value={qty} onChange={setQty} min={1} max={99} suffix="ชิ้น" />
      </Field>
    </div>
  );
}
```

- ค่าออกเป็น `number | null` — ส่ง API ให้แปลง `null` ตามที่ backend ต้องการ (`?? 0` หรือไม่ส่ง)
- จัดรูปแบบ/บีบเข้าช่วง min–max ตอนออกจากช่อง (ระหว่างพิมพ์ไม่บังคับ)

## Checkbox · Radio · RadioGroup · Switch

| ตัว | ใช้เมื่อ |
|---|---|
| `Checkbox` | ติ๊กยอมรับ · เลือกหลายข้อ · ค่าที่มีผลหลังกดบันทึก |
| `RadioGroup` | เลือก 1 จาก 2–5 ที่ต้องเห็นทั้งหมด · `variant="card"` สำหรับแพ็กเกจ/วิธีจัดส่ง/วิธีชำระ |
| `Switch` | เปิด/ปิดที่ **มีผลทันที** (ตั้งค่า การแจ้งเตือน) |

```tsx
'use client';

import { useState } from 'react';
import { CreditCard, QrCode, Wallet } from 'lucide-react';
import { Field } from '@/components/ui';
import { Checkbox, RadioGroup, Switch } from '@/components/Choice';

const ITEMS = ['นม', 'ไข่', 'ขนมปัง'];

export function ChoiceExamples() {
  const [agree, setAgree] = useState(false);
  const [picked, setPicked] = useState<string[]>(['นม']);
  const [pay, setPay] = useState<string | null>('qr');
  const [notify, setNotify] = useState(true);
  const all = picked.length === ITEMS.length;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Checkbox
          label="เลือกทั้งหมด" checked={all} indeterminate={picked.length > 0 && !all}
          onChange={(e) => setPicked(e.target.checked ? ITEMS : [])}
        />
        {ITEMS.map((it) => (
          <Checkbox key={it} label={it} checked={picked.includes(it)}
            onChange={(e) => setPicked((p) => (e.target.checked ? [...p, it] : p.filter((x) => x !== it)))} />
        ))}
      </div>

      <Field label="วิธีชำระเงิน" as="div">
        <RadioGroup
          variant="card" value={pay} onChange={setPay}
          options={[
            { value: 'qr', label: 'พร้อมเพย์', description: 'สแกน QR', icon: <QrCode size={18} /> },
            { value: 'card', label: 'บัตรเครดิต', description: 'Visa / Mastercard', icon: <CreditCard size={18} /> },
            { value: 'cod', label: 'เก็บเงินปลายทาง', description: '+฿20', icon: <Wallet size={18} />, disabled: true },
          ]}
        />
      </Field>

      <Switch className="w-full" placement="start" label="แจ้งเตือนทางอีเมล" description="เมื่อมีคำสั่งซื้อใหม่" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
      <Checkbox label="ยอมรับข้อกำหนดการใช้งาน" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
    </div>
  );
}
```

ข้อควรระวัง
- `Checkbox`/`Switch` มี `<label>` ของตัวเองอยู่แล้ว — **อย่าห่อด้วย `Field` แบบ label** (label ซ้อน label) · ถ้าต้องมีหัวข้อกลุ่มใช้ `Field as="div"`
- `RadioGroup` ใน `Field` ไม่ต้องใส่ `label` ซ้ำ · ไม่มี Field → ใส่ `label` ให้ screen reader
- แถวตั้งค่า: `Switch placement="start" className="w-full"` (ชื่อซ้าย สวิตช์ชิดขวา)

## SegmentedControl

**ใช้เมื่อ:** 2–5 ตัวเลือกสั้นๆ สลับมุมมอง/ช่วงเวลา · **ไม่ใช้เมื่อ:** เป็นการนำทางระหว่างเนื้อหาหลายส่วน (→ `Tabs`)

```tsx
'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';

export function ViewSwitch() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [range, setRange] = useState<'d' | 'w' | 'm'>('w');
  return (
    <div className="flex flex-wrap gap-3">
      <SegmentedControl label="ช่วงเวลา" value={range} onChange={setRange} options={[{ value: 'd', label: 'วัน' }, { value: 'w', label: 'สัปดาห์' }, { value: 'm', label: 'เดือน' }]} />
      {/* ไอคอนอย่างเดียว ต้องมี aria-label ที่ตัวเลือก */}
      <SegmentedControl size="sm" label="มุมมอง" value={view} onChange={setView}
        options={[{ value: 'grid', label: null, icon: <LayoutGrid size={16} />, 'aria-label': 'การ์ด' }, { value: 'list', label: null, icon: <List size={16} />, 'aria-label': 'รายการ' }]} />
    </div>
  );
}
```

## Slider

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { Slider } from '@/components/Slider';

export function PriceRange() {
  const [range, setRange] = useState<[number, number]>([200, 1500]);
  const [volume, setVolume] = useState(40);
  return (
    <div className="space-y-6">
      <Field label={`ช่วงราคา ฿${range[0].toLocaleString()} – ฿${range[1].toLocaleString()}`} as="div">
        <Slider range label="ช่วงราคา" min={0} max={3000} step={50} minGap={100} value={range} onChange={setRange}
          onCommit={(v) => console.log('ค้นหาใหม่', v)} format={(v) => `฿${v.toLocaleString()}`} />
      </Field>
      <Slider label="ระดับเสียง" min={0} max={100} value={volume} onChange={setVolume} marks={[0, 50, 100].map((v) => ({ value: v, label: `${v}%` }))} />
    </div>
  );
}
```

- `onChange` เรียกทุกการขยับ (อัปเดตป้าย) · `onCommit` เรียกตอนปล่อย (ยิง API ตรงนี้)

## DatePicker · DateRangePicker

**ใช้แทน `<input type="date">` เสมอ** · ค่าเป็นสตริง ISO ค.ศ. แม้หน้าจอไทยแสดง พ.ศ.

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { DatePicker } from '@/components/DatePicker';
import { DateRangePicker, type DateRange } from '@/components/DateRangePicker';

export function DateFields() {
  const [due, setDue] = useState(''); // '' = ยังไม่เลือก
  const [meeting, setMeeting] = useState('2026-10-24T14:30');
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <div className="space-y-4">
      <Field label="กำหนดส่ง" as="div"><DatePicker value={due} onChange={setDue} min="2026-10-24" clearable /></Field>
      <Field label="นัดประชุม" as="div"><DatePicker value={meeting} onChange={setMeeting} withTime /></Field>
      <Field label="ช่วงรายงาน" hint="ไม่เกิน 90 วัน" as="div">
        <DateRangePicker value={range} onChange={setRange} maxDays={90} presets={['last7', 'last30', 'thisMonth']} clearable />
      </Field>
    </div>
  );
}
```

- แปลงเป็น `Date`: `new Date(value)` (`'YYYY-MM-DD'` = เที่ยงคืน UTC — ถ้าต้องการเวลาท้องถิ่นใช้ `parseYmd` จาก `@/lib/calendar`)
- `presets` ที่มี: `'today' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth'` ("7 วัน" นับรวมวันนี้) · `presets={false}` ซ่อน

## TagInput

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { TagInput } from '@/components/TagInput';

export function InviteEmails() {
  const [emails, setEmails] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(['ขายดี']);
  return (
    <div className="space-y-4">
      <Field label="อีเมลผู้รับ" hint="วางหลายอีเมลพร้อมกันได้ (คั่นด้วย comma หรือขึ้นบรรทัดใหม่)" as="div">
        <TagInput aria-label="อีเมลผู้รับ" value={emails} onChange={setEmails} max={20}
          validate={(t) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)} invalidText="รูปแบบอีเมลไม่ถูกต้อง" transform={(t) => t.toLowerCase()} />
      </Field>
      <Field label="แท็ก" as="div">
        <TagInput aria-label="แท็ก" variant="colorful" value={tags} onChange={setTags} maxLength={20} transform={(t) => t.replace(/^#/, '')} />
      </Field>
    </div>
  );
}
```

## FileDrop

**ใช้เมื่อ:** อัปโหลดไฟล์ (หลายไฟล์ · แถบความคืบหน้า · ยกเลิก/ลองใหม่) · รูปเดียวพร้อมตัวอย่าง → `ImagePicker`

ต้องเขียน `upload` ให้ตรงกับ backend: รับ `File` + `{ onProgress, signal }` คืน `Promise<string>` (เช่น key/URL ที่เก็บ) — โยน Error = ไม่สำเร็จ (ผู้ใช้กดลองใหม่ได้)

```tsx
'use client';

import { useState } from 'react';
import { FileDrop, type UploadFn, type UploadedFile } from '@/components/FileDrop';

/** อัปโหลดด้วย XHR เพื่อให้มีความคืบหน้า (fetch ยังไม่รายงานความคืบหน้าของการส่ง) */
const upload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);
    xhr.open('POST', '/api/upload');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText).key) : reject(new Error('อัปโหลดไม่สำเร็จ')));
    xhr.onerror = () => reject(new Error('เชื่อมต่อไม่ได้'));
    signal.addEventListener('abort', () => xhr.abort());
    xhr.send(body);
  });

export function Attachments() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  return (
    <>
      <FileDrop upload={upload} onChange={setFiles} accept="image/*,application/pdf" maxFiles={5} maxSize={10 * 1024 * 1024} />
      <p className="mt-2 text-xs text-ink-mute">อัปโหลดแล้ว {files.length} ไฟล์</p>
    </>
  );
}
```

- ถ้าใช้ presigned URL (S3/R2): ใน `upload` ขอ URL ก่อน แล้ว `PUT` ไฟล์ด้วย XHR แบบเดียวกัน คืน key
- ดูไฟล์ที่อัปโหลด: `MediaGallery` / `MediaLightbox` ([media.md](./media.md))

## ImagePicker

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { ImagePicker } from '@/components/admin/ImagePicker';

export function AvatarField() {
  const [avatar, setAvatar] = useState<string | null>(null);
  return (
    <Field label="รูปโปรไฟล์" as="div">
      <ImagePicker
        value={avatar} onChange={setAvatar}
        upload={async (file) => {
          const body = new FormData();
          body.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body });
          if (!res.ok) throw new Error('อัปโหลดไม่สำเร็จ');
          return (await res.json()).key as string;
        }}
        resolveUrl={(key) => `/files/${key}`}
      />
    </Field>
  );
}
```

## PasswordInput · PasswordRules · OtpInput

```tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui';
import { PasswordInput, PasswordRules } from '@/components/admin/PasswordFields';
import { OtpInput } from '@/components/OtpInput';

export function SecurityFields() {
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [otp, setOtp] = useState('');
  const [wrong, setWrong] = useState(false);
  return (
    <div className="space-y-4">
      <Field label="รหัสผ่านใหม่" as="div"><PasswordInput value={next} onChange={setNext} autoComplete="new-password" /></Field>
      <Field label="ยืนยันรหัสผ่าน" as="div"><PasswordInput value={again} onChange={setAgain} autoComplete="new-password" /></Field>
      <PasswordRules next={next} again={again} />
      <OtpInput value={otp} onChange={(v) => { setOtp(v); setWrong(false); }} invalid={wrong} autoFocus={false}
        onComplete={(code) => { if (code !== '123456') setWrong(true); }} />
    </div>
  );
}
```

- `autoComplete` ของ `PasswordInput` บังคับใส่: `current-password` (เข้าสู่ระบบ) / `new-password` (ตั้งใหม่)
- `PasswordRules` ใช้กติกา ≥10 ตัว มีตัวอักษรและตัวเลข — ถ้า backend ใช้กติกาอื่น แก้ `passwordChecks` ในไฟล์เดียวกัน

## LoadingButton

```tsx
'use client';

import { useState } from 'react';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';

export function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [status, setStatus] = useState<LoadingStatus>('idle');
  return (
    <LoadingButton
      status={status} loadingText="กำลังบันทึก" successText="บันทึกแล้ว" errorText="ไม่สำเร็จ"
      onClick={async () => {
        setStatus('loading');
        try { await onSave(); setStatus('success'); } catch { setStatus('error'); }
        setTimeout(() => setStatus('idle'), 1500); // กลับเป็นปกติเอง — คอมโพเนนต์ไม่รีเซ็ตให้
      }}
    >
      บันทึก
    </LoadingButton>
  );
}
```

- ความกว้างปุ่มคงที่ตามป้ายปกติ — `loadingText` ควรสั้นกว่าหรือเท่าป้าย
- ปุ่มธรรมดาที่ไม่มีสถานะ: `Button` (`variant`: primary · dark · outline · ghost · danger · `size`: md · sm)
