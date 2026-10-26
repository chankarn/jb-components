# หน้าต่างลอยและการแจ้งเตือน

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/components/Overlay`

```ts
import { useModal, Dialog, Drawer } from '@/components/Overlay';
```

### ฟังก์ชัน `useModal`

```ts
useModal(open: boolean, onClose: () => void, panel: RefObject<HTMLElement | null>, dismissible: boolean, focusField?: boolean) => { dismiss: () => void; nudge: () => void; }
```

### `Dialog`

Dialog: หน้าต่างกลางจอ สำหรับฟอร์มสั้น/ยืนยัน · เนื้อหายาวหรือรายการให้เลื่อนดูใช้ Drawer
- เข้าแบบสปริงจากเบลอเป็นคม · ฉากหลังเบลอ · หัวเป็นแสงไล่สีนุ่มๆ (+ `icon` ในกรอบสี ตาม `tone`)
- เนื้อหาค่อยๆ ลอยขึ้นทีละบล็อก · เลื่อนแล้วมีเงาที่หัว/ท้ายบอกว่ามีต่อ
- จอแคบ: เป็น bottom sheet เลื่อนขึ้นจากล่าง มีที่จับ ปัดลงเพื่อปิด
- `variant="alert"`: แบบกล่องยืนยัน ไอคอนใหญ่ตรงกลาง ปุ่มเต็มแถว (role="alertdialog")


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `open` **(จำเป็น)** | `boolean` |  |  |
| `onClose` **(จำเป็น)** | `() => void` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `description` | `ReactNode` |  | บรรทัดรองใต้หัวข้อ |
| `children` | `ReactNode` |  |  |
| `footer` | `ReactNode` |  | ปุ่มด้านล่าง (ชิดขวา · จอแคบยืดเต็มแถว) |
| `dismissible` | `boolean` | `true` | false = ปิดด้วย Esc/คลิกฉากหลัง/ปัดลงไม่ได้ (หน้าต่างเด้งเตือนแทน) และไม่มีปุ่ม × (Dialog) — ต้องมีปุ่มใน footer ที่พาออกได้เอง |
| `className` | `string` |  |  |
| `size` | `"md" \| "sm" \| "lg" \| "xl"` | `'md'` |  |
| `icon` | `ReactNode` |  |  |
| `tone` | `"danger" \| "brand" \| "success"` | `'brand'` |  |
| `variant` | `"default" \| "alert"` | `'default'` |  |

### `Drawer`

Drawer: แผงเลื่อนออกจากขอบจอ สำหรับรายละเอียด/ฟอร์มยาว/ตัวกรอง
- จอกว้างเป็นแผงลอยมุมมนห่างขอบเล็กน้อย · จอแคบชิดขอบเต็มความสูง
- เลื่อนเข้าแบบสปริง · ปัดกลับทางขอบ (ขวา/ซ้าย/ลง) เพื่อปิด · เนื้อหาค่อยๆ ลอยขึ้นทีละบล็อก · หัว/ท้ายติดอยู่กับที่มีเงาตอนเลื่อน
- `side`: right (ค่าตั้งต้น) · left · bottom


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `open` **(จำเป็น)** | `boolean` |  |  |
| `onClose` **(จำเป็น)** | `() => void` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `description` | `ReactNode` |  | บรรทัดรองใต้หัวข้อ |
| `children` | `ReactNode` |  |  |
| `footer` | `ReactNode` |  | ปุ่มด้านล่าง (ชิดขวา · จอแคบยืดเต็มแถว) |
| `dismissible` | `boolean` | `true` | false = ปิดด้วย Esc/คลิกฉากหลัง/ปัดลงไม่ได้ (หน้าต่างเด้งเตือนแทน) และไม่มีปุ่ม × (Dialog) — ต้องมีปุ่มใน footer ที่พาออกได้เอง |
| `className` | `string` |  |  |
| `side` | `"right" \| "left" \| "bottom"` | `'right'` |  |
| `size` | `"md" \| "sm" \| "lg"` | `'md'` |  |


## `@/components/Popover`

```ts
import { useFloating, useDismiss, mergeRefs, Popover, Side, Align, Floating } from '@/components/Popover';
```

### ฟังก์ชัน `useFloating`

ติดตามตำแหน่งกล่องลอยเทียบกับตัวยึด ขณะเปิดอยู่

```ts
useFloating(open: boolean, anchor: RefObject<HTMLElement | null>, { side, align, offset, padding, minSize }?: FloatOpts) => { setFloating: (el: HTMLElement | null) => void; pos: Placement | null; update: () => void; anchorWidth: number; }
```

### ฟังก์ชัน `useDismiss`

ปิดเมื่อกดนอกตัวยึด/กล่อง (ไม่นับกล่องลอยซ้อนข้างใน)

```ts
useDismiss(open: boolean, onClose: () => void, refs: RefObject<HTMLElement | null>[]) => void
```

### ฟังก์ชัน `mergeRefs`

รวม ref หลายตัว (ref ของผู้ใช้ที่ติดมากับ trigger + ref ของเราเอง)

```ts
mergeRefs<T>(...refs: (Ref<T> | undefined)[]) => (el: T | null) => void
```

### `Popover`

Popover: กล่องลอยทั่วไปที่กดเปิด (ฟอร์มสั้น ตัวกรอง รายละเอียด การ์ดโปรไฟล์)
- controlled (`open` + `onOpenChange`) หรือปล่อยให้จัดการเอง
- เปิดแล้วโฟกัสย้ายเข้ากล่อง · Esc ปิดแล้วคืนโฟกัสที่ปุ่ม (ไม่ลามไปปิด dialog ที่ครอบอยู่) · กดนอกกล่องปิด · Tab ออกนอกกล่องปิด
- role="dialog" + aria-expanded/aria-controls ที่ปุ่ม


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `trigger` **(จำเป็น)** | `ReactElement<Record<string, unknown>, string \| JSXElementConstructor<any>>` |  | ปุ่มที่กดเปิด — ต้องเป็น element เดียวที่รับ ref ได้ (button, หรือ component ที่ส่ง ref ต่อ) |
| `children` **(จำเป็น)** | `ReactNode \| ((close: () => void) => ReactNode)` |  | เนื้อหา · ส่งเป็นฟังก์ชันเพื่อรับ `close` ไปผูกกับปุ่มในกล่อง |
| `open` | `boolean` |  |  |
| `onOpenChange` | `((open: boolean) => void)` |  |  |
| `side` | `"right" \| "left" \| "bottom" \| "top"` | `'bottom'` |  |
| `align` | `"center" \| "start" \| "end"` | `'center'` |  |
| `offset` | `number` | `8` |  |
| `arrow` | `boolean` | `true` |  |
| `label` | `string` |  | ชื่อกล่องสำหรับ screen reader |
| `className` | `string` |  |  |

### `Floating`

กล่องลอย (portal + อนิเมชันงอกออกจากตัวยึด + ลูกศร) — ใช้ภายใน Popover/Tooltip/DropdownMenu
`arrowColor` = สีพื้นของกล่อง (CSS color) ให้ลูกศรสีเดียวกัน


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `open` **(จำเป็น)** | `boolean` |  |  |
| `pos` **(จำเป็น)** | `Placement \| null` |  |  |
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `arrow` | `boolean` |  |  |
| `arrowColor` | `string` | `'rgb(var(--surface))'` |  |
| `travel` | `number` | `6` | ระยะที่เลื่อนเข้ามาตอนเปิด (px) |
| `duration` | `number` | `0.16` |  |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)


## `@/components/Tooltip`

```ts
import { Tooltip } from '@/components/Tooltip';
```

### `Tooltip`

Tooltip: ป้ายสั้นๆ อธิบายปุ่ม (โดยเฉพาะปุ่มไอคอน) — ข้อความยาว/มีลิงก์ใช้ Popover หรือ HelpTip แทน
- เปิดเมื่อชี้ค้าง (`delay` ms) หรือโฟกัสด้วยคีย์บอร์ด · ปิดเมื่อออก/Esc
- ชี้ต่อจากปุ่มหนึ่งไปอีกปุ่มแล้วเปิดทันที · เลื่อนเมาส์เข้าไปในป้ายได้โดยไม่ปิด (WCAG 1.4.13)
- จอสัมผัสไม่เปิดตอนแตะ (ไม่บังการกด) — ข้อมูลสำคัญอย่าซ่อนไว้ใน tooltip อย่างเดียว
- ตั้ง aria-describedby ที่ตัวยึดให้ screen reader อ่านต่อท้าย · ปุ่มไอคอนยังต้องมี aria-label ของตัวเอง
- ปุ่ม disabled ไม่ส่ง event เมาส์ → ครอบด้วย <span tabIndex={0}> ก่อน


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `content` **(จำเป็น)** | `ReactNode` |  |  |
| `children` **(จำเป็น)** | `ReactElement<Record<string, unknown>, string \| JSXElementConstructor<any>>` |  |  |
| `side` | `"right" \| "left" \| "bottom" \| "top"` | `'top'` |  |
| `align` | `"center" \| "start" \| "end"` | `'center'` |  |
| `delay` | `number` | `450` |  |
| `disabled` | `boolean` |  |  |
| `className` | `string` |  |  |


## `@/components/DropdownMenu`

```ts
import { DropdownMenu, MenuEntry } from '@/components/DropdownMenu';
```

### `DropdownMenu`

DropdownMenu: เมนูคำสั่งที่กดเปิดจากปุ่ม (… · ผู้ใช้ · ส่งออก · เลือกคอลัมน์ที่แสดง)
- รายการ: คำสั่ง (ไอคอน/คำอธิบาย/ปุ่มลัด/ลิงก์/สีอันตราย/ปิดใช้) · ติ๊กเลือก (`checkbox` — กดแล้วเมนูไม่ปิด) · หัวกลุ่ม · เส้นคั่น
- คีย์บอร์ดตาม ARIA menu button: Enter/Space/↓ เปิดแล้วโฟกัสตัวแรก · ↑ เปิดที่ตัวสุดท้าย · ↑↓ วนรอบข้ามตัวที่ปิด · Home/End
  · พิมพ์ตัวอักษรกระโดดไปรายการ (ภาษาไทยได้) · Esc ปิดแล้วคืนโฟกัสที่ปุ่ม · Tab ปิด
- ชี้เมาส์แล้วโฟกัสตาม (คีย์บอร์ด/เมาส์ใช้สลับกันได้ไม่สับสน) · ใช้ตัววางตำแหน่งกลางของ Popover (พลิกเอง ตามตอนเลื่อนหน้า)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `trigger` **(จำเป็น)** | `ReactElement<Record<string, unknown>, string \| JSXElementConstructor<any>>` |  |  |
| `items` **(จำเป็น)** | `MenuEntry[]` |  |  |
| `side` | `"right" \| "left" \| "bottom" \| "top"` | `'bottom'` |  |
| `align` | `"center" \| "start" \| "end"` | `'start'` |  |
| `label` | `string` |  | ชื่อเมนูสำหรับ screen reader (ไม่ระบุ = ใช้ข้อความบนปุ่ม) |
| `className` | `string` |  |  |

### type `MenuEntry`

```ts
type MenuEntry =
  | {
      type?: 'item';
      label: string;
      icon?: React.ReactNode;
      /** ปุ่มลัดชิดขวา เขียนแบบ 'mod+D' แล้วแสดงตามระบบ (⌘D บน Mac · Ctrl+D บน Windows) — แสดงอย่างเดียว ไม่ได้ผูกคีย์ให้ */
      shortcut?: string;
      description?: string;
      onSelect?: () => void;
      href?: string;
      danger?: boolean;
      disabled?: boolean;
    }
  | { type: 'checkbox'; label: string; icon?: React.ReactNode; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }
  | { type: 'label'; label: string }
  | { type: 'separator' };
