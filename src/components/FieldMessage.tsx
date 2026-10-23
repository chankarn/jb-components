'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { shake } from '@/lib/motion-fx';

/**
 * บรรทัดใต้ช่องของ Field (คำแนะนำ ↔ ข้อความผิดพลาด)
 * - error ใหม่/เปลี่ยนข้อความ → ช่องกรอกข้างบนสั่นหนึ่งครั้ง (ไม่สั่นถ้ามี error ตั้งแต่โหลดหน้า เช่น ผลตรวจจาก server)
 * - ข้อความยืด/จางเข้าออกนุ่มๆ ไม่ดันเลย์เอาต์กระตุก · error มีไอคอนด้วย (ไม่บอกด้วยสีอย่างเดียว)
 * แยกเป็น client component เพื่อให้ Field/ui.tsx ยังใช้ใน server component ได้
 */
export function FieldMessage({ error, hint }: { error?: string; hint?: string }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const prev = React.useRef(error);
  React.useEffect(() => {
    if (error && error !== prev.current) shake(ref.current?.previousElementSibling);
    prev.current = error;
  }, [error]);

  const motionProps = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, height: 0, y: -4 },
        animate: { opacity: 1, height: 'auto', y: 0 },
        exit: { opacity: 0, height: 0, y: -4 },
        transition: { type: 'spring' as const, stiffness: 500, damping: 36 },
      };

  return (
    <div ref={ref}>
      <AnimatePresence initial={false} mode="popLayout">
        {error ? (
          <motion.span key={`e-${error}`} role="alert" {...motionProps} className="flex items-start gap-1 overflow-hidden text-[11px] font-semibold text-danger-700">
            <AlertCircle size={12} strokeWidth={2.6} className="mt-[3px] shrink-0" aria-hidden />
            <span>{error}</span>
          </motion.span>
        ) : hint ? (
          <motion.span key="hint" {...motionProps} className="block overflow-hidden text-[11px] text-ink-mute">{hint}</motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
