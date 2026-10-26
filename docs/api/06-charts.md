# กราฟและแดชบอร์ด

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/components/charts/ChartCard`

```ts
import { ChartCard } from '@/components/charts/ChartCard';
```

### `ChartCard`

กรอบของกราฟ: หัวข้อ + คำอธิบาย + legend + ปุ่มสลับเป็นตาราง (ฝาแฝดที่เข้าถึงได้ของกราฟ)
- `loading`: กราฟเดิมค้างไว้แต่จางลง ไม่กระพริบเป็น skeleton และไม่ขยับเลย์เอาต์ (ตามสเปกการรีเฟรชของ dataviz)
- `empty`: แสดง EmptyState ขนาดเล็กแทนกราฟ
- ความสูงของกราฟอยู่ที่ตัวกราฟเอง (รวมแกน x แล้ว) กรอบจึงโตตามเนื้อหา ไม่เกิดสกรอลล์ซ้อน


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` **(จำเป็น)** | `string` |  |  |
| `description` | `string` |  |  |
| `actions` | `ReactNode` |  | ปุ่ม/ตัวควบคุมมุมขวาบน |
| `legend` | `ReactNode` |  |  |
| `table` | `ChartTable` |  | มีค่า = แสดงปุ่ม กราฟ\|ตาราง |
| `loading` | `boolean` |  |  |
| `empty` | `boolean` |  |  |
| `emptyText` | `string` |  |  |
| `footer` | `ReactNode` |  |  |
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |


## `@/components/charts/TrendChart`

```ts
import { TrendChart } from '@/components/charts/TrendChart';
```

### `TrendChart`

กราฟเส้น/พื้นที่ตามเวลา (หลายซีรีส์ได้)
- เส้น 2px · พื้นที่เป็นแค่ "ฝ้า" ไล่จาง (ไม่ทึบ) · กริดแนวนอนเส้นทึบบางเฉียบ ไม่มีกริดแนวตั้ง
- เลื่อนเมาส์: เส้นแนวตั้งจับที่จุดข้อมูลใกล้สุด + tooltip แสดงทุกซีรีส์พร้อมกัน (ไม่ต้องเล็งเส้น)
- จุดปลายเส้นมีวงแหวนสีพื้น 2px ให้เห็นชัดตรงที่ทับกัน · legend กดซ่อน/แสดงซีรีส์ได้ โดยสีไม่เปลี่ยน
- `variant="area"` มีฝ้าใต้เส้น · `"line"` เส้นล้วน (ซีรีส์เดียวใช้ area ดูดี หลายซีรีส์ใช้ line จะเห็นชัดกว่า)

> ชนิดข้อมูล: `T extends Record<string, unknown>`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `data` **(จำเป็น)** | `T[]` |  |  |
| `xKey` **(จำเป็น)** | `string` |  |  |
| `series` **(จำเป็น)** | `Series[]` |  |  |
| `variant` | `"area" \| "line"` | `'area'` |  |
| `height` | `number` | `280` | ความสูงรวมแกน x แล้ว |
| `xFormat` | `((x: string) => string)` |  | ป้ายบนแกน x และหัว tooltip |
| `yFormat` | `((n: number) => string)` | `formatCompact` |  |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |
| `target` | `{ value: number; label: string; }` |  | เส้นเป้าหมาย (เส้นประ = ค่าอ้างอิง ไม่ใช่ข้อมูล) |
| `showLegend` | `boolean` | `true` |  |
| `className` | `string` |  |  |


## `@/components/charts/BarsChart`

```ts
import { BarsChart } from '@/components/charts/BarsChart';
```

### `BarsChart`

กราฟแท่ง: คอลัมน์ (`orientation="column"`) หรือแท่งนอน (`"bar"` — เหมาะกับชื่อหมวดยาว/หมวดเยอะ)
- แท่งบางไม่เกิน 24px ปลายด้านข้อมูลโค้ง 4px ฝั่งฐานเหลี่ยม · แท่งที่ชนกัน/ซ้อนกันคั่นด้วยช่องว่างสีพื้น 2px (ไม่มีกรอบสี)
- `stacked`: ซ้อนกัน (ส่วนต่อของทั้งก้อน) · ปลายโค้งเฉพาะชิ้นบนสุดที่มีค่า
- `highlight`: เน้นแท่งเดียว (ค่า x นั้น) ที่เหลือเทาจาง — ใช้เมื่อเรื่องที่จะเล่าคือ "ตัวนี้" (ซีรีส์เดียวเท่านั้น)
- `labels`: ตัวเลขที่ปลายแท่ง (ซีรีส์เดียวเท่านั้น · ควรใช้กับแท่งไม่เกิน ~8) ที่เหลืออ่านจากแกนและ tooltip

