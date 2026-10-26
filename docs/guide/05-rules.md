# 05 · กฎและกับดัก (อ่านก่อนเขียนโค้ด)

ทุกข้อในไฟล์นี้มาจากบั๊กที่เคยเกิดจริงในคลังนี้ · ข้อที่เป็น **ห้าม** ทำผิดแล้วจะพังแบบเห็นได้ชัดหรือพังเงียบๆ บางเครื่อง

## สารบัญ
- [สี และโหมดมืด](#สี-และโหมดมืด)
- [Tailwind opacity](#tailwind-opacity)
- [Field](#field)
- [Server / Client component](#server--client-component)
- [Hydration](#hydration)
- [ข้อความ ภาษา i18n](#ข้อความ-ภาษา-i18n)
- [การเข้าถึง (a11y)](#การเข้าถึง-a11y)
- [การเคลื่อนไหว](#การเคลื่อนไหว)
- [ปุ่มลัด](#ปุ่มลัด)
- [ฟอร์มและข้อมูล](#ฟอร์มและข้อมูล)
- [มือถือ / responsive](#มือถือ--responsive)
- [เพิ่มคอมโพเนนต์ใหม่เข้าคลัง](#เพิ่มคอมโพเนนต์ใหม่เข้าคลัง)

---

## สี และโหมดมืด

**ห้ามใส่สีตรงๆ** (`bg-[#0057B8]`, `text-red-500`, `bg-white`, `text-black`, `border-gray-200`) — ใช้ token เท่านั้น สีแบรนด์เปลี่ยนตามโปรเจกต์ และโหมดมืดเปลี่ยนค่า token ให้เอง

| ใช้กับ | token (คลาส Tailwind) |
|---|---|
| พื้นหลังหน้า | `bg-paper` |
| พื้นการ์ด/ช่องกรอก/เมนู (แทน `bg-white`) | `bg-surface` |
| ตัวหนังสือหลัก / รอง / จาง | `text-ink` / `text-ink-soft` / `text-ink-mute` |
| เส้นขอบ/เส้นคั่น/พื้นจางๆ | `border-ink/10`, `divide-ink/[0.06]`, `bg-ink/[0.05]` |
| ปุ่ม/แถบที่มีตัวหนังสือขาวทับ | `bg-brand-600` (hover `bg-brand-700`) |
| ไอคอน เส้น แถบความคืบหน้า ของตกแต่ง | `brand-500` (ตัวหนังสือเล็กสีขาวบน 500 อ่านไม่ผ่าน) |
| **ตัวหนังสือ/ลิงก์สีแบรนด์** | `text-brand-link` (ไม่ใช่ `text-brand-600` — โหมดมืดต้องสว่างขึ้น) |
| พื้นอ่อนสีแบรนด์ | `bg-brand-50`, `bg-brand-100` |
| สถานะ สำเร็จ / เตือน / ผิดพลาด | `ok-*` / `warn-*` / `danger-*` (พื้น `-50` + ตัวหนังสือ `-700`) |
| สีตกแต่งรอง (ภาพประกอบเท่านั้น ไม่ใช่ข้อความ) | `accent`, `accent-2` |
| สีกราฟ/สีประจำหมวด | `bg-[rgb(var(--chart-1))]` … `--chart-8` |
| เงา | `shadow-card`, `shadow-lift`, `shadow-glow` (โฟกัส), `shadow-glow-danger` |
| มุมมน | `rounded-card` (18px), `rounded-pill` |
| ฟอนต์หัวข้อ | `font-display` (Kanit) · เนื้อหาใช้ค่าตั้งต้น (Anuphan) |

- **ห้ามใช้ `dark:` ของ Tailwind** — โหมดมืดทำงานด้วย `data-theme="dark"` เปลี่ยนค่าตัวแปร token ใช้ token แล้วได้โหมดมืดฟรี
- สีที่ต้องการค่า alpha ใน arbitrary value: `bg-[rgb(var(--brand-600)/0.15)]`, `shadow-[0_10px_30px_-10px_rgb(var(--brand-600)/0.8)]`
- สีแบรนด์ของบริการภายนอก (LINE `#06C755`, Facebook) ใส่ hex ได้ — เป็นข้อยกเว้นเดียว
- สถานะ "ร่าง/รอ" ใช้ `warn` (อำพัน) ไม่ใช่สีแบรนด์ — แบรนด์อาจเป็นแดงแล้วดูเหมือน error
- ตั้งสีแบรนด์ของโปรเจกต์ที่ [02-setup ข้อ 4](./02-setup.md#4-สีแบรนด์-ci-ของโปรเจกต์) ที่เดียว ห้ามไล่แก้สีในคอมโพเนนต์

## Tailwind opacity

สเกล opacity ของ Tailwind มีแค่ `0 5 10 15 20 25 30 … 95 100` (+ `8` ที่คลังเพิ่มไว้) — **`/12`, `/7`, `/3`, `/6` ไม่มี** คลาสจะไม่ถูกสร้างและ **ไม่มี error** (สีหายเงียบๆ)

```tsx-snippet
<div className="bg-ink/12" />      // ✗ ไม่มีคลาสนี้ — ไม่มีพื้นเลย
<div className="bg-ink/10" />      // ✓
<div className="bg-ink/[0.06]" />  // ✓ ค่าอื่นใช้ arbitrary value
```

## Field

`Field` เป็น `<label>` โดยค่าตั้งต้น → **ช่องที่ข้างในมีปุ่มหรือหลาย element ต้องใส่ `as="div"`**: `Combobox` `Select` `DatePicker` `DateRangePicker` `NumberInput` `TagInput` `RadioGroup` `PasswordInput` `Slider` `FileDrop` `ImagePicker` ช่อง+ปุ่ม
ถ้าลืม: คลิกที่ป้าย/ที่ว่างในช่อง → เบราว์เซอร์ส่งคลิกไปที่ปุ่มแรกข้างใน (เช่น ปุ่ม × ล้างค่า หรือปุ่ม − ของ NumberInput)

- `Checkbox` / `Switch` / `Radio` มี `<label>` ของตัวเองอยู่แล้ว → **ห้ามห่อด้วย `Field` แบบ label** (label ซ้อน label) ถ้าต้องมีหัวข้อกลุ่มใช้ `Field as="div"`
- ช่องที่ไม่มีป้ายให้เห็น ต้องมี `aria-label`

## Server / Client component

- คอมโพเนนต์เกือบทั้งหมดเป็น client (`'use client'` อยู่ในไฟล์แล้ว) → **ไฟล์ที่ใช้ state/event handler/hook ต้องขึ้นต้นด้วย `'use client'`**
- ส่ง function เป็น props (`onClick`, `render`, `format`) จาก server component ไม่ได้ → ห่อส่วนนั้นเป็น client component
- `page.tsx` ควรเป็น server component (ใส่ `metadata`, ดึงข้อมูล) แล้ว render client component ที่ทำ UI
- `useSearchParams()` ใน client component → ห่อด้วย `<Suspense>` ใน page (ไม่งั้น build พัง)
- `toast`/`confirmDialog` เรียกได้จาก client เท่านั้น
- ใช้ได้ใน server: `Card`, `Chip`, `Field`/`Input` (ไม่มี handler), `getT()`, `getLang()`

## Hydration

ค่าที่ render ต้องเหมือนกันทั้ง server และ client:
- **ห้าม `Math.random()`, `Date.now()`, `new Date()` (เวลาปัจจุบัน) ตอน render** — ข้อมูลจำลองให้คำนวณจาก index แบบกำหนดค่าแน่นอน (ดู `SALES` ใน `DemoHome.tsx`) · เวลาสัมพัทธ์ ("5 นาทีที่แล้ว") คำนวณใน `useEffect` หรือยอมรับ `suppressHydrationWarning` ที่ element นั้น
- `localStorage`/`window` อ่านใน `useEffect` เท่านั้น
- `toLocaleString()` ไม่ระบุ locale ให้ผลต่างกันระหว่าง server/client → ระบุ `'th-TH'` หรือใช้ `formatNumber`/`formatDate`

## ข้อความ ภาษา i18n

- ข้อความบนหน้าจอเป็น **ภาษาไทยสุภาพ สั้น** · ปุ่มเป็นกริยา ("บันทึก", "ลบสินค้า") · ข้อความผิดบอกวิธีแก้
- ข้อความภายในคอมโพเนนต์ (เช่น "ไม่มีตัวเลือก", ป้ายสถานะ) มาจาก `src/lib/i18n/dict.th.ts` / `dict.en.ts` — **ห้ามลบ key** · เพิ่ม key ต้องเพิ่มทั้งสองไฟล์
- โปรเจกต์สองภาษา: client `const t = useT()` · server `const t = await getT()` · ภาษาปัจจุบัน `useLang().lang`
- ตัวเลข/เงิน/วันที่: `formatNumber`, `formatDate` (`@/lib/utils`) · ปีไทย พ.ศ. ใน DatePicker/CalendarHeatmap ทำให้เอง แต่ **ค่าที่เก็บ/ส่ง API เป็น ค.ศ. ISO เสมอ**
- หัวข้อใหญ่ภาษาไทยไม่มีเว้นวรรค → เบราว์เซอร์ตัดกลางคำ: แบ่งบรรทัดเอง (`Hero title` เป็นอาร์เรย์)

## การเข้าถึง (a11y)

ของในคลังทำครบแล้ว — สิ่งที่ผู้ใช้คลังต้องทำเอง:
- ปุ่มไอคอนอย่างเดียว → `aria-label` (Tooltip ไม่แทน aria-label)
- รูป → `alt` (ตกแต่งล้วน `alt=""`)
- ห้ามบอกสถานะด้วยสีอย่างเดียว → มีข้อความ/ไอคอนด้วย (`StatusBadge`, `FieldMessage` ทำแล้ว)
- ห้ามซ้อน `<button>` ใน `<a>`/`<Link>` หรือกลับกัน → ลิงก์ที่หน้าตาเป็นปุ่มใช้ `<Link className=…>`
- หัวข้อเรียงระดับ h1 → h2 → h3 ไม่ข้าม (`AdminPageHeader` เป็น h1 · `Accordion headingLevel`)
- อย่าเอา `outline-none` ออกโดยไม่มี `focus-visible:ring-*` แทน
- ข้อมูลสำคัญห้ามอยู่ใน `Tooltip` อย่างเดียว (จอสัมผัสไม่แสดง)

## การเคลื่อนไหว

- คอมโพเนนต์ในคลังเคารพ "ลดการเคลื่อนไหว" ของระบบแล้ว · อนิเมชันที่ทำเองด้วย framer-motion ต้องเช็ก `useReducedMotion()` · CSS ต้องอยู่ใน `@media (prefers-reduced-motion: no-preference)` หรือมีทางปิด
- ตอบสนองตอนผิดใช้ `shake(el)` · ตอนเพิ่ม/สำเร็จใช้ `pop(el)` (`@/lib/motion-fx`) — อย่าเขียน keyframes ใหม่
- framer-motion `useMotionValue`: ตอนย้ายตำแหน่งแบบกระโดด (วนกลับ, รีเซ็ต) ใช้ **`x.jump(v)`** ไม่ใช่ `x.set(v)` — `set` เก็บความเร็วไว้ แอนิเมชันถัดไปจะพุ่ง/กรอย้อน (บั๊กเดิมของ Carousel)
- อย่าทำอนิเมชันที่ทำให้เลย์เอาต์กระโดด (ความสูงเปลี่ยนทันที) → ใช้ `Collapse` หรือ `motion.div layout`

## ปุ่มลัด

- เขียนแบบ `'mod+K'` เสมอ — `mod` = ⌘ (Mac) / Ctrl (Windows/Linux)
- แสดงผล: `<Kbd keys="mod+K" />`, `useShortcutLabel('mod+S')`, `shortcut: 'mod+D'` ใน DropdownMenu/CommandPalette (แสดงอย่างเดียว)
- ผูกคีย์: `useShortcut('s', fn)` · ⌘K: `useCommandHotkey(fn)` · ฟังเอง: `isModEvent(e, detectMac())` จาก `@/lib/platform`
- ห้าม `e.ctrlKey || e.metaKey` (Mac: Ctrl+K = ลบท้ายบรรทัด · Windows: ปุ่ม Win ไม่ใช่ mod) · ห้ามเขียน "Ctrl+K" ตายตัวในข้อความ

## ฟอร์มและข้อมูล

- **ตัวกรอง/การค้นหา/หน้าปัจจุบันของรายการ เก็บใน URL** (`useSearchParams` + `router.replace(…, { scroll: false })`) · เปลี่ยนตัวกรอง → ลบ `page`
- โหลดข้อมูลใน `useEffect` ต้องกันผลของคำขอเก่าทับคำขอใหม่ (`let live = true … return () => { live = false }`)
- `Toolbar onSearch` ต้องเป็นฟังก์ชันคงที่ (`setState` / `useCallback`)
- `DataTable` ต้องการ `id: number` ทุกแถว
- `NumberInput` คืน `null` เมื่อว่าง · `DatePicker` คืน `''` เมื่อว่าง · `Combobox` คืน `null`
- ตรวจฟอร์มฝั่ง client เพื่อประสบการณ์ แต่ server ต้องตรวจซ้ำเสมอ
- ก่อนลบ/ทิ้งการแก้ไข → `confirmDialog` · หลังลบที่กู้ได้ → `toast` พร้อม action "เลิกทำ"
- มีการแก้ไขค้าง → เตือน `beforeunload` ([สูตรฟอร์ม](./04-page-recipes.md#4-ฟอร์มเพิ่มแก้ไข))
- ฟังก์ชันตรรกะล้วน (ตรวจฟอร์ม คำนวณ แปลงข้อมูล) แยกไว้ในไฟล์ `.ts` (ไม่มี JSX) เพื่อเขียน vitest ได้ — ดู `src/app/demo/_lib/products.ts` + `tests/demo-products.test.ts`

## มือถือ / responsive

- ทดสอบที่ 375px ทุกหน้า: **ห้ามมี scroll แนวนอน** (ยกเว้นในตาราง/Carousel ที่ตั้งใจ)
- แถวที่มีหลายชิ้น (หัวหน้า, ชิป, ปุ่ม) ใส่ `flex-wrap` · ข้อความยาวที่ไม่มีเว้นวรรค (อีเมล URL JSON) ใส่ `break-all` หรือ `truncate` + `min-w-0`
- `flex` ที่ลูกมี `truncate` ต้องใส่ `min-w-0` ที่ลูกนั้น ไม่งั้นไม่ตัด
- Dialog → bottom sheet, AppShell sidebar → drawer, Breadcrumb ย่อ, Stepper ย่อ ทำเองแล้ว — ไม่ต้องทำเวอร์ชันมือถือแยก
- พื้นที่กดขั้นต่ำ ~40px (`size-10`) สำหรับปุ่มไอคอน
- เต็มความสูงจอใช้ `min-h-dvh` (ไม่ใช่ `min-h-screen` ที่โดนแถบเบราว์เซอร์มือถือบัง)

## เพิ่มคอมโพเนนต์ใหม่เข้าคลัง

เมื่อคลังไม่มีจริงๆ (ตรวจ [03-requirement-map](./03-requirement-map.md) แล้ว):
1. วางที่ `src/components/<ชื่อ>.tsx` (บล็อกหน้าบ้าน `src/components/blocks/`) · `'use client'` ถ้ามี state
2. ใช้ของกลาง: `Field`, `useFloating`/`Popover`/`Floating` (กล่องลอย — มี `data-floating`), `useModal`/`Dialog`/`Drawer`, `cn`, `shake`/`pop`, token สี
   - กล่องลอยถูกซ่อน (`visibility: hidden`) จนกว่า `pos` จะมีค่า → **ย้ายโฟกัสเข้ากล่องได้หลัง `pos != null` เท่านั้น** (focus ใส่ element ที่ซ่อนอยู่ไม่ติดและไม่มี error · เคยทำให้ลูกศรใน DatePicker ไม่ทำงานและ Esc ปิด dialog ที่ครอบ)
   - input จริงที่โปร่งใสคลุมทั้งกล่อง + ชั้นตกแต่งวาดทับ → ชั้นตกแต่งต้อง `pointer-events-none` (ชั้นที่มี transform จะขึ้นมาอยู่เหนือ input และรับคลิกแทน · เคยเกิดใน Checkbox/Radio)
3. **JSDoc ที่ตัว export และทุก prop** (ภาษาไทย บอกพฤติกรรม/คีย์บอร์ด/ข้อควรระวัง) — `docs/api` สร้างจากตรงนี้
4. ตรรกะล้วนแยกเป็น `src/lib/<ชื่อ>.ts` + test ใน `tests/`
5. รองรับ: คีย์บอร์ด · screen reader (role/aria) · โหมดมืด (token) · ลดการเคลื่อนไหว · จอ 375px
6. เพิ่มตัวอย่างใน `src/app/Gallery.tsx`
7. ถ้าเป็นไฟล์ใหม่ เพิ่มชื่อไฟล์ในกลุ่มที่เหมาะใน `scripts/gen-api-docs.mjs` (ตัวแปร `GROUPS`) → `npm run docs:api` · เพิ่มแถวใน `03-requirement-map.md`
8. `npm run typecheck && npm test && npm run docs:check && npm run build`
