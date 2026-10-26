# การนำทางและโครงหน้า

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/components/AppShell`

```ts
import { AppShell, NavItem, NavGroup, ShellUser } from '@/components/AppShell';
```

### `AppShell`

AppShell: โครงหน้าหลังบ้าน — sidebar + topbar + พื้นที่เนื้อหา
- sidebar พับเป็นแถบไอคอนได้ (จำไว้ในเครื่อง) · ตอนพับ ชี้ไอคอนแล้วขึ้นชื่อเมนู · เมนูที่อยู่มีแถบไฮไลต์เลื่อนตาม
- จอแคบ (< 1024px): sidebar ซ่อน กดปุ่ม ☰ แล้วเลื่อนออกมาจากซ้าย (ปัดกลับเพื่อปิด · เลือกเมนูแล้วปิดเอง)
- topbar ติดด้านบน พื้นเบลอ มีเส้นใต้ตอนเลื่อนหน้า · ปุ่มค้นหา ⌘K (`onCommand` — เปิด CommandPalette) · ช่องปุ่มเพิ่มเติม (`actions`) · สลับธีม · เมนูผู้ใช้
- ลิงก์ "ข้ามไปเนื้อหา" สำหรับคีย์บอร์ด · เปลี่ยนหน้าแล้วเนื้อหาจางเข้านุ่มๆ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `brand` **(จำเป็น)** | `{ name: string; mark?: ReactNode; href?: string \| undefined; }` |  |  |
| `nav` **(จำเป็น)** | `NavGroup[]` |  |  |
| `user` **(จำเป็น)** | `ShellUser` |  |  |
| `onSignOut` | `(() => void)` |  |  |
| `onCommand` | `(() => void)` |  | มีค่า = แสดงปุ่มค้นหา "⌘K" ใน topbar (ให้เปิด CommandPalette · ผูกปุ่มลัดเองด้วย useCommandHotkey) |
| `commandLabel` | `string` | `'ค้นหา…'` |  |
| `actions` | `ReactNode` |  | ปุ่มเพิ่มเติมใน topbar ก่อนปุ่มธีม เช่น การแจ้งเตือน |
| `userMenu` | `{ label: string; icon?: ReactNode; href?: string \| undefined; onSelect?: (() => void) \| undefined; }[]` |  | รายการเพิ่มในเมนูผู้ใช้ (ก่อน "ออกจากระบบ") |
| `children` **(จำเป็น)** | `ReactNode` |  |  |

### type `NavItem`

```ts
type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** ตัวเลข/ป้ายท้ายเมนู เช่น จำนวนงานค้าง */
  badge?: string | number;
  /** `exact` = ตรงทั้ง path เท่านั้น (เช่น หน้าแรก) · ค่าตั้งต้น = path นี้และหน้าย่อย */
  match?: 'exact' | 'prefix';
};
```

### type `NavGroup`

```ts
type NavGroup = { label?: string; items: NavItem[] };
```

### type `ShellUser`

```ts
type ShellUser = { name: string; email?: string; role?: string; seed?: number };
```


## `@/components/Tabs`

```ts
import { Tabs, TabItem } from '@/components/Tabs';
```

### `Tabs`

แท็บแบบเส้นใต้ + แถบ hover เลื่อนตาม (สไตล์ Vercel จาก 21st.dev ปรับให้เข้ากับโปรเจกต์)
- controlled: `value` / `onChange` · ใช้สี brand/ink ตามธีมทั้งสว่างและมืด
- เข้าถึงได้: role=tablist/tab · ลูกศรซ้ายขวา Home End เลื่อนโฟกัสและเลือก · Tab ไปแค่แท็บที่เลือก
- ชื่อแท็บยาวเกินจอ: เลื่อนแนวนอนได้ · วัดตำแหน่งใหม่เมื่อขนาดหรือฟอนต์เปลี่ยน

> ชนิดข้อมูล: `T extends string`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `items` **(จำเป็น)** | `TabItem<T>[]` |  |  |
| `value` **(จำเป็น)** | `T` |  |  |
| `onChange` **(จำเป็น)** | `(key: T) => void` |  |  |
| `aria-label` | `string` |  |  |
| `className` | `string` |  |  |

### type `TabItem`

```ts
type TabItem<T extends string = string> = {
  key: T;
  label: string;
  /** ตัวเลขท้ายชื่อแท็บ (เช่น จำนวนรายการ) · undefined = ไม่แสดง */
  count?: number | string;
};
```


## `@/components/Breadcrumb`

```ts
import { Breadcrumb, Crumb } from '@/components/Breadcrumb';
```

### `Breadcrumb`

Breadcrumb: เส้นทางนำทางบอกว่าอยู่หน้าไหนในโครงสร้าง
- รายการสุดท้าย = หน้าปัจจุบัน (aria-current="page" · ไม่เป็นลิงก์)
- ยาวเกิน `maxItems` → ยุบตรงกลางเป็นปุ่ม "…" กดแล้วเป็นเมนูของหน้าที่ซ่อน (เก็บตัวแรก + ท้ายๆ ไว้)
- จอแคบ (`mobileCollapse`): เหลือ "… › หน้าแม่ › หน้าปัจจุบัน" (หน้าที่เหลืออยู่ในเมนู …) · ชื่อยาวตัดด้วย … ชี้ดูชื่อเต็มได้
- `<nav aria-label>` + `<ol>` ตามแนวทาง ARIA breadcrumb · ตัวคั่นซ่อนจาก screen reader


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `items` **(จำเป็น)** | `Crumb[]` |  |  |
| `maxItems` | `number` | `4` |  |
| `separator` | `"chevron" \| "slash"` | `'chevron'` |  |
| `mobileCollapse` | `boolean` | `true` |  |
| `className` | `string` |  |  |

### type `Crumb`

```ts
type Crumb = { label: string; href?: string; icon?: React.ReactNode };
```


## `@/components/Stepper`

```ts
import { Stepper, Step } from '@/components/Stepper';
```

### `Stepper`

Stepper: แถบบอกขั้นตอน 1 → 2 → 3 (การแสดงผลอย่างเดียว ไม่ได้คุมฟอร์มให้ — คนละอย่างกับ Wizard ของระบบอบรม)
- สถานะ: เสร็จแล้ว (ติ๊กวาดเส้น) · ปัจจุบัน (วงแหวนกระเพื่อมเบาๆ) · ยังไม่ถึง · มีปัญหา (`error`)
- เส้นเชื่อมระหว่างขั้นเติมสีไล่ตามเมื่อผ่านขั้น
- `orientation="horizontal"` (จอแคบซ่อนชื่อขั้นอื่น เหลือ "ขั้นที่ n จาก N" + ชื่อขั้นปัจจุบัน) · `vertical` (มี `content` ใต้ขั้นปัจจุบันได้)
- `onStepClick` → ขั้นที่ผ่านแล้วกดย้อนกลับได้ (ขั้นข้างหน้ากดไม่ได้ เว้นแต่ `clickable="all"`)
- `<ol>` + aria-current="step" · สถานะของแต่ละขั้นมีข้อความซ่อนให้ screen reader อ่าน


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `steps` **(จำเป็น)** | `Step[]` |  |  |
| `current` **(จำเป็น)** | `number` |  | ขั้นปัจจุบัน (เริ่ม 0) · เท่ากับ steps.length = เสร็จครบทุกขั้น |
| `orientation` | `"vertical" \| "horizontal"` | `'horizontal'` |  |
| `onStepClick` | `((index: number) => void)` |  |  |
| `clickable` | `"done" \| "all"` | `'done'` |  |
| `className` | `string` |  |  |

### type `Step`

```ts
type Step = {
  title: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  /** ขั้นนี้มีปัญหา (วงกลมเป็น ! สีแดง) */
  error?: boolean;
  /** เนื้อหาของขั้น — แสดงใต้ขั้นปัจจุบันในแนวตั้ง (ยืดออกแบบนุ่ม) */
  content?: React.ReactNode;
};
```


## `@/components/Accordion`

```ts
import { Collapse, Accordion, AccordionItem, AccordionProps } from '@/components/Accordion';
```

### `Collapse`

Collapse: กล่องยืด/หดความสูงแบบนุ่ม ใช้ห่ออะไรก็ได้ที่ต้องซ่อน/แสดง
- ใช้ grid-template-rows 0fr ↔ 1fr (เบราว์เซอร์คำนวณความสูงจริงเอง ไม่ต้องวัดด้วย JS · เนื้อหาเปลี่ยนขนาดระหว่างเปิดก็ไม่เพี้ยน)
- ตอนปิด เนื้อหาเป็น `inert` (กด Tab เข้าไม่ได้ screen reader ไม่อ่าน) แต่ยังอยู่ใน DOM (ค้นหาในหน้า/SEO เห็น · state ข้างในไม่หาย)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `open` **(จำเป็น)** | `boolean` |  |  |
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `Accordion`

Accordion: หัวข้อพับ/กางได้ (FAQ · หน้าตั้งค่า · รายละเอียดสินค้า)
- `type="single"` เปิดได้ทีละข้อ · `type="multiple"` เปิดหลายข้อพร้อมกัน · controlled หรือปล่อยให้จัดการเอง
- ARIA ตามแนวทาง accordion: ปุ่มหัวข้ออยู่ใน heading มี aria-expanded/aria-controls · เนื้อหาเป็น region
- คีย์บอร์ด: Enter/Space เปิดปิด · ↑↓ ย้ายระหว่างหัวข้อ · Home/End
- ยืดหดนุ่มด้วย Collapse · ลูกศรหมุน · ผู้ใช้ตั้งลดการเคลื่อนไหว = เปิดปิดทันที


**แบบที่ 1**

| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `items` **(จำเป็น)** | `AccordionItem[]` |  |  |
| `variant` | `"card" \| "separated" \| "flush"` |  | `card` = การ์ดใบเดียวมีเส้นคั่น · `separated` = แยกการ์ดทีละข้อ (ข้อที่เปิดยกขึ้น) · `flush` = ไม่มีพื้น มีแต่เส้นคั่น (วางในการ์ดอื่น) |
| `headingLevel` | `2 \| 6 \| 3 \| 4 \| 5` |  | ระดับหัวข้อ (h2–h6) ให้โครงหน้าถูกต้องสำหรับ screen reader |
| `className` | `string` |  |  |
| `type` | `"single"` |  |  |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` |  |  |
| `onValueChange` | `((v: string \| null) => void)` |  |  |
| `collapsible` | `boolean` |  | กดข้อที่เปิดอยู่แล้วปิดได้ (ค่าตั้งต้น true) · false = ต้องเปิดไว้หนึ่งข้อเสมอ |