> ชนิดข้อมูล: `T extends Record<string, unknown>`


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `data` **(จำเป็น)** | `T[]` |  |  |
| `xKey` **(จำเป็น)** | `string` |  | คีย์ของหมวด (แกนที่เป็นชื่อ) |
| `series` **(จำเป็น)** | `Series[]` |  |  |
| `orientation` | `"column" \| "bar"` | `'column'` |  |
| `stacked` | `boolean` | `false` |  |
| `highlight` | `string` |  |  |
| `labels` | `boolean` | `false` |  |
| `height` | `number` | `280` | ความสูงรวมแกนแล้ว |
| `xFormat` | `((x: string) => string)` |  |  |
| `yFormat` | `((n: number) => string)` | `formatCompact` | ป้ายแกนตัวเลข |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |
| `categoryWidth` | `number` | `96` | ความกว้างป้ายหมวดเมื่อเป็นแท่งนอน |
| `showLegend` | `boolean` | `true` |  |
| `className` | `string` |  |  |


## `@/components/charts/DonutChart`

```ts
import { DonutChart, DonutItem } from '@/components/charts/DonutChart';
```

### `DonutChart`

Donut: ส่วนต่อของทั้งหมด (part-to-whole) ที่มีไม่เกิน ~6 ชิ้น
- ส่วนที่เกิน `maxSlices` รวมเป็น "อื่นๆ" สีเทา (ไม่สร้างสีเพิ่ม) · เรียงจากมากไปน้อยตามเข็มนาฬิกา
- ชิ้นคั่นด้วยช่องว่าง 2px ปลายโค้ง · ตรงกลางโชว์ยอดรวม แล้วเปลี่ยนเป็นชิ้นที่ชี้ (ทั้งชี้วงและชี้รายการข้างๆ)
- คลิกชิ้นหรือรายการเพื่อปักหมุด (ตัวเลขกลางวงค้างที่ชิ้นนั้น) คลิกซ้ำหรือกด Esc เพื่อปล่อย · ชี้ชิ้นอื่นระหว่างปักหมุดดูชั่วคราวได้
- รายการข้างวงบอกชื่อ/ค่า/เปอร์เซ็นต์ครบ จึงไม่ต้องพึ่ง tooltip หรือสีอย่างเดียว · โฟกัสด้วยคีย์บอร์ดได้
- ค่าใกล้กันมากหรือต้องเทียบขนาด → ใช้ BarsChart จะอ่านง่ายกว่า (เทียบความยาวง่ายกว่าเทียบมุม)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `data` **(จำเป็น)** | `DonutItem[]` |  |  |
| `maxSlices` | `number` | `6` |  |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |
| `centerLabel` | `string` |  | ป้ายใต้ตัวเลขกลางวงตอนไม่ได้ชี้ชิ้นไหน (ค่าตั้งต้น "รวม") |
| `centerValue` | `string` |  | ตัวเลขกลางวง (ค่าตั้งต้น = ยอดรวม) |
| `size` | `number` | `208` |  |
| `className` | `string` |  |  |

### type `DonutItem`

```ts
type DonutItem = { label: string; value: number; /** ช่องสี 0–7 — ไม่ใส่ = ตามลำดับที่ส่งเข้ามา (สีติดกับรายการ ไม่ใช่กับอันดับ) */ slot?: number };
```


## `@/components/charts/Heatmap`

```ts
import { Heatmap } from '@/components/charts/Heatmap';
```

### `Heatmap`

