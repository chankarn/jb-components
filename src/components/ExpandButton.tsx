"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ปุ่มวงกลมไอคอน ชี้แล้วยืดออกเป็นแคปซูลโชว์ข้อความ — ดัดแปลงจาก download-hover-button
// ของ 21st.dev ให้รับ icon/label/ลิงก์ได้ และเปิดด้วยคีย์บอร์ด (focus) ได้ด้วย
// จอสัมผัสไม่มี hover: ถ้ายังหดเป็นวงกลม คนจะไม่มีทางเห็นข้อความเลย จึงโชว์เป็นแคปซูลตลอด

type Props = {
  icon: React.ReactNode;
  label: string;
  /** มี href = ลิงก์เปิดแท็บใหม่ ไม่มี = ปุ่มที่เรียก onClick */
  href?: string;
  onClick?: () => void;
  /** ทับสีตั้งต้น (พื้น brand-600 ตัวหนังสือขาว) เช่น "bg-[#06C755] text-white" · ใช้ได้ทั่วไป ไม่ผูกกับการแชร์ */
  className?: string;
  /** เส้นผ่านศูนย์กลางตอนหด (px) */
  size?: number;
  /** ความกว้างตอนยืด (px) */
  expandedWidth?: number;
};

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function useCanHover() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(HOVER_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(HOVER_QUERY).matches,
    () => true,
  );
}

export function ExpandButton({ icon, label, href, onClick, className, size = 52, expandedWidth = 200 }: Props) {
  const canHover = useCanHover();
  const [open, setOpen] = React.useState(false);

  const shell = cn(
    "relative flex items-center justify-center overflow-hidden bg-brand-600 font-bold text-white shadow-md",
    className,
  );

  const body = canHover ? (
    <motion.span
      initial={false}
      animate={{ width: open ? expandedWidth : size }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ height: size, borderRadius: size / 2 }}
      className={shell}
    >
      <motion.span
        className="absolute flex"
        initial={false}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.8 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.span>
      <motion.span
        className="flex w-full items-center justify-center gap-2 whitespace-nowrap px-4 text-[15px]"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, delay: open ? 0.1 : 0 }}
      >
        {icon}
        {label}
      </motion.span>
    </motion.span>
  ) : (
    <span style={{ height: size, borderRadius: size / 2 }} className={cn(shell, "gap-2 whitespace-nowrap px-4 text-[14px]")}>
      {icon}
      {label}
    </span>
  );

  const handlers = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  };
  const common = "rounded-full outline-none focus-visible:ring-4 focus-visible:ring-brand-500/60 transition-transform active:scale-95";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={common} {...handlers}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={common} {...handlers}>
      {body}
    </button>
  );
}
