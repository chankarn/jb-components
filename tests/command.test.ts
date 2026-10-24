import { describe, it, expect } from 'vitest';
import { buildCommandRows, flattenRows } from '@/lib/command';

const items = [
  { id: 'nav-home', label: 'ภาพรวม', group: 'ไปที่', keywords: ['dashboard', 'home'] },
  { id: 'nav-products', label: 'สินค้า', group: 'ไปที่', keywords: ['products'] },
  { id: 'act-new', label: 'เพิ่มสินค้าใหม่', group: 'การทำงาน', keywords: ['create', 'new'] },
  { id: 'p1', label: 'โยเกิร์ตกรีก 100 ก.', group: 'สินค้า', keywords: ['YG-114'], description: 'YG-114 · ฿59' },
  { id: 'p2', label: 'นมสดรสจืด', group: 'สินค้า', keywords: ['MK-100'] },
  { id: 'p3', label: 'กรีกโยเกิร์ตน้ำผึ้ง', group: 'สินค้า', keywords: ['YG-121'] },
];

describe('command: buildCommandRows', () => {
  it('ไม่มีคำค้น → ทุกกลุ่มตามลำดับเดิม', () => {
    const r = buildCommandRows(items, '');
    expect(r.map((g) => g.group)).toEqual(['ไปที่', 'การทำงาน', 'สินค้า']);
    expect(r[2].items).toHaveLength(3);
  });
  it('กรองข้ามกลุ่ม · กลุ่มที่ว่างถูกตัด · ไฮไลต์ตำแหน่งที่เจอ', () => {
    const r = buildCommandRows(items, 'สินค้า');
    expect(r.map((g) => g.group)).toEqual(['ไปที่', 'การทำงาน']);
    expect(r[0].items[0].ranges).toEqual([[0, 6]]);
  });
  it('ค้นจาก keywords (ภาษาอังกฤษ/รหัส) ได้ ไม่สนตัวพิมพ์', () => {
    expect(flattenRows(buildCommandRows(items, 'dashboard')).map((i) => i.id)).toEqual(['nav-home']);
    expect(flattenRows(buildCommandRows(items, 'mk-100')).map((i) => i.id)).toEqual(['p2']);
  });
  it('เรียงตามความตรง: ขึ้นต้นด้วยคำค้นมาก่อน', () => {
    const r = buildCommandRows(items, 'กรีก');
    expect(r[0].items.map((x) => x.item.id)).toEqual(['p3', 'p1']);
  });
  it('limit ต่อกลุ่ม', () => {
    expect(buildCommandRows(items, '', { สินค้า: 2 })[2].items).toHaveLength(2);
  });
  it('ไม่เจอเลย → ว่าง', () => expect(buildCommandRows(items, 'zzz')).toEqual([]));
});
