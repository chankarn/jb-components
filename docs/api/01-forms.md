# พื้นฐานและฟอร์ม

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/components/ui`

```ts
import { Card, Button, Chip, Field, Input, Textarea, Progress, Empty, Skeleton, SkeletonText, Tabs, Select } from '@/components/ui';
```

### `Card`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `Button`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `variant` | `"primary" \| "dark" \| "outline" \| "ghost" \| "danger"` | `'primary'` |  |
| `size` | `"md" \| "sm"` | `'md'` |  |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `Chip`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `tone` | `"dark" \| "brand" \| "mute" \| "done"` | `'brand'` |  |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `Field`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `label` **(จำเป็น)** | `string` |  |  |
| `hint` | `string` |  |  |
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `as` | `"div" \| "label"` | `'label'` | ใช้ 'div' เมื่อในช่องมีปุ่ม/ช่องกรอกหลายอัน (เช่น ชิป) — ถ้าเป็น label เบราว์เซอร์จะส่ง hover/คลิกไปที่ปุ่มแรกที่เจอ |
| `field` | `string` |  | รหัสช่อง (data-field) ให้ summary ของ wizard เลื่อนมาหา |
| `error` | `string` |  | ข้อความผิดพลาดใต้ช่อง — มีค่าแล้วกรอบช่องกรอกเป็นสีแดง |
| `help` | `string` |  | คำอธิบายเพิ่มเติม แสดงเมื่อกดไอคอน ? ที่มุมขวาของหัวช่อง (ข้อจำกัดสั้นๆ ให้ใช้ hint) |

### `Input`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `Textarea`



รับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### `Progress`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `percent` **(จำเป็น)** | `number` |  |  |
| `className` | `string` |  |  |

### `Empty`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `text` **(จำเป็น)** | `string` |  |  |
| `description` | `string` |  |  |
| `action` | `ReactNode` |  |  |

### `Skeleton`

กล่องโครงตอนโหลด มีแถบแสงไล่ผ่าน (shimmer) · กำหนดขนาด/ทรงด้วย className เช่น `h-4 w-40` `size-10 rounded-full`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `className` | `string` |  |  |

### `SkeletonText`

โครงข้อความหลายบรรทัด (บรรทัดสุดท้ายสั้นกว่า)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `lines` | `number` | `3` |  |
| `className` | `string` |  |  |

### `Tabs` (มาจาก Tabs.tsx)

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

### `Select` (มาจาก Select.tsx)

กล่องเลือกแบบรายการเลื่อนลง — API เหมือน <select> เดิม (value / onChange(e.target.value) / <option> เป็น children)
เมนูวาดผ่าน portal จึงไม่ถูกตัดโดยตาราง/drawer ที่ overflow-hidden และพลิกขึ้นบนเองเมื่อล่างไม่พอ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` | `string \| number` |  |  |
| `onChange` | `((e: ChangeEvent<HTMLSelectElement, Element>) => void)` |  |  |
| `disabled` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `variant` | `"field" \| "pill" \| "compact"` | `'field'` |  |
| `placeholder` | `string` | `'—'` |  |
| `aria-label` | `string` |  |  |
| `id` | `string` |  |  |


## `@/components/FieldMessage`

```ts
import { FieldMessage } from '@/components/FieldMessage';
```

### `FieldMessage`

บรรทัดใต้ช่องของ Field (คำแนะนำ ↔ ข้อความผิดพลาด)
- error ใหม่/เปลี่ยนข้อความ → ช่องกรอกข้างบนสั่นหนึ่งครั้ง (ไม่สั่นถ้ามี error ตั้งแต่โหลดหน้า เช่น ผลตรวจจาก server)
- ข้อความยืด/จางเข้าออกนุ่มๆ ไม่ดันเลย์เอาต์กระตุก · error มีไอคอนด้วย (ไม่บอกด้วยสีอย่างเดียว)
แยกเป็น client component เพื่อให้ Field/ui.tsx ยังใช้ใน server component ได้


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `error` | `string` |  |  |
| `hint` | `string` |  |  |


## `@/components/Choice`

```ts
import { RadioGroup, CheckboxProps, Checkbox, RadioProps, Radio, RadioOption, SwitchProps, Switch } from '@/components/Choice';
```

### `RadioGroup`