Heatmap (แถว × คอลัมน์ เช่น วัน × ชั่วโมง): ความเข้มของสีเดียว = ปริมาณ (เฉดเดียว อ่อน→เข้ม ไม่ใช่รุ้ง)
สีมาจากสเกล brand จึงตามสี CI เอง · ช่องว่าง/ค่า 0 = เฉดอ่อนสุดที่ยังเห็นเป็นช่อง · มีแถบสเกลบอกช่วงค่า
ทุกช่องเป็นเป้า hover/โฟกัสเอง (tooltip บอกแถว/คอลัมน์/ค่า) และมี aria-label ครบ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `data` **(จำเป็น)** | `number[][]` |  | data[แถว][คอลัมน์] |
| `rowLabels` **(จำเป็น)** | `string[]` |  |  |
| `colLabels` **(จำเป็น)** | `string[]` |  |  |
| `colTickEvery` | `number` | `1` | แสดงป้ายคอลัมน์ทุกๆ n ช่อง (กันป้ายชนกันตอนมีคอลัมน์เยอะ) |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |
| `valueLabel` | `string` |  | ชื่อหน่วยใน tooltip เช่น "คน" |
| `lowLabel` | `string` |  |  |
| `highLabel` | `string` |  |  |
| `className` | `string` |  |  |


## `@/components/charts/CalendarHeatmap`

```ts
import { CalendarHeatmap, calendarTable } from '@/components/charts/CalendarHeatmap';
```

### `CalendarHeatmap`

Calendar heatmap ทั้งปี (แบบ GitHub): คอลัมน์ = สัปดาห์ · แถว = วันในสัปดาห์ · ช่องสี่เหลี่ยมจัตุรัส
- สี 5 ระดับ (0 = ไม่มีกิจกรรม · 1–4 จากควอร์ไทล์ของวันที่มีกิจกรรม) เฉดเดียวจากสีหลัก จึงตามสี CI/ธีม/ฝั่งเอง
- ช่องก่อนวันแรก/หลังวันสุดท้ายที่ไม่เต็มสัปดาห์เป็น "ช่องว่าง" (ต่างจากวันที่มีแต่ไม่มีกิจกรรม = สีเทาจาง)
- ป้ายเดือนตรงสัปดาห์ที่มีวันที่ 1 · วันที่แสดงปี พ.ศ. ในภาษาไทย (lib/calendar)
- ชี้/โฟกัสช่องเพื่อดูวันที่และค่า · คีย์บอร์ด: ลูกศรเลื่อนทีละวัน/สัปดาห์ Home/End ไปวันแรก/วันสุดท้าย (โฟกัสได้ทีละช่อง ไม่ใช่ 365 จุด)
- จอแคบเลื่อนแนวนอนได้ (ช่องไม่เล็กกว่า `cellMin` px) และเริ่มที่ช่วงล่าสุด · ควรมีตารางข้อมูลแทนคู่กันเสมอ (ดู `calendarTable` กับ ChartCard)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `days` **(จำเป็น)** | `DayValue[]` |  |  |
| `from` | `string` |  |  |
| `to` | `string` |  |  |
| `weekStart` | `0 \| 1` | `0` | 0 = สัปดาห์เริ่มวันอาทิตย์ (แบบ GitHub) · 1 = เริ่มวันจันทร์ |
| `valueLabel` | `string` |  | ชื่อหน่วยใน tooltip เช่น "บทเรียน" |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |
| `cellMin` | `number` | `13` | ความกว้างช่องขั้นต่ำ (px) — ต่ำกว่านี้จะเลื่อนแนวนอนแทนการบีบช่อง |
| `label` | `string` |  | ชื่อกราฟสำหรับ screen reader |
| `className` | `string` |  |  |

### ฟังก์ชัน `calendarTable`

ตารางข้อมูลแทนกราฟ (ฝาแฝดที่เข้าถึงได้) สำหรับ ChartCard · เรียงจากวันแรกไปวันสุดท้าย วันที่ตามภาษา

```ts
calendarTable(days: DayValue[], opts: { lang: "th" | "en"; dateLabel: string; valueLabel: string; from?: string | undefined; to?: string | undefined; format?: ((n: number) => string) | undefined; }) => ChartTable
```


## `@/components/charts/KpiCard`

```ts
import { KpiCard } from '@/components/charts/KpiCard';
```

### `KpiCard`