**แบบที่ 2** — เมื่อ `type: "multiple"`

| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `items` **(จำเป็น)** | `AccordionItem[]` |  |  |
| `variant` | `"card" \| "separated" \| "flush"` |  | `card` = การ์ดใบเดียวมีเส้นคั่น · `separated` = แยกการ์ดทีละข้อ (ข้อที่เปิดยกขึ้น) · `flush` = ไม่มีพื้น มีแต่เส้นคั่น (วางในการ์ดอื่น) |
| `headingLevel` | `2 \| 6 \| 3 \| 4 \| 5` |  | ระดับหัวข้อ (h2–h6) ให้โครงหน้าถูกต้องสำหรับ screen reader |
| `className` | `string` |  |  |
| `type` **(จำเป็น)** | `"multiple"` |  |  |
| `value` | `string[]` |  |  |
| `defaultValue` | `string[]` |  |  |
| `onValueChange` | `((v: string[]) => void)` |  |  |

### type `AccordionItem`

```ts
type AccordionItem = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** บรรทัดรองใต้หัวข้อ */
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};
```

### type `AccordionProps`

```ts
type AccordionProps = Single | Multiple;
```


## `@/components/PillSwitch`

```ts
import { PillSwitch } from '@/components/PillSwitch';
```

### `PillSwitch`