RadioGroup: เลือกหนึ่งจากหลายตัวเลือก
- `variant="list"` วงกลมเรียงกัน · `variant="card"` เป็นการ์ดทั้งใบกดได้ ใบที่เลือกขอบ/พื้นเป็นสีแบรนด์ (เหมาะกับแพ็กเกจ วิธีจัดส่ง)
- คีย์บอร์ดแบบ native: Tab เข้ากลุ่มครั้งเดียว ลูกศรเลื่อน/เลือก


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `options` **(จำเป็น)** | `RadioOption[]` |  |  |
| `value` **(จำเป็น)** | `string \| null` |  |  |
| `onChange` **(จำเป็น)** | `(value: string) => void` |  |  |
| `name` | `string` |  | ชื่อฟิลด์ตอนส่งฟอร์ม (ไม่ระบุ = สร้างให้) |
| `label` | `string` |  | ชื่อกลุ่มสำหรับ screen reader (ถ้าไม่ได้ครอบด้วย Field) |
| `variant` | `"list" \| "card"` | `'list'` |  |
| `orientation` | `"vertical" \| "horizontal"` | `'vertical'` |  |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `disabled` | `boolean` |  |  |
| `className` | `string` |  |  |

### type `CheckboxProps`

```ts
type CheckboxProps = ChoiceBase & {
  /** สถานะ "เลือกบางส่วน" (ขีดกลาง) เช่น ช่อง "เลือกทั้งหมด" เมื่อเลือกไว้แค่บางแถว · กดแล้วเบราว์เซอร์ล้างสถานะนี้เองและส่ง onChange ตามปกติ */
  indeterminate?: boolean;
};
```

### `Checkbox`

Checkbox: เครื่องหมายถูกวาดเส้นตอนติ๊ก · กดแล้วยุบนิดหน่อย · `indeterminate` เป็นขีดกลาง (aria-checked="mixed")
ใช้แบบ controlled (`checked` + `onChange`) หรือ uncontrolled (`defaultChecked`) ได้เหมือน input ปกติ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `label` | `ReactNode` |  |  |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `description` | `ReactNode` |  | บรรทัดคำอธิบายใต้ชื่อ |
| `indeterminate` | `boolean` | `false` | สถานะ "เลือกบางส่วน" (ขีดกลาง) เช่น ช่อง "เลือกทั้งหมด" เมื่อเลือกไว้แค่บางแถว · กดแล้วเบราว์เซอร์ล้างสถานะนี้เองและส่ง onChange ตามปกติ |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### type `RadioProps`

```ts
type RadioProps = ChoiceBase;
```

### `Radio`

Radio เดี่ยว (ปกติใช้ผ่าน RadioGroup) · จุดกลางขยายออกแบบสปริงตอนเลือก


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `label` | `ReactNode` |  |  |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `description` | `ReactNode` |  | บรรทัดคำอธิบายใต้ชื่อ |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)

### type `RadioOption`

```ts
type RadioOption = { value: string; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean; icon?: React.ReactNode };
```

### type `SwitchProps`

```ts
type SwitchProps = ChoiceBase & {
  /** `start` = ชื่ออยู่ซ้าย สวิตช์ชิดขวา (แถวตั้งค่า ใส่ `className="w-full"` ร่วมด้วย) */
  placement?: 'start' | 'end';
};
```

### `Switch`

Switch: เปิด/ปิดค่าที่มีผลทันที (ตั้งค่า แจ้งเตือน) — ถ้าต้องกด "บันทึก" ก่อนถึงมีผล ใช้ Checkbox แทน
- input checkbox ที่มี role="switch" → screen reader อ่านว่า "สวิตช์ เปิด/ปิด" · Space สลับ
- ปุ่มกลมเลื่อนแบบเด้งนิดๆ และยืดออกตอนกดค้าง


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `label` | `ReactNode` |  |  |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `description` | `ReactNode` |  | บรรทัดคำอธิบายใต้ชื่อ |
| `placement` | `"start" \| "end"` | `'end'` | `start` = ชื่ออยู่ซ้าย สวิตช์ชิดขวา (แถวตั้งค่า ใส่ `className="w-full"` ร่วมด้วย) |

และรับ props มาตรฐานของ element HTML ด้านในได้ทั้งหมด (`className`, `onClick`, `disabled`, `aria-*` ฯลฯ)


## `@/components/SegmentedControl`

```ts
import { SegmentedControl, SegmentOption } from '@/components/SegmentedControl';
```

### `SegmentedControl`

