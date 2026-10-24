/** ตรรกะล้วนของ CommandPalette: กรอง + จัดกลุ่ม + ไฮไลต์ (ใช้ตัวจับคู่ชุดเดียวกับ Combobox) */
import { filterOptions, type Range } from './combobox';

export type CommandEntry = {
  id: string;
  label: string;
  /** ชื่อกลุ่ม (กลุ่มเรียงตามลำดับที่เจอครั้งแรกใน items) */
  group: string;
  description?: string;
  /** คำค้นเพิ่ม เช่น รหัสสินค้า ชื่ออังกฤษ (ไม่แสดง) */
  keywords?: string[];
};
export type CommandRows<T extends CommandEntry> = { group: string; items: { item: T; ranges: Range[] }[] }[];

/**
 * กรองด้วยคำค้น (ไม่สนตัวพิมพ์/เครื่องหมาย · หลายคำต้องเจอครบ · ค้นจาก description/keywords ได้) แล้วจัดกลุ่ม
 * - ในกลุ่มเรียงตามความตรง (ขึ้นต้นด้วยคำค้น > ขึ้นต้นคำ > ตรงกลางคำ > เจอใน keywords) · ตรงเท่ากันคงลำดับเดิม
 * - `limit[group]` จำกัดจำนวนต่อกลุ่ม (เช่น ผลสินค้าไม่เกิน 6) · กลุ่มที่ไม่เหลือรายการถูกตัดออก
 */
export function buildCommandRows<T extends CommandEntry>(items: readonly T[], query: string, limit: Record<string, number> = {}): CommandRows<T> {
  const order: string[] = [];
  for (const it of items) if (!order.includes(it.group)) order.push(it.group);
  return order
    .map((group) => {
      const inGroup = items.filter((it) => it.group === group);
      const matched = filterOptions(inGroup.map((it) => ({ value: it.id, label: it.label, description: it.description, keywords: it.keywords })), query);
      const rows = matched.map((m) => ({ item: inGroup[m.index], ranges: m.ranges }));
      return { group, items: limit[group] != null ? rows.slice(0, limit[group]) : rows };
    })
    .filter((g) => g.items.length > 0);
}

/** รายการเรียบ (ลำดับตามที่แสดง) — ใช้เลื่อน ↑↓ ข้ามกลุ่ม */
export function flattenRows<T extends CommandEntry>(rows: CommandRows<T>): T[] {
  return rows.flatMap((g) => g.items.map((r) => r.item));
}
