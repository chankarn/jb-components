# 03 · แปล requirement เป็นคอมโพเนนต์

วิธีใช้: หาคำใน requirement (ซ้ายมือ) → ใช้คอมโพเนนต์ขวามือ · props ครบดูที่ [docs/api](../api/README.md) · วิธีใช้ละเอียดดู [components/](./components/)
คอลัมน์ "import" ย่อ `@/components/` เป็น `c/` (เวลาเขียนโค้ดจริงใช้ `@/components/...` เต็ม)

> ถ้า requirement ตรงกับแถวไหน **ห้ามเขียนคอมโพเนนต์นั้นใหม่เอง** — ดูรายการ "ห้ามทำเอง" ท้ายไฟล์

---

## 1. โครงเว็บ / layout

| requirement พูดว่า… | ใช้ | import | หมายเหตุ |
|---|---|---|---|
| หลังบ้าน, admin, backoffice, ระบบจัดการ, มี sidebar/เมนูซ้าย | `AppShell` | `c/AppShell` | sidebar พับได้ · จอแคบเป็น drawer · topbar · เมนูผู้ใช้ · สลับธีม ครบในตัว |
| ค้นหาทั้งระบบ, quick search, คีย์ลัดค้นหา, ⌘K, Ctrl+K, "ไปหน้าไหนก็ได้เร็วๆ" | `CommandPalette` + `useCommandHotkey` | `c/CommandPalette` | ผูกกับ `AppShell onCommand` → ปุ่มค้นหาใน topbar ([สูตร](./04-page-recipes.md#2-โครงหลังบ้าน-appshell--k)) |
| การแจ้งเตือน (กระดิ่ง) ใน topbar | `DropdownMenu` ใส่ใน `AppShell actions` | `c/DropdownMenu` | ดู `src/app/demo/(app)/DemoShell.tsx` |
| หัวหน้าแต่ละหน้า (ชื่อหน้า + ปุ่มด้านขวา + breadcrumb + ตัวเลขสรุป) | `AdminPageHeader` | `c/admin/kit` | `stats` = ชิปตัวเลข · `breadcrumb` ใส่ `<Breadcrumb>` |
| เว็บหน้าบ้าน, landing, marketing, หน้าแรกบริษัท, หน้าขายของ/แอป | บล็อกใน `c/blocks` | `c/blocks` | `SiteNav` → `Hero` → … → `SiteFooter` ([สูตร](./04-page-recipes.md#9-landing-page)) |
| เมนูบนเว็บหน้าบ้าน, navbar, เมนูลิงก์ไป section | `SiteNav` | `c/blocks` | โปร่งใส→เบลอตอนเลื่อน · scrollspy · มือถือเป็น ☰ |
| ท้ายเว็บ, footer, สมัครรับข่าว | `SiteFooter` | `c/blocks` | `onSubscribe` คืน Promise ตรวจอีเมลให้ |
| สลับธีมมืด/สว่าง | `ThemeToggle` (มีใน AppShell/SiteFooter แล้ว) · `useTheme` | `c/ThemeProvider` | ต้องมี `ThemeProvider` ที่ root ([02-setup](./02-setup.md)) |
| สลับภาษา TH/EN | `PillSwitch` + cookie `lang` | `c/PillSwitch` | ตัวอย่าง `LangSwitch` ใน [02-setup](./02-setup.md#5-ภาษา-i18n) |
| ข้ามไปเนื้อหา / skip link | มีใน `AppShell` แล้ว | — | หน้าบ้านใส่ `<a href="#main">` เอง |

## 2. การนำทางในหน้า

| requirement | ใช้ | import | หมายเหตุ |
|---|---|---|---|
| แท็บ, แบ่งหมวด/สถานะในหน้าเดียว, แท็บมีตัวเลข | `Tabs` | `c/Tabs` | `items[].count` · controlled เท่านั้น |
| สลับมุมมอง (ตาราง/การ์ด), ช่วงเวลา (วัน/สัปดาห์/เดือน), ปุ่มกลุ่มเลือกได้ทีละอัน 2–5 ตัว | `SegmentedControl` | `c/SegmentedControl` | ตัวเลือกเยอะกว่า 5 → `Select` |
| เปิด/ปิดสองสถานะแบบแคปซูล (TH/EN, ☀/☾) | `PillSwitch` | `c/PillSwitch` | ค่าเปิด/ปิดทั่วไปใช้ `Switch` |
| breadcrumb, เส้นทาง "หน้าแรก › สินค้า › แก้ไข" | `Breadcrumb` | `c/Breadcrumb` | ยาวเกินยุบเป็น … · มือถือย่อเอง |
| ขั้นตอน 1→2→3, สมัครหลายขั้น, checkout, สถานะคำสั่งซื้อ/การจัดส่ง | `Stepper` | `c/Stepper` | แสดงผลอย่างเดียว — คุมฟอร์มแต่ละขั้นเอง ([สูตร](./04-page-recipes.md#6-ฟอร์มหลายขั้น-stepper)) |
| แบ่งหน้า, pagination, เลือกจำนวนแถวต่อหน้า | `Pagination` | `c/admin/kit` | หรือ `DataTable paginate={10}` ถ้าข้อมูลอยู่ฝั่ง client ทั้งหมด |
| FAQ, คำถามที่พบบ่อย, หัวข้อพับ/กาง | `Accordion` (หน้าบ้านใช้ `FaqSection`) | `c/Accordion` | `type="single"`/`"multiple"` |
| ซ่อน/แสดงส่วนหนึ่งแบบยืดหด ("ตัวเลือกขั้นสูง", "ดูเพิ่มเติม") | `Collapse` | `c/Accordion` | เนื้อหายังอยู่ใน DOM (inert ตอนปิด) |
| การ์ดหัวข้อพับได้ในหน้าตั้งค่า | `SectionCard collapsible` | `c/admin/kit` | |

## 3. ฟอร์มและการกรอกข้อมูล

ทุกช่องห่อด้วย `Field` (ป้าย + hint + error + สั่นตอนผิด) — **ช่องที่ไม่ใช่ `<input>` เดี่ยว ต้องใส่ `as="div"`** ([05-rules](./05-rules.md#field))

| requirement | ใช้ | import | หมายเหตุ |
|---|---|---|---|
| ช่องข้อความบรรทัดเดียว (ชื่อ อีเมล เบอร์ ค้นหา) | `Input` ใน `Field` | `c/ui` | |
| ข้อความหลายบรรทัด (คำอธิบาย หมายเหตุ) | `Textarea` | `c/ui` | ตัวนับตัวอักษรใส่ใน `Field hint` |
| รหัสผ่าน (มีปุ่มแสดง/ซ่อน) | `PasswordInput` | `c/admin/PasswordFields` | `Field as="div"` |
| ตั้งรหัสผ่านใหม่ + เงื่อนไขติ๊กเขียว | `PasswordInput` ×2 + `PasswordRules` | `c/admin/PasswordFields` | ≥10 ตัว ตัวอักษร+ตัวเลข |
| OTP, รหัสยืนยัน 4–6 หลัก | `OtpInput` | `c/OtpInput` | `invalid` → สั่น · `onComplete` |
| ตัวเลข, จำนวน, ราคา, เงิน (มี comma, +/−) | `NumberInput` | `c/NumberInput` | `precision={2} prefix="฿"` · ค่าว่าง = `null` |
| เลือก 1 จากรายการสั้น (≤ ~10, ไม่ต้องค้น) | `Select` | `c/Select` | API เหมือน `<select>`: `onChange={(e) => e.target.value}` |
| เลือก 1 จากรายการยาว / ต้องพิมพ์ค้น (จังหวัด ลูกค้า สินค้า) | `Combobox` | `c/Combobox` | `value: string \| null` |
| เลือกหลายอัน + ค้นหา (ผู้รับผิดชอบหลายคน หมวดหลายหมวด) | `Combobox multiple` | `c/Combobox` | `value: string[]` · `maxSelected` |
| เลือกได้หรือ "พิมพ์เพิ่มใหม่" ถ้าไม่มีในรายการ | `Combobox onCreate` | `c/Combobox` | ต้องเพิ่ม option เองใน `onCreate` |
| แท็ก, คีย์เวิร์ด, อีเมลหลายรายการ, พิมพ์แล้วกด Enter เป็นชิป | `TagInput` | `c/TagInput` | `validate` + `invalidText` · `max` · `variant="colorful"` |
| เลือก 1 จาก 2–5 ตัวเลือกที่ต้องเห็นทั้งหมด (เพศ ประเภท) | `RadioGroup` | `c/Choice` | `orientation="horizontal"` |
| เลือกแพ็กเกจ, วิธีจัดส่ง, วิธีชำระเงิน (การ์ดมีคำอธิบาย/ไอคอน) | `RadioGroup variant="card"` | `c/Choice` | `options[].description/icon` |
| ติ๊กยอมรับเงื่อนไข, เลือกหลายข้อ, "เลือกทั้งหมด" | `Checkbox` | `c/Choice` | `indeterminate` สำหรับเลือกบางส่วน |
| เปิด/ปิดที่มีผลทันที (ตั้งค่าแจ้งเตือน เปิดใช้งาน) | `Switch` | `c/Choice` | ต้องกดบันทึกก่อนมีผล → ใช้ `Checkbox` · แถวตั้งค่า `placement="start" className="w-full"` |
| เลื่อนเลือกค่า (ระดับเสียง เกณฑ์ %) | `Slider` | `c/Slider` | `onCommit` ยิง API ครั้งเดียวตอนปล่อย |
| ช่วงราคา, ช่วงอายุ (min–max) | `Slider range` | `c/Slider` | `value: [number, number]` · `minGap` |
| วันที่ (วันเกิด วันนัด กำหนดส่ง) | `DatePicker` | `c/DatePicker` | ค่าเป็นสตริง `YYYY-MM-DD` · ไทยแสดง พ.ศ. |
| วันที่ + เวลา | `DatePicker withTime` | `c/DatePicker` | `YYYY-MM-DDTHH:mm` |
| ช่วงวันที่ (จาก–ถึง), ตัวกรองรายงาน, "7 วันล่าสุด" | `DateRangePicker` | `c/DateRangePicker` | `{from, to}` · มีค่าสำเร็จรูป · `maxDays` |
| อัปโหลดไฟล์, ลากไฟล์มาวาง, หลายไฟล์, แถบความคืบหน้า | `FileDrop` | `c/FileDrop` | ต้องเขียน `upload: UploadFn` ผูกกับ backend |
| รูปโปรไฟล์/รูปปก 1 รูป (แสดงตัวอย่าง เปลี่ยน/ลบ) | `ImagePicker` | `c/admin/ImagePicker` | `upload` + `resolveUrl` |
| คำอธิบายช่องแบบยาว (ไอคอน ?) | `Field help="…"` หรือ `HelpTip` | `c/ui` / `c/HelpTip` | ข้อจำกัดสั้นๆ ใช้ `hint` |
| ปุ่มบันทึกที่มีสถานะ กำลังบันทึก/สำเร็จ/ผิดพลาด | `LoadingButton` | `c/Loading` | `status` คุมจากภายนอก |
| บันทึกด้วย ⌘S / Ctrl+S | `useShortcut('s', save)` + `<Kbd keys="mod+S">` | `c/Kbd` | ใช้ได้ทั้ง Mac/Windows |
| ฟอร์มยาวแบ่งเป็นกลุ่ม | `SectionCard` ×N | `c/admin/kit` | ดู [สูตรฟอร์ม](./04-page-recipes.md#4-ฟอร์มเพิ่มแก้ไข) |
| ช่องผิดแล้วสั่น / ช่องกรอกทำเองแล้วอยากให้สั่น | `Field error` (สั่นเอง) · `shake(el)` | `@/lib/motion-fx` | |

## 4. แสดงข้อมูล

| requirement | ใช้ | import | หมายเหตุ |
|---|---|---|---|
| ตารางรายการ (ค้นหา กรอง แบ่งหน้า คลิกแถว) | `DataTable` + `Toolbar` + `FilterSelect` + `Pagination` | `c/admin/kit` | [สูตรหน้ารายการ](./04-page-recipes.md#3-หน้ารายการ-ค้นหา--กรอง--ตาราง) |
| ตารางอิสระ (ต้องคุม markup เอง เช่น รวมแถว มี footer) | `Table`, `TableRow`, `TableCell`… | `c/Table` | ตาราง HTML ที่จัดสไตล์แล้ว |
| เมนู "…" ท้ายแถว (แก้ไข ทำสำเนา ลบ) | `RowMenu` | `c/admin/RowMenu` | คลิกเมนูไม่ลามเป็นคลิกแถว |
| ป้ายสถานะ (active/draft/overdue…) | `StatusBadge` | `c/StatusBadge` | สถานะที่รู้จัก: passed completed published active resolved sent · in_progress queued open draft · not_started archived closed skipped · overdue failed suspended (คำแปลอยู่ใน dict `badge.*`) |
| ป้ายข้อความสั้น/หมวด | `Chip` | `c/ui` | `tone`: brand dark mute done |
| รูปย่อ/ตัวอักษรแรกของผู้ใช้ | `Avatar` | `c/Avatar` | `seed` = id ผู้ใช้ (สีคงเดิม) |
| ตัวเลขสรุปบนแดชบอร์ด (KPI) แบบหลังบ้าน | `StatCard` | `c/admin/kit` | `delta` · `trend` · `format` · กดได้ |
| KPI แบบรายงาน/dataviz (มีหน่วย เทียบช่วง ดี/แย่) | `KpiCard` | `c/charts` | `goodWhen="down"` เมื่อลด = ดี |
| ตัวเลขวิ่งขึ้น | `AnimatedNumber` | `c/AnimatedNumber` | |
| ความคืบหน้า % (แถบ) | `Progress` | `c/ui` | |
| ความคืบหน้า % (วงแหวน) | `ProgressRing` | `c/ProgressRing` | ครบ 100% เป็นสีเขียว |
| ไม่มีข้อมูล, ค้นไม่เจอ, ยังไม่มีรายการ | `EmptyState` | `c/EmptyState` | `card` เมื่ออยู่โดดๆ · `size="sm"` ในกล่องเล็ก |
| กล่องหมายเหตุ/คำเตือน/เคล็ดลับในหน้า | `InfoNote` | `c/admin/kit` | `tone`: info tip success warn danger |
| การ์ดทั่วไป | `Card` | `c/ui` | |

## 5. กราฟ / แดชบอร์ด

กราฟทุกตัววางใน `ChartCard` (หัวข้อ + ปุ่มสลับเป็นตาราง + loading/empty) · import จาก `@/components/charts`

| requirement | ใช้ | หมายเหตุ |
|---|---|---|
| แนวโน้มตามเวลา, ยอดขายรายวัน/เดือน, เทียบหลายเส้น | `TrendChart` | 1 ซีรีส์ `variant="area"` · หลายซีรีส์ `"line"` · `target` เส้นเป้า |
| เทียบหมวดหมู่, ยอดต่อสาขา, ต่อสินค้า | `BarsChart` | ชื่อยาว/หมวดเยอะ → `orientation="bar"` · `stacked` · `highlight` |
| สัดส่วนของทั้งหมด (≤ 6 ชิ้น) | `DonutChart` | เกินรวมเป็น "อื่นๆ" เอง · ค่าใกล้กันใช้ `BarsChart` |
| อันดับ Top 5/10 (สินค้าขายดี) | `RankList` | อ่านง่ายกว่าแท่งนอนเมื่อชื่อยาว |
| ความหนาแน่น วัน×ชั่วโมง | `Heatmap` | |
| กิจกรรมรายวันทั้งปี (แบบ GitHub) | `CalendarHeatmap` + `calendarTable` | |
| เส้นแนวโน้มจิ๋วในการ์ด | `Sparkline` (หรือ `StatCard trend` / `KpiCard trend`) | |
| ตัวกรองช่วงเวลาของแดชบอร์ด | `SegmentedControl` (7/30/90 วัน) หรือ `DateRangePicker` | วางใน `AdminPageHeader actions` |
| ห้าม | กราฟสองแกน y · สีรุ้ง · เกิน 8 ซีรีส์ | ดู [components/charts.md](./components/charts.md) |

## 6. หน้าต่างลอย / การแจ้งผล

| requirement | ใช้ | import | หมายเหตุ |
|---|---|---|---|
| แจ้งผลสั้นๆ "บันทึกแล้ว", "ลบไม่สำเร็จ" | `toast.success/error/info/warning` | `c/feedback` | ต้องมี `<FeedbackHost/>` ที่ root |
| แจ้งผลพร้อมปุ่ม "เลิกทำ" / "ลองใหม่" | `toast.success(msg, { action: { label, onClick } })` | `c/feedback` | |
| แสดง กำลังทำ… → สำเร็จ/ไม่สำเร็จ ในกล่องเดียว | `toast.promise(promise, {loading, success, error})` | `c/feedback` | |
| ยืนยันก่อนลบ / ก่อนออก "แน่ใจไหม?" | `await confirmDialog(msg, { danger: true })` | `c/feedback` | คืน `Promise<boolean>` · ไม่ต้องสร้าง Dialog เอง |
| ฟอร์มสั้นในหน้าต่าง (เชิญสมาชิก เปลี่ยนชื่อ) | `Dialog` | `c/Overlay` | มือถือเป็น bottom sheet เอง |
| กล่องยืนยันที่มีเนื้อหาพิเศษ (ไอคอน ข้อความยาว ช่องกรอกยืนยัน) | `Dialog variant="alert" tone="danger"` | `c/Overlay` | กรณีปกติใช้ `confirmDialog` |
| แผงรายละเอียดด้านข้าง, ฟอร์มยาว, ตัวกรองบนมือถือ | `Drawer` | `c/Overlay` | `side="right"`/`left`/`bottom` |
| กล่องลอยเล็กจากปุ่ม (ตัวกรองด่วน การ์ดโปรไฟล์ ฟอร์มสั้น) | `Popover` | `c/Popover` | `children` เป็นฟังก์ชันรับ `close` ได้ |
| เมนูคำสั่งจากปุ่ม (ส่งออก, ผู้ใช้, เลือกคอลัมน์ที่แสดง) | `DropdownMenu` | `c/DropdownMenu` | รายการ `checkbox`/`label`/`separator` · `shortcut: 'mod+D'` |
| ป้ายอธิบายปุ่มไอคอนตอนชี้ | `Tooltip` | `c/Tooltip` | ข้อมูลสำคัญอย่าซ่อนใน tooltip อย่างเดียว |
| แถบโหลดบนสุดของจอตอนเปลี่ยนหน้า/โหลด | `TopProgress active` | `c/Loading` | วางครั้งเดียว |
| ตัวหมุนโหลด | `Loader` | `c/Loading` | 6 แบบ |
| โครงโหลดครั้งแรก (ยังไม่มีข้อมูล) | `Skeleton`, `SkeletonText` | `c/ui` | |
| โหลดข้อมูลใหม่ทับของเดิม (เปลี่ยนตัวกรอง) | `LoadingOverlay show` | `c/Loading` | |

## 7. สื่อ / รูป / วิดีโอ

| requirement | ใช้ | import | หมายเหตุ |
|---|---|---|---|
| แกลเลอรีรูป/วิดีโอ กดดูเต็มจอ เลื่อนต่อ | `MediaGallery` | `c/MediaLightbox` | `items: MediaItem[]` · `columns` |
| รูปเดียวกดขยาย | `ZoomImage` | `c/MediaLightbox` | |
| ดูวิดีโอเต็มจอจากปุ่ม ("ดูวิดีโอแนะนำ") | `MediaLightbox` | `c/MediaLightbox` | `open` + `items` + `index` |
| ดูไฟล์ที่ผู้ใช้เพิ่งเลือก (ก่อนอัปโหลด) | `MediaLightbox` + `URL.createObjectURL(file)` | `c/MediaLightbox` | `type: file.type` |
| สไลด์โชว์, แบนเนอร์หมุน, รูปสินค้าหลายรูป, การ์ดเลื่อน | `Carousel` | `c/Carousel` | `perView={{0:1,640:2,1024:3}}` · `autoplay` · `loop` |
| แถบโลโก้/ข่าวเลื่อนวน | `Marquee` (หน้าบ้านใช้ `LogoCloud`) | `c/Marquee` | |
| ปุ่มแชร์ LINE / Facebook | `ShareButtons` | `c/ShareButtons` | |
| ปุ่มกลมยืดเป็นแคปซูลตอนชี้ (ลอยมุมจอ) | `ExpandButton` | `c/ExpandButton` | |
| ภาพประกอบนามธรรม (blob) พื้นหลัง login | `LoginBackdrop`, `BlobArt` | `c/BlobArt` | |

## 8. หน้าบ้าน (landing) — ส่วนประกอบ

import ทั้งหมดจาก `@/components/blocks` · ลำดับที่แนะนำ: Nav → Hero → LogoCloud → StatsBand → FeatureBento → Steps → Testimonials → FaqSection → CtaBand → Footer

| requirement | ใช้ | หมายเหตุ |
|---|---|---|
| ส่วนแรกของหน้า (หัวข้อใหญ่ ปุ่ม ภาพหลัก) | `Hero` | `title` เป็น **อาร์เรย์บรรทัด** · `layout="center"`/`"split"` · `visual` ใส่รูปจริงได้ |
| โลโก้ลูกค้า/พันธมิตร | `LogoCloud` | |
| ตัวเลขผลงาน ("1,200+ ร้านค้า") | `StatsBand` | วิ่งขึ้นตอนเห็น |
| จุดเด่น/ฟีเจอร์ | `FeatureBento` | `wide` · `visual` |
| ขั้นตอนการใช้งาน 3–4 ขั้น | `Steps` (บล็อก) | คนละตัวกับ `Stepper` ของฟอร์ม |
| รีวิว/คำนิยม | `Testimonials` | |
| คำถามที่พบบ่อย | `FaqSection` | `items` แบบ `AccordionItem` |
| กล่องชวนสมัครปิดท้าย | `CtaBand` | |
| หัวข้อ section ที่ทำเอง | `SectionHeading` | `highlight` = คำที่เป็นสีไล่ |
| อนิเมชันโผล่ตอนเลื่อนมาเห็น | `Reveal` / `Reveal stagger` + `RevealItem` | |
| ราคา/แพ็กเกจ (pricing) | **ยังไม่มีบล็อก** → ประกอบจาก `SectionHeading` + `Card` + `SegmentedControl` (รายเดือน/รายปี) + `Reveal stagger` | ดู [สูตร](./04-page-recipes.md#10-สิ่งที่หน้าบ้านมักขอแต่ยังไม่มีบล็อก) |
| ฟอร์มติดต่อเรา | `Field` + `Input`/`Textarea` + `LoadingButton` + `toast` | |

## 9. ยูทิลิตี้

| ต้องการ | ใช้ | import |
|---|---|---|
| รวมคลาส Tailwind แบบมีเงื่อนไข | `cn(...)` | `@/lib/utils` |
| จัดรูปแบบวันที่ไทย / ตัวเลข / ระยะเวลา | `formatDate`, `formatNumber`, `formatDuration` | `@/lib/utils` |
| ตัวเลขย่อ 12.9K / 4.2M | `formatCompact` | `@/components/charts` |
| ขนาดไฟล์ "2.4 MB" | `formatBytes` | `@/lib/file-drop` |
| ข้อความปุ่มลัดตามระบบ (⌘K / Ctrl+K) | `useShortcutLabel('mod+K')`, `<Kbd keys="mod+K" />` | `c/Kbd` |
| ข้อความแปล | `useT()` (client) · `getT()` (server) | `@/lib/i18n/client` · `@/lib/i18n/server` |
| สีแบรนด์ตามโปรเจกต์ | `ciStyleCss({ colors })` | `@/lib/ci-store` ([02-setup](./02-setup.md#4-สีแบรนด์-ci-ของโปรเจกต์)) |
| สีของซีรีส์กราฟ (ใช้ใน UI ที่ทำเอง) | `seriesColor(slot)` หรือคลาส `bg-[rgb(var(--chart-1))]` | `@/components/charts` |

---

## ห้ามทำเอง (มีในคลังแล้ว — เขียนใหม่ = พังซ้ำ)

| อย่าทำ | ใช้แทน | เพราะของในคลังแก้แล้วเรื่อง… |
|---|---|---|
| `<input type="date">` | `DatePicker` | หน้าตาต่างกันทุกเบราว์เซอร์ · ไม่มี พ.ศ. |
| `<input type="number">` | `NumberInput` | ล้อเมาส์เปลี่ยนค่า · ใส่ comma ไม่ได้ · พิมพ์ "e" ได้ |
| `<select>` ธรรมดา | `Select` / `Combobox` | ถูกตัดใน container ที่ overflow-hidden · มือถือหน้าตาไม่ตรง |
| `window.confirm` / `alert` | `confirmDialog` / `toast` | บล็อกหน้า · ไม่ตามธีม |
| modal ทำเองด้วย `fixed inset-0` | `Dialog` / `Drawer` / `useModal` | focus trap · Esc ปิดทีละชั้น · ล็อก scroll · คืนโฟกัส |
| dropdown/popover คำนวณตำแหน่งเอง | `Popover` / `DropdownMenu` / `useFloating` | พลิกขึ้นบนเมื่อล่างไม่พอ · ตามตอนเลื่อน · portal |
| toast/snackbar เอง หรือติดตั้ง react-hot-toast/sonner | `toast` | มีอยู่แล้ว ซ้อนกัน หยุดตอนชี้ ปัดทิ้งได้ |
| ติดตั้งไลบรารีกราฟอื่น (chart.js ฯลฯ) | `@/components/charts` | สีตาม CI · ผ่านการตรวจตาบอดสี · มีตารางแทน |
| carousel จากไลบรารีอื่น (swiper, slick) | `Carousel` | วนไร้รอยต่อ · a11y · reduced motion |
| ฟังคีย์ `e.ctrlKey \|\| e.metaKey` เอง | `useShortcut` / `isModEvent` | Windows ต้อง Ctrl เท่านั้น · Mac ต้อง ⌘ เท่านั้น |
| เขียน "Ctrl+K" ตายตัวในข้อความ | `<Kbd keys="mod+K">` / `useShortcutLabel` | Mac ต้องเห็น ⌘K |
| ใส่สี hex ในคลาส (`bg-[#FF0000]`, `text-red-500`) | token: `bg-brand-600`, `text-danger-700`, `text-ink-mute` | สีแบรนด์เปลี่ยนตามโปรเจกต์ · โหมดมืด |
| sidebar/topbar ทำเอง | `AppShell` | พับ/จำค่า · drawer มือถือ · skip link |
| ติดตั้ง UI kit อื่น (MUI, antd, shadcn) | คลังนี้ | หน้าตาไม่เป็นชุดเดียวกัน · bundle ซ้ำ |