SegmentedControl: ปุ่มกลุ่มเลือกได้ทีละอัน (วัน/สัปดาห์/เดือน · มุมมองตาราง/การ์ด)
- พื้นของตัวที่เลือกเลื่อนตามไปแบบสปริง (framer-motion layout) · ผู้ใช้ตั้งลดการเคลื่อนไหว = ย้ายทันที
- ARIA radiogroup: Tab เข้ากลุ่มครั้งเดียวที่ตัวที่เลือก · ← → ↑ ↓ เลื่อนและเลือก (ข้ามตัวที่ปิด) · Home/End
- `fullWidth` ยืดเต็มกล่อง (ช่องกว้างตามข้อความแล้วแบ่งที่เหลือ — จอแคบไม่ตัดคำก่อนจำเป็น) · ใส่ไอคอนอย่างเดียวได้ (ต้องมี `aria-label` ที่ตัวเลือก)

> ชนิดข้อมูล: `V extends string`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `options` **(จำเป็น)** | `SegmentOption<V>[]` |  |  |
| `value` **(จำเป็น)** | `V` |  |  |
| `onChange` **(จำเป็น)** | `(v: V) => void` |  |  |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `fullWidth` | `boolean` |  |  |
| `label` | `string` |  | ชื่อกลุ่มสำหรับ screen reader |
| `disabled` | `boolean` |  |  |
| `className` | `string` |  |  |

### type `SegmentOption`

```ts
type SegmentOption<V extends string = string> = { value: V; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; 'aria-label'?: string };
```


## `@/components/Slider`

```ts
import { Slider, SliderMark, SliderProps } from '@/components/Slider';
```

### `Slider`

Slider / Range slider
- ลากปุ่ม หรือคลิก/แตะที่ราง (ปุ่มที่ใกล้กว่าวิ่งมาหา แล้วลากต่อได้ทันที) · โหมดช่วงสองปุ่มไม่ข้ามกัน
- คีย์บอร์ดตามแนวทาง ARIA: ← → ทีละขั้น · Shift/PageUp/PageDown ก้าวใหญ่ · Home/End
- ป้ายค่าลอยเหนือปุ่มตอนชี้/ลาก/โฟกัส · `marks` จุดบนรางพร้อมป้าย · ตอนคลิกหรือกดคีย์ปุ่มเลื่อนนุ่มๆ ตอนลากตามนิ้วตรงๆ
- ปุ่มเป็น role="slider" มี aria-valuetext ตาม `format` · มี input hidden ส่งค่าในฟอร์มได้


**แบบที่ 1**

| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` |  |  |
| `marks` | `SliderMark[]` |  | จุดบอกตำแหน่งบนราง (และป้ายใต้ราง ถ้าใส่ label) |
| `format` | `((v: number) => string)` |  | แปลงค่าเป็นข้อความ (ป้ายลอยเหนือปุ่ม + ที่ screen reader อ่าน) เช่น `(v) => `฿${v.toLocaleString()}`` |
| `tooltip` | `"auto" \| "always" \| "never"` |  | ป้ายค่าลอยเหนือปุ่ม: `auto` = ตอนชี้/ลาก/โฟกัส · `always` · `never` |
| `label` | `string` |  | ชื่อสำหรับ screen reader (ปุ่มของโหมดช่วงจะต่อท้ายว่า "ต่ำสุด"/"สูงสุด") |
| `name` | `string` |  | ชื่อฟิลด์สำหรับส่งฟอร์ม (โหมดช่วงส่งเป็น name[0], name[1]) |
| `disabled` | `boolean` |  |  |
| `className` | `string` |  |  |
| `range` | `false` |  |  |
| `value` **(จำเป็น)** | `number` |  |  |
| `onChange` **(จำเป็น)** | `(v: number) => void` |  |  |
| `onCommit` | `((v: number) => void)` |  | เรียกตอนปล่อยปุ่ม/จบการกดคีย์ — ใช้ยิง API ครั้งเดียวแทนทุกการขยับ |

**แบบที่ 2** — เมื่อ `range: true`

| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` |  |  |
| `marks` | `SliderMark[]` |  | จุดบอกตำแหน่งบนราง (และป้ายใต้ราง ถ้าใส่ label) |
| `format` | `((v: number) => string)` |  | แปลงค่าเป็นข้อความ (ป้ายลอยเหนือปุ่ม + ที่ screen reader อ่าน) เช่น `(v) => `฿${v.toLocaleString()}`` |
| `tooltip` | `"auto" \| "always" \| "never"` |  | ป้ายค่าลอยเหนือปุ่ม: `auto` = ตอนชี้/ลาก/โฟกัส · `always` · `never` |
| `label` | `string` |  | ชื่อสำหรับ screen reader (ปุ่มของโหมดช่วงจะต่อท้ายว่า "ต่ำสุด"/"สูงสุด") |
| `name` | `string` |  | ชื่อฟิลด์สำหรับส่งฟอร์ม (โหมดช่วงส่งเป็น name[0], name[1]) |
| `disabled` | `boolean` |  |  |
| `className` | `string` |  |  |
| `range` **(จำเป็น)** | `true` |  |  |
| `value` **(จำเป็น)** | `[number, number]` |  |  |
| `onChange` **(จำเป็น)** | `(v: [number, number]) => void` |  |  |
| `onCommit` | `((v: [number, number]) => void)` |  |  |
| `minGap` | `number` |  | ระยะห่างน้อยสุดระหว่างสองปุ่ม |

