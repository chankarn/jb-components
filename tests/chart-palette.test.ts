import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BAND, checkPalette, chartPalette, chartVars, deltaE, extendPalette, similarCiPairs, snapToBand } from '@/lib/chart-palette';
import { parseHex, rgbToOklch } from '@/lib/ci-theme';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

/** อ่านค่า --chart-N ของ block ที่ขึ้นต้นด้วย selector นั้น (ถึงปีกกาปิดแรก) */
function chartTokens(selector: string) {
  const start = css.indexOf(selector);
  const block = css.slice(start, css.indexOf('\n}', start));
  return Object.fromEntries([...block.matchAll(/--(chart-\d):\s*([\d ]+);/g)].map((m) => [m[1], m[2].trim()]));
}

describe('chart-palette: ค่าวัดตรงกับ validate_palette.js ของสกิล dataviz', () => {
  // ตัวเลขเหล่านี้มาจากการรันตัวต้นฉบับกับคู่สีเดียวกัน (เทียบทศนิยม 1 ตำแหน่ง)
  it('ΔE ตาปกติ / ตาบอดสีแดง-เขียว ตรงกับตัวต้นฉบับ', () => {
    expect(deltaE('#ED9E12', '#FF0000')).toBeCloseTo(22.2, 1);
    expect(deltaE('#ED9E12', '#FF0000', 'deutan')).toBeCloseTo(12.2, 1);
    expect(deltaE('#6250D6', '#2A78D6')).toBeCloseTo(10.5, 1);
    expect(deltaE('#6250D6', '#2A78D6', 'deutan')).toBeCloseTo(4.5, 1);
    expect(deltaE('#C58200', '#FF0000', 'deutan')).toBeCloseTo(1.9, 1);
  });

  it('จับพาเลตที่ไม่ผ่านได้ (แดง→อำพันเข้มในโหมดมืด · น้ำเงิน→ม่วง)', () => {
    expect(checkPalette(['#FF0000', '#C58200', '#00AA8E'], 'dark').ok).toBe(false);
    expect(checkPalette(['#2A78D6', '#6250D6'], 'light').ok).toBe(false);
  });
});

describe('chart-palette: พาเลตที่สร้างให้ผ่านเกณฑ์ทั้งสองโหมด', () => {
  const CIS = [
    { primary: '#FF0000' }, { primary: '#D60000' }, { primary: '#006989' }, { primary: '#7B4BC4' },
    { primary: '#D63C76' }, { primary: '#0E8C8C' },
    { primary: '#006989', secondary: '#F5A623', decor: '#D63C76' },
    { primary: '#7B4BC4', secondary: '#00B295', decor: '#F5A623' },
    // พาเลตจริงที่ลองใช้ (Salmon / Vintage Grape / Almond Silk / Silver)
    { primary: '#DB8A74', secondary: '#444054' },
    { primary: '#DB8A74', secondary: '#444054', decor: '#FAC9B8' },
    { primary: '#DB8A74', secondary: '#BEBBBB', decor: '#FAC9B8' },
  ];
  for (const ci of CIS) {
    it(`CI ${JSON.stringify(ci)}`, () => {
      for (const mode of ['light', 'dark'] as const) {
        const c = checkPalette(chartPalette(ci, mode), mode);
        expect(c.ok, `${mode}: ${JSON.stringify(c)}`).toBe(true);
        expect(c.cvd).toBeGreaterThanOrEqual(8);
        expect(c.normal).toBeGreaterThanOrEqual(15);
      }
    });
  }

  it('ได้ 8 ช่องเสมอ · ช่อง 1 ยังเป็นเฉดเดียวกับสีหลักที่ใส่ (แค่ปรับความสว่าง/ความสด)', () => {
    const p = chartPalette({ primary: '#7B4BC4' }, 'light');
    expect(p).toHaveLength(8);
    const hue = (h: string) => rgbToOklch(parseHex(h)!).h;
    expect(Math.abs(hue(p[0]) - hue('#7B4BC4'))).toBeLessThan(3);
  });

  it('สีที่สดน้อยเกินจอแสดงถึงเกณฑ์ไม่ได้ → ขยับความสว่างจนความสดถึง 0.10', () => {
    const snapped = snapToBand('#006989', 'light');
    expect(rgbToOklch(parseHex(snapped)!).c).toBeGreaterThanOrEqual(0.1);
    const [lo, hi] = BAND.light;
    const l = rgbToOklch(parseHex(snapped)!).l;
    expect(l).toBeGreaterThanOrEqual(lo);
    expect(l).toBeLessThanOrEqual(hi);
  });
});

