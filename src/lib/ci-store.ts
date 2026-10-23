import { useSyncExternalStore } from 'react';
import { ciTheme, ciThemeCss, parseHex, toHex, DEFAULT_DECOR, DEFAULT_SECONDARY } from '@/lib/ci-theme';
import { chartThemeCss } from '@/lib/chart-palette';
import { STATE_KEY } from '@/lib/ci-script';

export { CI_INIT_SCRIPT, CSS_KEY, STATE_KEY, STYLE_ID } from '@/lib/ci-script';

/**
 * สถานะสี CI ระดับทั้งแอป (หลายหน้า/หลายแท็บใช้ร่วมกัน)
 *
 * - เก็บที่เดียว: `useCiState()` อ่าน · `setCiState()` แก้ · จำใน localStorage · แท็บอื่นเปลี่ยนก็ตามด้วย (storage event)
 * - ตัวทาสีจริงคือ <CiThemeApplier/> ที่ root layout — ไม่ผูกกับหน้าไหน จึงเลือกสีหน้าหลักแล้วไปหน้า dashboard ได้สีเดียวกัน
 * - `ciStyleCss()` เป็นฟังก์ชันล้วน (ทดสอบได้) · ผลลัพธ์ถูกเก็บไว้ใน localStorage อีกที (`CSS_KEY`) ให้สคริปต์ใน <head>
 *   (`CI_INIT_SCRIPT`) ทาก่อน React โหลด ไม่เห็นสีตั้งต้นกระพริบทุกครั้งที่เปิดหน้า
 */
export type CiState = {
  /** ลำดับ = บทบาท: หลัก → รอง → ตกแต่ง (สีที่ 4 ขึ้นไปสำรอง) */
  colors: string[];
  /** ปรับโทนสีรอง/ตกแต่ง/พื้นหลังให้เข้ากับสีหลัก */
  harmonize: boolean;
  /** false = ใช้สีตั้งต้นของระบบ (globals.css) */
  active: boolean;
};

export const DEFAULT_COLORS = ['#FF0000', DEFAULT_SECONDARY, DEFAULT_DECOR];
export const DEFAULT_CI: CiState = { colors: DEFAULT_COLORS, harmonize: true, active: false };

const valid = (s: string | undefined) => !!s && parseHex(s) !== null;
const norm = (s: string) => toHex(parseHex(s)!);

/** CSS ที่ทับตัวแปรสีทั้งหมด (แบรนด์ + สีกราฟ) · null = ไม่ต้องทาอะไร (ปิดอยู่ หรือสีหลักยังพิมพ์ไม่ครบ) */
export function ciStyleCss(s: CiState): string | null {
  if (!s.active || !valid(s.colors[0])) return null;
  const [primary, secondary, decor] = s.colors.slice(0, 3).map((c) => (valid(c) ? norm(c) : undefined));
  const theme = ciTheme({ primary: primary!, secondary, decor, harmonize: s.harmonize });
  return `${ciThemeCss(theme)}\n${chartThemeCss({ primary: primary!, secondary: theme.info.secondary, decor: theme.info.decor })}`;
}

// ── store ────────────────────────────────────────────────────────────────
let state: CiState = DEFAULT_CI;
let hydrated = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function readStorage(): CiState | null {
  try {
    const v = JSON.parse(localStorage.getItem(STATE_KEY) ?? 'null');
    if (!v || !Array.isArray(v.colors) || !v.colors.length) return null;
    return { colors: v.colors.map(String), harmonize: v.harmonize !== false, active: !!v.active };
  } catch {
    return null;
  }
}

/** อ่านค่าที่จำไว้ครั้งเดียวหลัง mount (ฝั่ง server/ตอน hydrate ใช้ค่าตั้งต้นก่อน กัน HTML ไม่ตรงกัน) + ตามแท็บอื่น */
export function hydrateCi() {
  if (hydrated) return;
  hydrated = true;
  const v = readStorage();
  if (v) { state = v; emit(); }
  window.addEventListener('storage', (e) => {
    if (e.key !== STATE_KEY) return;
    state = readStorage() ?? DEFAULT_CI;
    emit();
  });
}

export function setCiState(patch: Partial<CiState>) {
  state = { ...state, ...patch };
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch { /* ใช้ได้โดยไม่จำค่า */ }
  emit();
}

export const resetCi = () => setCiState({ ...DEFAULT_CI });

const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const useCiState = (): CiState => useSyncExternalStore(subscribe, () => state, () => DEFAULT_CI);