### type `SliderMark`

```ts
type SliderMark = number | { value: number; label?: React.ReactNode };
```

### type `SliderProps`

```ts
type SliderProps = SingleProps | RangeProps;
```


## `@/components/NumberInput`

```ts
import { NumberInput, NumberInputProps } from '@/components/NumberInput';
```

### `NumberInput`

NumberInput: ช่องตัวเลขที่ใส่ comma ให้เอง · ปุ่ม +/− (กดค้างแล้ววิ่งเร็วขึ้นเรื่อยๆ) · จำกัด min/max
- พิมพ์ได้อิสระระหว่างโฟกัส (รับ comma, เลขไทย) · ออกจากช่องแล้วจัดรูปแบบ ปัดทศนิยม และบีบให้อยู่ในช่วง
- ลบจนว่างได้ (ค่าเป็น null ไม่กลายเป็น 0) · ↑↓ ทีละ step · Shift+↑↓ ทีละ 10 step · PageUp/Down · Home/End (เมื่อมี min/max)
- ใช้ type="text" + inputMode → มือถือขึ้นแป้นตัวเลข แต่ไม่มีปัญหาแบบ type="number" (ล้อเมาส์เปลี่ยนค่า, comma ไม่ได้, "e" พิมพ์ได้)
- role="spinbutton" พร้อม aria-valuemin/max/now


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `number \| null` |  |  |
| `onChange` **(จำเป็น)** | `(v: number \| null) => void` |  |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` | `1` | ขั้นของปุ่ม +/− และลูกศร (Shift = ×10) |
| `precision` | `number` |  | ทศนิยมตายตัว เช่น 2 สำหรับเงิน (ไม่ระบุ = ตามที่พิมพ์) |
| `prefix` | `ReactNode` |  | ข้อความหน้า/หลังตัวเลข เช่น "฿" หรือ "ชิ้น" |
| `suffix` | `ReactNode` |  |  |
| `hideButtons` | `boolean` |  | ซ่อนปุ่ม +/− (เหลือช่องตัวเลขที่มี comma ให้) |
| `variant` | `"field" \| "compact"` | `'field'` |  |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `name` | `string` |  |  |
| `id` | `string` |  |  |
| `className` | `string` |  |  |
| `aria-label` | `string` |  |  |

### type `NumberInputProps`

```ts
type NumberInputProps = {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  /** ขั้นของปุ่ม +/− และลูกศร (Shift = ×10) */
  step?: number;
  /** ทศนิยมตายตัว เช่น 2 สำหรับเงิน (ไม่ระบุ = ตามที่พิมพ์) */
  precision?: number;
  /** ข้อความหน้า/หลังตัวเลข เช่น "฿" หรือ "ชิ้น" */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** ซ่อนปุ่ม +/− (เหลือช่องตัวเลขที่มี comma ให้) */
  hideButtons?: boolean;
  variant?: Variant;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
};
```


## `@/components/Select`

```ts
import { Select } from '@/components/Select';
```

### `Select`

กล่องเลือกแบบรายการเลื่อนลง — API เหมือน <select> เดิม (value / onChange(e.target.value) / <option> เป็น children)
เมนูวาดผ่าน portal จึงไม่ถูกตัดโดยตาราง/drawer ที่ overflow-hidden และพลิกขึ้นบนเองเมื่อล่างไม่พอ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` | `string \| number` |  |  |
| `onChange` | `((e: ChangeEvent<HTMLSelectElement, Element>) => void)` |  |  |
| `disabled` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `variant` | `"field" \| "pill" \| "compact"` | `'field'` |  |
| `placeholder` | `string` | `'—'` |  |
| `aria-label` | `string` |  |  |
| `id` | `string` |  |  |


