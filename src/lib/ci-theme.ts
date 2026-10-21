/**
 * สร้างโทเคนสีของระบบจากสี CI (corporate identity) ที่ผู้ใช้ใส่
 *
 *   ciTheme({ primary: '#D60000', secondary: '#F5A623', decor: '#00B295' }) → { light, dark, info }
 *
 * - คำนวณใน OKLCH (ความสว่างตามที่ตาเห็นจริง) เฉดอ่อน/เข้มของทุกสีจึงไล่เท่ากัน ไม่ว่าจะเป็นสีอะไร
 * - สีหลัก → สเกล brand-50…700 + brand-link · 600 ถูกปรับให้ตัวหนังสือขาวทับได้ (contrast ≥ 4.5:1)
 * - สีรอง/สีตกแต่ง → --accent-500 / --accent2-500 (ภาพประกอบ ลวดลาย)
 * - harmonize: ดึงความสว่าง/ความสดของสีรองเข้าหาสีหลักนิดหน่อย + ย้อมพื้นหลังอ่อนๆ ด้วยเฉดของสีหลัก
 * - สีสถานะ (ok/warn/danger) และสีตัวอักษร (ink) ไม่ยุ่ง — ตามกติกาเดิมที่สถานะไม่ขึ้นกับสีแบรนด์
 * ค่าที่คืนเป็น "R G B" ตรงกับรูปแบบตัวแปรใน globals.css
 */

export type Oklch = { l: number; c: number; h: number };
type Rgb = [number, number, number]; // 0–1

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** '#abc' / 'abc' / '#aabbcc' → [r,g,b] 0–1 · ไม่ถูกต้องคืน null */
export function parseHex(input: string): Rgb | null {
  let h = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((x) => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
}

export function toHex([r, g, b]: Rgb) {
  return '#' + [r, g, b].map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch([r0, g0, b0]: Rgb): Oklch {
  const [r, g, b] = [r0, g0, b0].map(toLinear);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

/** OKLCH → sRGB · ถ้าสีเกินขอบเขตที่จอแสดงได้ ลดความสด (chroma) ลงจนพอดี โดยคงความสว่างและเฉดไว้ */
export function oklchToRgb(o: Oklch): Rgb {
  const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  let lin = oklchToLinear(o);
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = o.c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...o, c: mid }))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear({ ...o, c: lo });
  }
  return lin.map((v) => fromLinear(clamp(v))) as Rgb;
}

const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** contrast ratio ตาม WCAG (1–21) */
export function contrast(a: Rgb, b: Rgb) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const WHITE: Rgb = [1, 1, 1];
const channels = (rgb: Rgb) => rgb.map((v) => Math.round(clamp(v) * 255)).join(' ');
const at = (o: Oklch, l: number, cFactor: number): Rgb => oklchToRgb({ l, c: o.c * cFactor, h: o.h });

/** ลดความสว่างทีละนิดจนตัวหนังสือขาวทับได้ (≥ 4.5:1) */
function darkenForWhiteText(o: Oklch): Oklch {
  let l = o.l;
  while (l > 0.2 && contrast(oklchToRgb({ ...o, l }), WHITE) < 4.5) l -= 0.01;
  return { ...o, l };
}

export type BrandScale = {
  light: Record<string, string>;
  dark: Record<string, string>;
  /** ช่องไหนในสเกลที่เป็นสีที่ผู้ใช้ใส่มาตรงๆ (500 หรือ 600) */
  exactAt: '500' | '600';
  /** contrast ของตัวหนังสือขาวบน 600 */
  whiteOn600: number;
};

/**
 * สีหลัก → brand-50…700
 * - สีที่ใส่ผ่าน contrast กับตัวหนังสือขาวอยู่แล้ว (สีเข้ม): ใช้เป็น 600 แล้วทำ 500 ให้สดขึ้นนิดหน่อย
 * - ยังไม่ผ่าน (สีสด/สีอ่อน): ใช้เป็น 500 แล้วหรี่ลงจนได้ 600 ที่ตัวหนังสือขาวอ่านออก
 */
