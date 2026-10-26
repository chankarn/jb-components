# รูป · วิดีโอ · สไลด์

props ครบ: [docs/api/05-media.md](../../api/05-media.md) · ตัวอย่างรันได้: Gallery (`/`) หัวข้อ MediaLightbox / Carousel / Marquee

## MediaItem (ใช้ร่วมกันทุกตัว)

```ts
type MediaItem = {
  src: string;          // URL รูป/วิดีโอ หรือ URL.createObjectURL(file)
  type?: string;        // 'image' | 'video' | MIME เช่น 'video/mp4' — ไม่ใส่ = เดาจากนามสกุล (blob: URL ต้องใส่)
  title?: string; alt?: string; poster?: string; credit?: string;
};
```

## MediaGallery · MediaThumb · ZoomImage · MediaLightbox

```tsx
'use client';

import { useState } from 'react';
import { MediaGallery, MediaLightbox, ZoomImage, type MediaItem } from '@/components/MediaLightbox';
import { Button } from '@/components/ui';

const WORKS: MediaItem[] = [
  { src: '/works/kitchen.jpg', title: 'ห้องครัวโมเดิร์น', credit: 'โครงการบ้านสวน 2569' },
  { src: '/works/living.jpg', title: 'ห้องนั่งเล่น' },
  { src: '/works/tour.mp4', type: 'video/mp4', title: 'พาชมทั้งหลัง', poster: '/works/tour.jpg' },
];

export function Portfolio() {
  const [preview, setPreview] = useState<MediaItem[] | null>(null);
  return (
    <div className="space-y-6">
      {/* ตารางภาพย่อ กดแล้วดูเต็มจอเป็นชุด เลื่อนต่อได้ */}
      <MediaGallery items={WORKS} columns={3} aspect="aspect-[4/3]" />

      {/* รูปเดียวกดขยาย */}
      <ZoomImage src="/works/kitchen.jpg" alt="ห้องครัวโมเดิร์น" className="w-64" imgClassName="rounded-2xl" />

      {/* ดูไฟล์ที่ผู้ใช้เพิ่งเลือก (ยังไม่อัปโหลด) */}
      <label className="inline-flex cursor-pointer">
        <span className="sr-only">เลือกไฟล์</span>
        <input type="file" accept="image/*,video/*" multiple className="text-sm"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            setPreview(files.map((f) => ({ src: URL.createObjectURL(f), type: f.type, title: f.name })));
          }} />
      </label>
      <MediaLightbox
        open={!!preview} index={0} items={preview ?? []}
        onClose={() => { preview?.forEach((p) => URL.revokeObjectURL(p.src)); setPreview(null); }}
      />
      <Button variant="ghost" size="sm" onClick={() => setPreview(WORKS)}>เปิดดูทั้งชุด</Button>
    </div>
  );
}
```

- `MediaLightbox` แบบควบคุมเอง: `open` + `items` + `index` (+ `onIndexChange` ถ้าต้องรู้ว่าดูรายการไหน)
- `URL.createObjectURL` ต้อง `revokeObjectURL` ตอนเลิกใช้ (กันหน่วยความจำรั่ว) · ต้องใส่ `type: file.type` เพราะ blob URL ไม่มีนามสกุล
- รูปที่โหลดไม่ได้ แสดงข้อความในหน้าต่างเอง · วิดีโอเปลี่ยนรายการแล้วหยุดเอง
- ใน `next.config` ถ้าใช้ `next/image` กับโดเมนภายนอกต้องตั้ง `images.remotePatterns` — คอมโพเนนต์นี้ใช้ `<img>` ธรรมดา ไม่ต้องตั้ง

## Carousel

**ใช้เมื่อ:** แบนเนอร์หมุน · รูปสินค้าหลายรูป · การ์ดเลื่อนแนวนอน · รีวิว · **ไม่ใช้เมื่อ:** เนื้อหาสำคัญที่ทุกคนต้องเห็น (คนส่วนใหญ่ไม่เลื่อนดูสไลด์ที่ 3+)