สวิตช์แคปซูลสองฝั่ง — ใช้ร่วมกันทั้งปุ่มเปลี่ยนภาษาและเปลี่ยนธีม ให้หน้าตาเป็นชุดเดียวกัน
(รูปแบบเดียวกับ jb-protfolio): ตัวเลือกที่ไม่ได้ใช้อยู่จางๆ ในราง ปุ่มกลมเลื่อนไปอยู่ฝั่งที่เลือกและแสดงตัวเลือกปัจจุบัน


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `options` **(จำเป็น)** | `[ReactNode, ReactNode]` |  |  |
| `index` **(จำเป็น)** | `0 \| 1` |  |  |
| `onChange` **(จำเป็น)** | `(next: 0 \| 1) => void` |  |  |
| `label` **(จำเป็น)** | `string` |  |  |
| `className` | `string` |  |  |


## `@/components/ThemeProvider`

```ts
import { ThemeProvider, ThemeToggle, ThemeChoice, THEME_INIT_SCRIPT, useTheme } from '@/components/ThemeProvider';
```

### `ThemeProvider`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `children` **(จำเป็น)** | `ReactNode` |  |  |

### `ThemeToggle`

สวิตช์สว่าง/มืด — ค่าเริ่มต้นคือสว่าง ไม่ตามระบบเครื่อง


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `className` | `string` | `''` |  |

