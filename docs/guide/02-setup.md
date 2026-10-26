# 02 · เอาคลังไปใช้ในโปรเจกต์ใหม่

ตอนนี้คลังยังไม่ได้ทำเป็นแพ็กเกจ npm — ใช้วิธี **ก๊อปไฟล์เข้าโปรเจกต์** (แบบ shadcn/ui) แก้ได้อิสระในแต่ละโปรเจกต์

## ทางเลือก

| วิธี | เหมาะกับ | ทำอย่างไร |
|---|---|---|
| **A. เริ่มจากคลังนี้เลย** (ง่ายสุด) | โปรเจกต์ใหม่ทั้งหมด | ก๊อปทั้ง repo → ลบ `src/app/Gallery.tsx`, `src/app/CiPanel.tsx`, `src/app/dashboard`, `src/app/demo`, `src/app/landing`, `tests/demo-products.test.ts` → เขียน `src/app/page.tsx` ใหม่ |
| **B. ก๊อปเข้าโปรเจกต์ Next.js ที่มีอยู่** | มีโปรเจกต์แล้ว | ทำตามหัวข้อด้านล่างทีละข้อ |

## B. ก๊อปเข้าโปรเจกต์ที่มีอยู่

### 1. ติดตั้งแพ็กเกจ

```bash
npm i framer-motion lucide-react clsx tailwind-merge
```

```bash
npm i recharts react-is
```
(บรรทัดที่สองเฉพาะถ้าใช้กราฟ `src/components/charts`)

ต้องมี: Next.js 15 (App Router) · React 19 · Tailwind CSS **3.4** (ยังไม่รองรับ v4) · TypeScript

### 2. ก๊อปไฟล์

| จาก | ไป | หมายเหตุ |
|---|---|---|
| `src/components/**` | `src/components/` | ทั้งโฟลเดอร์ (รวม `admin/`, `charts/`, `blocks/`) |
| `src/lib/**` | `src/lib/` | รวม `i18n/` (ข้อความของคอมโพเนนต์อยู่ใน `dict.th.ts` / `dict.en.ts`) |
| `src/app/globals.css` | `src/app/globals.css` | **จำเป็น** — ตัวแปรสี (token) + ฟอนต์ + CSS ของอนิเมชันทุกตัว |
| `tailwind.config.ts` | รวมเข้ากับของเดิม | ต้องมี `theme.extend` ทั้งหมด (สี, `shadow-glow`, `opacity-8`, ฟอนต์, `rounded-card`) และ `content` ครอบ `src/**/*.{ts,tsx}` |
| `public/fonts/**` | `public/fonts/` | Anuphan (ตัวหนังสือ) + Kanit (หัวข้อ) + ไฟล์สัญญาอนุญาต OFL |

ตั้ง alias ใน `tsconfig.json`: `"paths": { "@/*": ["./src/*"] }` (คอมโพเนนต์ import กันเองด้วย `@/`)

### 3. root layout

คอมโพเนนต์ต้องการ provider 3 ตัวที่ root: ภาษา (`I18nProvider`), ธีมสว่าง/มืด (`ThemeProvider`), และ `FeedbackHost` (toast + กล่องยืนยัน)

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { getLang } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/client';
import { FeedbackHost } from '@/components/feedback';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/ThemeProvider';
import { BRAND_CSS } from '@/lib/brand';

export const metadata: Metadata = { title: 'ชื่อเว็บ' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang(); // อ่าน cookie "lang" (ค่าตั้งต้น th)
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* ทาธีมมืด/สว่างก่อน React โหลด (ไม่กระพริบ) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* สีแบรนด์ของโปรเจกต์ (ดูข้อ 4) */}
        <style id="brand" dangerouslySetInnerHTML={{ __html: BRAND_CSS }} />
      </head>
      <body>
        <I18nProvider lang={lang}>
          <ThemeProvider>
            {children}
            <FeedbackHost />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
