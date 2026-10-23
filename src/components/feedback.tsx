'use client';

import { useT } from '@/lib/i18n/client';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, Info, X } from 'lucide-react';
import { Dialog } from '@/components/Overlay';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Popup UI กลาง — แทน alert()/confirm() ของ browser
 *
 *   toast.success('บันทึกแล้ว')      // แถบแจ้งเตือนมุมจอ auto หาย
 *   toast.error('ผิดพลาด')
 *   if (await confirmDialog('ลบ?'))  // กล่องยืนยัน (Promise<boolean>)
 *
 * เป็น store ระดับ module → เรียกจาก hook / ฟังก์ชันธรรมดาได้ ไม่ต้องผูก context
 * แค่ mount <FeedbackHost/> ครั้งเดียวใน layout
 */

// ── Toast store ──────────────────────────────────────────
type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

let toasts: Toast[] = [];
const toastSubs = new Set<() => void>();
let seq = 1;

function pushToast(kind: ToastKind, message: string) {
  const id = seq++;
  toasts = [...toasts, { id, kind, message }];
  toastSubs.forEach((f) => f());
  setTimeout(() => dismissToast(id), 4000);
}
function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  toastSubs.forEach((f) => f());
}

export const toast = {
  success: (m: string) => pushToast('success', m),
  error: (m: string) => pushToast('error', m),
  info: (m: string) => pushToast('info', m),
};

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
const TOAST_STYLE: Record<ToastKind, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'border-ok-500', iconColor: 'text-ok-600' },
  error: { icon: XCircle, ring: 'border-danger-500', iconColor: 'text-danger-600' },
  info: { icon: Info, ring: 'border-brand-500', iconColor: 'text-brand-500' },
};

export function FeedbackHost() {
  const tr = useT();
  const [list, setList] = useState<Toast[]>(toasts);
  const [req, setReq] = useState<ConfirmReq | null>(confirmReq);
  // คงข้อความล่าสุดไว้ระหว่างอนิเมชันตอนปิด (req เป็น null แล้วแต่หน้าต่างยังจางออกอยู่)
  const last = useRef<ConfirmReq | null>(null);
  if (req) last.current = req;
  const shown = req ?? last.current;

  useEffect(() => {
    const onToast = () => setList([...toasts]);
    const onConfirm = () => setReq(confirmReq);
    toastSubs.add(onToast);
    confirmSubs.add(onConfirm);
    return () => {
      toastSubs.delete(onToast);
      confirmSubs.delete(onConfirm);
    };
  }, []);

  return (
    <>
      {/* toasts */}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {list.map((t) => {
          const s = TOAST_STYLE[t.kind];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-2xl border-l-4 bg-surface p-3 shadow-lift animate-pop',
                s.ring,
              )}
            >
              <Icon size={18} className={cn('mt-0.5 shrink-0', s.iconColor)} />
              <p className="flex-1 whitespace-pre-line text-sm font-medium leading-snug">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} className="shrink-0 text-ink-mute hover:text-ink" aria-label={tr('common.close')}>
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>

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
