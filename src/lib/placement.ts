/** คำนวณตำแหน่งกล่องลอย (popover/tooltip/เมนู) รอบตัวยึด — ฟังก์ชันล้วน แยกจาก .tsx เพื่อให้ vitest ทดสอบได้ */

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export type Box = { top: number; left: number; width: number; height: number };

export type PlaceInput = {
  /** กรอบของตัวยึด (getBoundingClientRect) */
  anchor: Box;
  /** ขนาดกล่องลอย */
  floating: { width: number; height: number };
  viewport: { width: number; height: number };
  side?: Side;
  align?: Align;
  /** ระยะห่างจากตัวยึด */
  offset?: number;
  /** ระยะกันขอบจอ */
  padding?: number;
  /** ระยะกันลูกศรชิดมุมกล่อง */
  arrowPadding?: number;
};

export type Placement = {
  top: number;
  left: number;
  /** ฝั่งที่ใช้จริง (อาจพลิกจากที่ขอ) */
  side: Side;
  /** ตำแหน่งลูกศรตามแกนขวาง นับจากขอบซ้าย/บนของกล่องลอย (ชี้กลางตัวยึดเสมอ แม้กล่องถูกเลื่อนหนีขอบจอ) */
  arrow: number;
};

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/** ที่ว่างระหว่างตัวยึดกับขอบจอแต่ละฝั่ง */
export function spaceAround(a: Box, vp: { width: number; height: number }): Record<Side, number> {
  return { top: a.top, bottom: vp.height - (a.top + a.height), left: a.left, right: vp.width - (a.left + a.width) };
}

/**
 * - ฝั่งที่ขอวางไม่พอ และฝั่งตรงข้ามมีที่มากกว่า → พลิก (ไม่พลิกถ้าฝั่งตรงข้ามก็ไม่พอและแคบกว่า)
 * - แกนขวาง: จัดชิด start/center/end ตามที่ขอ แล้วเลื่อนให้อยู่ในจอ (เว้น padding) · กล่องใหญ่กว่าจอ → ชิดขอบเริ่ม
 */
export function place({ anchor: a, floating: f, viewport: vp, side = 'bottom', align = 'center', offset = 8, padding = 8, arrowPadding = 12 }: PlaceInput): Placement {
  const space = spaceAround(a, vp);
  const vertical = side === 'top' || side === 'bottom';
  const need = (vertical ? f.height : f.width) + offset + padding;
  let s = side;
  if (space[side] < need && space[OPPOSITE[side]] > space[side]) s = OPPOSITE[side];

  let top: number;
  let left: number;
  if (vertical) {
    top = s === 'bottom' ? a.top + a.height + offset : a.top - offset - f.height;
    left = align === 'start' ? a.left : align === 'end' ? a.left + a.width - f.width : a.left + a.width / 2 - f.width / 2;
    left = shift(left, f.width, vp.width, padding);
  } else {
    left = s === 'right' ? a.left + a.width + offset : a.left - offset - f.width;
    top = align === 'start' ? a.top : align === 'end' ? a.top + a.height - f.height : a.top + a.height / 2 - f.height / 2;
    top = shift(top, f.height, vp.height, padding);
  }

  const center = vertical ? a.left + a.width / 2 - left : a.top + a.height / 2 - top;
  const size = vertical ? f.width : f.height;
  const arrow = Math.min(Math.max(center, arrowPadding), Math.max(arrowPadding, size - arrowPadding));
  return { top: Math.round(top), left: Math.round(left), side: s, arrow: Math.round(arrow) };
}

function shift(pos: number, size: number, max: number, pad: number) {
  if (size + pad * 2 >= max) return pad;
  return Math.min(Math.max(pos, pad), max - pad - size);
}

/** จุดตั้งต้นของอนิเมชันขยาย (transform-origin) ให้กล่องดูงอกออกมาจากตัวยึด */
export function originFor(p: Placement): string {
  switch (p.side) {
    case 'bottom': return `${p.arrow}px top`;
    case 'top': return `${p.arrow}px bottom`;
    case 'right': return `left ${p.arrow}px`;
    case 'left': return `right ${p.arrow}px`;
  }
}