```


## `@/components/CommandPalette`

```ts
import { useCommandHotkey, CommandPalette, CommandItem } from '@/components/CommandPalette';
```

### ฟังก์ชัน `useCommandHotkey`

กด ⌘K บน Mac / Ctrl+K บน Windows/Linux ที่ไหนก็ได้ในหน้า → เรียก `toggle`
(กันเบราว์เซอร์ทำงานเดิม: Ctrl+K ของ Chrome/Edge/Firefox คือค้นในแถบที่อยู่ · บน Mac ไม่รับ Ctrl+K เพราะชนกับปุ่มลบท้ายบรรทัดของระบบ)

```ts
useCommandHotkey(toggle: () => void) => void
```

### `CommandPalette`

CommandPalette: หน้าต่างค้นหา + สั่งงานจากคีย์บอร์ด (แบบ ⌘K ของ Linear/Vercel)
- พิมพ์ค้นข้ามทุกกลุ่ม (เมนู · การทำงาน · ข้อมูล) ไม่สนตัวพิมพ์ หลายคำต้องเจอครบ ค้นจาก keywords ได้ · ตัวอักษรที่เจอถูกไฮไลต์
- ↑↓ เลื่อนข้ามกลุ่ม (วนรอบ) · Enter เลือก · Esc ปิด · ชี้เมาส์เลือกได้ · แถบไฮไลต์เลื่อนตามแบบสปริง
- `limit` จำกัดจำนวนต่อกลุ่ม · `onQueryChange` ให้ฝั่งที่ใช้โหลดผลเพิ่มตามคำค้น (`loading` แสดงวงหมุน)
- ARIA: ช่องค้นหาเป็น combobox คุม listbox (aria-activedescendant) · กลุ่มเป็น role="group" มีชื่อ
- พฤติกรรมหน้าต่างเดียวกับ Dialog: ล็อกการเลื่อน · กัน Tab หลุด · ปิดแล้วคืนโฟกัส


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `open` **(จำเป็น)** | `boolean` |  |  |
| `onOpenChange` **(จำเป็น)** | `(open: boolean) => void` |  |  |
| `items` **(จำเป็น)** | `CommandItem[]` |  |  |
| `limit` | `Record<string, number>` |  |  |
| `placeholder` | `string` | `'พิมพ์เพื่อค้นหาหรือสั่งงาน…'` |  |
| `emptyText` | `string` | `'ไม่พบผลลัพธ์'` |  |
| `loading` | `boolean` |  |  |
| `onQueryChange` | `((q: string) => void)` |  |  |
| `label` | `string` | `'ค้นหาและคำสั่ง'` |  |

### type `CommandItem`

```ts
type CommandItem = CommandEntry & {
  icon?: React.ReactNode;
  /** ปุ่มลัดชิดขวา เขียนแบบ 'mod+N' แล้วแสดงตามระบบ (⌘N / Ctrl+N) — แสดงอย่างเดียว ไม่ได้ผูกปุ่มให้ */
  shortcut?: string;
  onSelect: () => void;
};
```


## `@/components/HelpTip`

```ts
import { HelpTip } from '@/components/HelpTip';
```

### `HelpTip`

ไอคอน ? อธิบายเพิ่มเติมของช่อง · เปิดด้วยการกด/Enter/Space (ไม่พึ่ง hover จึงใช้ได้บนจอสัมผัสและคีย์บอร์ด)
ปิดด้วย Esc / คลิกนอกกล่อง (เลื่อนหน้าแล้วกล่องตามไอคอนไป ไม่ปิด) · ใช้กับข้อความอธิบายแนวคิดที่ยาวกว่าหนึ่งบรรทัด
ส่วนข้อจำกัดสั้นๆ ที่ต้องรู้ก่อนกรอก (หน่วย ค่าว่างหมายถึงอะไร) ให้อยู่ใต้ช่องตามเดิม


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `text` **(จำเป็น)** | `string` |  |  |
| `className` | `string` |  |  |


## `@/components/feedback`

```ts
import { confirmDialog, FeedbackHost, toast } from '@/components/feedback';
```

### ฟังก์ชัน `confirmDialog`

```ts
confirmDialog(message: string, opts?: { confirmLabel?: string | undefined; cancelLabel?: string | undefined; danger?: boolean | undefined; description?: string | undefined; } | undefined) => Promise<boolean>
```

### `FeedbackHost`

```ts
FeedbackHost() => Element
```

### `toast`

toast.success('บันทึกแล้ว')
toast.error('ลบไม่ได้', { description: 'มีคนใช้อยู่', action: { label: 'ลองใหม่', onClick } })
toast.promise(save(), { loading: 'กำลังบันทึก…', success: 'บันทึกแล้ว', error: (e) => `ไม่สำเร็จ: ${e.message}` })

ชนิด: `{ success: (m: string, o?: ToastOptions \| undefined) => number; error: (m: string, o?: ToastOptions \| undefined) => number; info: (m: str…`


## `@/components/Toaster`

```ts
import { Toaster } from '@/components/Toaster';
```

### `Toaster`

Toaster: แสดง toast จาก lib/toast-store (วางครั้งเดียวผ่าน <FeedbackHost/>)
- เข้าแบบสปริงจากเบลอเป็นคม ซ้อนเรียงลื่นๆ (ตัวใหม่ดันตัวเก่า) · ออกแบบเลื่อนหาย
- เส้นนับถอยหลังด้านล่าง · ชี้เมาส์/โฟกัสที่กลุ่ม = หยุดนับทุกตัว (อ่านทัน) · ปัดซ้าย/ขวาทิ้งได้
- success ติ๊กวาดเส้น · error สั่นตอนเข้า · loading หมุนแล้วแปลงร่างเป็นผลลัพธ์ (toast.promise)
- ปุ่ม action ในกล่อง (เช่น "เลิกทำ") · error เป็น role="alert" ตัวอื่นเป็น role="status"

```ts
Toaster() => Element
```