การ์ดตัวเลขสรุป (stat tile): ป้าย · ค่า · เปลี่ยนแปลงเทียบช่วงก่อน · แนวโน้ม
- ค่าเป็นตัวเลขตัวเดียวที่เด่นที่สุดในการ์ด ใช้ฟอนต์เดียวกับหน้า (ไม่ใช้ฟอนต์หัวข้อ) และตัวเลขสัดส่วนปกติ (ไม่ tabular)
- delta: สีบอกว่า "ดีหรือไม่ดี" (ตาม `goodWhen`) ไม่ใช่แค่ขึ้น/ลง · มีลูกศรและเครื่องหมาย +/− กำกับเสมอ ไม่พึ่งสีอย่างเดียว
  (ค่าใช้จ่ายขึ้น = แย่ → goodWhen="down")
- `trend`: เส้นเล็กท้ายการ์ด · `onClick` ทำให้กดได้ (เช่น ไปหน้ารายละเอียด)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `label` **(จำเป็น)** | `string` |  |  |
| `value` **(จำเป็น)** | `string \| number` |  |  |
| `unit` | `string` |  |  |
| `delta` | `number` |  | เปลี่ยนแปลงเป็นเปอร์เซ็นต์ เช่น 12.4 หรือ -3 |
| `deltaLabel` | `string` |  | ชื่อช่วงที่เทียบ เช่น "เทียบเดือนก่อน" — ต้องมีเมื่อมี delta ไม่งั้นตัวเลขไม่มีความหมาย |
| `goodWhen` | `"up" \| "down"` | `'up'` |  |
| `trend` | `number[]` |  |  |
| `icon` | `ReactNode` |  |  |
| `hint` | `string` |  |  |
| `onClick` | `(() => void)` |  |  |
| `className` | `string` |  |  |


## `@/components/charts/Sparkline`

```ts
import { Sparkline } from '@/components/charts/Sparkline';
```

### `Sparkline`

เส้นเล็กๆ แสดงแนวโน้ม (ไม่มีแกน ไม่มี tooltip — ตัวเลขจริงอยู่ในการ์ดข้างๆ จึงเป็นของตกแต่งที่ซ่อนจาก screen reader)
เส้น 2px + ฝ้าจางใต้เส้น + จุดปลายมีวงแหวนสีพื้น · สีตามช่องกราฟ (ค่าตั้งต้น = สีหลัก)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `data` **(จำเป็น)** | `number[]` |  |  |
| `slot` | `number` | `0` |  |
| `height` | `number` | `40` |  |
| `className` | `string` |  |  |


## `@/components/charts/RankList`

```ts
import { RankList } from '@/components/charts/RankList';
```

### `RankList`

ลิสต์อันดับ (Top N): ชื่อ + ค่า + แท่งบางใต้ชื่อ — อ่านง่ายกว่ากราฟแท่งนอนเมื่อมีชื่อยาวหรือเป็นแค่ 5–10 อันดับ
ทุกแท่งใช้สีเดียว (ช่อง `slot`) เพราะเป็นซีรีส์เดียว ไม่ไล่สีตามค่า — ความยาวแท่งบอกค่าอยู่แล้ว
แท่งโตขึ้นจาก 0 ตอนแสดงครั้งแรก (ผู้ใช้ตั้งลดการเคลื่อนไหวในระบบ = แสดงเลย)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `items` **(จำเป็น)** | `{ label: string; value: number; hint?: string \| undefined; }[]` |  |  |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |
| `slot` | `number` | `0` |  |
| `showRank` | `boolean` | `true` |  |
| `className` | `string` |  |  |


## `@/components/charts/theme`

```ts
import { useSeriesToggle, ChartLegend, TooltipCard, SeriesTooltip, seriesTable, formatCompact, formatFull, niceTicks, seriesColor, INK, heatLevelColor, Series, colorOf, useUid, ChartTable } from '@/components/charts/theme';
```

### ฟังก์ชัน `useSeriesToggle`

ซ่อน/แสดงซีรีส์ด้วย legend (กดเพื่อสลับ) — ซ่อนจนหมดไม่ได้ อย่างน้อยเหลือหนึ่ง

```ts
useSeriesToggle(series: Series[]) => { hidden: string[]; toggle: (key: string) => void; isVisible: (key: string) => boolean; }
```

### `ChartLegend`