## `@/components/Combobox`

```ts
import { Combobox, ComboOption, ComboboxProps } from '@/components/Combobox';
```

### `Combobox`

Combobox: ค้นหา + เลือกอันเดียวหรือหลายอัน (`multiple`)
- พิมพ์เพื่อกรอง (ไม่สนตัวพิมพ์/เครื่องหมายกำกับ · หลายคำต้องเจอครบ · ค้นเจอจาก `keywords`/`description` ด้วย) ตัวอักษรที่ค้นเจอถูกไฮไลต์
- โหมดหลายอัน: เลือกแล้วเป็นชิปในช่อง กดลบทีละอันหรือ Backspace ตอนช่องค้นหาว่าง · เลือกต่อเนื่องได้โดยแผงไม่ปิด · `maxSelected` จำกัดจำนวน
- คีย์บอร์ด: ↑↓ เลื่อน (ข้ามตัวที่ปิดไว้) · Enter เลือก · Esc ล้างคำค้นก่อน แล้วค่อยปิด (ไม่ลามไปปิด dialog ที่ครอบอยู่) · Tab ปิด
- ARIA combobox/listbox ครบ (aria-activedescendant · aria-multiselectable) · วาดผ่าน portal พลิกขึ้นบนเอง ใช้ใน dialog/drawer ได้


**แบบที่ 1**

| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `options` **(จำเป็น)** | `ComboOption[]` |  |  |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `clearable` | `boolean` |  | แสดงปุ่ม × ล้างค่าทั้งหมดบนช่อง |
| `variant` | `"field" \| "pill" \| "compact"` |  |  |
| `emptyText` | `string` |  | ข้อความตอนค้นไม่เจอ (ค่าตั้งต้น "ไม่มีตัวเลือก") |
| `onCreate` | `((label: string) => void)` |  | พิมพ์ข้อความที่ยังไม่มีในรายการแล้วขึ้นแถว "เพิ่ม “…”" — ฟังก์ชันนี้ต้องเพิ่มตัวเลือกใหม่ (และเลือกให้ถ้าต้องการ) เอง |
| `className` | `string` |  |  |
| `id` | `string` |  |  |
| `aria-label` | `string` |  |  |
| `multiple` | `false` |  |  |
| `value` **(จำเป็น)** | `string \| null` |  |  |
| `onChange` **(จำเป็น)** | `(v: string \| null) => void` |  |  |

**แบบที่ 2** — เมื่อ `multiple: true`

| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `options` **(จำเป็น)** | `ComboOption[]` |  |  |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `clearable` | `boolean` |  | แสดงปุ่ม × ล้างค่าทั้งหมดบนช่อง |
| `variant` | `"field" \| "pill" \| "compact"` |  |  |
| `emptyText` | `string` |  | ข้อความตอนค้นไม่เจอ (ค่าตั้งต้น "ไม่มีตัวเลือก") |
| `onCreate` | `((label: string) => void)` |  | พิมพ์ข้อความที่ยังไม่มีในรายการแล้วขึ้นแถว "เพิ่ม “…”" — ฟังก์ชันนี้ต้องเพิ่มตัวเลือกใหม่ (และเลือกให้ถ้าต้องการ) เอง |
| `className` | `string` |  |  |
| `id` | `string` |  |  |
| `aria-label` | `string` |  |  |
| `multiple` **(จำเป็น)** | `true` |  |  |
| `value` **(จำเป็น)** | `string[]` |  |  |
| `onChange` **(จำเป็น)** | `(v: string[]) => void` |  |  |
| `maxSelected` | `number` |  | เลือกได้สูงสุดกี่อัน |
| `maxVisibleChips` | `number` |  | ตอนไม่ได้โฟกัสแสดงชิปแค่กี่อัน ที่เหลือเป็น "+N" (ค่าตั้งต้น 3) |

### type `ComboboxProps`

```ts
type ComboboxProps = Single | Multi;
```


## `@/components/TagInput`

```ts
import { TagInput, TagInputProps } from '@/components/TagInput';
```

### `TagInput`

