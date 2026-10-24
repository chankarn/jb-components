import { describe, it, expect } from 'vitest';
import { EMPTY_PRODUCT, isLowStock, marginPercent, queryProducts, seedProducts, suggestSku, validateProduct } from '@/app/demo/_lib/products';

const all = seedProducts();

describe('demo products: seed', () => {
  it('36 รายการ · id/sku ไม่ซ้ำ · กำหนดค่าแน่นอน', () => {
    expect(all).toHaveLength(36);
    expect(new Set(all.map((p) => p.sku)).size).toBe(36);
    expect(seedProducts()).toEqual(all);
  });
});

describe('demo products: queryProducts', () => {
  it('แบ่งหน้า + ตัวเลขแท็บ', () => {
    const r = queryProducts(all, { perPage: 10, page: 2 });
    expect(r.rows).toHaveLength(10);
    expect(r).toMatchObject({ total: 36, pages: 4, page: 2 });
    expect(r.counts.all).toBe(36);
    expect(r.counts.active + r.counts.draft + r.counts.archived).toBe(36);
  });
  it('ค้นหาไม่สนตัวพิมพ์ · หลายคำต้องเจอครบ · ค้นจาก SKU/แท็กได้', () => {
    expect(queryProducts(all, { q: 'โยเกิร์ต สตรอว์' }).rows.map((p) => p.name)).toEqual(['โยเกิร์ตสตรอว์เบอร์รี 135 ก.']);
    expect(queryProducts(all, { q: 'yg-' }).total).toBe(7);
    expect(queryProducts(all, { q: 'ขายดี' }).total).toBeGreaterThan(0);
  });
  it('กรองสถานะไม่กระทบตัวเลขแท็บ · กรองหมวด', () => {
    const r = queryProducts(all, { status: 'draft', category: 'milk' });
    expect(r.rows.every((p) => p.status === 'draft' && p.category === 'milk')).toBe(true);
    expect(r.counts.all).toBe(7);
  });
  it('เรียงราคา น้อย→มาก · หน้าเกินขอบ → หน้าสุดท้าย', () => {
    const r = queryProducts(all, { sort: 'price', dir: 'asc', perPage: 100 });
    expect(r.rows.map((p) => p.price)).toEqual([...r.rows.map((p) => p.price)].sort((a, b) => a - b));
    expect(queryProducts(all, { page: 99 }).page).toBe(4);
  });
  it('สต็อกต่ำ (ไม่นับที่เก็บถาวร)', () => {
    const r = queryProducts(all, { lowStockOnly: true, perPage: 100 });
    expect(r.rows.every(isLowStock)).toBe(true);
    expect(isLowStock({ stock: 0, lowStock: 10, status: 'archived' })).toBe(false);
  });
});

describe('demo products: validateProduct / suggestSku / marginPercent', () => {
  it('ฟอร์มว่าง → ขาดชื่อ รหัส หมวด ราคา', () => {
    expect(Object.keys(validateProduct(EMPTY_PRODUCT)).sort()).toEqual(['category', 'name', 'price', 'sku']);
  });
  it('รหัสผิดรูปแบบ/ซ้ำ · ต้นทุนเกินราคา · สต็อกทศนิยม', () => {
    const base = { ...EMPTY_PRODUCT, name: 'นม', category: 'milk', price: 20 };
    expect(validateProduct({ ...base, sku: 'ab' }).sku).toMatch(/A–Z/);
    expect(validateProduct({ ...base, sku: 'MK-100' }, ['MK-100']).sku).toMatch(/ใช้แล้ว/);
    expect(validateProduct({ ...base, sku: 'MK-1', cost: 25 }).cost).toMatch(/สูงกว่า/);
    expect(validateProduct({ ...base, sku: 'MK-1', stock: 1.5 }).stock).toBeDefined();
    expect(validateProduct({ ...base, sku: 'MK-101' })).toEqual({});
  });
  it('suggestSku: ขึ้นต้นด้วยรหัสหมวด · หลบรหัสที่ใช้แล้ว', () => {
    const a = suggestSku('นมใหม่', 'milk', []);
    expect(a).toMatch(/^MK-\d{3}$/);
    expect(suggestSku('นมใหม่', 'milk', [a])).not.toBe(a);
  });
  it('marginPercent', () => {
    expect(marginPercent(100, 60)).toBe(40);
    expect(marginPercent(30, null)).toBeNull();
    expect(marginPercent(0, 5)).toBeNull();
  });
});
