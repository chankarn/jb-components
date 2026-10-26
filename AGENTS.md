# jb-components — คู่มือสำหรับ AI (อ่านไฟล์นี้ก่อน)

คลังคอมโพเนนต์ UI กลางของทีม สำหรับเว็บ **Next.js 15 (App Router) + React 19 + Tailwind CSS 3.4 + TypeScript**
มีทั้งฟอร์ม หน้าต่างลอย การนำทาง ตาราง กราฟ สื่อ หลังบ้าน และบล็อกหน้าบ้าน (landing)
ทุกตัว: รองรับภาษาไทย/อังกฤษ · โหมดมืด · เปลี่ยนสีตามแบรนด์ (CI) · คีย์บอร์ด/screen reader · ผู้ใช้ที่ตั้งลดการเคลื่อนไหว

> **หลักสำคัญที่สุด:** ถ้าในคลังมีคอมโพเนนต์ที่ตรงกับ requirement แล้ว **ให้ใช้ของในคลัง ห้ามเขียนใหม่เอง**
> ของในคลังผ่านการแก้บั๊ก การเข้าถึง (a11y) มือถือ และโหมดมืดมาแล้ว — เขียนใหม่จะเจอบั๊กเดิมซ้ำ

## ลำดับการอ่าน

| ลำดับ | ไฟล์ | อ่านเมื่อ |
|---|---|---|
| 1 | [docs/guide/01-workflow.md](docs/guide/01-workflow.md) | **ทุกครั้งที่เริ่มงานใหม่** — ขั้นตอนจาก requirement → แผนคอมโพเนนต์ → ลงมือ → ตรวจ |
| 2 | [docs/guide/02-setup.md](docs/guide/02-setup.md) | เอาคลังไปใช้ในโปรเจกต์ใหม่ (ไฟล์ที่ต้องก๊อป · layout · สีแบรนด์) |
| 3 | [docs/guide/03-requirement-map.md](docs/guide/03-requirement-map.md) | **แปล requirement เป็นคอมโพเนนต์** — "ต้องการ X → ใช้ Y" ครบทุกหมวด |
| 4 | [docs/guide/04-page-recipes.md](docs/guide/04-page-recipes.md) | ประกอบหน้าทั้งหน้า: login · หลังบ้าน · รายการ · ฟอร์ม · แดชบอร์ด · landing |
| 5 | [docs/guide/components/](docs/guide/components/) | วิธีใช้รายคอมโพเนนต์: ใช้เมื่อไร · ไม่ใช้เมื่อไร · ตัวอย่าง · ข้อควรระวัง |
| 6 | [docs/guide/05-rules.md](docs/guide/05-rules.md) | **กฎและกับดัก** ที่เคยทำพังมาแล้ว (อ่านก่อนเขียนโค้ด) |
| 7 | [docs/guide/06-checklist.md](docs/guide/06-checklist.md) | ก่อนส่งงาน |
| อ้างอิง | [docs/api/](docs/api/README.md) | props ทุกตัว ชนิด ค่าตั้งต้น (สร้างอัตโนมัติจากโค้ด — เชื่อถือได้ที่สุด) |

## ของจริงที่ดูเป็นตัวอย่างได้ (รันได้ทั้งหมด)

| หน้า | ไฟล์ | ใช้ดูเรื่อง |
|---|---|---|
| `/` (Gallery) | `src/app/Gallery.tsx` | ตัวอย่างการใช้ทุกคอมโพเนนต์ + props หลายแบบ |
| `/demo/login` → `/demo` | `src/app/demo/**` | แอปหลังบ้านครบ flow: login · AppShell · แดชบอร์ด · รายการ (ตัวกรองใน URL) · ฟอร์มเพิ่ม/แก้ไข · ⌘K |
| `/landing` | `src/app/landing/LandingPage.tsx` | เว็บหน้าบ้านที่ประกอบจากบล็อก |
| `/dashboard` | `src/app/dashboard/DashboardDemo.tsx` | กราฟทุกแบบ + KPI |

บัญชีทดลองของ `/demo`: `demo@jb.dev` / `demo1234` (ข้อมูลจำลองใน localStorage)

## คำสั่ง

```bash
npm run dev        # http://localhost:3400
npm test           # vitest (ตรรกะล้วนใน src/lib และ src/app/demo/_lib)
npm run typecheck  # tsc
npm run build
npm run docs:api   # สร้าง docs/api ใหม่จากโค้ด (หลังแก้ props)
npm run docs:check # ตรวจว่าตัวอย่างโค้ดในคู่มือ compile ผ่าน
```

ตัวอย่างโค้ดในคู่มือ: บล็อก ` ```tsx ` ทุกบล็อกเป็นไฟล์สมบูรณ์ที่ถูกตรวจด้วย `docs:check` (บรรทัดแรก `// src/...` = ชื่อไฟล์ ตัวอย่างอื่น import ถึงได้) · ท่อนสั้นที่ไม่ต้องตรวจใช้ ` ```tsx-snippet `

## ตัวอย่างสั้นที่สุด (ภาพรวมการใช้)

```tsx
'use client';

import { useState } from 'react';
import { Button, Field, Input } from '@/components/ui';
import { Dialog } from '@/components/Overlay';
import { toast } from '@/components/feedback';

export function InviteButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  return (
    <>
      <Button onClick={() => setOpen(true)}>เชิญสมาชิก</Button>
      <Dialog
        open={open} onClose={() => setOpen(false)} title="เชิญสมาชิก" description="ส่งอีเมลเชิญเข้าร่วมทีม"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button onClick={() => {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError('รูปแบบอีเมลไม่ถูกต้อง'); return; }
              setOpen(false);
              toast.success('ส่งคำเชิญแล้ว', { description: email });
            }}>ส่งคำเชิญ</Button>
          </>
        }
      >
        <Field label="อีเมล" error={error}>
          <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} />
        </Field>
      </Dialog>
    </>
  );
}
```

## ห้ามย้ายมาใช้ (ผูกกับระบบอบรมของต้นทาง)
QuestionEditor, Wizard, AdminShell, users/* — ใช้ `AppShell` และ `Stepper` ของคลังนี้แทน