Legend: ตัวคีย์สีตรงตามชนิดของ mark (เส้น = ขีดสั้น · แท่ง/พื้นที่ = สี่เหลี่ยมมน) · กดสลับแสดง/ซ่อนได้


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `series` **(จำเป็น)** | `Series[]` |  |  |
| `hidden` | `string[]` | `[]` |  |
| `onToggle` | `((key: string) => void)` |  |  |
| `kind` | `"line" \| "rect"` | `'rect'` |  |
| `className` | `string` |  |  |

### `TooltipCard`

กล่อง tooltip: ค่าเป็นตัวเด่น ชื่อซีรีส์เป็นรอง · คีย์เป็นขีดสั้นสีของซีรีส์ (ไม่ใช่กล่องสี)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` | `string` |  |  |
| `rows` **(จำเป็น)** | `TooltipRow[]` |  |  |
| `className` | `string` |  |  |

### `SeriesTooltip`

ตัวห่อ tooltip สำหรับ <Tooltip content={...}> ของ Recharts — แปลง payload เป็นแถวตามซีรีส์ที่ระบุ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `active` | `boolean` |  |  |
| `payload` | `readonly { dataKey?: unknown; value?: unknown; }[]` |  |  |
| `label` | `unknown` |  |  |
| `series` **(จำเป็น)** | `Series[]` |  |  |
| `labelFormat` | `((label: string) => string)` |  |  |
| `valueFormat` | `((n: number) => string)` | `formatFull` |  |

### ฟังก์ชัน `seriesTable`

แปลงข้อมูลกราฟเป็นตารางสำหรับปุ่ม "ตาราง" (ฝาแฝดที่เข้าถึงได้ของกราฟ)

```ts
seriesTable<T extends Record<string, unknown>>(data: T[], xKey: string, series: Series[], opts?: { xLabel?: string | undefined; format?: ((n: number) => string) | undefined; }) => ChartTable
```

### ฟังก์ชัน `formatCompact` (มาจาก chart-math.ts)

1,284 / 12.9K / 4.2M — ตามสเปก stat tile

```ts
formatCompact(n: number) => string
```

### ฟังก์ชัน `formatFull` (มาจาก chart-math.ts)

```ts
formatFull(n: number) => string
```

### ฟังก์ชัน `niceTicks` (มาจาก chart-math.ts)

ขีดบนแกนตัวเลขที่เป็นเลขกลมๆ (1, 2, 2.5, 5 × 10ⁿ) เริ่มที่ 0 — ปล่อยให้ Recharts เลือกเองจะได้ 350/700/1.1K ที่อ่านยาก
`max` = ค่าสูงสุดที่ต้องรองรับ · คืน ticks สำหรับ <YAxis ticks domain>

```ts
niceTicks(max: number, count?: number) => number[]
```

### ฟังก์ชัน `seriesColor`

ช่องสี 0–7 ของพาเลตกราฟ (เกินแปดวนกลับ — กราฟที่ซีรีส์เกินแปดควรรวมเป็น "อื่นๆ" ไม่ใช่ใช้สีเพิ่ม)

```ts
seriesColor(slot: number) => string
```

### `INK`

สีโครงกราฟ ล้วนมาจากโทเคนข้อความ/พื้นผิว จึงเปลี่ยนตามธีมสว่าง/มืดเอง

ชนิด: `{ grid: string; axis: string; hover: string; muted: string; text: string; textSoft: string; textStrong: string; surface: string; }`

### ฟังก์ชัน `heatLevelColor`

```ts
heatLevelColor(level: number) => string
```

### type `Series`

```ts
type Series = {
  key: string;
  label: string;
  /** ช่องสี 0–7 — ไม่ใส่ = ตามลำดับในอาร์เรย์ (ตั้งค่านี้ถ้าอยากให้ซีรีส์เดิมคงสีเดิมข้ามหลายกราฟ) */
  slot?: number;
};
```

### ฟังก์ชัน `colorOf`

```ts
colorOf(s: Series, index: number) => string
```

### ฟังก์ชัน `useUid`

id ไม่ซ้ำสำหรับ gradient/defs (useId มีเครื่องหมาย : ซึ่งใช้ใน url(#…) ไม่ได้)

```ts
useUid() => string
```

### type `ChartTable`

```ts
type ChartTable = { columns: string[]; rows: string[][] };
```

