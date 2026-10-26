# ฟังก์ชันช่วย (lib)

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/lib/utils`

```ts
import { cn, formatDate, formatNumber, formatDuration, toLocalInput, daysLeft } from '@/lib/utils';
```

### ฟังก์ชัน `cn`

```ts
cn(...inputs: ClassValue[]) => string
```

### ฟังก์ชัน `formatDate`

```ts
formatDate(d: string | Date, withTime?: boolean) => string
```

### ฟังก์ชัน `formatNumber`

```ts
formatNumber(n: number) => string
```

### ฟังก์ชัน `formatDuration`

3725 -> "1:02:05" ใช้กับ player

```ts
formatDuration(sec: number) => string
```

### ฟังก์ชัน `toLocalInput`

ค่าที่ใช้กับ <input type="datetime-local">

```ts
toLocalInput(d: string | Date | null | undefined) => string
```

### ฟังก์ชัน `daysLeft`

```ts
daysLeft(due: string | Date | null | undefined) => number | null
```


## `@/lib/motion-fx`

```ts
import { shake, pop } from '@/lib/motion-fx';
```

### ฟังก์ชัน `shake`

```ts
shake(el: Element | null | undefined) => void
```

### ฟังก์ชัน `pop`

```ts
pop(el: Element | null | undefined) => void
```


## `@/lib/platform`

```ts
import { detectMac, isModEvent, shortcutKeys, formatShortcut, ariaShortcut } from '@/lib/platform';
```

### ฟังก์ชัน `detectMac`

เป็นเครื่อง Apple (Mac/iPhone/iPad) หรือไม่ · ใช้ userAgentData ก่อน (navigator.platform เลิกใช้แล้ว)

```ts
detectMac(nav?: NavLike | undefined) => boolean
```

### ฟังก์ชัน `isModEvent`

กดปุ่ม "mod" อยู่หรือไม่ ตามระบบ: Mac = ⌘ (ไม่นับ Ctrl — Ctrl+K บน Mac คือ "ลบถึงท้ายบรรทัด" ในช่องพิมพ์)
· Windows/Linux = Ctrl (ไม่นับปุ่ม Windows) · กด Alt ร่วม = ไม่นับ (Ctrl+Alt คือ AltGr บนคีย์บอร์ดยุโรป)

```ts
isModEvent(e: { metaKey: boolean; ctrlKey: boolean; altKey: boolean; }, mac: boolean) => boolean
```

### ฟังก์ชัน `shortcutKeys`

แยกปุ่มลัดเป็นรายปุ่มตามระบบ: 'mod+shift+p' → Mac ['⌘','⇧','P'] · Windows ['Ctrl','Shift','P'] (รับรูปแบบเก่า '⌘S' ด้วย)

```ts
shortcutKeys(shortcut: string, mac: boolean) => string[]
```

### ฟังก์ชัน `formatShortcut`

ข้อความปุ่มลัดตามระบบ: Mac "⌘⇧P" (ติดกันแบบเมนู macOS) · Windows "Ctrl+Shift+P"

```ts
formatShortcut(shortcut: string, mac: boolean) => string
```

### ฟังก์ชัน `ariaShortcut`

ค่า aria-keyshortcuts ตามมาตรฐาน (ชื่อปุ่มแบบ KeyboardEvent.key): 'mod+K' → Mac "Meta+K" · Windows "Control+K"

```ts
ariaShortcut(shortcut: string, mac: boolean) => string
```


## `@/lib/toast-store`

```ts
import { subscribeToasts, getToasts, updateToast, dismissToast, ToastKind, ToastAction, ToastOptions, ToastItem, DEFAULT_DURATION, MAX_TOASTS, toast } from '@/lib/toast-store';
```

### ฟังก์ชัน `subscribeToasts`

```ts
subscribeToasts(f: () => void) => () => void
```

### ฟังก์ชัน `getToasts`

```ts
getToasts() => ToastItem[]
```

### ฟังก์ชัน `updateToast`

แก้ toast ที่แสดงอยู่ (ไม่มีแล้ว = ไม่ทำอะไร) · เปลี่ยนชนิดแล้วระยะเวลากลับเป็นค่าตั้งต้นของชนิดใหม่ ถ้าไม่ได้ระบุ

```ts
updateToast(id: number, patch: Partial<Omit<ToastItem, "id" | "version">>) => boolean
```

### ฟังก์ชัน `dismissToast`

```ts
dismissToast(id?: number | undefined) => void
```

### type `ToastKind`

ที่เก็บ toast ระดับ module (เรียกจากที่ไหนก็ได้ ไม่ต้องมี context) — ไม่มี JSX จึงทดสอบด้วย vitest ได้
เวลาถอยหลังจนหายจัดการที่ฝั่ง UI (หยุดนับตอนชี้เมาส์ได้) · ที่นี่เก็บแค่รายการ + ระยะเวลา

```ts
type ToastKind = 'success' | 'error' | 'info' | 'warning' | 'loading';
```

### type `ToastAction`

```ts
type ToastAction = { label: string; onClick: () => void };
```

### type `ToastOptions`

```ts
type ToastOptions = {
  /** บรรทัดรองใต้ข้อความหลัก */
  description?: string;
  /** ปุ่มในกล่อง เช่น { label: 'เลิกทำ', onClick } — กดแล้ว toast ปิดเอง */
  action?: ToastAction;
  /** มิลลิวินาทีก่อนหาย · Infinity = ค้างจนกดปิด */
  duration?: number;
};
```

### type `ToastItem`

```ts
type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
  description?: string;
  action?: ToastAction;
  duration: number;
  /** เพิ่มทุกครั้งที่ถูกอัปเดต (เช่น loading → success) ให้ UI เริ่มนับเวลาใหม่/เล่นอนิเมชันใหม่ */
  version: number;
};
```

### `DEFAULT_DURATION`

ชนิด: `Record<ToastKind, number>`

### `MAX_TOASTS`

แสดงพร้อมกันได้สูงสุด — เกินแล้วตัวเก่าสุดหลุดออก

ชนิด: `4`

### `toast`

toast.success('บันทึกแล้ว')
toast.error('ลบไม่ได้', { description: 'มีคนใช้อยู่', action: { label: 'ลองใหม่', onClick } })
toast.promise(save(), { loading: 'กำลังบันทึก…', success: 'บันทึกแล้ว', error: (e) => `ไม่สำเร็จ: ${e.message}` })

ชนิด: `{ success: (m: string, o?: ToastOptions \| undefined) => number; error: (m: string, o?: ToastOptions \| undefined) => number; info: (m: str…`


## `@/lib/ci-theme`

```ts
import { parseHex, toHex, rgbToOklch, oklchToRgb, contrast, brandScale, harmonize, ciTheme, ciThemeCss, Oklch, BrandScale, CiInput, DEFAULT_SECONDARY, DEFAULT_DECOR } from '@/lib/ci-theme';
```

### ฟังก์ชัน `parseHex`

'#abc' / 'abc' / '#aabbcc' → [r,g,b] 0–1 · ไม่ถูกต้องคืน null

```ts
parseHex(input: string) => Rgb | null
```

### ฟังก์ชัน `toHex`

```ts
toHex([r, g, b]: Rgb) => string
```

### ฟังก์ชัน `rgbToOklch`

```ts
rgbToOklch([r0, g0, b0]: Rgb) => Oklch
```

### ฟังก์ชัน `oklchToRgb`

OKLCH → sRGB · ถ้าสีเกินขอบเขตที่จอแสดงได้ ลดความสด (chroma) ลงจนพอดี โดยคงความสว่างและเฉดไว้

```ts
oklchToRgb(o: Oklch) => Rgb
```

### ฟังก์ชัน `contrast`

contrast ratio ตาม WCAG (1–21)

```ts
contrast(a: Rgb, b: Rgb) => number
```

### ฟังก์ชัน `brandScale`

สีหลัก → brand-50…700
- สีที่ใส่ผ่าน contrast กับตัวหนังสือขาวอยู่แล้ว (สีเข้ม): ใช้เป็น 600 แล้วทำ 500 ให้สดขึ้นนิดหน่อย
- ยังไม่ผ่าน (สีสด/สีอ่อน): ใช้เป็น 500 แล้วหรี่ลงจนได้ 600 ที่ตัวหนังสือขาวอ่านออก

```ts
brandScale(hex: string) => BrandScale
```

### ฟังก์ชัน `harmonize`

ดึงสีรองเข้าหาสีหลักนิดหน่อย (ความสว่าง 25% · ความสด 35%) คงเฉดสีเดิมไว้

```ts
harmonize(hex: string, toward: string) => string
```

### ฟังก์ชัน `ciTheme`

```ts
ciTheme({ primary, secondary, decor, harmonize: tune }: CiInput) => { light: Record<string, string>; dark: Record<string, string>; info: { exactAt: "500" | "600"; whiteOn600: number; secondary: string; decor: string; }; }
```

### ฟังก์ชัน `ciThemeCss`

CSS ที่ทับตัวแปรของ globals.css · ใช้ !important เพื่อชนะทุกกฎเดิม (รวม body:has([data-surface=admin]))
ธีมมืดมี selector ที่เจาะจงกว่า จึงชนะกฎของธีมสว่างในกลุ่ม !important ด้วยกัน

```ts
ciThemeCss(theme: { light: Record<string, string>; dark: Record<string, string>; info: { exactAt: "500" | "600"; whiteOn600: number; secondary: string; decor: string; }; }) => string
```

### type `Oklch`

สร้างโทเคนสีของระบบจากสี CI (corporate identity) ที่ผู้ใช้ใส่

  ciTheme({ primary: '#D60000', secondary: '#F5A623', decor: '#00B295' }) → { light, dark, info }

- คำนวณใน OKLCH (ความสว่างตามที่ตาเห็นจริง) เฉดอ่อน/เข้มของทุกสีจึงไล่เท่ากัน ไม่ว่าจะเป็นสีอะไร
- สีหลัก → สเกล brand-50…700 + brand-link · 600 ถูกปรับให้ตัวหนังสือขาวทับได้ (contrast ≥ 4.5:1)
- สีรอง/สีตกแต่ง → --accent-500 / --accent2-500 (ภาพประกอบ ลวดลาย)
- harmonize: ดึงความสว่าง/ความสดของสีรองเข้าหาสีหลักนิดหน่อย + ย้อมพื้นหลังอ่อนๆ ด้วยเฉดของสีหลัก
- สีสถานะ (ok/warn/danger) และสีตัวอักษร (ink) ไม่ยุ่ง — ตามกติกาเดิมที่สถานะไม่ขึ้นกับสีแบรนด์
ค่าที่คืนเป็น "R G B" ตรงกับรูปแบบตัวแปรใน globals.css

```ts
type Oklch = { l: number; c: number; h: number };
```

### type `BrandScale`

```ts
type BrandScale = {
  light: Record<string, string>;
  dark: Record<string, string>;
  /** ช่องไหนในสเกลที่เป็นสีที่ผู้ใช้ใส่มาตรงๆ (500 หรือ 600) */
  exactAt: '500' | '600';
  /** contrast ของตัวหนังสือขาวบน 600 */
  whiteOn600: number;
};
```

### type `CiInput`

```ts
type CiInput = { primary: string; secondary?: string; decor?: string; harmonize?: boolean };
```

### `DEFAULT_SECONDARY`

ค่าเริ่มต้นของสีรอง/สีตกแต่ง เมื่อผู้ใช้ใส่มาไม่ครบ (ตรงกับ globals.css)

ชนิด: `"#F5A623"`

### `DEFAULT_DECOR`

ชนิด: `"#00B295"`


## `@/lib/ci-store`

```ts
import { ciStyleCss, hydrateCi, setCiState, CI_INIT_SCRIPT, CSS_KEY, STATE_KEY, STYLE_ID, CiState, DEFAULT_COLORS, DEFAULT_CI, resetCi, useCiState } from '@/lib/ci-store';
```

### ฟังก์ชัน `ciStyleCss`

CSS ที่ทับตัวแปรสีทั้งหมด (แบรนด์ + สีกราฟ) · null = ไม่ต้องทาอะไร (ปิดอยู่ หรือสีหลักยังพิมพ์ไม่ครบ)

```ts
ciStyleCss(s: CiState) => string | null
```

### ฟังก์ชัน `hydrateCi`

อ่านค่าที่จำไว้ครั้งเดียวหลัง mount (ฝั่ง server/ตอน hydrate ใช้ค่าตั้งต้นก่อน กัน HTML ไม่ตรงกัน) + ตามแท็บอื่น

```ts
hydrateCi() => void
```

### ฟังก์ชัน `setCiState`

```ts
setCiState(patch: Partial<CiState>) => void
```

### `CI_INIT_SCRIPT`

ใส่ใน <head> ก่อน React โหลด: ทา CSS สี CI ที่คำนวณไว้แล้วทันที ไม่เห็นสีตั้งต้นกระพริบ · localStorage ใช้ไม่ได้ก็ข้าม

ชนิด: `"try{var c=localStorage.getItem('jb-ci-css');if(c){var s=document.createElement('style');s.id='ci-theme';s.textContent=c;document.head.ap…`

### `CSS_KEY`

ชนิด: `"jb-ci-css"`

### `STATE_KEY`

ค่าคงที่ + สคริปต์ <head> ของสี CI — ไฟล์นี้ไม่พึ่ง React เพื่อให้ server component (root layout) import ได้
(ตัว store/hook อยู่ใน ci-store.ts ซึ่งใช้ได้เฉพาะฝั่ง client)

ชนิด: `"jb-ci-colors"`

### `STYLE_ID`

ชนิด: `"ci-theme"`

### type `CiState`

สถานะสี CI ระดับทั้งแอป (หลายหน้า/หลายแท็บใช้ร่วมกัน)

- เก็บที่เดียว: `useCiState()` อ่าน · `setCiState()` แก้ · จำใน localStorage · แท็บอื่นเปลี่ยนก็ตามด้วย (storage event)
- ตัวทาสีจริงคือ <CiThemeApplier/> ที่ root layout — ไม่ผูกกับหน้าไหน จึงเลือกสีหน้าหลักแล้วไปหน้า dashboard ได้สีเดียวกัน
- `ciStyleCss()` เป็นฟังก์ชันล้วน (ทดสอบได้) · ผลลัพธ์ถูกเก็บไว้ใน localStorage อีกที (`CSS_KEY`) ให้สคริปต์ใน <head>
  (`CI_INIT_SCRIPT`) ทาก่อน React โหลด ไม่เห็นสีตั้งต้นกระพริบทุกครั้งที่เปิดหน้า

```ts
type CiState = {
  /** ลำดับ = บทบาท: หลัก → รอง → ตกแต่ง (สีที่ 4 ขึ้นไปสำรอง) */
  colors: string[];
  /** ปรับโทนสีรอง/ตกแต่ง/พื้นหลังให้เข้ากับสีหลัก */
  harmonize: boolean;
  /** false = ใช้สีตั้งต้นของระบบ (globals.css) */
  active: boolean;
};
```

### `DEFAULT_COLORS`

ชนิด: `string[]`

### `DEFAULT_CI`

ชนิด: `CiState`

### ฟังก์ชัน `resetCi`

```ts
resetCi() => void
```

### ฟังก์ชัน `useCiState`

```ts
useCiState() => CiState
```


## `@/lib/chart-palette`

```ts
import { deltaE, contrastRatio, checkPalette, snapToBand, extendPalette, chartPalette, similarCiPairs, chartVars, chartThemeCss, Mode, SLOTS, BAND, CHROMA_FLOOR, CVD_TARGET, NORMAL_FLOOR, CONTRAST_MIN, SURFACE, PaletteCheck, CiColors } from '@/lib/chart-palette';
```

### ฟังก์ชัน `deltaE`

ระยะห่างสีใน OKLab × 100 · ไม่ระบุ kind = ตาปกติ

```ts
deltaE(a: string, b: string, kind?: "protan" | "deutan" | "tritan" | undefined) => number
```

### ฟังก์ชัน `contrastRatio`

```ts
contrastRatio(a: string, b: string) => number
```

### ฟังก์ชัน `checkPalette`

```ts
checkPalette(hexes: string[], mode: Mode, surface?: string) => PaletteCheck
```

### ฟังก์ชัน `snapToBand`

บีบสีเข้าเกณฑ์ของโหมด (คงเฉดสี): ความสว่างเข้าช่วง (ขอบในเผื่อ 0.005 กันค่าปัดเศษหลุดขอบ)
และความสดไม่ต่ำกว่าเกณฑ์ (ต่ำกว่านั้นอ่านเป็นสีเทา ทำหน้าที่แยกซีรีส์ไม่ได้)
บางเฉด (เช่น ฟ้าอมเขียวเข้ม) จอแสดงความสดถึงเกณฑ์ไม่ได้ที่ความสว่างเดิม → ขยับความสว่างขึ้นทีละ 0.01 จนได้

```ts
snapToBand(hex: string, mode: Mode) => string
```

### ฟังก์ชัน `extendPalette`

ช่อง 4–8 จากชุดสี CI เอง: เลือกเฉดทีละช่องแบบ "จุดที่ไกลที่สุด" (กึ่งกลางช่องว่างที่ใหญ่สุดบนวงล้อสี ห่างจากเฉดที่มีอยู่)
· ความสดระดับกลางของสี CI (ไม่ต่ำกว่าเกณฑ์ ไม่เกิน 0.15) จึงนุ่มเท่าชุดสี ไม่สดโดด
· ความสว่างสลับสูง/ต่ำรอบกลางช่วง (`amp` = ระยะสลับ) ให้แยกกันได้แม้เฉดอยู่ใกล้กัน
· แต่ละช่องผ่าน snapToBand: บางเฉด (เช่น เขียวเหลือง) ที่ความสว่างนั้นจอแสดงความสดถึงเกณฑ์ไม่ได้ จะขยับความสว่างให้

```ts
extendPalette(base: string[], mode: Mode, count?: number, amp?: number) => string[]
```

### ฟังก์ชัน `chartPalette`

พาเลต 8 ช่องของโหมดนั้น · ช่อง CI ที่ไม่ได้ใส่ใช้ค่าตั้งต้น (อำพัน/มิ้นต์)
ลองหลายแบบ (ระยะสลับความสว่าง × ลำดับของช่อง 4–8 ทุกแบบ) เลือกชุดที่คู่ติดกันแย่สุดดีที่สุด แล้วค่อยปรับความสว่างละเอียด (tune)

```ts
chartPalette(ci: CiColors, mode: Mode) => string[]
```

### ฟังก์ชัน `similarCiPairs`

คู่สีใน 3 ช่อง CI ที่ตาปกติแยกยาก (ΔE < 15) — ในกราฟจะเหมือนกัน แม้ไม่ได้อยู่ติดกันจึงไม่ถูกเกณฑ์หลักจับ

```ts
similarCiPairs(hexes3: string[]) => [number, number, number][]
```

### ฟังก์ชัน `chartVars`

ตัวแปร CSS --chart-1…8 (รูปแบบ "R G B" เหมือนโทเคนอื่น) ของทั้งสองโหมด

```ts
chartVars(ci: CiColors) => { light: Record<string, string>; dark: Record<string, string>; }
```

### ฟังก์ชัน `chartThemeCss`

CSS ทับ --chart-N — เอาไปต่อท้าย ciThemeCss() ได้เลย (selector เดียวกัน ใช้ !important เหมือนกัน)

```ts
chartThemeCss(ci: CiColors) => string
```

### type `Mode`

พาเลตสีของกราฟ (categorical) ที่ตามสี CI ได้ และผ่านเกณฑ์ตรวจสีของ dataviz ทั้งโหมดสว่าง/มืด

  chartPalette({ primary, secondary, decor }, 'dark') → hex 8 ช่อง

- ช่อง 1–3 = สีหลัก/สีรอง/สีตกแต่งของ CI · ช่อง 4–8 = สร้างจากชุดสี CI เอง (extendPalette): เฉดที่ห่างจากสี CI มากที่สุดบนวงล้อสี
  ความสดระดับเดียวกับสี CI จึงไม่โดดออกนอกชุด (เฉดคงที่ชุดเก่า น้ำเงิน/ชมพู สดกว่าชุดสีแบรนด์ที่นุ่มมากจนดูเป็นคนนอก)
- ช่อง CI ถูกบีบความสว่างเข้าช่วงของโหมด (OKLCH L 0.43–0.77 สว่าง · 0.48–0.67 มืด) แล้วปรับความสว่างทีละนิด
  จนทุกคู่ที่อยู่ติดกันผ่านเกณฑ์ CVD (ΔE ≥ 8 ในตาบอดสีแดง/เขียว) และเกณฑ์ตาปกติ (ΔE ≥ 15) — snap-to-passing
- ค่าวัดทั้งหมดพอร์ตจาก scripts/validate_palette.js ของสกิล dataviz (Machado 2009 severity 1.0 · ΔE = OKLab × 100)
  tests/chart-palette.test.ts เทียบค่าที่ได้กับตัวต้นฉบับ

```ts
type Mode = 'light' | 'dark';
```

### `SLOTS`

ชนิด: `8`

### `BAND`

ชนิด: `Record<Mode, [number, number]>`

### `CHROMA_FLOOR`

ชนิด: `0.1`

### `CVD_TARGET`

ชนิด: `8`

### `NORMAL_FLOOR`

ชนิด: `15`

### `CONTRAST_MIN`

ชนิด: `3`

### `SURFACE`

พื้นผิวที่กราฟวาดอยู่จริง (ค่า --surface ของ globals.css)

ชนิด: `Record<Mode, string>`

### type `PaletteCheck`

```ts
type PaletteCheck = {
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
```

### type `CiColors`

```ts
type CiColors = { primary: string; secondary?: string; decor?: string };
```


## `@/lib/chart-math`

```ts
import { formatCompact, niceTicks, sliceAt, sparkPath, countUp, percentChange, formatFull } from '@/lib/chart-math';
```

### ฟังก์ชัน `formatCompact`

1,284 / 12.9K / 4.2M — ตามสเปก stat tile

```ts
formatCompact(n: number) => string
```

### ฟังก์ชัน `niceTicks`

ขีดบนแกนตัวเลขที่เป็นเลขกลมๆ (1, 2, 2.5, 5 × 10ⁿ) เริ่มที่ 0 — ปล่อยให้ Recharts เลือกเองจะได้ 350/700/1.1K ที่อ่านยาก
`max` = ค่าสูงสุดที่ต้องรองรับ · คืน ticks สำหรับ <YAxis ticks domain>

```ts
niceTicks(max: number, count?: number) => number[]
```

### ฟังก์ชัน `sliceAt`

หาชิ้นที่อยู่ใต้ตำแหน่งที่กด จากมุม/ระยะเทียบจุดศูนย์กลางวง (ไม่พึ่ง element ของ Recharts ที่ถูกวาดใหม่ตอน hover
จน mousedown/mouseup ตกคนละ element แล้วไม่เกิด click) · มุมเริ่มที่ 12 นาฬิกา วนตามเข็ม เหมือน startAngle={90} endAngle={-270}
คืน index ชิ้น · 'hole' = กดตรงรูกลางวง · null = กดนอกวง

```ts
sliceAt(dx: number, dy: number, radius: number, values: number[]) => number | "hole" | null
```

### ฟังก์ชัน `sparkPath`

เส้นแนวโน้มจิ๋ว (ในการ์ดตัวเลข): จุดข้อมูล → path ของเส้นและพื้นที่ใต้เส้น ในกล่อง w×h
เว้นขอบบน/ล่าง `pad` กันเส้นโดนตัด · ค่าเท่ากันหมด → เส้นตรงกลาง · น้อยกว่า 2 จุด → ว่าง

```ts
sparkPath(values: readonly number[], w: number, h: number, pad?: number) => { line: string; area: string; }
```

### ฟังก์ชัน `countUp`

ค่าระหว่างทางของตัวเลขที่วิ่ง (ease-out cubic: เร็วตอนต้น ช้าลงตอนท้าย) · t = 0..1

```ts
countUp(from: number, to: number, t: number) => number
```

### ฟังก์ชัน `percentChange`

% เปลี่ยนแปลงจากค่าก่อนหน้า (ปัด 1 ตำแหน่ง) · ค่าก่อนหน้าเป็น 0 → null (หารไม่ได้)

```ts
percentChange(prev: number, curr: number) => number | null
```

### ฟังก์ชัน `formatFull`

```ts
formatFull(n: number) => string
```


## `@/lib/calendar`

```ts
import { parseYmd, daysInMonth, addMonths, addDays, monthGrid, outOfRange, clampYmd, todayYmd, formatYmd, YMD, pad2, toYmd, cmpYmd, Cell, MONTHS_FULL, MONTHS_SHORT, WEEKDAYS, displayYear } from '@/lib/calendar';
```

### ฟังก์ชัน `parseYmd`

```ts
parseYmd(s: string | null | undefined) => YMD | null
```

### ฟังก์ชัน `daysInMonth`

```ts
daysInMonth(y: number, m: number) => number
```

### ฟังก์ชัน `addMonths`

```ts
addMonths(y: number, m: number, delta: number) => { y: number; m: number; }
```

### ฟังก์ชัน `addDays`

```ts
addDays(v: YMD, n: number) => YMD
```

### ฟังก์ชัน `monthGrid`

ตารางเดือน 6 แถว × 7 วัน (เริ่มวันอาทิตย์) — คงที่ 42 ช่องเพื่อให้ปฏิทินไม่กระโดดความสูงเวลาเปลี่ยนเดือน

```ts
monthGrid(y: number, m: number) => Cell[]
```

### ฟังก์ชัน `outOfRange`

```ts
outOfRange(v: YMD, min?: YMD | null | undefined, max?: YMD | null | undefined) => boolean
```

### ฟังก์ชัน `clampYmd`

```ts
clampYmd(v: YMD, min?: YMD | null | undefined, max?: YMD | null | undefined) => YMD
```

### ฟังก์ชัน `todayYmd`

```ts
todayYmd(now?: Date) => YMD
```

### ฟังก์ชัน `formatYmd`

```ts
formatYmd(v: YMD, lang: "th" | "en") => string
```

### type `YMD`

ฟังก์ชันปฏิทินล้วน (ไม่แตะ timezone) — ใช้กับ DatePicker · วันที่เป็นสตริง `YYYY-MM-DD` เหมือน <input type="date">

```ts
type YMD = { y: number; m: number; d: number };
```

### ฟังก์ชัน `pad2`

```ts
pad2(n: number) => string
```

### ฟังก์ชัน `toYmd`

```ts
toYmd(v: YMD) => string
```

### ฟังก์ชัน `cmpYmd`

```ts
cmpYmd(a: YMD, b: YMD) => number
```

### type `Cell`

```ts
type Cell = YMD & { inMonth: boolean };
```

### `MONTHS_FULL`

ชนิด: `{ readonly th: readonly ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พ…`

### `MONTHS_SHORT`

ชนิด: `{ readonly th: readonly ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]; readonly en:…`

### `WEEKDAYS`

ชนิด: `{ readonly th: readonly ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]; readonly en: readonly ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]; }`

### ฟังก์ชัน `displayYear`

ปีที่แสดง: ไทย = พ.ศ. (+543) · อังกฤษ = ค.ศ.

```ts
displayYear(y: number, lang: "th" | "en") => number
```


## `@/lib/media`

```ts
import { mediaKind, formatDuration, swipeDirection, MediaKind, stepIndex } from '@/lib/media';
```

### ฟังก์ชัน `mediaKind`

รูปหรือวิดีโอ: ใช้ `type` ที่ระบุมาก่อน (เช่น MIME จากไฟล์ที่อัปโหลด 'video/mp4') ไม่งั้นดูจากนามสกุลใน URL
blob:/data: ที่ไม่มีนามสกุล → ดู MIME ใน data: ถ้ามี ไม่งั้นถือเป็นรูป (ควรส่ง type มาเองสำหรับไฟล์จากเครื่อง)

```ts
mediaKind(src: string, type?: string | undefined) => MediaKind
```

### ฟังก์ชัน `formatDuration`

ความยาวคลิป: 5 → "0:05" · 75 → "1:15" · 3725 → "1:02:05" · ไม่รู้ค่า → ""

```ts
formatDuration(sec: number | null | undefined) => string
```

### ฟังก์ชัน `swipeDirection`

ปัดซ้าย/ขวาพอจะเปลี่ยนรายการไหม (ระยะเกิน 25% ของความกว้าง หรือปัดเร็ว) → 1 ถัดไป · -1 ก่อนหน้า · 0 อยู่ที่เดิม

```ts
swipeDirection(offsetX: number, velocityX: number, width: number) => 0 | 1 | -1
```

### type `MediaKind`

ตรรกะล้วนของ MediaLightbox / MediaGallery (ทดสอบได้)

```ts
type MediaKind = 'image' | 'video';
```

### ฟังก์ชัน `stepIndex`

ตำแหน่งถัดไป/ก่อนหน้าแบบวนรอบ

```ts
stepIndex(i: number, dir: 1 | -1, count: number) => number
```


## `@/lib/tags`

```ts
import { splitTags, addTags, trickle, tagKey, AddResult } from '@/lib/tags';
```

### ฟังก์ชัน `splitTags`

แยกข้อความ (พิมพ์หรือวาง) เป็นแท็ก ตามตัวคั่น (ค่าตั้งต้น: comma, comma ไทย/จีน, ขึ้นบรรทัด, tab, ;) · ตัดช่องว่าง · ทิ้งค่าว่าง

```ts
splitTags(text: string, separators?: readonly string[]) => string[]
```

### ฟังก์ชัน `addTags`

เพิ่มแท็กหลายอันทีเดียว ตามลำดับ
- ซ้ำกับของเดิมหรือซ้ำกันเองในชุดที่วาง → ไม่เพิ่ม · ไม่ผ่าน `validate` → invalid · ยาวเกิน `maxLength` → invalid
- เกิน `max` → overflow (ที่ยังเหลือที่ก็เพิ่มไป)
- `transform` แปลงก่อนเช็ก (เช่น ตัดเครื่องหมาย # หรือเป็นตัวเล็ก)

```ts
addTags(current: readonly string[], incoming: readonly string[], { max, maxLength, validate, transform }?: { max?: number | undefined; maxLength?: number | undefined; validate?: ((t: string) => boolean) | undefined; transform?: ((t: string) => string) | undefined; }) => AddResult
```

### ฟังก์ชัน `trickle`

แถบโหลดด้านบน (แบบ NProgress): ยังไม่รู้ว่าเหลือเท่าไร → ค่อยๆ คืบเข้าหา ~94% ช้าลงเรื่อยๆ ไม่ถึง 100 จนกว่าจะเสร็จจริง
ยิ่งใกล้ยิ่งคืบน้อย (ระยะที่เหลือ × อัตรา) และมีขั้นต่ำกันนิ่งสนิท

```ts
trickle(p: number, rate?: number, ceiling?: number) => number
```

### ฟังก์ชัน `tagKey`

เทียบแท็กซ้ำแบบไม่สนตัวพิมพ์/ช่องว่างหัวท้าย/ช่องว่างซ้อน

```ts
tagKey(s: string) => string
```

### type `AddResult`

```ts
type AddResult = {
  /** รายการใหม่ทั้งหมด */
  tags: string[];
  added: string[];
  /** แท็กเดิมที่ซ้ำ (คืนเป็นค่าที่มีอยู่แล้ว เพื่อให้ UI สั่นชิปตัวนั้น) */
  duplicates: string[];
  invalid: string[];
  /** ตกเพราะเกินจำนวน */
  overflow: string[];
};
```


## `@/lib/file-drop`

```ts
import { matchesAccept, formatBytes, validateFiles, fileKind, FileLike, Rejection } from '@/lib/file-drop';
```

### ฟังก์ชัน `matchesAccept`

เช็กไฟล์กับค่า accept แบบเดียวกับ <input accept>: นามสกุล (.pdf), MIME ตรงตัว (application/pdf), หรือ wildcard (image/*)
ไม่ระบุ accept → รับทุกไฟล์ · ไม่สนตัวพิมพ์

```ts
matchesAccept(file: Pick<FileLike, "type" | "name">, accept?: string | undefined) => boolean
```

### ฟังก์ชัน `formatBytes`

ขนาดไฟล์อ่านง่าย: 0 B · 512 B · 1.5 KB · 12 MB (ฐาน 1024 · ทศนิยมเดียวเมื่อน้อยกว่า 10)

```ts
formatBytes(bytes: number) => string
```

### ฟังก์ชัน `validateFiles`

แยกไฟล์ที่รับได้/ไม่ได้ ตามลำดับที่เลือกมา
- ผิดชนิดหรือใหญ่เกิน → ตกทีละไฟล์ (ไม่ทำให้ไฟล์อื่นตกด้วย)
- เกินจำนวน → รับเท่าที่ยังเหลือที่ว่าง (นับรวมไฟล์ที่มีอยู่แล้ว `existing`) ที่เหลือตก

```ts
validateFiles<T extends FileLike>(files: readonly T[], { accept, maxSize, maxFiles, existing }: { accept?: string | undefined; maxSize?: number | undefined; maxFiles?: number | undefined; existing?: number | undefined; }) => { accepted: T[]; rejected: Rejection[]; }
```

### ฟังก์ชัน `fileKind`

หมวดไฟล์สำหรับเลือกไอคอน

```ts
fileKind(file: Pick<FileLike, "type" | "name">) => "audio" | "video" | "image" | "pdf" | "sheet" | "doc" | "archive" | "other"
```

### type `FileLike`

ตรรกะล้วนของ FileDrop (แยกจาก .tsx เพื่อให้ vitest ทดสอบได้)

```ts
type FileLike = { name: string; size: number; type: string };
```

### type `Rejection`

```ts
type Rejection = { name: string; reason: 'type' | 'size' | 'count' };
```


## `@/lib/placement`

```ts
import { spaceAround, place, originFor, Side, Align, Box, PlaceInput, Placement } from '@/lib/placement';
```

### ฟังก์ชัน `spaceAround`

ที่ว่างระหว่างตัวยึดกับขอบจอแต่ละฝั่ง

```ts
spaceAround(a: Box, vp: { width: number; height: number; }) => Record<Side, number>
```

### ฟังก์ชัน `place`

- ฝั่งที่ขอวางไม่พอ และฝั่งตรงข้ามมีที่มากกว่า → พลิก (ไม่พลิกถ้าฝั่งตรงข้ามก็ไม่พอและแคบกว่า)
- แกนขวาง: จัดชิด start/center/end ตามที่ขอ แล้วเลื่อนให้อยู่ในจอ (เว้น padding) · กล่องใหญ่กว่าจอ → ชิดขอบเริ่ม

```ts
place({ anchor: a, floating: f, viewport: vp, side, align, offset, padding, arrowPadding, minSize }: PlaceInput) => Placement
```

### ฟังก์ชัน `originFor`

จุดตั้งต้นของอนิเมชันขยาย (transform-origin) ให้กล่องดูงอกออกมาจากตัวยึด

```ts
originFor(p: Placement) => string
```

### type `Side`

คำนวณตำแหน่งกล่องลอย (popover/tooltip/เมนู) รอบตัวยึด — ฟังก์ชันล้วน แยกจาก .tsx เพื่อให้ vitest ทดสอบได้

```ts
type Side = 'top' | 'bottom' | 'left' | 'right';
```

### type `Align`

```ts
type Align = 'start' | 'center' | 'end';
```

### type `Box`

```ts
type Box = { top: number; left: number; width: number; height: number };
```

### type `PlaceInput`

```ts
type PlaceInput = {
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
  /**
   * ความสูง/กว้างขั้นต่ำที่ "พอใช้" ในการตัดสินใจพลิก (สำหรับรายการที่หดได้ด้วย maxHeight)
   * เช่น 220 = ถ้าด้านล่างเหลือ ≥ 220 ก็ไม่พลิก แม้รายการเต็มจะสูงกว่านั้น (ให้หดแล้วเลื่อนในตัวเอง)
   */
  minSize?: number;
};
```

### type `Placement`

```ts
type Placement = {
  top: number;
  left: number;
  /** ฝั่งที่ใช้จริง (อาจพลิกจากที่ขอ) */
  side: Side;
  /** ตำแหน่งลูกศรตามแกนขวาง นับจากขอบซ้าย/บนของกล่องลอย (ชี้กลางตัวยึดเสมอ แม้กล่องถูกเลื่อนหนีขอบจอ) */
  arrow: number;
  /** ที่ว่างตามแกนหลักฝั่งที่วางจริง (หักระยะห่าง/กันขอบแล้ว) — ใช้ตั้ง maxHeight ให้รายการหดพอดีจอ */
  available: number;
};
```

