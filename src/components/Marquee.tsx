'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { marqueeCopies, marqueeDuration } from '@/lib/carousel';

type Props = {
  children: React.ReactNode;
  /** ความเร็ว px ต่อวินาที (คงที่ไม่ว่าเนื้อหาจะยาวแค่ไหน) */
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  /** ช่องไฟระหว่างชิ้น (px) */
  gap?: number;
  pauseOnHover?: boolean;
  /** ขอบสองข้างจางหาย */
  fade?: boolean;
  /** ชื่อสำหรับ screen reader (เช่น "พันธมิตรของเรา") */
  label?: string;
  /** แนวตั้งต้องกำหนดความสูงผ่าน className เช่น `h-80` */
  className?: string;
};

/**
 * Marquee: แถบเลื่อนวนไม่รู้จบ (โลโก้ ข่าวสั้น รูป รีวิว)
 * - วาดเนื้อหาซ้ำพอให้ยาวกว่ากล่อง แล้วเลื่อนไปหนึ่งชุดพอดีด้วย CSS transform (ลื่นแบบ GPU ไม่กระตุก ไม่มีรอยต่อ)
 * - ความเร็วเป็น px/วินาที: เนื้อหายาวขึ้นก็ไม่เร็วขึ้น · วัดขนาดใหม่เองเมื่อกล่อง/ฟอนต์/รูปเปลี่ยน
 * - ชี้หรือโฟกัสแล้วหยุด (`pauseOnHover`) · ขอบจางหาย (`fade`) · แนวนอนหรือแนวตั้ง กลับทิศได้
 * - ชุดที่วาดซ้ำถูกซ่อนจาก screen reader และกด Tab เข้าไม่ได้ (อ่านแค่ชุดเดียว)
 * - ผู้ใช้ตั้งลดการเคลื่อนไหวในระบบ → ไม่เลื่อน แสดงชุดเดียวที่เลื่อนดูเองได้
 */
export function Marquee({ children, speed = 40, direction = 'left', gap = 24, pauseOnHover = true, fade = true, label, className }: Props) {
  const reduce = useReducedMotion();
  const vertical = direction === 'up' || direction === 'down';
  const box = React.useRef<HTMLDivElement>(null);
  const group = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ box: 0, group: 0 });

  React.useEffect(() => {
    const measure = () => {
      const b = box.current;
      const g = group.current;
      if (!b || !g) return;
      setSize({ box: vertical ? b.clientHeight : b.clientWidth, group: vertical ? g.offsetHeight : g.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    if (group.current) ro.observe(group.current);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [vertical]);

  const copies = reduce ? 1 : marqueeCopies(size.box, size.group);
  const duration = marqueeDuration(size.group, speed);
  const ready = !reduce && duration > 0;

  const groupClass = cn('flex shrink-0', vertical ? 'flex-col' : 'items-center');
  // ช่องไฟท้ายชุดใส่เป็น padding เพื่อให้ "หนึ่งชุด" = เนื้อหา + ช่องไฟ พอดีระยะเลื่อน
  const groupStyle: React.CSSProperties = vertical ? { gap, paddingBottom: gap } : { gap, paddingRight: gap };

  return (
    <div
      ref={box} role="region" aria-label={label}
      data-pause-hover={pauseOnHover} data-fade={fade ? (vertical ? 'y' : 'x') : undefined}
      className={cn('marquee relative', reduce ? (vertical ? 'overflow-y-auto' : 'overflow-x-auto') : 'overflow-hidden', className)}
    >
      <div
        className={cn('flex w-max', vertical && 'h-max w-full flex-col', ready && 'marquee-track')}
        style={{
          ['--marquee-distance' as string]: `${size.group}px`,
          ['--marquee-duration' as string]: `${duration}s`,
          ['--marquee-name' as string]: vertical ? 'marquee-y' : 'marquee-x',
          ['--marquee-dir' as string]: direction === 'right' || direction === 'down' ? 'reverse' : 'normal',
        }}
      >
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} ref={i === 0 ? group : undefined} className={groupClass} style={groupStyle} aria-hidden={i > 0 || undefined} inert={i > 0 || undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
