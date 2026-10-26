# กราฟและแดชบอร์ด

import ทั้งหมดจาก `@/components/charts` (ต้องติดตั้ง `recharts react-is`) · props ครบ: [docs/api/06-charts.md](../../api/06-charts.md) · ทุกแบบรันได้ที่ `/dashboard` (`src/app/dashboard/DashboardDemo.tsx`)

## เลือกกราฟจากคำถามของข้อมูล

| ข้อมูลต้องตอบว่า… | ใช้ | ไม่ใช้ |
|---|---|---|
| ตัวเลขเดียวที่สำคัญ (ยอดวันนี้ จำนวนผู้ใช้) | `KpiCard` / `StatCard` | กราฟ |
| เปลี่ยนไปอย่างไรตามเวลา | `TrendChart` | แท่งเมื่อจุดเวลาเยอะ (> ~20) |
| หมวดไหนมาก/น้อย | `BarsChart` (ชื่อยาว → `orientation="bar"`) | Donut |
| ส่วนแบ่งของทั้งหมด (≤ 6 ส่วน ต่างกันชัด) | `DonutChart` | Donut เมื่อค่าใกล้กัน → แท่ง |
| ส่วนแบ่งของทั้งหมดตามหมวด | `BarsChart stacked` | หลาย Donut |
| อันดับ Top 5–10 | `RankList` | แท่งนอนที่ตัดชื่อ |
| ความหนาแน่นสองมิติ (วัน × ชั่วโมง) | `Heatmap` | |
| กิจกรรมรายวันทั้งปี | `CalendarHeatmap` | |
| แนวโน้มจิ๋วข้างตัวเลข | `Sparkline` / `trend` ใน KpiCard/StatCard | |

**ห้าม:** กราฟสองแกน y (แยกเป็นสองกราฟ) · สีรุ้ง/สีที่สร้างเอง · เกิน 8 ซีรีส์ (รวมเป็น "อื่นๆ" หรือแยกกราฟ) · สีแดง/เขียวสถานะใช้เป็นสีซีรีส์ · ตัวเลขบนทุกจุด

## ChartCard (กรอบของทุกกราฟ)

- `title` + `description` (ช่วงเวลา/หน่วย) · `actions` มุมขวาบน
- **`table` = ฝาแฝดที่เข้าถึงได้** (ปุ่มสลับ กราฟ|ตาราง) — ใส่ทุกกราฟที่มีตัวเลขสำคัญ: `seriesTable(data, xKey, series, { xLabel })`
- `loading` = กราฟเดิมจางลง (ไม่กระพริบ) · `empty` = แสดงสถานะว่าง
- ความสูงกำหนดที่ตัวกราฟ (`height`) ไม่ใช่ที่การ์ด

## Series (สีของซีรีส์)

```ts
type Series = { key: string; label: string; slot?: number }; // slot 0–7 = ช่องสีของพาเลตกราฟ (ตามสี CI)
```

- ไม่ใส่ `slot` = ตามลำดับในอาร์เรย์ · **ซีรีส์เดียวกันต้องได้สีเดิมทุกกราฟ** → ตั้ง `slot` ให้คงที่ (เช่น "ออนไลน์" = 1 เสมอ)
- ซ่อน/กรองซีรีส์แล้วสีที่เหลือต้องไม่เปลี่ยน (สีผูกกับซีรีส์ ไม่ใช่ลำดับ) — legend ของ TrendChart/BarsChart จัดการให้แล้ว

## TrendChart

```tsx
'use client';

import { ChartCard, TrendChart, seriesTable, type Series } from '@/components/charts';

const DATA = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'].map((m, i) => ({
  month: m, online: 120 + i * 18 + (i % 2) * 10, store: 160 - i * 4,
}));
const SERIES: Series[] = [{ key: 'online', label: 'ออนไลน์', slot: 0 }, { key: 'store', label: 'หน้าร้าน', slot: 1 }];

export function SalesTrend() {
  return (
    <ChartCard title="ยอดขายรายเดือน" description="พันบาท · ม.ค.–มิ.ย. 2569" table={seriesTable(DATA, 'month', SERIES, { xLabel: 'เดือน' })}>
      <TrendChart data={DATA} xKey="month" series={SERIES} variant="line" target={{ value: 170, label: 'เป้า' }} valueFormat={(n) => `${n} พันบาท`} />
    </ChartCard>
  );
}
```

- ซีรีส์เดียว → `variant="area"` + `showLegend={false}` (ชื่อซีรีส์อยู่ในหัวการ์ดแล้ว) · หลายซีรีส์ → `"line"`
- `xFormat` ป้ายแกน x · `yFormat` ป้ายแกน y (ค่าตั้งต้น 12.9K) · `valueFormat` ตัวเลขใน tooltip (ค่าตั้งต้นเต็ม)
- ข้อมูลต้องเป็นค่าคงที่ระหว่าง server/client (ห้าม `Math.random()` ตอน render → hydration error)

## BarsChart

```tsx
'use client';

import { BarsChart, ChartCard, seriesTable, type Series } from '@/components/charts';

const BRANCH = [
  { name: 'สาขาสยามสแควร์', orders: 820 }, { name: 'สาขาอารีย์', orders: 610 },
  { name: 'สาขาบางนา', orders: 540 }, { name: 'สาขาลาดพร้าว', orders: 430 },
];
const S: Series[] = [{ key: 'orders', label: 'คำสั่งซื้อ' }];

export function BranchBars() {
  return (
    <ChartCard title="คำสั่งซื้อตามสาขา" description="30 วันล่าสุด" table={seriesTable(BRANCH, 'name', S, { xLabel: 'สาขา' })}>
      <BarsChart data={BRANCH} xKey="name" series={S} orientation="bar" categoryWidth={120} labels highlight="สาขาสยามสแควร์" showLegend={false} />
    </ChartCard>
  );
}
```

