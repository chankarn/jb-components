'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, Download, Package, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Button, Chip } from '@/components/ui';
import { AdminPageHeader, DataTable, FilterSelect, Pagination, Toolbar, type Column } from '@/components/admin/kit';
import { RowMenu } from '@/components/admin/RowMenu';
import { Tabs } from '@/components/Tabs';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Switch } from '@/components/Choice';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/Loading';
import { confirmDialog, toast } from '@/components/feedback';
import { api } from '../../_lib/store';
import { CATEGORIES, STATUS_LABEL, categoryLabel, isLowStock, suggestSku, type Product, type ProductPage, type ProductQuery, type ProductStatus } from '../../_lib/products';

// ฉบับร่างใช้สีอำพัน (สีแบรนด์อาจเป็นแดง ทำให้ร่างดูเหมือนผิดพลาด)
const STATUS_TONE: Record<ProductStatus, 'done' | 'brand' | 'mute'> = { active: 'done', draft: 'mute', archived: 'mute' };
const CAT_TILE: Record<string, string> = {
  milk: 'bg-[rgb(var(--chart-1)/0.14)] text-[rgb(var(--chart-1))]', yogurt: 'bg-[rgb(var(--chart-2)/0.16)] text-[rgb(var(--chart-2))]',
  drink: 'bg-[rgb(var(--chart-3)/0.16)] text-[rgb(var(--chart-3))]', cheese: 'bg-[rgb(var(--chart-4)/0.16)] text-[rgb(var(--chart-4))]',
  dessert: 'bg-[rgb(var(--chart-5)/0.16)] text-[rgb(var(--chart-5))]',
};
const baht = (n: number) => `฿${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const rtf = new Intl.RelativeTimeFormat('th', { numeric: 'auto' });
function ago(iso: string) {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour');
  return rtf.format(Math.round(hrs / 24), 'day');
}

/** อ่าน/เขียนตัวกรองใน URL (แชร์ลิงก์ได้ · ปุ่มย้อนกลับของเบราว์เซอร์ใช้ได้) */
function useQueryState() {
  const params = useSearchParams();
  const router = useRouter();
  const query: ProductQuery = {
    q: params.get('q') ?? '',
    status: (params.get('status') as ProductStatus | null) ?? 'all',
    category: params.get('cat') ?? 'all',
    lowStockOnly: params.get('low') === '1',
    sort: (params.get('sort') as ProductQuery['sort']) ?? 'updated',
    page: Number(params.get('page') ?? 1) || 1,
    perPage: Number(params.get('per') ?? 10) || 10,
  };
  const set = React.useCallback((patch: Record<string, string | number | boolean | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '' || v === false || v === 'all' || (k === 'page' && v === 1) || (k === 'sort' && v === 'updated') || (k === 'per' && v === 10)) next.delete(k);
      else next.set(k, v === true ? '1' : String(v));
    }
    if (!('page' in patch)) next.delete('page'); // เปลี่ยนตัวกรอง → กลับหน้าแรก
    const s = next.toString();
    router.replace(`/demo/products${s ? `?${s}` : ''}`, { scroll: false });
  }, [params, router]);
  return { query, set, key: params.toString() };
}

export function ProductList() {
  const router = useRouter();
  const { query, set, key } = useQueryState();
  const [data, setData] = React.useState<ProductPage | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reload, setReload] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    setLoading(true);
    void api.list(query).then((r) => { if (live) { setData(r); setLoading(false); } });
    return () => { live = false; };
  }, [key, reload]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = React.useCallback((v: string) => { if (v !== (query.q ?? '')) set({ q: v }); }, [query.q, set]);

  async function remove(p: Product) {
    const ok = await confirmDialog(`ลบ "${p.name}"?`, { danger: true, description: 'ลบแล้วกดเลิกทำได้ภายในไม่กี่วินาที', confirmLabel: 'ลบสินค้า' });
    if (!ok) return;
    const removed = await api.remove(p.id);
    setReload((n) => n + 1);
    if (removed) {
      toast.success('ลบสินค้าแล้ว', {
        description: p.name,
        action: { label: 'เลิกทำ', onClick: () => { api.restore(removed); setReload((n) => n + 1); toast.info('กู้คืนสินค้าแล้ว'); } },
      });
    }
  }

  async function duplicate(p: Product) {
    const all = await api.all();
    const copy = await toast.promise(
      api.create({ ...p, name: `${p.name} (สำเนา)`, sku: suggestSku(`${p.name} copy`, p.category, all.map((x) => x.sku)), status: 'draft' }),
      { loading: 'กำลังทำสำเนา…', success: 'ทำสำเนาแล้ว — เปิดหน้าแก้ไข', error: 'ทำสำเนาไม่สำเร็จ' },
    );
    router.push(`/demo/products/${copy.id}`);
  }

  const columns: Column<Product>[] = [
    {
      key: 'name', header: 'สินค้า',
      render: (p) => (
        <span className="flex min-w-0 items-center gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${CAT_TILE[p.category] ?? 'bg-ink/[0.06]'}`}><Package size={18} /></span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <span className="truncate">{p.name}</span>
              {p.featured && <Star aria-label="สินค้าแนะนำ" size={13} className="shrink-0 fill-warn-500 text-warn-500" />}
            </span>
            <span className="block font-mono text-[11px] text-ink-mute">{p.sku}</span>
          </span>
        </span>
      ),
    },
    { key: 'cat', header: 'หมวดหมู่', className: 'w-32', render: (p) => <span className="whitespace-nowrap text-sm text-ink-soft">{categoryLabel(p.category)}</span> },
    { key: 'price', header: 'ราคา', className: 'w-24 text-right', render: (p) => <span className="font-semibold tabular-nums">{baht(p.price)}</span> },
    {
      key: 'stock', header: 'สต็อก', className: 'w-32',
      render: (p) => {
        const low = isLowStock(p);
        return (
          <span className="block">
            <span className={`text-sm font-semibold tabular-nums ${low ? 'text-warn-700' : 'text-ink'}`}>{p.stock.toLocaleString()}</span>
            {low && <span className="ml-1.5 whitespace-nowrap rounded-pill bg-warn-50 px-1.5 py-px text-[10px] font-bold text-warn-700">ใกล้หมด</span>}
            <span aria-hidden className="mt-1 block h-1 w-20 overflow-hidden rounded-pill bg-ink/[0.07]">
              <span className={`block h-full rounded-pill ${low ? 'bg-warn-500' : 'bg-ok-500'}`} style={{ width: `${Math.min(100, (p.stock / 240) * 100)}%` }} />
            </span>
          </span>
        );
      },
    },
    { key: 'status', header: 'สถานะ', className: 'w-28', render: (p) => <Chip tone={STATUS_TONE[p.status]} className={p.status === 'draft' ? 'bg-warn-50 text-warn-700' : undefined}>{STATUS_LABEL[p.status]}</Chip> },
    { key: 'updated', header: 'แก้ไขล่าสุด', className: 'w-32', render: (p) => <span className="whitespace-nowrap text-xs text-ink-mute" title={new Date(p.updatedAt).toLocaleString('th-TH')}>{ago(p.updatedAt)}</span> },
    {
      key: 'menu', header: '', className: 'w-12',
      render: (p) => (
        <RowMenu items={[
          { label: 'แก้ไข', icon: <Pencil size={15} />, href: `/demo/products/${p.id}` },
          { label: 'ทำสำเนา', icon: <Copy size={15} />, onClick: () => void duplicate(p) },
          { label: 'ลบ', icon: <Trash2 size={15} />, danger: true, onClick: () => void remove(p) },
        ]} />
      ),
    },
  ];

  const filtered = !!(query.q || (query.category && query.category !== 'all') || query.lowStockOnly);
  const counts = data?.counts;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'ภาพรวม', href: '/demo' }, { label: 'สินค้า' }]} />}
        title="สินค้า" description="จัดการรายการสินค้า ราคา และสต็อก"
        stats={counts ? [{ label: 'ทั้งหมด', value: counts.all }, { label: 'เผยแพร่', value: counts.active, tone: 'done' }, { label: 'ฉบับร่าง', value: counts.draft, tone: 'warn' }] : undefined}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast.info('หน้าตัวอย่าง: ยังไม่มีการส่งออกจริง')}><Download size={14} /> ส่งออก</Button>
            <Link href="/demo/products/new"><Button size="sm"><Plus size={14} /> เพิ่มสินค้า</Button></Link>
          </>
        }
      />

      <Tabs
        aria-label="สถานะสินค้า" value={query.status ?? 'all'} onChange={(v) => set({ status: v })}
        items={[
          { key: 'all', label: 'ทั้งหมด', count: counts?.all },
          { key: 'active', label: 'เผยแพร่', count: counts?.active },
          { key: 'draft', label: 'ฉบับร่าง', count: counts?.draft },
          { key: 'archived', label: 'เก็บถาวร', count: counts?.archived },
        ]}
      />

      <Toolbar q={query.q ?? ''} onSearch={onSearch} placeholder="ค้นหาชื่อ รหัส หรือแท็ก…">
        <FilterSelect value={query.category ?? 'all'} onChange={(v) => set({ cat: v })} options={[{ value: 'all', label: 'ทุกหมวดหมู่' }, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))]} />
        <FilterSelect value={query.sort ?? 'updated'} onChange={(v) => set({ sort: v })} options={[{ value: 'updated', label: 'แก้ไขล่าสุด' }, { value: 'name', label: 'ชื่อ ก–ฮ' }, { value: 'price', label: 'ราคาสูงสุด' }, { value: 'stock', label: 'สต็อกมากสุด' }]} />
        <Switch size="sm" label="เฉพาะใกล้หมด" checked={!!query.lowStockOnly} onChange={(e) => set({ low: e.target.checked })} className="ml-1 items-center" />
      </Toolbar>

      {data && data.total === 0 && !loading ? (
        <EmptyState
          card title={filtered ? 'ไม่พบสินค้าที่ตรงกับตัวกรอง' : 'ยังไม่มีสินค้าในสถานะนี้'}
          description={filtered ? 'ลองเปลี่ยนคำค้นหรือล้างตัวกรอง' : undefined}
          action={filtered ? <Button size="sm" variant="outline" onClick={() => router.replace('/demo/products')}>ล้างตัวกรอง</Button> : <Link href="/demo/products/new"><Button size="sm"><Plus size={14} /> เพิ่มสินค้า</Button></Link>}
        />
      ) : (
        <LoadingOverlay show={loading && !!data} label="กำลังโหลด">
          <DataTable columns={columns} rows={data?.rows} loading={!data} onRowClick={(p) => router.push(`/demo/products/${p.id}`)} />
          {data && data.total > 0 && (
            <div className="mt-3 px-1">
              <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => set({ page: p })} perPage={query.perPage} onPerPageChange={(n) => set({ per: n })} />
            </div>
          )}
        </LoadingOverlay>
      )}
    </div>
  );
}
