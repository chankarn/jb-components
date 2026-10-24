/**
 * ข้อมูลจำลองของหน้าตัวอย่าง /demo (สินค้านม) — ฟังก์ชันล้วน ไม่แตะ localStorage จึงทดสอบด้วย vitest ได้
 * ที่เก็บจริง (localStorage + หน่วงเวลาเหมือนเรียก API) อยู่ใน store.ts
 */
import { fold } from '@/lib/combobox';

export type ProductStatus = 'active' | 'draft' | 'archived';
export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  /** ต้นทุนต่อหน่วย (ไม่บังคับ) */
  cost: number | null;
  stock: number;
  /** เตือนเมื่อสต็อกต่ำกว่าหรือเท่าค่านี้ */
  lowStock: number;
  status: ProductStatus;
  tags: string[];
  description: string;
  /** YYYY-MM-DD หรือว่าง */
  launchDate: string;
  featured: boolean;
  /** ISO datetime */
  updatedAt: string;
};
export type ProductInput = Omit<Product, 'id' | 'updatedAt'>;

export const CATEGORIES = [
  { value: 'milk', label: 'นมพร้อมดื่ม', code: 'MK' },
  { value: 'yogurt', label: 'โยเกิร์ต', code: 'YG' },
  { value: 'drink', label: 'นมเปรี้ยว', code: 'DR' },
  { value: 'cheese', label: 'ชีสและเนย', code: 'CH' },
  { value: 'dessert', label: 'ขนมหวาน', code: 'DS' },
] as const;
export const categoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

export const STATUS_LABEL: Record<ProductStatus, string> = { active: 'เผยแพร่', draft: 'ฉบับร่าง', archived: 'เก็บถาวร' };

export const EMPTY_PRODUCT: ProductInput = {
  name: '', sku: '', category: '', price: 0, cost: null, stock: 0, lowStock: 10,
  status: 'draft', tags: [], description: '', launchDate: '', featured: false,
};

