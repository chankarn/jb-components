'use client';

import { useT } from '@/lib/i18n/client';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Toaster } from '@/components/Toaster';
import { Dialog } from '@/components/Overlay';
import { Button } from '@/components/ui';

/**
 * Popup UI กลาง — แทน alert()/confirm() ของ browser
 *
 *   toast.success('บันทึกแล้ว')      // แถบแจ้งเตือนมุมจอ หายเอง (ชี้เมาส์ = หยุดนับ · ปัดทิ้งได้)
 *   toast.error('ผิดพลาด', { description, action: { label: 'ลองใหม่', onClick } })
 *   toast.promise(save(), { loading, success, error })  // loading แล้วแปลงร่างเป็นผลลัพธ์
 *   if (await confirmDialog('ลบ?'))  // กล่องยืนยัน (Promise<boolean>)
 *
 * เป็น store ระดับ module → เรียกจาก hook / ฟังก์ชันธรรมดาได้ ไม่ต้องผูก context
 * แค่ mount <FeedbackHost/> ครั้งเดียวใน layout
 */

// ── Toast store: อยู่ที่ lib/toast-store.ts (ทดสอบได้) · re-export ให้ import เดิมใช้ได้ ──
export { toast } from '@/lib/toast-store';
let seq = 1;

// ── Confirm store ────────────────────────────────────────
type ConfirmReq = {
  id: number; message: string; description?: string; confirmLabel: string; cancelLabel: string;
  danger: boolean; resolve: (v: boolean) => void;
};

let confirmReq: ConfirmReq | null = null;
const confirmSubs = new Set<() => void>();

export function confirmDialog(
  message: string,
  opts?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean; /** บรรทัดอธิบายใต้คำถาม */ description?: string },
): Promise<boolean> {
  return new Promise((resolve) => {
    confirmReq = {
      id: seq++, message, resolve, description: opts?.description,
      confirmLabel: opts?.confirmLabel ?? '',
      cancelLabel: opts?.cancelLabel ?? '',
      danger: opts?.danger ?? false,
    };
    confirmSubs.forEach((f) => f());
  });
}
function settleConfirm(v: boolean) {
  confirmReq?.resolve(v);
  confirmReq = null;
  confirmSubs.forEach((f) => f());
}

// ── Host (render toasts + confirm modal) ─────────────────
export function FeedbackHost() {
  const tr = useT();
  const [req, setReq] = useState<ConfirmReq | null>(confirmReq);
  // คงข้อความล่าสุดไว้ระหว่างอนิเมชันตอนปิด (req เป็น null แล้วแต่หน้าต่างยังจางออกอยู่)
  const last = useRef<ConfirmReq | null>(null);
  if (req) last.current = req;
  const shown = req ?? last.current;

  useEffect(() => {
    const onConfirm = () => setReq(confirmReq);
    confirmSubs.add(onConfirm);
    return () => { confirmSubs.delete(onConfirm); };
  }, []);

  return (
    <>
      <Toaster />

      {/* confirm modal: ใช้หน้าต่างชุดเดียวกับ Dialog (แบบ alert) · ยืนยันอันตราย → โฟกัสเริ่มที่ "ยกเลิก" (กด Enter พลาดไม่ลบ) */}
      <Dialog
        open={!!req} onClose={() => settleConfirm(false)} variant="alert"
        title={shown?.message ?? ''} description={shown?.description}
        tone={shown?.danger ? 'danger' : 'brand'}
        icon={shown?.danger ? <AlertTriangle size={26} strokeWidth={2.2} /> : <HelpCircle size={26} strokeWidth={2.2} />}
        footer={
          <>
            <Button variant="ghost" onClick={() => settleConfirm(false)} data-autofocus={shown?.danger || undefined}>
              {shown?.cancelLabel || tr('common.cancel')}
            </Button>
            <Button variant={shown?.danger ? 'danger' : 'primary'} onClick={() => settleConfirm(true)} data-autofocus={!shown?.danger || undefined}>
              {shown?.confirmLabel || tr('common.confirm')}
            </Button>
          </>
        }
      />
    </>
  );
}
