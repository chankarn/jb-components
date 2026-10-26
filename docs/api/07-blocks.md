# บล็อกหน้าบ้าน (landing/marketing)

> สร้างอัตโนมัติด้วย `npm run docs:api` — ห้ามแก้ด้วยมือ

## `@/components/blocks/Reveal`

```ts
import { Reveal, RevealItem, SectionHeading, useSpotlight } from '@/components/blocks/Reveal';
```

### `Reveal`

Reveal: เนื้อหาลอยขึ้นจากเบลอเป็นคมเมื่อเลื่อนมาเห็น (ครั้งเดียว)
- ห่อชิ้นเดียว: `<Reveal>…</Reveal>` · ทำทีละชิ้นต่อกัน: `<Reveal stagger>` แล้วลูกแต่ละตัวห่อด้วย `<RevealItem>`
- `delay` วินาที · ผู้ใช้ตั้งลดการเคลื่อนไหว = แสดงเลย


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `delay` | `number` | `0` |  |
| `stagger` | `number \| boolean` |  | ระยะห่างระหว่างลูกแต่ละตัว (วินาที) — ใช้คู่กับ RevealItem |
| `as` | `"div" \| "header" \| "section" \| "ul"` | `'div'` |  |

### `RevealItem`

ลูกของ <Reveal stagger> — โผล่ทีละตัวตามลำดับ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `children` **(จำเป็น)** | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `as` | `"div" \| "li"` | `'div'` |  |

### `SectionHeading`

หัวข้อของแต่ละ section: ป้ายเล็ก (eyebrow) · หัวข้อ (คำใน `highlight` เป็นสีไล่แบบแสงวิ่ง) · คำอธิบาย


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `eyebrow` | `string` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `highlight` | `string` |  | ส่วนของ title ที่จะไฮไลต์ (ต้องเป็นข้อความที่อยู่ใน title) |
| `description` | `ReactNode` |  |  |
| `align` | `"center" \| "left"` | `'center'` |  |
| `className` | `string` |  |  |

### ฟังก์ชัน `useSpotlight`

ตั้ง --mx/--my ตามตำแหน่งเมาส์ (ใช้กับคลาส .spotlight)

```ts
useSpotlight<T extends HTMLElement>() => (e: PointerEvent<T>) => void
```


## `@/components/blocks/SiteNav`

```ts
import { SiteNav, SiteLink } from '@/components/blocks/SiteNav';
```

### `SiteNav`

SiteNav: แถบเมนูบนของเว็บหน้าบ้าน
- ด้านบนสุดโปร่งใส เลื่อนลงแล้วเป็นพื้นเบลอมีเงา (ลอยเป็นแคปซูลบนจอกว้าง)
- ลิงก์แบบ `#id` เลื่อนนุ่มไป section นั้น และมีแคปซูลไฮไลต์เลื่อนตาม section ที่กำลังอ่าน (scrollspy)
- จอแคบ: ปุ่ม ☰ เปิดเมนูลงมาพร้อมลิงก์ไล่โผล่ทีละอัน · เลือกลิงก์/Esc แล้วปิด


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `brand` **(จำเป็น)** | `{ name: string; mark?: ReactNode; href?: string \| undefined; }` |  |  |
| `links` **(จำเป็น)** | `SiteLink[]` |  |  |
| `actions` | `ReactNode` |  | ปุ่มขวา เช่น เข้าสู่ระบบ / เริ่มใช้ฟรี (จอแคบย้ายไปอยู่ในเมนู) |
| `className` | `string` |  |  |

### type `SiteLink`

```ts
type SiteLink = { href: string; label: string };
```


## `@/components/blocks/Hero`

```ts
import { Hero, ProductMock, HeroChip } from '@/components/blocks/Hero';
```

### `Hero`

Hero: ส่วนแรกของหน้า — พื้นหลังแสง aurora ลอยช้าๆ + ตารางเส้นจาง · หัวข้อโผล่ทีละบรรทัด · ภาพหลักพร้อมชิปลอยรอบๆ
- `layout="center"`: ข้อความกลางจอ ภาพหลักอยู่ล่าง เอียงอยู่แล้วตั้งตรงเมื่อเลื่อนลง (perspective ตามการเลื่อน)
- `layout="split"`: ข้อความซ้าย ภาพหลักขวา เอียงตามเมาส์แบบ 3 มิติ
- `title` เป็นอาร์เรย์บรรทัด (ภาษาไทยไม่มีเว้นวรรคระหว่างคำ ตัดบรรทัดเองให้สวย) · `highlight` = ข้อความในบรรทัดที่เป็นสีไล่


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `layout` | `"center" \| "split"` | `'center'` |  |
| `badge` | `{ label: string; tag?: string \| undefined; href?: string \| undefined; }` |  |  |
| `title` **(จำเป็น)** | `string[]` |  |  |
| `highlight` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `actions` | `ReactNode` |  |  |
| `trust` | `{ avatars?: string[] \| undefined; rating?: number \| undefined; text: string; }` |  | แถบความน่าเชื่อถือใต้ปุ่ม เช่น รูปผู้ใช้ + คะแนน |
| `visual` | `ReactNode` |  | ภาพหลัก (ค่าตั้งต้น: ProductMock) |
| `chips` | `HeroChip[]` | `[]` | ชิปลอยรอบภาพหลัก (สูงสุด 4) |
| `className` | `string` |  |  |

