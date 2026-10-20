# jb-components

คอมโพเนนต์ UI กลางที่ย้ายมาจาก CP-Meiji Non-Campus (อ่านอย่างเดียวจากต้นทาง)
Stack: Next.js 15 · React 19 · Tailwind 3.4 · framer-motion · lucide-react · i18n ไทย/อังกฤษ (ย้าย `src/lib/i18n` มาทั้งโฟลเดอร์)

```bash
npm run dev     # http://localhost:3200 (หน้า Gallery)
npm run build
```

## สถานะการย้าย

| กลุ่ม | คอมโพเนนต์ | สถานะ |
|---|---|---|
| 0 โครง/โทเคน | globals.css, tailwind.config.ts, ฟอนต์, `cn`, i18n | ย้ายแล้ว |
| 1 ชั้นล่างสุด | Tabs, PillSwitch (+ThemeProvider/ThemeToggle), HelpTip, EmptyState/NoDataArt, MediaLightbox/ZoomImage | ย้ายแล้ว |
| 2 | Avatar, StatusBadge, ProgressRing (+`lib/cover.ts`) | ย้ายแล้ว |
| 3a ฟอร์ม/ป๊อปอัป | ui.tsx (Card, Button, Chip, Field, Input, Textarea, Progress, Skeleton, Empty), Select, DatePicker (+`lib/calendar.ts` + เทสต์), feedback.tsx (toast/confirmDialog) | ย้ายแล้ว |
| 3b | admin/kit.tsx (Dialog, Drawer, DataTable, Pagination, ...), Table.tsx, RowMenu | ยังไม่ย้าย |

ไม่ย้าย (ผูกกับระบบอบรม): QuestionEditor, Wizard, AdminShell, users/*

## ข้อตัดสินใจ
- ไม่ย้าย `LangSwitch` (ผูกกับ `POST /api/lang` + cookie ของต้นทาง) ใช้ `PillSwitch` ต่อกับกลไกสลับภาษาของแอปปลายทางเอง
- `<FeedbackHost />` ต้อง mount ครั้งเดียวที่ root layout (ทำไว้แล้วใน `src/app/layout.tsx`)
- `Field` ยังมี selector `[data-bank-picker]` ที่เป็นของเฉพาะระบบต้นทาง (ไม่เป็นอันตราย คงไว้ตามโค้ดเดิม)
