# บล็อกหน้าบ้าน (landing · marketing · เว็บองค์กร)

import ทั้งหมดจาก `@/components/blocks` · props ครบ: [docs/api/07-blocks.md](../../api/07-blocks.md) · หน้าเต็ม: [สูตร 9](../04-page-recipes.md#9-landing-page) · ของจริง `src/app/landing/LandingPage.tsx`

บล็อกไม่ผูกกับธุรกิจใด — ต่างกันแค่ข้อมูล ลำดับ และสี CI · ทุกบล็อกตามโหมดมืดและลดการเคลื่อนไหวเอง

## แต่ละบล็อก

| บล็อก | หน้าที่ | props สำคัญ | ข้อควรระวัง |
|---|---|---|---|
| `SiteNav` | เมนูบน | `brand`, `links: {href,label}[]`, `actions` | ลิงก์ `#id` เลื่อนนุ่ม + ไฮไลต์ตาม section (ต้องมี `id` ที่ section ปลายทาง) · `actions` จอแคบย้ายเข้าเมนู ☰ |
| `Hero` | ส่วนแรก | `title: string[]`, `highlight`, `description`, `actions`, `badge`, `trust`, `chips` (≤4), `visual`, `layout` | **`title` เป็นอาร์เรย์บรรทัด** · `highlight` ต้องอยู่ใน title จริง · ไม่ใส่ `visual` = ภาพจำลองแดชบอร์ด |
| `LogoCloud` | โลโก้ลูกค้า | `title`, `logos: {name, icon?}[]` | ใช้รูปโลโก้จริงใส่ใน `icon` (`<img className="h-6">`) |
| `StatsBand` | ตัวเลขผลงาน | `stats: {value, label, prefix?, suffix?, decimals?}[]` | `value` เป็น number (วิ่งขึ้น) · หน่วยใส่ `suffix` |
| `FeatureBento` | จุดเด่น/บริการ | `features: {icon, title, description, visual?, wide?}[]` + หัวข้อ | 4–6 ใบ · `wide` 1–2 ใบให้กริดสวย |
| `Steps` | ขั้นตอน 3–4 ขั้น | `steps: {icon, title, description}[]` | คนละตัวกับ `Stepper` ของฟอร์ม |
| `Testimonials` | รีวิว | `items: {quote, name, role, rating?}[]` | ≥ 6 รายการ (สองแถววิ่งสวน) |
| `FaqSection` | คำถามที่พบบ่อย | `items: {id, title, content}[]`, `aside` | `aside` = การ์ดติดต่อทีมงาน |
| `CtaBand` | ชวนลงมือปิดท้าย | `title`, `description`, `actions`, `points` | ปุ่มบนพื้นสีแบรนด์ใช้ `bg-white text-brand-700` |
| `SiteFooter` | ท้ายเว็บ | `brand`, `columns`, `onSubscribe`, `legal` | `onSubscribe(email)` คืน Promise (ตรวจอีเมลให้) · ไม่ใส่ = ไม่มีช่องสมัคร |

หัวข้อของ section (`eyebrow` · `title` · `highlight` · `description` · `id`) มีรูปแบบเดียวกันทุกบล็อกที่เป็น section

## ปรับให้เข้ากับประเภทเว็บ

| ประเภทเว็บ | ลำดับบล็อกที่แนะนำ |
|---|---|
| SaaS / แอป | Nav → Hero (ProductMock) → LogoCloud → StatsBand → FeatureBento → Steps → Testimonials → (Pricing) → FaqSection → CtaBand → Footer |
| บริษัท / องค์กร | Nav → Hero `split` + รูปจริง → FeatureBento (บริการ) → StatsBand → ผลงาน (`MediaGallery`/`Carousel`) → Testimonials → ติดต่อเรา → Footer |
| ร้านอาหาร / คาเฟ่ | Nav → Hero + รูปอาหาร → เมนูแนะนำ (`Carousel`) → บรรยากาศ (`MediaGallery`) → รีวิว → แผนที่/เวลาเปิด → Footer |
| อีเวนต์ / คอร์ส | Nav → Hero + วันที่ → จุดเด่น → กำหนดการ (`Stepper vertical` หรือ `Steps`) → วิทยากร → ราคา → FaqSection → CtaBand |
| แคมเปญหน้าเดียว | Hero → FeatureBento → CtaBand (ไม่มี Nav ซับซ้อน) |

ส่วนที่ยังไม่มีบล็อก (ราคา ติดต่อเรา บทความ ทีมงาน): ประกอบตาม [สูตร 10](../04-page-recipes.md#10-สิ่งที่หน้าบ้านมักขอแต่ยังไม่มีบล็อก)

## ทำ section ใหม่ให้หน้าตาเข้าชุด

ใช้ `SectionHeading` + `Reveal` + คลาสอนิเมชันใน `globals.css`:

```tsx
'use client';

import { MapPin, Clock, Phone } from 'lucide-react';
import { Reveal, RevealItem, SectionHeading, useSpotlight } from '@/components/blocks';

const INFO = [
  { icon: <MapPin size={20} />, title: 'ที่ตั้ง', text: '123 ถ.สุขุมวิท กรุงเทพฯ' },
  { icon: <Clock size={20} />, title: 'เวลาเปิด', text: 'ทุกวัน 08:00–20:00 น.' },
  { icon: <Phone size={20} />, title: 'โทร', text: '02-123-4567' },
];

export function VisitUs() {
  const spot = useSpotlight<HTMLDivElement>();
  return (
    <section id="visit" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="มาเยี่ยมเรา" title="แวะมาชิมได้ทุกวัน" highlight="ทุกวัน" description="ที่จอดรถฟรี 2 ชั่วโมง" />
      <Reveal stagger className="mt-12 grid gap-4 md:grid-cols-3">
        {INFO.map((i) => (
          <RevealItem key={i.title}>
            <div onPointerMove={spot} className="spotlight rounded-3xl bg-surface p-6 shadow-card">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand-100 text-brand-link">{i.icon}</span>
              <p className="mt-4 font-display text-lg font-semibold">{i.title}</p>
              <p className="mt-1 text-sm text-ink-mute">{i.text}</p>
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
```

คลาสสำเร็จรูปใน `globals.css` (ใช้ได้ทุกที่)

| คลาส | ผล |
|---|---|
| `aurora` | พื้นหลังแสงไล่สีแบรนด์ลอยช้าๆ — `<div className="aurora" aria-hidden><span /><span /><span /></div>` ในกล่อง `relative overflow-hidden` |
| `grid-fade` | ตารางเส้นจางๆ ขอบค่อยๆ หาย |
| `text-shimmer` | ตัวหนังสือไล่สีแบบแสงวิ่ง (ใช้กับคำเด่นคำเดียว) |
| `spotlight` + `useSpotlight` | แสงตามเคอร์เซอร์ + ขอบเรือง |
| `float-y` | ลอยขึ้นลงช้าๆ |
| `beam` | ลำแสงวิ่งผ่าน — `<span className="beam" aria-hidden />` ในกล่อง `relative overflow-hidden` |
| `data-smooth-scroll` (ที่กล่องนอกสุด) | ลิงก์ `#id` เลื่อนนุ่ม |

ข้อควรระวัง
- ลิงก์ที่หน้าตาเป็นปุ่ม: `<Link className="…">` อย่าใส่ `<Button>` ใน `<Link>` (ปุ่มซ้อนในลิงก์ผิด HTML)
- หน้า landing เป็น client component ได้ แต่ `page.tsx` ควรเป็น server component ที่มี `metadata` (SEO + Open Graph สำหรับปุ่มแชร์)
- ใส่ `overflow-x-clip` ที่กล่องนอกสุด (แสง aurora/ชิปลอยไม่ทำให้เกิด scroll แนวนอนบนมือถือ)
- ภาษาไทยในหัวข้อใหญ่: ตัดบรรทัดเองเป็นอาร์เรย์ (Hero) หรือใส่ `<br className="hidden sm:block" />` — อย่าปล่อยให้เบราว์เซอร์ตัดกลางคำ
