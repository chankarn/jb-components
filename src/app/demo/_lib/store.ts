/**
 * "หลังบ้าน" จำลองของหน้าตัวอย่าง /demo — เก็บใน localStorage และหน่วงเวลาเหมือนเรียก API จริง
 * (ให้เห็นสถานะโหลด/บันทึก) · ในโปรเจกต์จริงแทนที่ไฟล์นี้ด้วยการเรียก API ของระบบ
 */
import { queryProducts, seedProducts, type Product, type ProductInput, type ProductQuery } from './products';

const KEY = 'jb-demo-products-v1';
const SESSION_KEY = 'jb-demo-session';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** บัญชีทดลองของหน้าตัวอย่าง (ไม่ใช่บัญชีจริง) */
export const DEMO_ACCOUNT = { email: 'demo@jb.dev', password: 'demo1234', name: 'สมชาย ใจดี', role: 'ผู้จัดการฝ่ายขาย' };

function read(): Product[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ข้อมูลเสีย/ปิด storage → เริ่มใหม่ */ }
  const seed = seedProducts();
  write(seed);
  return seed;
}
function write(list: Product[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage เต็ม/ปิดอยู่ */ }
}

export const api = {
  async list(q: ProductQuery) { await wait(420); return queryProducts(read(), q); },
  async all() { await wait(200); return read(); },
  async get(id: number) { await wait(320); return read().find((p) => p.id === id) ?? null; },
  async create(input: ProductInput) {
    await wait(700);
    const list = read();
    const p: Product = { ...input, id: Math.max(0, ...list.map((x) => x.id)) + 1, updatedAt: new Date().toISOString() };
    write([p, ...list]);
    return p;
  },
  async update(id: number, input: ProductInput) {
    await wait(700);
    const list = read();
    const p: Product = { ...input, id, updatedAt: new Date().toISOString() };
    write(list.map((x) => (x.id === id ? p : x)));
    return p;
  },
  async remove(id: number) {
    await wait(350);
    const list = read();
    const p = list.find((x) => x.id === id) ?? null;
    write(list.filter((x) => x.id !== id));
    return p;
  },
  /** เลิกทำการลบ: ใส่กลับที่เดิม */
  restore(p: Product) { const list = read(); if (!list.some((x) => x.id === p.id)) write([...list, p]); },
  /** ล้างกลับเป็นข้อมูลตั้งต้น */
  reset() { write(seedProducts()); },
};

export type Session = { name: string; email: string; role: string };

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}

/** เข้าสู่ระบบจำลอง · `remember` = จำไว้หลังปิดเบราว์เซอร์ (localStorage) ไม่งั้นแค่แท็บนี้ (sessionStorage) */
export async function signIn(email: string, password: string, remember: boolean): Promise<Session> {
  await wait(900);
  if (email.trim().toLowerCase() !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }
  const s: Session = { name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, role: DEMO_ACCOUNT.role };
  try { (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
}

export function signOut() {
  try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}
