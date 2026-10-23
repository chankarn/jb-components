/**
 * ที่เก็บ toast ระดับ module (เรียกจากที่ไหนก็ได้ ไม่ต้องมี context) — ไม่มี JSX จึงทดสอบด้วย vitest ได้
 * เวลาถอยหลังจนหายจัดการที่ฝั่ง UI (หยุดนับตอนชี้เมาส์ได้) · ที่นี่เก็บแค่รายการ + ระยะเวลา
 */

export type ToastKind = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type ToastAction = { label: string; onClick: () => void };
export type ToastOptions = {
  /** บรรทัดรองใต้ข้อความหลัก */
  description?: string;
  /** ปุ่มในกล่อง เช่น { label: 'เลิกทำ', onClick } — กดแล้ว toast ปิดเอง */
  action?: ToastAction;
  /** มิลลิวินาทีก่อนหาย · Infinity = ค้างจนกดปิด */
  duration?: number;
};
export type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
  description?: string;
  action?: ToastAction;
  duration: number;
  /** เพิ่มทุกครั้งที่ถูกอัปเดต (เช่น loading → success) ให้ UI เริ่มนับเวลาใหม่/เล่นอนิเมชันใหม่ */
  version: number;
};

export const DEFAULT_DURATION: Record<ToastKind, number> = { success: 4000, info: 4000, warning: 6000, error: 7000, loading: Infinity };
/** แสดงพร้อมกันได้สูงสุด — เกินแล้วตัวเก่าสุดหลุดออก */
export const MAX_TOASTS = 4;

let items: ToastItem[] = [];
let seq = 1;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function subscribeToasts(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }
export function getToasts() { return items; }

function push(kind: ToastKind, message: string, opts: ToastOptions = {}) {
  const id = seq++;
  const item: ToastItem = { id, kind, message, description: opts.description, action: opts.action, duration: opts.duration ?? DEFAULT_DURATION[kind], version: 0 };
  items = [...items, item].slice(-MAX_TOASTS);
  emit();
  return id;
}

/** แก้ toast ที่แสดงอยู่ (ไม่มีแล้ว = ไม่ทำอะไร) · เปลี่ยนชนิดแล้วระยะเวลากลับเป็นค่าตั้งต้นของชนิดใหม่ ถ้าไม่ได้ระบุ */
export function updateToast(id: number, patch: Partial<Omit<ToastItem, 'id' | 'version'>>) {
  let found = false;
  items = items.map((t) => {
    if (t.id !== id) return t;
    found = true;
    const kind = patch.kind ?? t.kind;
    const duration = patch.duration ?? (patch.kind && patch.kind !== t.kind ? DEFAULT_DURATION[kind] : t.duration);
    return { ...t, ...patch, kind, duration, version: t.version + 1 };
  });
  if (found) emit();
  return found;
}

export function dismissToast(id?: number) {
  const next = id == null ? [] : items.filter((t) => t.id !== id);
  if (next.length === items.length) return;
  items = next;
  emit();
}

type Msg<T> = string | ((v: T) => string);
const text = <T,>(m: Msg<T>, v: T) => (typeof m === 'function' ? m(v) : m);

/**
 *   toast.success('บันทึกแล้ว')
 *   toast.error('ลบไม่ได้', { description: 'มีคนใช้อยู่', action: { label: 'ลองใหม่', onClick } })
 *   toast.promise(save(), { loading: 'กำลังบันทึก…', success: 'บันทึกแล้ว', error: (e) => `ไม่สำเร็จ: ${e.message}` })
 */
export const toast = {
  success: (m: string, o?: ToastOptions) => push('success', m, o),
  error: (m: string, o?: ToastOptions) => push('error', m, o),
  info: (m: string, o?: ToastOptions) => push('info', m, o),
  warning: (m: string, o?: ToastOptions) => push('warning', m, o),
  loading: (m: string, o?: ToastOptions) => push('loading', m, o),
  update: updateToast,
  dismiss: dismissToast,
  /** แสดง loading แล้วแปลงร่างเป็น success/error ตามผลของ promise (คืน promise เดิม) */
  promise<T>(p: Promise<T>, m: { loading: string; success: Msg<T>; error: Msg<unknown> }, o?: ToastOptions): Promise<T> {
    const id = push('loading', m.loading, { description: o?.description });
    p.then(
      (v) => { updateToast(id, { kind: 'success', message: text(m.success, v), description: o?.description, action: o?.action }); },
      (e) => { updateToast(id, { kind: 'error', message: text(m.error, e), description: undefined }); },
    );
    return p;
  },
};