```

> `CiThemeApplier` + `CI_INIT_SCRIPT` (ที่ layout ของคลังนี้ใช้) มีไว้สำหรับ **แผงเปลี่ยนสีตอนรันไทม์** ของหน้า Gallery เท่านั้น โปรเจกต์จริงที่สีแบรนด์ตายตัวไม่ต้องใส่

### 4. สีแบรนด์ (CI) ของโปรเจกต์

ทุกคอมโพเนนต์ใช้ตัวแปร CSS (`--brand-50` … `--brand-700`, `--accent-500`, `--accent2-500`, `--chart-1…8`) ไม่ได้ฝังสีตายตัว
ใส่สีแบรนด์ 1–3 สี แล้วระบบสร้างเฉดทั้งหมดให้ (ตัวหนังสือขาวบนสีหลักอ่านออกเสมอ · โหมดมืดปรับให้เอง · สีกราฟแยกกันออกแม้คนตาบอดสี):

```tsx
// src/lib/brand.ts
import { ciStyleCss } from '@/lib/ci-store';

/** สีแบรนด์: [สีหลัก, สีรอง, สีตกแต่ง] — สีรอง/ตกแต่งไม่ใส่ก็ได้ · harmonize = ปรับสีรองให้เข้ากับสีหลัก */
export const BRAND_CSS = ciStyleCss({ colors: ['#0057B8', '#F5A623', '#00B295'], harmonize: true, active: true }) ?? '';
```

อยากเห็นผลก่อนตัดสินใจ: เปิด Gallery ของคลังนี้ (`npm run dev` → `/`) แล้วลองสีในแผง "สี CI" ด้านบน — เห็นทุกคอมโพเนนต์เปลี่ยนตาม

### 5. ภาษา (i18n)

- ข้อความในคอมโพเนนต์มาจาก `src/lib/i18n/dict.th.ts` / `dict.en.ts` — **ห้ามลบ key** ที่คอมโพเนนต์ใช้ (เพิ่ม key ของโปรเจกต์ได้ ต้องเพิ่มทั้งสองไฟล์)
- ใน client component: `const t = useT(); t('common.save')` · ใน server component: `const t = await getT()`
- ภาษาอ่านจาก cookie `lang` — ปุ่มสลับภาษาตั้ง cookie แล้ว `router.refresh()`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { PillSwitch } from '@/components/PillSwitch';
import { useLang } from '@/lib/i18n/client';

export function LangSwitch() {
  const router = useRouter();
  const { lang } = useLang();
  return (
    <PillSwitch
      label="ภาษา / Language" options={['TH', 'EN']} index={lang === 'en' ? 1 : 0}
      onChange={(i) => {
        document.cookie = `lang=${i === 1 ? 'en' : 'th'}; path=/; max-age=31536000`;
        router.refresh();
      }}
    />
  );
}
```

### 6. ตรวจว่าติดตั้งครบ

วางปุ่มนี้ในหน้าใดก็ได้ — กดแล้วต้องเห็น toast มุมขวาบน และสีปุ่มเป็นสีแบรนด์:

```tsx
'use client';

import { Button } from '@/components/ui';
import { toast } from '@/components/feedback';
import { ThemeToggle } from '@/components/ThemeProvider';

export function SetupCheck() {
  return (
    <div className="flex items-center gap-3 p-6">
      <Button onClick={() => toast.success('ติดตั้งเรียบร้อย')}>ทดสอบ</Button>
      <ThemeToggle />
    </div>
  );
}
```

ถ้าปุ่มไม่มีสี/ไม่มีมุมมน → ยังไม่ได้รวม `tailwind.config.ts` หรือ `content` ไม่ครอบ `src/components` · ถ้าไม่มี toast → ลืม `<FeedbackHost />` · ถ้าฟอนต์ไม่ใช่ Anuphan → ลืมก๊อป `public/fonts`
