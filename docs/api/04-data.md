# แสดงข้อมูลและหลังบ้าน

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/components/admin/kit`

```ts
import { DataTable, Toolbar, FilterSelect, Pagination, SectionCard, StatCard, AdminPageHeader, InfoNote, Column, PAGE_SIZES, Dialog, Drawer } from '@/components/admin/kit';
```

### `DataTable`

> ชนิดข้อมูล: `T extends { id: number; }`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `columns` **(จำเป็น)** | `Column<T>[]` |  |  |
| `rows` **(จำเป็น)** | `T[] \| null` |  |  |
| `loading` | `boolean` |  |  |
| `empty` | `string` |  |  |
| `onRowClick` | `((row: T) => void)` |  |  |
| `paginate` | `number` |  | แบ่งหน้าฝั่ง client สำหรับตารางที่โหลดข้อมูลมาทั้งชุด — ใส่เป็นจำนวนแถวต่อหน้าเริ่มต้น (เช่น 10) · ตารางที่แบ่งหน้าจาก server ไม่ต้องใส่ |

### `Toolbar`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `q` **(จำเป็น)** | `string` |  |  |
| `onSearch` **(จำเป็น)** | `(v: string) => void` |  |  |
| `placeholder` | `string` |  |  |
| `children` | `ReactNode` |  |  |

### `FilterSelect`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `string` |  |  |
| `onChange` **(จำเป็น)** | `(v: string) => void` |  |  |
| `options` **(จำเป็น)** | `{ value: string; label: string; }[]` |  |  |

### `Pagination`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `page` **(จำเป็น)** | `number` |  |  |
| `pages` **(จำเป็น)** | `number` |  |  |
| `total` **(จำเป็น)** | `number` |  |  |
| `onChange` **(จำเป็น)** | `(p: number) => void` |  |  |
| `perPage` | `number` |  | ใส่คู่กับ onPerPageChange เพื่อให้เลือกจำนวนแถวต่อหน้าได้ |
| `onPerPageChange` | `((n: number) => void)` |  |  |
| `pageSizes` | `number[]` | `PAGE_SIZES` |  |

### `SectionCard`

การ์ดหัวข้อของฟอร์ม/หน้าตั้งค่า: หัว (ไอคอน · ชื่อ · คำอธิบาย · ปุ่มด้านขวา) แล้วเนื้อหาด้านล่าง
- `collapsible` กดหัวเพื่อพับ/กาง (ยืดหดนุ่ม · `defaultOpen`)
- `help` = คำอธิบายยาว แสดงเมื่อกดไอคอน ? ข้างหัวข้อ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` **(จำเป็น)** | `string` |  |  |
| `hint` | `string` |  |  |
| `help` | `string` |  |  |
| `icon` | `ReactNode` |  |  |
| `actions` | `ReactNode` |  | ปุ่ม/ลิงก์ชิดขวาของหัวการ์ด |
| `collapsible` | `boolean` |  |  |
| `defaultOpen` | `boolean` | `true` |  |
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |

### `StatCard`

การ์ดตัวเลขสรุป
- ตัวเลขวิ่งขึ้นตอนเลื่อนมาเห็น (เมื่อ value เป็นตัวเลข) · `format` กำหนดรูปแบบ เช่น `฿${n}`
- `icon` ในกรอบสีตาม `tone` · `delta` = % เปลี่ยนแปลง (ชิป ↑ เขียว / ↓ แดง · `deltaInverse` เมื่อ "ลด = ดี" เช่น จำนวนค้าง)
- `trend` = ชุดตัวเลขย้อนหลัง วาดเป็นเส้นจิ๋ว · `onClick` → การ์ดกดได้ ยกขึ้นตอนชี้พร้อมลูกศร
- การ์ดในแถวเดียวกันสูงเท่ากันเสมอ (มี/ไม่มี hint ก็ตรงกัน)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `label` **(จำเป็น)** | `string` |  |  |
| `value` **(จำเป็น)** | `string \| number` |  |  |
| `hint` | `string` |  |  |
| `tone` | `"danger" \| "done" \| "default" \| "warn"` | `'default'` |  |
| `onClick` | `(() => void)` |  |  |
| `icon` | `ReactNode` |  |  |
| `delta` | `number \| null` |  |  |
| `deltaInverse` | `boolean` |  |  |
| `trend` | `number[]` |  |  |
| `format` | `((n: number) => string)` |  |  |

### `AdminPageHeader`