TagInput: พิมพ์แล้วกด Enter หรือ comma เป็นชิป
- วางข้อความหลายบรรทัด/คั่นด้วย comma → แตกเป็นหลายแท็กทีเดียว
- ชิปเด้งเข้าแบบสปริงพร้อมวงกระเพื่อม · ลบแล้วหดหาย ชิปที่เหลือเลื่อนเข้าที่นุ่มๆ
- พิมพ์ซ้ำ → ชิปเดิมสั่นบอกว่ามีแล้ว · ไม่ผ่าน `validate`/ยาวเกิน → ช่องสั่น + ข้อความ
- Backspace ตอนช่องว่าง: ครั้งแรกเล็งชิปท้าย (ขอบแดง) ครั้งที่สองลบ
- คีย์บอร์ด: ← จากช่องว่างเข้าไปเลือกชิป · ← → เลื่อน · Backspace/Delete ลบ · Enter/F2 หรือดับเบิลคลิกแก้ไขชิป · Esc ยกเลิกการแก้
- ประกาศการเพิ่ม/ลบ/ซ้ำผ่าน aria-live · ใช้กับ Field ได้ (กรอบแดงตอน error)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `string[]` |  |  |
| `onChange` **(จำเป็น)** | `(tags: string[]) => void` |  |  |
| `placeholder` | `string` |  |  |
| `max` | `number` |  | จำนวนแท็กสูงสุด (แสดงตัวนับ n/max) |
| `maxLength` | `number` |  | ความยาวสูงสุดต่อแท็ก |
| `validate` | `((tag: string) => boolean)` |  | ตรวจแท็กก่อนเพิ่ม (เช่น รูปแบบอีเมล) · ไม่ผ่าน = ช่องสั่นพร้อมข้อความ `invalidText` |
| `invalidText` | `string` |  |  |
| `transform` | `((tag: string) => string)` |  | แปลงก่อนเพิ่ม เช่น ตัด # หรือทำเป็นตัวเล็ก |
| `variant` | `"brand" \| "colorful"` | `'brand'` | `colorful` = ชิปแต่ละแท็กได้สีประจำตัว (จากชุดสีกราฟที่ตามสี CI · แท็กเดิมได้สีเดิมเสมอ) |
| `disabled` | `boolean` |  |  |
| `id` | `string` |  |  |
| `className` | `string` |  |  |
| `aria-label` | `string` |  |  |

### type `TagInputProps`

```ts
type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** จำนวนแท็กสูงสุด (แสดงตัวนับ n/max) */
  max?: number;
  /** ความยาวสูงสุดต่อแท็ก */
  maxLength?: number;
  /** ตรวจแท็กก่อนเพิ่ม (เช่น รูปแบบอีเมล) · ไม่ผ่าน = ช่องสั่นพร้อมข้อความ `invalidText` */
  validate?: (tag: string) => boolean;
  invalidText?: string;
  /** แปลงก่อนเพิ่ม เช่น ตัด # หรือทำเป็นตัวเล็ก */
  transform?: (tag: string) => string;
  /** `colorful` = ชิปแต่ละแท็กได้สีประจำตัว (จากชุดสีกราฟที่ตามสี CI · แท็กเดิมได้สีเดิมเสมอ) */
  variant?: Variant;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
};
```


## `@/components/DatePicker`

```ts
import { DatePicker } from '@/components/DatePicker';
```

### `DatePicker`

ปฏิทินเลือกวันที่ (แทน <input type="date"> ของเบราว์เซอร์ที่หน้าตาไม่เหมือนกันทุกเครื่อง)
- ไทยแสดงปี พ.ศ. · อังกฤษแสดง ค.ศ. แต่ค่าที่ส่งออกเป็น ISO (ค.ศ.) เสมอ
- คีย์บอร์ด: ลูกศรเลื่อนวัน/สัปดาห์ · PageUp/PageDown เปลี่ยนเดือน · Home/End ต้น/ท้ายสัปดาห์ · Enter เลือก · Esc ปิด
- วาดผ่าน portal และพลิกขึ้นบนเองเมื่อล่างจอไม่พอ จึงใช้ใน dialog/drawer/ตารางได้


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `string` |  | `YYYY-MM-DD` (หรือ `YYYY-MM-DDTHH:mm` เมื่อ withTime) — ค่าว่าง = ยังไม่เลือก |
| `onChange` **(จำเป็น)** | `(v: string) => void` |  |  |
| `min` | `string` |  | ขอบเขตวันที่เลือกได้ `YYYY-MM-DD` |
| `max` | `string` |  |  |
| `withTime` | `boolean` |  |  |
| `clearable` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `placeholder` | `string` |  |  |
| `variant` | `"field" \| "pill" \| "compact"` | `'field'` |  |
| `className` | `string` |  |  |
| `id` | `string` |  |  |
| `aria-label` | `string` |  |  |