```tsx
'use client';

import { Carousel } from '@/components/Carousel';

const BANNERS = [
  { src: '/banners/sale.jpg', title: 'ลดสูงสุด 50%', sub: 'ถึง 31 ต.ค. นี้' },
  { src: '/banners/new.jpg', title: 'สินค้าใหม่ประจำเดือน', sub: 'นมออร์แกนิก' },
  { src: '/banners/free.jpg', title: 'ส่งฟรีทั่วไทย', sub: 'เมื่อซื้อครบ ฿500' },
];

export function HomeBanners() {
  return (
    <div className="space-y-10">
      <Carousel label="โปรโมชัน" autoplay={5000} slideClassName="aspect-[21/9] overflow-hidden rounded-3xl">
        {BANNERS.map((b) => (
          <div key={b.src} className="relative h-full">
            <img src={b.src} alt="" className="kenburns size-full object-cover" draggable={false} />
            <div data-caption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-6 text-white">
              <p className="text-2xl font-bold">{b.title}</p>
              <p className="text-sm opacity-90">{b.sub}</p>
            </div>
          </div>
        ))}
      </Carousel>

      {/* การ์ดหลายใบต่อหน้า ตามความกว้างกล่อง */}
      <Carousel label="สินค้าแนะนำ" perView={{ 0: 1.2, 640: 2, 1024: 4 }} gap={16} loop={false} dots={false}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="rounded-card bg-surface p-4 shadow-card">สินค้า {i + 1}</div>
        ))}
      </Carousel>
    </div>
  );
}
```

- `perView` เป็นตัวเลขหรือ `{ ความกว้างกล่อง(px): จำนวนใบ }` (วัดจาก **กล่องเอง** ไม่ใช่หน้าจอ) · เศษ (1.2) = เห็นขอบใบถัดไปเป็นสัญญาณให้ปัด
- `loop` (ค่าตั้งต้น true) วนไร้รอยต่อ · `autoplay` หยุดเองตอนชี้/โฟกัส/ลาก/สลับแท็บ/ผู้ใช้ลดการเคลื่อนไหว
- คลาส `kenburns` ที่รูป = ซูมช้าๆ ตอนสไลด์ถูกเลือก · `data-caption` = คำบรรยายเลื่อนขึ้นตาม
- รูปใส่ `draggable={false}` (ไม่งั้นเบราว์เซอร์ลากรูปแทนการปัด) · ลากแล้วปล่อยบนลิงก์ไม่นับเป็นคลิก

## Marquee

```tsx
import { Marquee } from '@/components/Marquee';

export function NewsTicker({ items }: { items: string[] }) {
  return (
    <Marquee label="ข่าวล่าสุด" speed={50} gap={40} className="border-y border-ink/10 py-2 text-sm">
      {items.map((t) => <span key={t} className="whitespace-nowrap">{t}</span>)}
    </Marquee>
  );
}
```

- ความเร็วเป็น px/วินาที (เนื้อหายาวขึ้นไม่เร็วขึ้น) · `direction` left/right/up/down (แนวตั้งต้องกำหนดความสูงใน `className`)
- โลโก้ลูกค้าบน landing ใช้บล็อก `LogoCloud` · รีวิววนใช้ `Testimonials`

## BlobArt (ภาพประกอบนามธรรม)

| ตัว | ใช้ |
|---|---|
| `LoginBackdrop` | พื้นหลังหน้า login (วางเป็นลูกตัวแรกของกล่อง `relative overflow-hidden`) |
| `AdminLoginBackdrop`, `LoginPattern`, `HeroPattern` | พื้นหลังลวดลายแบบอื่น |
| `BlobArt`, `FlatCluster` | กลุ่ม blob ตกแต่ง (สีผ่านคลาส `fill-brand-*`) |