### type `ThemeChoice`

```ts
type ThemeChoice = 'light' | 'dark';
```

### `THEME_INIT_SCRIPT`

ทำงานก่อน React โหลด เพื่อไม่ให้หน้ากระพริบสีผิดโทน — localStorage อาจใช้ไม่ได้ (โหมดส่วนตัว) จึงครอบ try/catch

ชนิด: `"try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){}"`

### ฟังก์ชัน `useTheme`

```ts
useTheme() => { choice: ThemeChoice; setChoice: (c: ThemeChoice) => void; }
```


## `@/components/Kbd`

```ts
import { useIsMac, useShortcutLabel, useShortcut, Kbd, useAriaShortcut } from '@/components/Kbd';
```

### ฟังก์ชัน `useIsMac`

เป็นเครื่อง Apple หรือไม่ (รู้หลัง mount — ฝั่ง server ถือว่า Mac ไปก่อน แล้วแก้เป็นค่าจริงก่อนผู้ใช้เห็นต่างกันนาน)
ใช้ตัดสินใจแสดง ⌘ หรือ Ctrl และฟังปุ่มลัดให้ถูกระบบ

```ts
useIsMac() => boolean
```

### ฟังก์ชัน `useShortcutLabel`

ข้อความปุ่มลัดตามระบบ เช่น useShortcutLabel('mod+S') → "⌘S" / "Ctrl+S"

```ts
useShortcutLabel(shortcut: string) => string
```

### ฟังก์ชัน `useShortcut`

ผูกปุ่มลัด 'mod+<ตัวอักษร>' ทั้งหน้า (mod = ⌘ บน Mac · Ctrl บน Windows/Linux) · ตัวอักษรไม่สนพิมพ์เล็ก/ใหญ่
กันเบราว์เซอร์ทำงานเดิมของปุ่มนั้น (เช่น Ctrl+S บันทึกหน้าเว็บ · Ctrl+K ค้นในแถบที่อยู่)

```ts
useShortcut(key: string, handler: (e: KeyboardEvent) => void, enabled?: boolean) => void
```

### `Kbd`

Kbd: แสดงปุ่มลัดเป็นปุ่มคีย์บอร์ด ตามระบบของผู้ใช้
- เขียนครั้งเดียว `keys="mod+K"` → Mac แสดง ⌘ K · Windows แสดง Ctrl K
- `variant="caps"` แยกปุ่มละกล่อง (ค่าตั้งต้น) · `"text"` เป็นข้อความเดียว (ในเมนู/tooltip)
- screen reader อ่านเป็นข้อความเต็ม เช่น "Ctrl+K"


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `keys` **(จำเป็น)** | `string` |  |  |
| `variant` | `"text" \| "caps"` | `'caps'` |  |
| `className` | `string` |  |  |

### ฟังก์ชัน `useAriaShortcut`

สำหรับ aria-keyshortcuts ตามระบบ

```ts
useAriaShortcut(shortcut: string) => string
```

