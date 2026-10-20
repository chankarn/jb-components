# jb-components

คอมโพเนนต์ UI กลางที่ย้ายมาจาก CP-Meiji Non-Campus (อ่านอย่างเดียวจากต้นทาง)
Stack: Next.js 15 · React 19 · Tailwind 3.4 · framer-motion · lucide-react · i18n ไทย/อังกฤษ (ย้าย `src/lib/i18n` มาทั้งโฟลเดอร์)

```bash
npm run dev     # http://localhost:3400 (หน้า Gallery)
npm run build
```

## สถานะการย้าย

| กลุ่ม | คอมโพเนนต์ | สถานะ |
|---|---|---|
| 0 โครง/โทเคน | globals.css, tailwind.config.ts, ฟอนต์, `cn`, i18n | ย้ายแล้ว |
| 1 ชั้นล่างสุด | Tabs, PillSwitch (+ThemeProvider/ThemeToggle), HelpTip, EmptyState/NoDataArt, MediaLightbox/ZoomImage | ย้ายแล้ว |
| 2 | Avatar, StatusBadge, ProgressRing (+`lib/cover.ts`) | ย้ายแล้ว |
| 3a ฟอร์ม/ป๊อปอัป | ui.tsx (Card, Button, Chip, Field, Input, Textarea, Progress, Skeleton, Empty), Select, DatePicker (+`lib/calendar.ts` + เทสต์), feedback.tsx (toast/confirmDialog) | ย้ายแล้ว |
| 3b | admin/kit.tsx (DataTable, Toolbar, FilterSelect, Pagination, Drawer, Dialog, SectionCard, StatCard, AdminPageHeader, InfoNote), Table.tsx, admin/RowMenu.tsx | ย้ายแล้ว |

ไม่ย้าย (ผูกกับระบบอบรม): QuestionEditor, Wizard, AdminShell, users/*

## ข้อตัดสินใจ
- ไม่ย้าย `LangSwitch` (ผูกกับ `POST /api/lang` + cookie ของต้นทาง) ใช้ `PillSwitch` ต่อกับกลไกสลับภาษาของแอปปลายทางเอง
- hydration error #418 ที่เคยเห็นตอนทดสอบ ไม่ใช่บั๊กของโค้ด: ตรวจซ้ำบนพอร์ตใหม่แล้วไม่มี ที่เห็นมาจาก origin `localhost:3200` ซึ่งใช้ร่วมกับโปรเจกต์อื่น (เลยเปลี่ยนพอร์ตเริ่มต้นเป็น 3400)
- `<FeedbackHost />` ต้อง mount ครั้งเดียวที่ root layout (ทำไว้แล้วใน `src/app/layout.tsx`)
- `Field` ยังมี selector `[data-bank-picker]` ที่เป็นของเฉพาะระบบต้นทาง (ไม่เป็นอันตราย คงไว้ตามโค้ดเดิม)
- `Drawer` ในต้นทางไม่มี `role`/`aria-modal` (ต่างจาก `Dialog`) ซึ่งขัดกับข้อตกลง "role/aria ครบ" ใน README ต้นทาง ยังไม่ได้แก้ ย้ายตามโค้ดเดิม
