import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_DURATION, MAX_TOASTS, dismissToast, getToasts, subscribeToasts, toast, updateToast } from '@/lib/toast-store';

beforeEach(() => dismissToast());

describe('toast-store', () => {
  it('เพิ่ม + ระยะเวลาตั้งต้นตามชนิด · กำหนดเองได้', () => {
    toast.success('a');
    toast.error('b', { duration: 1000, description: 'd' });
    const [a, b] = getToasts();
    expect(a).toMatchObject({ kind: 'success', message: 'a', duration: DEFAULT_DURATION.success, version: 0 });
    expect(b).toMatchObject({ kind: 'error', duration: 1000, description: 'd' });
  });
  it(`เกิน ${MAX_TOASTS} → ตัวเก่าสุดหลุด`, () => {
    for (let i = 0; i < MAX_TOASTS + 2; i++) toast.info(`t${i}`);
    expect(getToasts().map((t) => t.message)).toEqual(['t2', 't3', 't4', 't5']);
  });
  it('update: เปลี่ยนชนิดแล้วระยะเวลาเป็นของชนิดใหม่ · version เพิ่ม · id ที่ไม่มีอยู่ = false', () => {
    const id = toast.loading('กำลังโหลด');
    expect(getToasts()[0].duration).toBe(Infinity);
    expect(updateToast(id, { kind: 'success', message: 'เสร็จ' })).toBe(true);
    expect(getToasts()[0]).toMatchObject({ kind: 'success', message: 'เสร็จ', duration: DEFAULT_DURATION.success, version: 1 });
    expect(updateToast(9999, { message: 'x' })).toBe(false);
  });
  it('dismiss รายตัว / ทั้งหมด · แจ้ง subscriber', () => {
    let n = 0;
    const off = subscribeToasts(() => n++);
    const a = toast.info('a');
    toast.info('b');
    dismissToast(a);
    expect(getToasts().map((t) => t.message)).toEqual(['b']);
    dismissToast();
    expect(getToasts()).toEqual([]);
    expect(n).toBe(4);
    off();
    toast.info('c');
    expect(n).toBe(4);
  });
  it('promise: loading → success (ข้อความจากผลลัพธ์) / error', async () => {
    await toast.promise(Promise.resolve(3), { loading: 'รอ', success: (v) => `ได้ ${v}`, error: 'พัง' });
    expect(getToasts()[0]).toMatchObject({ kind: 'success', message: 'ได้ 3' });
    dismissToast();
    await toast.promise(Promise.reject(new Error('x')), { loading: 'รอ', success: 'ok', error: (e) => `พัง: ${(e as Error).message}` }).catch(() => {});
    await Promise.resolve();
    expect(getToasts()[0]).toMatchObject({ kind: 'error', message: 'พัง: x' });
  });
});
