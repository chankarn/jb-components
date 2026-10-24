'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Package, Plus, ShoppingCart, Users, Wallet } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { AdminPageHeader, StatCard } from '@/components/admin/kit';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ChartCard, DonutChart, RankList, TrendChart, seriesTable, type Series } from '@/components/charts';
import { api, getSession } from '../_lib/store';
import { CATEGORIES, categoryLabel, isLowStock, type Product } from '../_lib/products';

const wave = (i: number, s: number) => Math.sin(i * 0.5 + s) * 0.5 + Math.sin(i * 0.19 + s * 2.1) * 0.5;
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const day = (back: number) => {
  const d = new Date(Date.UTC(2026, 9, 23));
  d.setUTCDate(d.getUTCDate() - back);
  return `${d.getUTCDate()} ${TH_MONTH[d.getUTCMonth()]}`;
};
// ยอดขายจำลองแบบกำหนดค่าแน่นอน (server/client ได้ค่าเดียวกัน)
const SALES = Array.from({ length: 90 }, (_, k) => ({
  day: day(89 - k),
  sales: Math.round(38000 + 9000 * wave(k, 1) + k * 120),
  orders: Math.round(260 + 60 * wave(k, 3) + k * 0.9),
}));
const SERIES: Series[] = [{ key: 'sales', label: 'ยอดขาย (บาท)' }];
const baht = (n: number) => `฿${Math.round(n).toLocaleString()}`;

export function DemoHome() {
  const router = useRouter();
  const [range, setRange] = React.useState<'7' | '30' | '90'>('30');
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const name = getSession()?.name.split(' ')[0] ?? '';

  React.useEffect(() => { void api.all().then(setProducts); }, []);

  const rows = SALES.slice(-Number(range));
  const prev = SALES.slice(-Number(range) * 2, -Number(range));
  const sum = (xs: typeof SALES, k: 'sales' | 'orders') => xs.reduce((a, r) => a + r[k], 0);
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);
  const low = products?.filter(isLowStock) ?? [];
  const byCategory = CATEGORIES.map((c, i) => ({ label: c.label, value: products?.filter((p) => p.category === c.value && p.status !== 'archived').reduce((a, p) => a + p.stock, 0) ?? 0, slot: i }));
  const recent = products ? [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`สวัสดี ${name} 👋`}
        description="ภาพรวมยอดขายและสินค้าของคุณ"
        actions={
          <>
            <SegmentedControl size="sm" label="ช่วงเวลา" value={range} onChange={setRange} options={[{ value: '7', label: '7 วัน' }, { value: '30', label: '30 วัน' }, { value: '90', label: '90 วัน' }]} />
            <Link href="/demo/products/new"><Button size="sm"><Plus size={14} /> เพิ่มสินค้า</Button></Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ยอดขาย" value={sum(rows, 'sales')} format={baht} icon={<Wallet size={16} />} delta={pct(sum(rows, 'sales'), sum(prev, 'sales'))} hint="เทียบช่วงก่อน" trend={rows.map((r) => r.sales)} />
        <StatCard label="คำสั่งซื้อ" value={sum(rows, 'orders')} tone="done" icon={<ShoppingCart size={16} />} delta={pct(sum(rows, 'orders'), sum(prev, 'orders'))} hint="เทียบช่วงก่อน" trend={rows.map((r) => r.orders)} />
        <StatCard label="สินค้าใกล้หมด" value={products ? low.length : '…'} tone="warn" icon={<AlertTriangle size={16} />} hint="กดดูรายการ" onClick={() => router.push('/demo/products?low=1')} />
        <StatCard label="ลูกค้าใหม่" value={Math.round(48 * (Number(range) / 30))} icon={<Users size={16} />} delta={-4.2} hint="เทียบช่วงก่อน" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="ยอดขายรายวัน" description={`${rows[0].day} – ${rows[rows.length - 1].day}`} table={seriesTable(rows, 'day', SERIES, { xLabel: 'วันที่' })}>
          <TrendChart data={rows} xKey="day" series={SERIES} variant="area" valueFormat={baht} showLegend={false} height={260} />
        </ChartCard>
        <ChartCard title="สต็อกตามหมวดหมู่" description="จำนวนชิ้นในคลัง (ไม่รวมที่เก็บถาวร)" loading={!products} table={{ columns: ['หมวดหมู่', 'ชิ้น'], rows: byCategory.map((c) => [c.label, String(c.value)]) }}>
          <DonutChart data={byCategory} centerLabel="ชิ้นในคลัง" size={180} className="py-1" />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="สินค้าขายดี" description="30 วันล่าสุด">
          <RankList items={[
            { label: 'นมเปรี้ยว รสผลไม้รวม', value: 4820, hint: '+12%' }, { label: 'โยเกิร์ตกรีก 100 ก.', value: 3910, hint: '+8%' },
            { label: 'นมสดรสจืด 830 มล.', value: 3550, hint: '+3%' }, { label: 'พุดดิ้งนมสด 4 ถ้วย', value: 2470, hint: '−2%' }, { label: 'เชดดาร์ชีส สไลซ์', value: 1980, hint: '+5%' },
          ]} />
        </ChartCard>

        <section className="overflow-hidden rounded-card bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_0_0_1px_rgb(var(--ink)/0.06)] lg:col-span-2">
          <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
            <div>
              <h2 className="text-base font-semibold">แก้ไขล่าสุด</h2>
              <p className="text-xs text-ink-mute">สินค้าที่มีการเปลี่ยนแปลง 5 รายการล่าสุด</p>
            </div>
            <Link href="/demo/products" className="inline-flex items-center gap-1 rounded-lg text-xs font-semibold text-brand-link hover:underline">ดูทั้งหมด <ArrowRight size={13} /></Link>
          </header>
          <ul className="divide-y divide-ink/[0.06] px-2 pb-2">
            {!recent && Array.from({ length: 5 }, (_, i) => <li key={i} className="flex items-center gap-3 px-3 py-3"><Skeleton className="size-9 rounded-xl" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-16" /></li>)}
            {recent?.map((p) => (
              <li key={p.id}>
                <Link href={`/demo/products/${p.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-ink/[0.03]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-link"><Package size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block text-[11px] text-ink-mute">{p.sku} · {categoryLabel(p.category)}</span>
                  </span>
                  {isLowStock(p) && <span className="hidden rounded-pill bg-warn-50 px-2 py-0.5 text-[11px] font-semibold text-warn-700 sm:inline">เหลือ {p.stock}</span>}
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{baht(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
