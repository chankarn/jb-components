'use client';

import { useEffect, useState } from 'react';
import { CSS_KEY, STYLE_ID } from '@/lib/ci-script';
import { ciStyleCss, hydrateCi, useCiState } from '@/lib/ci-store';

/**
 * ตัวทาสี CI ระดับทั้งแอป — ติดครั้งเดียวที่ root layout (ไม่ผูกกับหน้าไหน)
 * อ่านสถานะจาก store กลาง แล้วเขียน <style id="ci-theme"> ทับตัวแปรสีทั้งหมด · ปิดใช้ = ลบ style
 * สีหลักที่ยังพิมพ์ไม่ครบ (null) คงธีมล่าสุดไว้ ไม่กระพริบกลับเป็นสีตั้งต้นระหว่างพิมพ์
 * CSS ที่คำนวณแล้วถูกเก็บใน localStorage ให้สคริปต์ใน <head> ทาก่อน React โหลด (ดู CI_INIT_SCRIPT)
 */
export function CiThemeApplier() {
  const state = useCiState();
  // รออ่านค่าที่จำไว้ก่อน — ไม่งั้นรอบแรก (ยังเป็นค่าตั้งต้น/ปิดอยู่) จะลบสไตล์ที่สคริปต์ใน <head> ทาไว้แล้วสีกระพริบ
  const [ready, setReady] = useState(false);
  useEffect(() => { hydrateCi(); setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    if (!state.active) {
      document.getElementById(STYLE_ID)?.remove();
      try { localStorage.removeItem(CSS_KEY); } catch { /* ข้าม */ }
      return;
    }
    const css = ciStyleCss(state);
    if (css == null) return;
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }
    el.textContent = css;
    try { localStorage.setItem(CSS_KEY, css); } catch { /* ข้าม */ }
  }, [state, ready]);

  return null;
}