describe('chart-palette: ค่าตั้งต้นใน globals.css ตรงกับที่โมดูลคำนวณ', () => {
  const rgbOf = (hexes: string[]) => hexes.map((h) => parseHex(h)!.map((v) => Math.round(v * 255)).join(' '));
  const expected = (mode: 'light' | 'dark', primary = '#FF0000') =>
    Object.fromEntries(rgbOf(chartPalette({ primary }, mode)).map((v, i) => [`chart-${i + 1}`, v]));

  it('สว่าง (:root)', () => expect(chartTokens(':root {\n  color-scheme: light;')).toEqual(expected('light')));
  it("มืด (:root[data-theme='dark'])", () => expect(chartTokens(":root[data-theme='dark'] {")).toEqual(expected('dark')));
  it('chartVars() ให้ค่าเดียวกัน', () => {
    expect(chartVars({ primary: '#FF0000' }).light).toEqual(expected('light'));
    expect(chartVars({ primary: '#FF0000' }).dark).toEqual(expected('dark'));
  });
  it('ฝั่งแอดมิน (สีหลัก Cerulean): ทั้ง 8 ช่องตรงกับที่โมดูลคำนวณ ทั้งสว่างและมืด', () => {
    expect(chartTokens("body:has([data-surface='admin']) {")).toEqual(expected('light', '#006989'));
    expect(chartTokens(":root[data-theme='dark'] body:has([data-surface='admin']) {")).toEqual(expected('dark', '#006989'));
  });
});

describe('chart-palette: ช่อง 4–8 สร้างจากชุดสี CI (ไม่ใช่เฉดคงที่)', () => {
  const lch = (h: string) => rgbToOklch(parseHex(h)!);
  it('ความสดของช่องที่เพิ่ม ไม่สดโดดออกนอกชุด (≤ 0.15) และไม่เทา (≥ 0.10)', () => {
    for (const ci of [{ primary: '#DB8A74', secondary: '#444054' }, { primary: '#006989' }, { primary: '#FF0000' }]) {
      for (const mode of ['light', 'dark'] as const) {
        const p = chartPalette(ci, mode);
        for (const h of p.slice(3)) {
          const c = lch(h).c;
          expect(c, `${JSON.stringify(ci)} ${mode} ${h}`).toBeGreaterThanOrEqual(0.099);
          expect(c, `${h}`).toBeLessThanOrEqual(0.16);
        }
      }
    }
  });

  it('ชุดสีที่นุ่ม (Salmon) ได้ช่องเพิ่มที่นุ่มตาม — ไม่มีสีสดจัดแบบน้ำเงินสด', () => {
    const soft = chartPalette({ primary: '#DB8A74', secondary: '#444054' }, 'light').slice(3).map((h) => lch(h).c);
    const vivid = chartPalette({ primary: '#FF0000' }, 'light').slice(3).map((h) => lch(h).c);
    expect(Math.max(...soft)).toBeLessThan(Math.max(...vivid));
  });

  it('เฉดที่เพิ่มห่างจากเฉดของสี CI (ไม่ซ้ำกับสีที่ผู้ใช้เลือกไว้)', () => {
    const base = ['#DB8A74', '#5D4C8E', '#2AB398'];
    const ext = extendPalette(base.map((b) => snapToBand(b, 'light')), 'light');
    const baseHues = base.map((b) => lch(b).h);
    const d = (a: number, b: number) => { const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); };
    for (const e of ext) expect(Math.min(...baseHues.map((h) => d(h, lch(e).h)))).toBeGreaterThan(20);
  });

  it('similarCiPairs: จับสี CI สองสีที่เกือบซ้ำกัน (Salmon กับ Almond ที่ถูกบีบเข้าช่วง)', () => {
    const pal = chartPalette({ primary: '#DB8A74', secondary: '#444054', decor: '#FAC9B8' }, 'light').slice(0, 3);
    expect(similarCiPairs(pal).map(([i, j]) => `${i}-${j}`)).toContain('0-2');
    expect(similarCiPairs(chartPalette({ primary: '#FF0000' }, 'light').slice(0, 3))).toEqual([]);
  });
});