## `@/components/DateRangePicker`

```ts
import { DateRangePicker, DateRange, PresetKey } from '@/components/DateRangePicker';
```

### `DateRangePicker`

ตัวเลือกช่วงวันที่ (ต่อยอดจาก DatePicker) — ไทยแสดงปี พ.ศ. · อังกฤษ ค.ศ. · ค่าที่ส่งออกเป็น ISO (ค.ศ.) เสมอ
- คลิกแรก = วันเริ่ม · คลิกที่สอง = วันสิ้นสุด (คลิกย้อนก็ได้ ระบบเรียงให้) · ระหว่างรอวันสิ้นสุดเห็นตัวอย่างช่วงตามเมาส์/โฟกัส
- ค่าสำเร็จรูปเป็นแถวให้กดทีเดียว (มีเครื่องหมายถูกที่ช่วงที่ตรงกับค่าปัจจุบัน) · จอกว้างปฏิทินสองเดือน จอแคบหนึ่งเดือน + ชิปค่าสำเร็จรูปด้านบน
- `maxDays` จำกัดความยาวช่วง (วันที่ไกลเกินจะกดไม่ได้ระหว่างเลือกวันสิ้นสุด) · `min`/`max` จำกัดขอบเขต
- คีย์บอร์ด: ลูกศรเลื่อนวัน/สัปดาห์ · PageUp/PageDown เดือน (Shift = ปี) · Home/End ต้น/ท้ายสัปดาห์ · Enter/Space เลือก
  · Esc ขณะรอวันสิ้นสุด = ยกเลิกการเลือก (ค่าเดิมไม่เปลี่ยน) · Esc อีกครั้งปิด (ไม่ลามไปปิด dialog ที่ครอบอยู่)
- วาดผ่าน portal และพลิกขึ้นบนเองเมื่อล่างจอไม่พอ จึงใช้ใน dialog/drawer/แถวตัวกรองได้ · ค่าเปลี่ยนเมื่อเลือกวันสิ้นสุดแล้วเท่านั้น


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `DateRange \| null` |  | ช่วงที่เลือก `{ from, to }` เป็น `YYYY-MM-DD` (ค.ศ.) · null = ยังไม่เลือก |
| `onChange` **(จำเป็น)** | `(v: DateRange \| null) => void` |  |  |
| `min` | `string` |  | ขอบเขตวันที่เลือกได้ `YYYY-MM-DD` |
| `max` | `string` |  |  |
| `maxDays` | `number` |  | ช่วงยาวสุดที่เลือกได้ (จำนวนวัน รวมวันเริ่มและวันจบ) |
| `presets` | `boolean \| PresetKey[]` | `true` | true = ค่าสำเร็จรูปมาตรฐาน (วันนี้ · 7/30/90 วัน · เดือนนี้ · เดือนก่อน) · false = ไม่แสดง · หรือระบุเองเช่น ['last7','last30'] |
| `clearable` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `placeholder` | `string` |  |  |
| `variant` | `"field" \| "pill" \| "compact"` | `'field'` |  |
| `className` | `string` |  |  |
| `id` | `string` |  |  |
| `aria-label` | `string` |  |  |


## `@/components/OtpInput`

```ts
import { OtpInput } from '@/components/OtpInput';
```

### `OtpInput`

OTP 6 ช่อง (FR-L-02): เลื่อนช่องอัตโนมัติ · วางรหัส 6 หลักทีเดียว · Backspace ย้อนช่อง · กรอกครบแล้วเรียก onComplete เอง
`value` เป็นสตริงตัวเลขยาวไม่เกิน length — คอมโพเนนต์นี้ไม่เก็บ state เอง
เอฟเฟกต์: ตัวเลขเด้งเข้าช่องตอนพิมพ์ · `invalid` กลายเป็น true (รหัสผิด) → ทั้งแถวสั่นหนึ่งครั้ง


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `string` |  |  |
| `onChange` **(จำเป็น)** | `(v: string) => void` |  |  |
| `onComplete` | `((v: string) => void)` |  |  |
| `length` | `number` | `6` |  |
| `disabled` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `autoFocus` | `boolean` | `true` |  |


## `@/components/FileDrop`

```ts
import { FileDrop, UploadFn, UploadedFile } from '@/components/FileDrop';
```

### `FileDrop`