/** ข้อมูลตั้งต้น 36 รายการ (กำหนดค่าแน่นอน — ไม่สุ่ม) */
export function seedProducts(): Product[] {
  const names: [string, string][] = [
    ['นมสดพาสเจอร์ไรส์ รสจืด 830 มล.', 'milk'], ['นมสดพาสเจอร์ไรส์ รสหวาน 830 มล.', 'milk'], ['นมช็อกโกแลต 200 มล.', 'milk'],
    ['นมสตรอว์เบอร์รี 200 มล.', 'milk'], ['นมกาแฟ 200 มล.', 'milk'], ['นมโปรตีนสูง ไม่มีน้ำตาล', 'milk'], ['นมแลคโตสฟรี 1 ลิตร', 'milk'],
    ['โยเกิร์ตรสธรรมชาติ 135 ก.', 'yogurt'], ['โยเกิร์ตกรีก 100 ก.', 'yogurt'], ['โยเกิร์ตสตรอว์เบอร์รี 135 ก.', 'yogurt'], ['โยเกิร์ตบลูเบอร์รี 135 ก.', 'yogurt'],
    ['โยเกิร์ตมะม่วง 135 ก.', 'yogurt'], ['โยเกิร์ตพร้อมดื่ม รสส้ม', 'yogurt'], ['โยเกิร์ตไขมันต่ำ 4 ถ้วย', 'yogurt'],
    ['นมเปรี้ยว รสผลไม้รวม 180 มล.', 'drink'], ['นมเปรี้ยว รสส้ม 180 มล.', 'drink'], ['นมเปรี้ยว รสองุ่น 180 มล.', 'drink'], ['นมเปรี้ยว ไม่มีน้ำตาล 4 ขวด', 'drink'],
    ['นมเปรี้ยว รสลิ้นจี่ 85 มล.', 'drink'], ['เครื่องดื่มนมหมัก พลัสไฟเบอร์', 'drink'],
    ['เชดดาร์ชีส สไลซ์ 10 แผ่น', 'cheese'], ['มอซซาเรลลา ขูด 200 ก.', 'cheese'], ['ครีมชีส 150 ก.', 'cheese'], ['เนยจืด 227 ก.', 'cheese'],
    ['เนยเค็ม 227 ก.', 'cheese'], ['พาร์เมซานชีส 100 ก.', 'cheese'], ['ชีสสติ๊ก สำหรับเด็ก', 'cheese'],
    ['พุดดิ้งนมสด 4 ถ้วย', 'dessert'], ['คัสตาร์ดคาราเมล', 'dessert'], ['ไอศกรีมวานิลลา 1 ลิตร', 'dessert'], ['ไอศกรีมชาเขียว 1 ลิตร', 'dessert'],
    ['เยลลี่นมรสลิ้นจี่', 'dessert'], ['ชีสเค้กถ้วย', 'dessert'], ['ไอศกรีมแท่ง ช็อกโกแลต', 'dessert'], ['นมอัดเม็ด รสนม', 'dessert'], ['ปันนาคอตต้า', 'dessert'],
  ];
  const tagPool = ['ขายดี', 'ใหม่', 'โปรโมชัน', 'ไม่มีน้ำตาล', 'เด็ก', 'ออร์แกนิก', 'แช่เย็น'];
  return names.map(([name, category], i) => {
    const code = CATEGORIES.find((c) => c.value === category)!.code;
    const price = Math.round((18 + ((i * 37) % 160)) * (category === 'cheese' ? 1.8 : 1)) + 0.5 * (i % 2);
    const stock = (i * 53) % 240;
    const day = 1 + ((i * 7) % 28);
    return {
      id: i + 1,
      name,
      sku: `${code}-${String(100 + i * 7).padStart(3, '0')}`,
      category,
      price,
      cost: i % 5 === 0 ? null : Math.round(price * (0.42 + (i % 4) * 0.06) * 100) / 100,
      stock,
      lowStock: 20,
      status: i % 9 === 0 ? 'archived' : i % 4 === 0 ? 'draft' : 'active',
      tags: [tagPool[i % tagPool.length], ...(i % 3 === 0 ? [tagPool[(i + 3) % tagPool.length]] : [])],
      description: '',
      launchDate: `2026-${String(1 + (i % 9)).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      featured: i % 6 === 0,
      updatedAt: new Date(Date.UTC(2026, 9, 22, 9, 0) - i * 5.3 * 3600_000).toISOString(),
    };
  });
}

export type ProductQuery = {
  q?: string;
  status?: ProductStatus | 'all';
  category?: string;
  /** แสดงเฉพาะสต็อกต่ำ */
  lowStockOnly?: boolean;
  sort?: 'updated' | 'name' | 'price' | 'stock';
  dir?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
};
export type ProductPage = {
  rows: Product[];
  total: number;
  pages: number;
  page: number;
  /** จำนวนตามสถานะ (หลังกรองคำค้น/หมวด แต่ก่อนกรองสถานะ — ใช้ทำตัวเลขบนแท็บ) */
  counts: Record<ProductStatus | 'all', number>;
};

const norm = (s: string) => fold(s).text;
export const isLowStock = (p: Pick<Product, 'stock' | 'lowStock' | 'status'>) => p.status !== 'archived' && p.stock <= p.lowStock;

/** ค้น/กรอง/เรียง/แบ่งหน้า · ค้นจากชื่อ รหัส แท็ก (ไม่สนตัวพิมพ์/เครื่องหมาย · หลายคำต้องเจอครบ) */
export function queryProducts(all: readonly Product[], query: ProductQuery = {}): ProductPage {
  const { q = '', status = 'all', category = 'all', lowStockOnly, sort = 'updated', dir, page = 1, perPage = 10 } = query;
  const words = norm(q).split(/\s+/).filter(Boolean);
  const base = all.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (lowStockOnly && !isLowStock(p)) return false;
    if (!words.length) return true;
    const hay = norm(`${p.name} ${p.sku} ${p.tags.join(' ')}`);
    return words.every((w) => hay.includes(w));
  });
  const counts = { all: base.length, active: 0, draft: 0, archived: 0 };
  base.forEach((p) => { counts[p.status]++; });
  const filtered = status === 'all' ? base : base.filter((p) => p.status === status);
  const d = dir ?? (sort === 'name' ? 'asc' : 'desc');
  const sign = d === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    const v = sort === 'name' ? a.name.localeCompare(b.name, 'th')
      : sort === 'price' ? a.price - b.price
        : sort === 'stock' ? a.stock - b.stock
          : a.updatedAt.localeCompare(b.updatedAt);
    return (v || a.id - b.id) * sign;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const cur = Math.min(Math.max(1, page), pages);
  return { rows: sorted.slice((cur - 1) * perPage, cur * perPage), total: sorted.length, pages, page: cur, counts };
}

/** ตรวจฟอร์ม → { ฟิลด์: ข้อความผิดพลาด } (ว่าง = ผ่าน) · `skus` = รหัสที่ใช้แล้วของสินค้าอื่น */
export function validateProduct(p: ProductInput, skus: readonly string[] = []): Partial<Record<keyof ProductInput, string>> {
  const e: Partial<Record<keyof ProductInput, string>> = {};
  if (!p.name.trim()) e.name = 'กรุณากรอกชื่อสินค้า';
  else if (p.name.trim().length > 120) e.name = 'ชื่อยาวเกิน 120 ตัวอักษร';
  if (!p.sku.trim()) e.sku = 'กรุณากรอกรหัสสินค้า';
  else if (!/^[A-Z0-9-]{3,20}$/.test(p.sku)) e.sku = 'ใช้ได้เฉพาะ A–Z, 0–9 และ - (3–20 ตัว)';
  else if (skus.includes(p.sku)) e.sku = 'รหัสนี้มีสินค้าอื่นใช้แล้ว';
  if (!p.category) e.category = 'เลือกหมวดหมู่';
  if (!(p.price > 0)) e.price = 'ราคาต้องมากกว่า 0';
  if (p.cost != null && p.cost < 0) e.cost = 'ต้นทุนติดลบไม่ได้';
  else if (p.cost != null && p.price > 0 && p.cost > p.price) e.cost = 'ต้นทุนสูงกว่าราคาขาย';
  if (!Number.isInteger(p.stock) || p.stock < 0) e.stock = 'สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0';
  if (p.description.length > 1000) e.description = 'คำอธิบายยาวเกิน 1,000 ตัวอักษร';
  return e;
}

/** รหัสสินค้าแนะนำ: รหัสหมวด + เลขจากชื่อ (ซ้ำกับที่มี → ขยับไปเลขถัดไป) */
export function suggestSku(name: string, category: string, taken: readonly string[]): string {
  const code = CATEGORIES.find((c) => c.value === category)?.code ?? 'PR';
  let h = 0;
  for (const ch of name.trim()) h = (h * 31 + ch.codePointAt(0)!) % 900;
  for (let k = 0; k < 900; k++) {
    const sku = `${code}-${100 + ((h + k) % 900)}`;
    if (!taken.includes(sku)) return sku;
  }
  return `${code}-${Date.now() % 1000}`;
}

/** กำไรขั้นต้น % จากราคาและต้นทุน (ปัด 1 ตำแหน่ง) · ไม่มีต้นทุน/ราคา → null */
export function marginPercent(price: number, cost: number | null): number | null {
  if (cost == null || !(price > 0)) return null;
  return Math.round(((price - cost) / price) * 1000) / 10;
}