export function brandScale(hex: string): BrandScale {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`invalid color: ${hex}`);
  const o = rgbToOklch(rgb);
  const passes = contrast(rgb, WHITE) >= 4.5;
  const s600: Oklch = passes ? o : darkenForWhiteText({ ...o, l: Math.min(o.l, o.l - 0.04) });
  const s500: Oklch = passes ? { ...o, l: Math.min(0.75, o.l + 0.07) } : o;
  const s700: Oklch = { ...s600, l: Math.max(0.18, s600.l - 0.1) };
  const rgb600 = oklchToRgb(s600);
  // เฉดอ่อนไล่ระหว่าง 50 (เกือบขาว) กับความสว่างจริงของ 500 — สีอ่อนมาก (เช่น เหลือง) สเกลจึงยังเรียงอ่อน→เข้มเสมอ
  const tint = (f: number, cFactor: number) => at(o, mix(0.975, s500.l, f), cFactor);

  const light = {
    'brand-50': channels(tint(0, 0.1)),
    'brand-100': channels(tint(0.09, 0.2)),
    'brand-200': channels(tint(0.25, 0.38)),
    'brand-300': channels(tint(0.5, 0.62)),
    'brand-400': channels(tint(0.77, 0.85)),
    'brand-500': channels(oklchToRgb(s500)),
    'brand-600': channels(rgb600),
    'brand-700': channels(oklchToRgb(s700)),
    'brand-link': channels(rgb600),
  };
  // ธีมมืด: เฉดอ่อน (พื้นป้าย/พื้นเน้น) กลายเป็นเฉดมืดอมสี · ลิงก์สว่างขึ้นให้อ่านบนพื้นมืด (ตามแนวเดิมของ globals.css)
  const dark = {
    'brand-50': channels(at(o, 0.26, 0.3)),
    'brand-100': channels(at(o, 0.3, 0.38)),
    'brand-200': channels(at(o, 0.36, 0.5)),
    'brand-link': channels(oklchToRgb({ l: 0.76, c: Math.min(o.c, 0.15), h: o.h })),
  };
  return { light, dark, exactAt: passes ? '600' : '500', whiteOn600: contrast(rgb600, WHITE) };
}

/** ดึงสีรองเข้าหาสีหลักนิดหน่อย (ความสว่าง 25% · ความสด 35%) คงเฉดสีเดิมไว้ */
export function harmonize(hex: string, toward: string): string {
  const a = parseHex(hex);
  const b = parseHex(toward);
  if (!a || !b) return hex;
  const s = rgbToOklch(a);
  const p = rgbToOklch(b);
  return toHex(oklchToRgb({ l: mix(s.l, p.l, 0.25), c: mix(s.c, p.c, 0.35), h: s.h }));
}

export type CiInput = { primary: string; secondary?: string; decor?: string; harmonize?: boolean };

/** ค่าเริ่มต้นของสีรอง/สีตกแต่ง เมื่อผู้ใช้ใส่มาไม่ครบ (ตรงกับ globals.css) */
export const DEFAULT_SECONDARY = '#F5A623';
export const DEFAULT_DECOR = '#00B295';

export function ciTheme({ primary, secondary = DEFAULT_SECONDARY, decor = DEFAULT_DECOR, harmonize: tune = true }: CiInput) {
  const brand = brandScale(primary);
  const p = rgbToOklch(parseHex(primary)!);
  const sec = tune ? harmonize(secondary, primary) : secondary;
  const dec = tune ? harmonize(decor, primary) : decor;

  const light: Record<string, string> = {
    ...brand.light,
    'accent-500': channels(parseHex(sec)!),
    'accent2-500': channels(parseHex(dec)!),
  };
  const dark: Record<string, string> = { ...brand.dark };
  if (tune) {
    // ย้อมพื้นหลังด้วยเฉดของสีหลักจางๆ ให้ทั้งหน้าดูเป็นชุดเดียวกับแบรนด์ (ตัวอักษรไม่ยุ่ง)
    light.paper = channels(oklchToRgb({ l: 0.968, c: Math.min(0.008, p.c * 0.06), h: p.h }));
    dark.paper = channels(oklchToRgb({ l: 0.19, c: Math.min(0.022, p.c * 0.12), h: p.h }));
    dark.surface = channels(oklchToRgb({ l: 0.24, c: Math.min(0.026, p.c * 0.14), h: p.h }));
  }
  return { light, dark, info: { exactAt: brand.exactAt, whiteOn600: brand.whiteOn600, secondary: sec, decor: dec } };
}

/**
 * CSS ที่ทับตัวแปรของ globals.css · ใช้ !important เพื่อชนะทุกกฎเดิม (รวม body:has([data-surface=admin]))
 * ธีมมืดมี selector ที่เจาะจงกว่า จึงชนะกฎของธีมสว่างในกลุ่ม !important ด้วยกัน
 */
export function ciThemeCss(theme: ReturnType<typeof ciTheme>) {
  const block = (vars: Record<string, string>) =>
    Object.entries(vars).map(([k, v]) => `  --${k}: ${v} !important;`).join('\n');
  return `body {\n${block(theme.light)}\n}\n:root[data-theme='dark'] body {\n${block(theme.dark)}\n}`;
}