หัวหน้าทุกหน้าหลังบ้าน (FR-A-01 ข้อ 6): breadcrumb/eyebrow · H1 · คำอธิบาย · ชิปสรุปตัวเลข · ปุ่มด้านขวา


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` **(จำเป็น)** | `string` |  |  |
| `stats` | `{ label: string; value: string \| number; tone?: Tone \| undefined; }[]` |  | เช่น [{ label: 'คอร์สทั้งหมด', value: 8 }, { label: 'เผยแพร่', value: 6, tone: 'done' }] |
| `actions` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `breadcrumb` | `ReactNode` |  | วาง <Breadcrumb/> หรือข้อความเล็กเหนือหัวข้อ |

### `InfoNote`

กล่องคำแนะนำ/หมายเหตุ: แถบสีซ้าย + ไอคอนตาม `tone` (info · tip · success · warn · danger) + หัวข้อ (ไม่บังคับ)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `tone` | `"danger" \| "success" \| "info" \| "warn" \| "tip"` | `'info'` |  |
| `title` | `string` |  |  |
| `className` | `string` |  |  |

### type `Column`

```ts
type Column<T> = {
  key: string;
  header: string;
  /** ความกว้างคงที่ เช่น 'w-28' — เว้นว่างให้ยืดตามเนื้อหา */
  className?: string;
  render: (row: T) => React.ReactNode;
};
```

### `PAGE_SIZES`

ชนิด: `number[]`

### `Dialog` (มาจาก Overlay.tsx)

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

### `Drawer` (มาจาก Overlay.tsx)

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


## `@/components/admin/RowMenu`

```ts
import { RowMenu, RowMenuItem } from '@/components/admin/RowMenu';
```

### `RowMenu`

เมนู "…" ท้ายแถวตาราง รวม action หลายอันไว้ที่เดียว
ใช้ DropdownMenu กลาง: ตามปุ่มตอนเลื่อนหน้า (เดิมปิดทิ้ง) · คีย์บอร์ด ↑↓/พิมพ์ตัวอักษร/Esc · รายการอันตรายมีเส้นคั่นก่อน
คลิกในเมนูไม่ลามไปเป็นคลิกแถว (แถวที่กดเปิดรายละเอียดได้)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `items` **(จำเป็น)** | `RowMenuItem[]` |  |  |
| `label` | `string` |  |  |

### type `RowMenuItem`

```ts
type RowMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  hidden?: boolean;
};
```


## `@/components/Table`

```ts
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, rowClass } from '@/components/Table';
```

### `Table`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableHeader`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableBody`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableFooter`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableRow`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableHead`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableCell`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TableCaption`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `rowClass`

แถวที่เลื่อนเข้า/ออกแบบมีอนิเมชัน (framer-motion) — ใช้ภายใน <AnimatePresence> · ค่าอนิเมชันกำหนดเองได้ผ่าน props ของ motion.tr

ชนิด: `"border-b border-ink/8 transition-colors hover:bg-brand-50/60"`


## `@/components/StatusBadge`

```ts
import { StatusBadge } from '@/components/StatusBadge';
```

### `StatusBadge`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `status` **(จำเป็น)** | `string` |  |  |
| `className` | `string` |  |  |


## `@/components/Avatar`

```ts
import { Avatar } from '@/components/Avatar';
```

### `Avatar`

วงกลมตัวอักษรแรกของชื่อ — สีไล่ตาม seed (เช่น id ผู้ใช้) ให้แต่ละคนต่างกันแต่คงเดิมทุกครั้ง · `muted` ใช้กับบัญชีที่ถูกปิดสิทธิ์


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `name` **(จำเป็น)** | `string` |  |  |
| `seed` **(จำเป็น)** | `number` |  |  |
| `size` | `number` | `36` |  |
| `muted` | `boolean` |  |  |
| `className` | `string` |  |  |


## `@/components/EmptyState`

```ts
import { NoDataArt, EmptyState } from '@/components/EmptyState';
```

### `NoDataArt`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `className` | `string` |  |  |

### `EmptyState`

