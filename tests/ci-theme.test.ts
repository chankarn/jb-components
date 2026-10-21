import { describe, it, expect } from 'vitest';
import { brandScale, ciTheme, contrast, harmonize, parseHex, rgbToOklch, oklchToRgb, toHex } from '@/lib/ci-theme';

const rgb = (channels: string) => channels.split(' ').map((n) => Number(n) / 255) as [number, number, number];

describe('ci-theme: สร้างโทเคนจากสี CI', () => {
  it('อ่าน hex ได้ทั้งแบบสั้น/ยาว/ไม่มี # และปฏิเสธค่าที่ผิด', () => {
    expect(toHex(parseHex('#d60000')!)).toBe('#D60000');
    expect(toHex(parseHex('f00')!)).toBe('#FF0000');
    for (const bad of ['', '#12', 'zzzzzz', '#1234567']) expect(parseHex(bad), bad).toBeNull();
  });

  it('แปลง OKLCH ไป-กลับแล้วได้สีเดิม', () => {
    for (const hex of ['#D60000', '#006989', '#F5A623', '#00B295', '#7B4BC4']) {
      expect(toHex(oklchToRgb(rgbToOklch(parseHex(hex)!)))).toBe(hex);
    }
  });

  it('สีสด (ขาวทับไม่ผ่าน) → ใช้เป็น 500 และหรี่ 600 จนตัวหนังสือขาวผ่าน 4.5:1', () => {
    const s = brandScale('#FF0000');
    expect(s.exactAt).toBe('500');
    expect(s.light['brand-500']).toBe('255 0 0');
    expect(s.whiteOn600).toBeGreaterThanOrEqual(4.5);
  });

  it('สีเข้ม (ขาวทับผ่านอยู่แล้ว) → ใช้เป็น 600 ตรงๆ', () => {
    const s = brandScale('#006989');
    expect(s.exactAt).toBe('600');
    expect(s.light['brand-600']).toBe('0 105 137');
  });

  it('สีอ่อนมาก (เหลือง) ก็ยังได้ 600 ที่ตัวหนังสือขาวอ่านออก', () => {
    const s = brandScale('#FFE600');
    expect(contrast(rgb(s.light['brand-600']), [1, 1, 1])).toBeGreaterThanOrEqual(4.5);
  });

  it('สเกลไล่จากอ่อนไปเข้มเสมอ', () => {
    for (const hex of ['#FF0000', '#006989', '#FFE600', '#7B4BC4']) {
      const l = brandScale(hex).light;
      const lum = ['50', '100', '200', '300', '400', '500', '600', '700'].map((k) => rgbToOklch(rgb(l[`brand-${k}`])).l);
      for (let i = 1; i < lum.length; i++) expect(lum[i], `${hex} ${i}`).toBeLessThan(lum[i - 1]);
    }
  });

  it('harmonize คงเฉดสีของสีรองไว้ และปิดได้', () => {
    const before = rgbToOklch(parseHex('#F5A623')!).h;
    const after = rgbToOklch(parseHex(harmonize('#F5A623', '#006989'))!).h;
    expect(Math.abs(after - before)).toBeLessThan(2);
    expect(ciTheme({ primary: '#006989', secondary: '#F5A623', harmonize: false }).light['accent-500']).toBe('245 166 35');
  });

  it('ใส่สีเดียวก็ได้ สีรอง/ตกแต่งใช้ค่าเริ่มต้น', () => {
    const t = ciTheme({ primary: '#006989', harmonize: false });
    expect(t.light['accent-500']).toBe('245 166 35');
    expect(t.light['accent2-500']).toBe('0 178 149');
  });
});
