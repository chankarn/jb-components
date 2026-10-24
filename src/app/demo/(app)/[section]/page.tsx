import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';

const TITLES: Record<string, string> = { orders: 'คำสั่งซื้อ', customers: 'ลูกค้า', reports: 'รายงานยอดขาย', settings: 'ตั้งค่า', help: 'ช่วยเหลือ' };

/** เมนูที่ยังไม่มีในตัวอย่าง (มีไว้ให้เห็น sidebar ครบ) */
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return (
    <div className="space-y-5">
      <h1 className="text-[1.65rem] font-bold tracking-tight">{TITLES[section] ?? 'ไม่พบหน้า'}</h1>
      <EmptyState
        card title="หน้านี้ยังไม่มีในตัวอย่าง"
        description="flow ตัวอย่างมีหน้า ภาพรวม · รายการสินค้า · เพิ่ม/แก้ไขสินค้า"
        action={<Link href="/demo/products" className="inline-flex h-10 items-center rounded-pill bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700">ไปหน้าสินค้า</Link>}
      />
    </div>
  );
}
