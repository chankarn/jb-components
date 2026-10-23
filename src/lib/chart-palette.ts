import { oklchToRgb, parseHex, rgbToOklch, toHex } from '@/lib/ci-theme';

/**
 * พาเลตสีของกราฟ (categorical) ที่ตามสี CI ได้ และผ่านเกณฑ์ตรวจสีของ dataviz ทั้งโหมดสว่าง/มืด
 *
 *   chartPalette({ primary, secondary, decor }, 'dark') → hex 8 ช่อง
 *
 * - ช่อง 1–3 = สีหลัก/สีรอง/สีตกแต่งของ CI · ช่อง 4–8 = สร้างจากชุดสี CI เอง (extendPalette): เฉดที่ห่างจากสี CI มากที่สุดบนวงล้อสี
 *   ความสดระดับเดียวกับสี CI จึงไม่โดดออกนอกชุด (เฉดคงที่ชุดเก่า น้ำเงิน/ชมพู สดกว่าชุดสีแบรนด์ที่นุ่มมากจนดูเป็นคนนอก)
 * - ช่อง CI ถูกบีบความสว่างเข้าช่วงของโหมด (OKLCH L 0.43–0.77 สว่าง · 0.48–0.67 มืด) แล้วปรับความสว่างทีละนิด
 *   จนทุกคู่ที่อยู่ติดกันผ่านเกณฑ์ CVD (ΔE ≥ 8 ในตาบอดสีแดง/เขียว) และเกณฑ์ตาปกติ (ΔE ≥ 15) — snap-to-passing
 * - ค่าวัดทั้งหมดพอร์ตจาก scripts/validate_palette.js ของสกิล dataviz (Machado 2009 severity 1.0 · ΔE = OKLab × 100)
 *   tests/chart-palette.test.ts เทียบค่าที่ได้กับตัวต้นฉบับ
 */

export type Mode = 'light' | 'dark';
export const SLOTS = 8;

export const BAND: Record<Mode, [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };
export const CHROMA_FLOOR = 0.1;
export const CVD_TARGET = 8;
export const NORMAL_FLOOR = 15;
export const CONTRAST_MIN = 3;
/** พื้นผิวที่กราฟวาดอยู่จริง (ค่า --surface ของ globals.css) */
export const SURFACE: Record<Mode, string> = { light: '#FFFFFF', dark: '#1E1B2E' };

// ── สี ────────────────────────────────────────────────────────────────────
type V3 = [number, number, number];
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lin = (hex: string): V3 => parseHex(hex)!.map(toLinear) as V3;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
} as const;
type Cvd = keyof typeof MACHADO;