สถานะ "ไม่มีข้อมูล": ภาพประกอบ + หัวข้อ + คำอธิบาย + ปุ่ม (ไม่บังคับ)
size: md = ทั้งหน้า/การ์ดใหญ่ · sm = ในตาราง/กล่องเล็ก


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` **(จำเป็น)** | `string` |  |  |
| `description` | `string` |  |  |
| `action` | `ReactNode` |  |  |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `className` | `string` |  |  |
| `card` | `boolean` |  | ห่อด้วยการ์ด — ใช้เมื่อสถานะว่างอยู่โดดๆ บนพื้นหน้า (ถ้าอยู่ในการ์ด/ตารางอยู่แล้วไม่ต้องใส่) |


## `@/components/ProgressRing`

```ts
import { ProgressRing } from '@/components/ProgressRing';
```

### `ProgressRing`

วงแหวนความคืบหน้า (SVG) — ตัวเลขกลางวง · ใช้สีแบรนด์ปัจจุบัน
- วงเดินและตัวเลขนับขึ้นพร้อมกันตอนแสดงครั้งแรกและทุกครั้งที่ค่าเปลี่ยน (ต่อจากค่าเดิม ไม่เริ่มจาก 0 ใหม่)
- ปลายวงไล่เฉดจาก brand-400 ไปเป็น brand-600 · ครบ 100% วงเปลี่ยนเป็นสีเขียว (ok) พร้อมวงคลื่นเด้งออกหนึ่งครั้ง
- ผู้ใช้ตั้งลดการเคลื่อนไหวในระบบ → แสดงค่าสุดท้ายทันที ไม่เล่นอนิเมชัน
- เข้าถึงได้: role=progressbar บอกค่าจริงเสมอ (ไม่ใช่ค่าระหว่างนับ)
`animated={false}` ปิดอนิเมชัน · `completeTone={false}` ไม่เปลี่ยนเป็นสีเขียวเมื่อครบ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `percent` **(จำเป็น)** | `number` |  |  |
| `size` | `number` | `64` |  |
| `stroke` | `number` | `7` |  |
| `duration` | `number` | `1.4` | วินาที ต่อการเดินหนึ่งครั้ง |
| `animated` | `boolean` | `true` |  |
| `completeTone` | `boolean` | `true` |  |
| `className` | `string` |  |  |


## `@/components/AnimatedNumber`

```ts
import { AnimatedNumber } from '@/components/AnimatedNumber';
```

### `AnimatedNumber`

AnimatedNumber: ตัวเลขวิ่งขึ้นตอนเลื่อนมาเห็นครั้งแรก (เร็วตอนต้น ช้าลงตอนท้าย) · ค่าเปลี่ยน → วิ่งจากค่าเดิมไปค่าใหม่
- `format` กำหนดรูปแบบ (ค่าตั้งต้น: comma + ทศนิยมเท่าค่าปลายทาง) · ตัวเลขกว้างเท่ากัน (tabular-nums) ข้อความไม่สั่นตอนวิ่ง
- screen reader อ่านค่าสุดท้ายทันที (ค่าที่วิ่งอยู่ซ่อนไว้) · ผู้ใช้ตั้งลดการเคลื่อนไหว = แสดงค่าจริงเลย


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `number` |  |  |
| `format` | `((n: number) => string)` |  |  |
| `duration` | `number` | `1100` |  |
| `className` | `string` |  |  |


## `@/components/Loading`

```ts
import { Loader, LoadingButton, TopProgress, LoadingOverlay, LoaderVariant, LoadingStatus } from '@/components/Loading';
```

### `Loader`

Loader: ตัวบอกกำลังโหลด
- `ring` วงแหวนไล่สีหมุนพร้อมเส้นยืดหด · `dots` จุดเด้งเป็นคลื่น · `bars` แท่งอีควอไลเซอร์
- `orbit` ดาวเทียมสองดวงโคจรรอบจุดกลาง · `pulse` วงเรดาร์กระเพื่อม · `grid` ตาราง 3×3 ยุบพองเป็นคลื่นทแยง
- role="status" + ข้อความซ่อนสำหรับ screen reader (`label`) · ขนาดด้วย `size` (px) · สีตาม `currentColor` ถ้าใส่ `tone="current"`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `variant` | `"ring" \| "dots" \| "bars" \| "orbit" \| "pulse" \| "grid"` | `'ring'` |  |
| `size` | `number` | `28` |  |
| `label` | `string` |  |  |
| `tone` | `"brand" \| "current"` | `'brand'` | `brand` = สีแบรนด์ (ไล่เฉด) · `current` = ใช้สีตัวอักษรรอบข้าง (เช่น ในปุ่ม) |
| `className` | `string` |  |  |

### `LoadingButton`

LoadingButton: ปุ่มที่แปลงร่างตามสถานะ (ความกว้างคงเดิม ปุ่มข้างๆ ไม่ขยับ)
- `loading` ป้ายเลื่อนขึ้นหาย วงหมุนเลื่อนขึ้นมาแทน · กดซ้ำไม่ได้ (aria-busy) แต่ยังโฟกัสอยู่
- `success` ปุ่มเป็นสีเขียว ติ๊กวาดเส้น + ประกายกระจาย · `error` สีแดงและปุ่มสั่น
- คุมสถานะเองจากภายนอก (เช่น ตั้ง success แล้ว setTimeout กลับเป็น idle)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `variant` | `"primary" \| "dark" \| "outline" \| "ghost" \| "danger"` |  |  |
| `size` | `"md" \| "sm"` |  |  |
| `status` | `"success" \| "error" \| "loading" \| "idle"` | `'idle'` |  |
| `loadingText` | `ReactNode` |  | ข้อความตอนโหลด (ไม่ใส่ = มีแต่วงหมุน) — ควรสั้นไม่เกินความยาวป้ายปกติ เพราะปุ่มกว้างเท่าเดิม |
| `successText` | `ReactNode` |  |  |
| `errorText` | `ReactNode` |  |  |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `TopProgress`

TopProgress: แถบโหลดบางๆ ชิดขอบบนจอ (แบบ YouTube/GitHub) — วางครั้งเดียวในหน้า คุมด้วย `active`
- เริ่มแล้วคืบเข้าหา ~94% ช้าลงเรื่อยๆ (ไม่รู้ว่าเหลือเท่าไรจึงไม่หยุดนิ่ง) · เสร็จ → พุ่งเต็มแล้วจางหาย
- ปลายแถบมีแสงเรือง + แถบแสงวิ่งผ่าน · โหลดเร็วกว่า 150ms ไม่แสดงเลย (ไม่กะพริบ)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `active` **(จำเป็น)** | `boolean` |  |  |
| `className` | `string` |  |  |

### `LoadingOverlay`

LoadingOverlay: ห่อการ์ด/ตาราง ระหว่างโหลดข้อมูลใหม่ — ของเดิมยังเห็นจางๆ ใต้ม่านเบลอ (ไม่กระโดดเป็นโครงว่าง)
- ข้อความมีจุด … วิ่ง · เนื้อหาข้างใต้ aria-busy และกด Tab เข้าไม่ได้ระหว่างโหลด
- โหลดครั้งแรกที่ยังไม่มีข้อมูลเลย ใช้ Skeleton แทนจะดีกว่า


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `show` **(จำเป็น)** | `boolean` |  |  |
| `label` | `string` |  |  |
| `variant` | `"ring" \| "dots" \| "bars" \| "orbit" \| "pulse" \| "grid"` | `'ring'` |  |
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |

### type `LoaderVariant`

```ts
type LoaderVariant = 'ring' | 'dots' | 'bars' | 'orbit' | 'pulse' | 'grid';
```

### type `LoadingStatus`

```ts
type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
```


## `@/components/ExpandButton`

```ts
import { ExpandButton } from '@/components/ExpandButton';
```

### `ExpandButton`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `icon` **(จำเป็น)** | `ReactNode` |  |  |
| `label` **(จำเป็น)** | `string` |  |  |
| `href` | `string` |  | มี href = ลิงก์เปิดแท็บใหม่ ไม่มี = ปุ่มที่เรียก onClick |
| `onClick` | `(() => void)` |  |  |
| `className` | `string` |  | ทับสีตั้งต้น (พื้น brand-600 ตัวหนังสือขาว) เช่น "bg-[#06C755] text-white" · ใช้ได้ทั่วไป ไม่ผูกกับการแชร์ |
| `size` | `number` | `52` | เส้นผ่านศูนย์กลางตอนหด (px) |
| `expandedWidth` | `number` | `200` | ความกว้างตอนยืด (px) |


## `@/components/ShareButtons`

```ts
import { ShareButtons } from '@/components/ShareButtons';
```

### `ShareButtons`

ปุ่มแชร์ LINE / Facebook (ย้ายมาจากหน้า /fortune ของ wunped)
- แชร์ลิงก์อย่างเดียว: ทั้งสองแพลตฟอร์มไม่ให้เติมข้อความให้แล้ว สิ่งที่โชว์ในโพสต์มาจาก Open Graph ของหน้านั้น
- `url` ไม่ใส่ = หน้าปัจจุบัน · สีพื้นเป็นสีแบรนด์ของ LINE/Facebook เอง ไม่ตามสี CI
- ปุ่มเป็นวงกลมไอคอนที่ยืดเป็นแคปซูลโชว์ข้อความเมื่อชี้ (จอสัมผัสโชว์เป็นแคปซูลตลอด)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `url` | `string` |  |  |
| `className` | `string` |  |  |