### `ProductMock`

ภาพจำลองหน้าจอแดชบอร์ด (HTML ล้วน — สีตาม CI และโหมดมืดอัตโนมัติ)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `className` | `string` |  |  |

### type `HeroChip`

```ts
type HeroChip = { icon?: React.ReactNode; label: string; value?: string; className?: string };
```


## `@/components/blocks/Sections`

```ts
import { LogoCloud, FeatureBento, Steps, StatsBand, Logo, Feature, Step, Stat } from '@/components/blocks/Sections';
```

### `LogoCloud`

แถบโลโก้ลูกค้า/พันธมิตร: วนไม่รู้จบ ขอบจาง · สีเทาจางแล้วเป็นสีเต็มตอนชี้


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` | `string` |  |  |
| `logos` **(จำเป็น)** | `Logo[]` |  |  |
| `className` | `string` |  |  |

### `FeatureBento`

FeatureBento: จุดเด่นแบบการ์ดหลายขนาด (bento) · การ์ดมีแสงตามเคอร์เซอร์และขอบเรือง (spotlight)
`wide` = กว้าง 2 ช่องบนจอกว้าง · `visual` = ภาพประกอบเล็กๆ ในการ์ด (UI จำลอง กราฟ ชิป ฯลฯ)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `id` | `string` |  |  |
| `eyebrow` | `string` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `highlight` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `features` **(จำเป็น)** | `Feature[]` |  |  |
| `className` | `string` |  |  |

### `Steps`

ขั้นตอนการใช้งาน 3–4 ขั้น · เส้นเชื่อมวาดตามการเลื่อนหน้า (จอแคบเป็นแนวตั้ง)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `id` | `string` |  |  |
| `eyebrow` | `string` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `highlight` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `steps` **(จำเป็น)** | `Step[]` |  |  |
| `className` | `string` |  |  |

### `StatsBand`

แถบตัวเลขเด่น: วิ่งขึ้นตอนเลื่อนมาเห็น · คั่นด้วยเส้นบาง


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `stats` **(จำเป็น)** | `Stat[]` |  |  |
| `className` | `string` |  |  |

### type `Logo`

```ts
type Logo = { name: string; icon?: React.ReactNode };
```

### type `Feature`

```ts
type Feature = { icon: React.ReactNode; title: string; description: string; visual?: React.ReactNode; wide?: boolean };
```

### type `Step`

```ts
type Step = { icon: React.ReactNode; title: string; description: string };
```

### type `Stat`

```ts
type Stat = { value: number; label: string; prefix?: string; suffix?: string; decimals?: number };
```


## `@/components/blocks/Closing`

```ts
import { Testimonials, FaqSection, CtaBand, SiteFooter, Testimonial, FooterColumn } from '@/components/blocks/Closing';
```

### `Testimonials`

รีวิวลูกค้า: การ์ดสองแถววิ่งสวนทางไม่รู้จบ · ชี้แล้วหยุดแถวนั้น · ขอบจาง


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `id` | `string` |  |  |
| `eyebrow` | `string` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `highlight` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `items` **(จำเป็น)** | `Testimonial[]` |  |  |
| `className` | `string` |  |  |

### `FaqSection`

คำถามที่พบบ่อย: หัวข้อ + การ์ดติดต่อ (ซ้าย ติดจอตอนเลื่อน) · Accordion (ขวา)


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `id` | `string` |  |  |
| `eyebrow` | `string` |  |  |
| `title` **(จำเป็น)** | `string` |  |  |
| `highlight` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `items` **(จำเป็น)** | `AccordionItem[]` |  |  |
| `aside` | `ReactNode` |  | การ์ดใต้หัวข้อ เช่น "ยังมีคำถาม? คุยกับทีมงาน" |
| `className` | `string` |  |  |

### `CtaBand`

กล่องชวนลงมือปิดท้าย: พื้นไล่สีแบรนด์ + แสง aurora + ตารางเส้น + ลำแสงวิ่งผ่าน · `points` = จุดเด่นสั้นๆ ใต้ปุ่ม


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `title` **(จำเป็น)** | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `actions` | `ReactNode` |  |  |
| `points` | `string[]` |  |  |
| `className` | `string` |  |  |

### `SiteFooter`

ท้ายเว็บ: แบรนด์ + คำอธิบาย + สมัครรับข่าว · คอลัมน์ลิงก์ · แถบล่าง (ลิขสิทธิ์ · สลับธีม) · ชื่อแบรนด์ตัวใหญ่จางๆ เป็นฉากหลัง
`onSubscribe` คืน Promise — ตรวจรูปแบบอีเมลให้ (ผิด = ช่องสั่น) · สำเร็จเปลี่ยนเป็นข้อความขอบคุณ


| prop | ชนิด | ค่าตั้งต้น | คำอธิบาย |
|---|---|---|---|
| `brand` **(จำเป็น)** | `{ name: string; mark?: ReactNode; }` |  |  |
| `description` | `string` |  |  |
| `columns` **(จำเป็น)** | `FooterColumn[]` |  |  |
| `onSubscribe` | `((email: string) => Promise<void>)` |  |  |
| `legal` | `string` |  |  |
| `className` | `string` |  |  |

### type `Testimonial`

```ts
type Testimonial = { quote: string; name: string; role: string; rating?: number };
```

### type `FooterColumn`

```ts
type FooterColumn = { title: string; links: { label: string; href: string }[] };
```