function oklabFromLin([r, g, b]: V3): V3 {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function simulate(hex: string, kind: Cvd): V3 {
  const [r, g, b] = lin(hex);
  const M = MACHADO[kind];
  return M.map((row) => clamp01(row[0] * r + row[1] * g + row[2] * b)) as V3;
}

/** ระยะห่างสีใน OKLab × 100 · ไม่ระบุ kind = ตาปกติ */
export function deltaE(a: string, b: string, kind?: Cvd): number {
  const x = oklabFromLin(kind ? simulate(a, kind) : lin(a));
  const y = oklabFromLin(kind ? simulate(b, kind) : lin(b));
  return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

const luminance = (hex: string) => { const [r, g, b] = lin(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

const oklch = (hex: string) => rgbToOklch(parseHex(hex)!);

// ── ตรวจพาเลต (เหมือน validate() ของสกิล แบบ pairs = adjacent) ───────────────
export type PaletteCheck = {
  ok: boolean;
  band: boolean;
  chroma: boolean;
  /** min(protan, deutan) ของคู่ติดกันที่แย่สุด */
  cvd: number;
  cvdState: 'pass' | 'floor' | 'fail';
  normal: number;
  /** สีที่คอนทราสต์กับพื้นต่ำกว่า 3:1 → ต้องมี label ตรงๆ หรือตารางข้อมูลช่วย */
  lowContrast: string[];
};

export function checkPalette(hexes: string[], mode: Mode, surface = SURFACE[mode]): PaletteCheck {
  const [lo, hi] = BAND[mode];
  const lch = hexes.map(oklch);
  const band = lch.every((o) => o.l >= lo && o.l <= hi);
  const chroma = lch.every((o) => o.c >= CHROMA_FLOOR);
  let cvd = 99;
  let normal = 99;
  for (let i = 0; i < hexes.length - 1; i++) {
    cvd = Math.min(cvd, deltaE(hexes[i], hexes[i + 1], 'protan'), deltaE(hexes[i], hexes[i + 1], 'deutan'));
    normal = Math.min(normal, deltaE(hexes[i], hexes[i + 1]));
  }
  const cvdState = cvd >= CVD_TARGET ? 'pass' : cvd >= 6 ? 'floor' : 'fail';
  const lowContrast = hexes.filter((h) => contrastRatio(h, surface) < CONTRAST_MIN);
  return { ok: band && chroma && cvdState !== 'fail' && normal >= NORMAL_FLOOR, band, chroma, cvd, cvdState, normal, lowContrast };
}

// ── สร้างพาเลต ────────────────────────────────────────────────────────────
const withL = (hex: string, l: number) => {
  const o = oklch(hex);
  return toHex(oklchToRgb({ ...o, l }));
};

/** ความสดที่จอ sRGB แสดงได้จริงที่ความสว่าง/เฉดนี้ (oklchToRgb ลดความสดเองเมื่อเกินขอบ) */
const reachable = (l: number, c: number, h: number) => rgbToOklch(oklchToRgb({ l, c, h })).c;

/**
 * บีบสีเข้าเกณฑ์ของโหมด (คงเฉดสี): ความสว่างเข้าช่วง (ขอบในเผื่อ 0.005 กันค่าปัดเศษหลุดขอบ)
 * และความสดไม่ต่ำกว่าเกณฑ์ (ต่ำกว่านั้นอ่านเป็นสีเทา ทำหน้าที่แยกซีรีส์ไม่ได้)
 * บางเฉด (เช่น ฟ้าอมเขียวเข้ม) จอแสดงความสดถึงเกณฑ์ไม่ได้ที่ความสว่างเดิม → ขยับความสว่างขึ้นทีละ 0.01 จนได้
 */
export function snapToBand(hex: string, mode: Mode): string {
  const [lo, hi] = BAND[mode];
  const o = oklch(hex);
  const want = Math.max(o.c, CHROMA_FLOOR + 0.005);
  let l = Math.min(hi - 0.005, Math.max(lo + 0.005, o.l));
  while (reachable(l, want, o.h) < CHROMA_FLOOR && l + 0.01 <= hi - 0.005) l += 0.01;
  return toHex(oklchToRgb({ l, c: want, h: o.h }));
}

const pairScore = (a: string, b: string) =>
  Math.min(Math.min(deltaE(a, b, 'protan'), deltaE(a, b, 'deutan')) / CVD_TARGET, deltaE(a, b) / NORMAL_FLOOR);
const minScore = (h: string[]) => Math.min(...h.slice(0, -1).map((c, i) => pairScore(c, h[i + 1])));

/**
 * ปีนเขาทีละก้าว: เลื่อนความสว่างของช่องที่ปรับได้ (±0.02) ในกรอบของโหมด เลือกก้าวที่ทำให้
 * "คู่ติดกันที่แย่สุด" ดีขึ้นมากสุด จนทุกคู่ผ่านหรือไม่มีก้าวไหนช่วยได้อีก
 */
function tune(hexes: string[], adjustable: boolean[], mode: Mode): string[] {
  const [lo, hi] = BAND[mode];
  let cur = hexes.slice();
  for (let iter = 0; iter < 60 && minScore(cur) < 1; iter++) {
    const base = minScore(cur);
    let best: { h: string[]; s: number } | null = null;
    cur.forEach((hex, i) => {
      if (!adjustable[i]) return;
      for (const d of [-0.02, 0.02]) {
        const l = oklch(hex).l + d;
        if (l < lo + 0.005 || l > hi - 0.005) continue;
        const next = cur.slice();
        next[i] = withL(hex, l);
        const s = minScore(next);
        if (s > (best?.s ?? base) + 1e-6) best = { h: next, s };
      }
    });
    if (!best) break;
    cur = (best as { h: string[] }).h;
  }
  return cur;
}

export type CiColors = { primary: string; secondary?: string; decor?: string };

const hueDist = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const median = (v: number[]) => [...v].sort((x, y) => x - y)[Math.floor(v.length / 2)];

/**
 * ช่อง 4–8 จากชุดสี CI เอง: เลือกเฉดทีละช่องแบบ "จุดที่ไกลที่สุด" (กึ่งกลางช่องว่างที่ใหญ่สุดบนวงล้อสี ห่างจากเฉดที่มีอยู่)
 * · ความสดระดับกลางของสี CI (ไม่ต่ำกว่าเกณฑ์ ไม่เกิน 0.15) จึงนุ่มเท่าชุดสี ไม่สดโดด
 * · ความสว่างสลับสูง/ต่ำรอบกลางช่วง (`amp` = ระยะสลับ) ให้แยกกันได้แม้เฉดอยู่ใกล้กัน
 * · แต่ละช่องผ่าน snapToBand: บางเฉด (เช่น เขียวเหลือง) ที่ความสว่างนั้นจอแสดงความสดถึงเกณฑ์ไม่ได้ จะขยับความสว่างให้
 */
export function extendPalette(base: string[], mode: Mode, count = SLOTS - base.length, amp = 0.06): string[] {
  const lch = base.map(oklch);
  const chroma = Math.min(0.15, Math.max(CHROMA_FLOOR + 0.005, median(lch.map((o) => o.c))));
  const [lo, hi] = BAND[mode];
  const mid = (lo + hi) / 2;
  const out: string[] = [];
  const taken = lch.map((o) => o.h);
  for (let i = 0; i < count; i++) {
    let best = 0;
    let bestGap = -1;
    for (let h = 0; h < 360; h += 5) {
      const gap = Math.min(...taken.map((x) => hueDist(h, x)));
      if (gap > bestGap) { bestGap = gap; best = h; }
    }
    taken.push(best);
    out.push(snapToBand(toHex(oklchToRgb({ l: mid + (i % 2 ? -amp : amp), c: chroma, h: best })), mode));
  }
  return out;
}

const permutations = <T,>(a: T[]): T[][] => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));

/**
 * พาเลต 8 ช่องของโหมดนั้น · ช่อง CI ที่ไม่ได้ใส่ใช้ค่าตั้งต้น (อำพัน/มิ้นต์)
 * ลองหลายแบบ (ระยะสลับความสว่าง × ลำดับของช่อง 4–8 ทุกแบบ) เลือกชุดที่คู่ติดกันแย่สุดดีที่สุด แล้วค่อยปรับความสว่างละเอียด (tune)
 */
export function chartPalette(ci: CiColors, mode: Mode): string[] {
  const base = [ci.primary, ci.secondary ?? '#F5A623', ci.decor ?? '#00B295'].map((c) => snapToBand(c, mode));
  let best: { hexes: string[]; score: number } | null = null;
  for (const amp of [0.04, 0.06, 0.08]) {
    for (const ext of permutations(extendPalette(base, mode, SLOTS - base.length, amp))) {
      const hexes = [...base, ...ext];
      const score = minScore(hexes);
      if (!best || score > best.score) best = { hexes, score };
    }
  }
  return tune(best!.hexes, best!.hexes.map(() => true), mode);
}

/** คู่สีใน 3 ช่อง CI ที่ตาปกติแยกยาก (ΔE < 15) — ในกราฟจะเหมือนกัน แม้ไม่ได้อยู่ติดกันจึงไม่ถูกเกณฑ์หลักจับ */
export function similarCiPairs(hexes3: string[]): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i < hexes3.length; i++) for (let j = i + 1; j < hexes3.length; j++) {
    const d = deltaE(hexes3[i], hexes3[j]);
    if (d < NORMAL_FLOOR) out.push([i, j, d]);
  }
  return out;
}

const channels = (hex: string) => parseHex(hex)!.map((v) => Math.round(v * 255)).join(' ');

/** ตัวแปร CSS --chart-1…8 (รูปแบบ "R G B" เหมือนโทเคนอื่น) ของทั้งสองโหมด */
export function chartVars(ci: CiColors): { light: Record<string, string>; dark: Record<string, string> } {
  const make = (mode: Mode) => Object.fromEntries(chartPalette(ci, mode).map((h, i) => [`chart-${i + 1}`, channels(h)]));
  return { light: make('light'), dark: make('dark') };
}

/** CSS ทับ --chart-N — เอาไปต่อท้าย ciThemeCss() ได้เลย (selector เดียวกัน ใช้ !important เหมือนกัน) */
export function chartThemeCss(ci: CiColors) {
  const v = chartVars(ci);
  const block = (m: Record<string, string>) => Object.entries(m).map(([k, x]) => `  --${k}: ${x} !important;`).join('\n');
  return `body {\n${block(v.light)}\n}\n:root[data-theme='dark'] body {\n${block(v.dark)}\n}`;
}
