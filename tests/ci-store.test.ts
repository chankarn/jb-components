import { describe, it, expect } from 'vitest';
import { DEFAULT_CI, ciStyleCss } from '@/lib/ci-store';
import { CI_INIT_SCRIPT, CSS_KEY, STYLE_ID } from '@/lib/ci-script';

describe('ci-store: CSS ที่ใช้ทาสีทั้งแอป', () => {
  it('ปิดอยู่ (ค่าตั้งต้น) → ไม่ทาอะไร', () => {
    expect(ciStyleCss(DEFAULT_CI)).toBeNull();
    expect(ciStyleCss({ ...DEFAULT_CI, colors: ['#006989'], active: false })).toBeNull();
  });

  it('สีหลักยังพิมพ์ไม่ครบ/ผิดรูปแบบ → null (ตัวทาสีจะคงธีมล่าสุดไว้)', () => {
    for (const bad of ['', '#12', '#zzzzzz', '7B4BC']) expect(ciStyleCss({ colors: [bad], harmonize: true, active: true }), bad).toBeNull();
  });

  it('ใส่สีเดียวก็ได้ → ได้ทั้งโทเคนแบรนด์และสีกราฟทั้งสองโหมด', () => {
    const css = ciStyleCss({ colors: ['#7B4BC4'], harmonize: true, active: true })!;
    expect(css).toContain('--brand-600:');
    expect(css).toContain('--accent-500:');
    for (let i = 1; i <= 8; i++) expect(css).toContain(`--chart-${i}:`);
    expect(css).toContain("body {");
    expect(css).toContain(":root[data-theme='dark'] body {");
  });

  it('สีรอง/ตกแต่งที่ผิดรูปแบบ → ใช้ค่าเริ่มต้นแทน ไม่ทำให้พัง', () => {
    expect(() => ciStyleCss({ colors: ['#7B4BC4', 'oops', ''], harmonize: false, active: true })).not.toThrow();
  });

  it('เลือกสีคนละสี → ได้ CSS คนละชุด · ปิดการปรับโทน → ไม่ย้อมพื้นหลัง (--paper)', () => {
    const a = ciStyleCss({ colors: ['#7B4BC4'], harmonize: true, active: true })!;
    const b = ciStyleCss({ colors: ['#006989'], harmonize: true, active: true })!;
    const c = ciStyleCss({ colors: ['#7B4BC4'], harmonize: false, active: true })!;
    expect(a).not.toBe(b);
    expect(a).toContain('--paper:');
    expect(c).not.toContain('--paper:');
  });
});

describe('ci-script: สคริปต์ใน <head>', () => {
  it('อ่านคีย์ CSS ที่ตัวทาสีเขียนไว้ แล้วใส่ <style id="ci-theme"> ครอบ try/catch', () => {
    expect(CI_INIT_SCRIPT).toContain(`localStorage.getItem('${CSS_KEY}')`);
    expect(CI_INIT_SCRIPT).toContain(`s.id='${STYLE_ID}'`);
    expect(CI_INIT_SCRIPT.startsWith('try{')).toBe(true);
    expect(CI_INIT_SCRIPT.endsWith('catch(e){}')).toBe(true);
  });
});