FileDrop: ลากไฟล์มาวางหรือกดเลือก · หลายไฟล์ · แถบความคืบหน้ารายไฟล์ · ยกเลิก/ลองใหม่/ลบ
- ผูกกับระบบอัปโหลดของโปรเจกต์ผ่าน `upload` (ดู UploadFn) · ได้รายการไฟล์ที่อัปโหลดเสร็จทาง `onChange`
- ตรวจชนิด (`accept` แบบเดียวกับ <input accept>) ขนาด (`maxSize` ไบต์) จำนวน (`maxFiles`) ก่อนอัปโหลด — ไฟล์ที่ไม่ผ่านแจ้งเป็นรายไฟล์ ไม่ทำให้ไฟล์อื่นตก
- รูปภาพมีภาพย่อ · ไฟล์อื่นมีไอคอนตามชนิด · แถวเข้า/ออกแบบนุ่มๆ
- กล่องวางไฟล์กด Tab ถึงและกด Enter/Space เปิดหน้าต่างเลือกไฟล์ได้ · สถานะอัปโหลดประกาศผ่าน aria-live


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `upload` **(จำเป็น)** | `UploadFn` |  |  |
| `onChange` | `((files: UploadedFile[]) => void)` |  |  |
| `accept` | `string` |  |  |
| `maxSize` | `number` |  |  |
| `maxFiles` | `number` |  |  |
| `multiple` | `boolean` | `true` |  |
| `disabled` | `boolean` |  |  |
| `hint` | `string` |  | ข้อความใต้หัวกล่อง (ไม่ระบุ = สรุปจาก maxFiles/maxSize ให้) |
| `className` | `string` |  |  |

### type `UploadFn`

อัปโหลดไฟล์หนึ่งไฟล์ แล้วคืนค่าที่จะเก็บ (เช่น asset_key หรือ URL) · เรียก onProgress(0..1) ระหว่างทาง · ยกเลิกได้ผ่าน signal · โยน Error = ไม่สำเร็จ

```ts
type UploadFn = (file: File, ctx: { onProgress: (ratio: number) => void; signal: AbortSignal }) => Promise<string>;
```

### type `UploadedFile`

```ts
type UploadedFile = { id: string; name: string; size: number; type: string; value: string };
```


## `@/components/admin/ImagePicker`

```ts
import { ImagePicker } from '@/components/admin/ImagePicker';
```

### `ImagePicker`

ช่องแนบรูป — เก็บเป็นค่าสตริง (เช่น asset_key) · ผูกกับระบบอัปโหลดของโปรเจกต์ปลายทางผ่าน props
(ต้นทางเรียก uploadAsset/adminAssetUrl ของระบบอบรมตรงๆ — ที่นี่แยกออกมาเป็น `upload` และ `resolveUrl`)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `string \| null` |  |  |
| `onChange` **(จำเป็น)** | `(key: string \| null) => void` |  |  |
| `upload` **(จำเป็น)** | `(file: File) => Promise<string>` |  | อัปโหลดไฟล์แล้วคืนค่าที่จะเก็บ (เช่น asset_key) · โยน Error เพื่อแสดง toast |
| `resolveUrl` **(จำเป็น)** | `(value: string) => string` |  | แปลงค่าที่เก็บเป็น URL สำหรับแสดงรูป |
| `size` | `"md" \| "sm"` | `'md'` |  |
| `label` | `string` |  |  |


## `@/components/admin/PasswordFields`

```ts
import { PasswordInput, passwordChecks, PasswordRules } from '@/components/admin/PasswordFields';
```

### `PasswordInput`

ช่องรหัสผ่าน: ไอคอนกุญแจซ้าย ปุ่มแสดง/ซ่อนขวา (ใช้แบบเดียวกับหน้า login แอดมิน)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `value` **(จำเป็น)** | `string` |  |  |
| `onChange` **(จำเป็น)** | `(v: string) => void` |  |  |
| `autoComplete` **(จำเป็น)** | `string` |  |  |
| `autoFocus` | `boolean` |  |  |

### ฟังก์ชัน `passwordChecks`

เงื่อนไขรหัสผ่านใหม่ติ๊กเขียวทีละข้อตามที่พิมพ์ (กติกาเดียวกับ server: ≥ 10 ตัว มีตัวอักษรและตัวเลข)

```ts
passwordChecks(next: string, again: string, t: Translate) => { ok: boolean; label: string; }[]
```

### `PasswordRules`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `next` **(จำเป็น)** | `string` |  |  |
| `again` **(จำเป็น)** | `string` |  |  |