- `labels` ตัวเลขปลายแท่ง (ซีรีส์เดียว ≤ ~8 แท่ง) · `highlight` เน้นแท่งเดียวที่เหลือเทา (เล่าเรื่อง "ตัวนี้")
- `stacked` หลายซีรีส์ซ้อนกัน (ดู [สูตรแดชบอร์ด](../04-page-recipes.md#5-แดชบอร์ด))

## DonutChart · RankList

```tsx
'use client';

import { ChartCard, DonutChart, RankList } from '@/components/charts';

export function ShareAndRank() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="ช่องทางชำระเงิน" table={{ columns: ['ช่องทาง', 'รายการ'], rows: [['พร้อมเพย์', '1,320'], ['บัตร', '640'], ['ปลายทาง', '210']] }}>
        <DonutChart data={[{ label: 'พร้อมเพย์', value: 1320 }, { label: 'บัตร', value: 640 }, { label: 'ปลายทาง', value: 210 }]} centerLabel="รายการ" />
      </ChartCard>
      <ChartCard title="สินค้าขายดี">
        <RankList items={[{ label: 'นมสดรสจืด 830 มล.', value: 4820, hint: '+12%' }, { label: 'โยเกิร์ตกรีก', value: 3910 }, { label: 'ชาเขียวนม', value: 2470 }]} valueFormat={(n) => `${n.toLocaleString()} ชิ้น`} />
      </ChartCard>
    </div>
  );
}
```

- Donut เกิน `maxSlices` (6) รวมเป็น "อื่นๆ" สีเทาเอง · `slot` ในแต่ละชิ้นเพื่อคงสี
- `RankList` ทุกแท่งสีเดียว (ซีรีส์เดียว) — อย่าไล่สีตามค่า

## KpiCard · Sparkline

```tsx
import { Users } from 'lucide-react';
import { KpiCard, Sparkline } from '@/components/charts';

export function Kpis() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard label="ผู้ใช้งาน" value={12840} icon={<Users size={16} />} delta={8.2} deltaLabel="เทียบเดือนก่อน" trend={[9, 10, 10.5, 11, 12, 12.8]} />
      <KpiCard label="เวลาตอบกลับเฉลี่ย" value={4.2} unit="นาที" delta={-12} deltaLabel="เทียบเดือนก่อน" goodWhen="down" />
      <div className="rounded-card bg-surface p-4 shadow-card">
        <p className="text-sm text-ink-mute">ยอดขาย 7 วัน</p>
        <Sparkline data={[3, 5, 4, 6, 8, 7, 9]} height={40} />
      </div>
    </div>
  );
}
```

- `delta` ต้องมี `deltaLabel` คู่กันเสมอ (เทียบกับอะไร) · สีบอก "ดี/แย่" ตาม `goodWhen` ไม่ใช่ขึ้น/ลง
- `StatCard` (admin/kit) vs `KpiCard`: หลังบ้านทั่วไปใช้ `StatCard` (มี tone/กดได้/ตัวเลขวิ่ง) · หน้ารายงานเชิงข้อมูลใช้ `KpiCard`

## Heatmap · CalendarHeatmap

```tsx
'use client';

import { CalendarHeatmap, ChartCard, Heatmap, calendarTable } from '@/components/charts';
import { useLang } from '@/lib/i18n/client';

const DAYS = Array.from({ length: 180 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 4, 1 + i));
  return { date: d.toISOString().slice(0, 10), value: (i * 7) % 5 === 0 ? 0 : (i * 13) % 9 };
});
const HOURS = Array.from({ length: 24 }, (_, h) => `${h}`);
const VISITS = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'].map((_, d) => HOURS.map((_, h) => Math.round(40 * Math.sin((h - 6) / 4) ** 2 + (d > 4 ? 20 : 0))));

export function Activity() {
  const { lang } = useLang();
  return (
    <div className="space-y-4">
      <ChartCard title="กิจกรรมรายวัน" table={calendarTable(DAYS, { lang, dateLabel: 'วันที่', valueLabel: 'บทเรียน' })}>
        <CalendarHeatmap days={DAYS} valueLabel="บทเรียน" weekStart={1} label="กิจกรรมรายวัน" />
      </ChartCard>
      <ChartCard title="ผู้เข้าชมตามช่วงเวลา">
        <Heatmap data={VISITS} rowLabels={['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.']} colLabels={HOURS} colTickEvery={3} valueLabel="คน" lowLabel="น้อย" highLabel="มาก" />
      </ChartCard>
    </div>
  );
}
```

## ใช้สีกราฟใน UI ที่ทำเอง

- คลาส: `bg-[rgb(var(--chart-1))]` · พื้นจาง `bg-[rgb(var(--chart-2)/0.15)]` (ช่อง 1–8)
- JS: `seriesColor(slot)` (slot 0–7) — คืน CSS color ใช้ใน `style`
- สีโครงกราฟ (เส้นกริด แกน ตัวหนังสือ) ที่ตามธีม: `INK.grid`, `INK.axis`, `INK.text` …
- พาเลตกราฟถูกสร้างจากสี CI และตรวจความต่างของสีสำหรับคนตาบอดสีแล้ว — **ห้ามกำหนดสีซีรีส์เป็น hex เอง**
