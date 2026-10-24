'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Aperture, ArrowRight, Atom, BarChart3, Bell, Boxes, Feather, Gem, Hexagon, Leaf, MessageCircle, Milk, Orbit, PackageCheck,
  PlayCircle, Rocket, Search, ShoppingCart, Smartphone, Sparkles, Upload, UserPlus, Users, Wallet,
} from 'lucide-react';
import { CtaBand, FaqSection, FeatureBento, Hero, LogoCloud, SiteFooter, SiteNav, StatsBand, Steps, Testimonials } from '@/components/blocks';
import { MediaLightbox } from '@/components/MediaLightbox';
import { Avatar } from '@/components/Avatar';
import { Kbd } from '@/components/Kbd';
import { toast } from '@/components/feedback';

// ปุ่มแบบลิงก์ (ห้ามซ้อน <button> ใน <a>)
const BTN = 'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-6 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60';
const primary = `${BTN} bg-brand-600 text-white shadow-[0_10px_30px_-10px_rgb(var(--brand-600)/0.8)] hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_16px_36px_-12px_rgb(var(--brand-600)/0.9)]`;
const secondary = `${BTN} bg-surface/80 text-ink shadow-[0_0_0_1px_rgb(var(--ink)/0.12)] backdrop-blur hover:bg-surface hover:shadow-[0_0_0_1px_rgb(var(--ink)/0.25)]`;

/* ── ภาพประกอบเล็กในการ์ดจุดเด่น (UI จำลอง — สีตาม CI) ── */
function StockVisual() {
  const rows = [['นมสดรสจืด 830 มล.', 82], ['โยเกิร์ตกรีก 100 ก.', 14], ['นมเปรี้ยวผลไม้รวม', 61], ['เชดดาร์ชีส สไลซ์', 38]] as const;
  return (
    <div className="space-y-2 rounded-2xl bg-paper p-3">
      {rows.map(([n, v]) => (
        <div key={n} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2 text-xs shadow-[0_0_0_1px_rgb(var(--ink)/0.05)]">
          <span className="min-w-0 flex-1 truncate font-medium text-ink">{n}</span>
          {v < 20 && <span className="rounded-pill bg-warn-50 px-1.5 py-px text-[10px] font-bold text-warn-700">ใกล้หมด</span>}
          <span className="h-1.5 w-20 overflow-hidden rounded-pill bg-ink/[0.07]"><span className={`block h-full rounded-pill ${v < 20 ? 'bg-warn-500' : 'bg-ok-500'}`} style={{ width: `${v}%` }} /></span>
          <span className="w-7 text-right tabular-nums text-ink-mute">{v}</span>
        </div>
      ))}
    </div>
  );
}
function NotifyVisual() {
  return (
    <div className="relative h-36">
      {[['สต็อกใกล้หมด', 'โยเกิร์ตกรีก เหลือ 14 ชิ้น', 'bg-warn-50 text-warn-700'], ['คำสั่งซื้อใหม่ #A-20931', '฿308 · 5 นาทีที่แล้ว', 'bg-ok-50 text-ok-700']].map(([t, d, tone], i) => (
        <div key={t} className="absolute inset-x-0 flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[0_14px_30px_-16px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.06)] transition duration-500 group-hover:translate-y-0" style={{ top: i * 52, transform: `scale(${1 - i * 0.04})`, zIndex: 2 - i }}>
          <span className={`grid size-8 place-items-center rounded-xl ${tone}`}><Bell size={15} /></span>
          <span className="min-w-0 leading-tight"><span className="block truncate text-xs font-semibold text-ink">{t}</span><span className="block truncate text-[11px] text-ink-mute">{d}</span></span>
        </div>
      ))}
    </div>
  );
}
function ReportVisual() {
  const bars = [40, 62, 48, 75, 58, 88, 70];
  return (
    <div className="flex h-32 items-end gap-2 rounded-2xl bg-paper p-3">
      {bars.map((b, i) => (
        <span key={i} className="flex-1 origin-bottom rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-transform duration-500 group-hover:scale-y-110" style={{ height: `${b}%`, opacity: i === 5 ? 1 : 0.45, transitionDelay: `${i * 40}ms` }} />
      ))}
    </div>
  );
}
function TeamVisual() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-paper p-3">
      <span className="flex -space-x-2">{['สมชาย', 'นภา', 'Kim', 'Bo'].map((n, i) => <Avatar key={n} name={n} seed={i + 2} size={34} className="ring-2 ring-paper transition duration-300 group-hover:translate-x-1" />)}</span>
      <span className="flex gap-1.5 text-[11px] font-semibold">
        <span className="rounded-pill bg-brand-100 px-2 py-0.5 text-brand-link">ผู้ดูแล</span>
        <span className="rounded-pill bg-ink/[0.06] px-2 py-0.5 text-ink-soft">พนักงาน</span>
      </span>
    </div>
  );
}
function SearchVisual() {
  return (
    <div className="rounded-2xl bg-paper p-3">
      <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm text-ink-mute shadow-[0_0_0_1px_rgb(var(--ink)/0.06)]">
        <Search size={15} /><span className="flex-1">โยเกิร์ต<span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-ink align-middle" /></span><Kbd keys="mod+K" />
      </div>
      <div className="mt-2 space-y-1">
        {['โยเกิร์ตกรีก 100 ก.', 'โยเกิร์ตสตรอว์เบอร์รี 135 ก.'].map((n, i) => (
          <div key={n} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${i === 0 ? 'bg-brand-50 text-ink ring-1 ring-brand-500/15' : 'text-ink-soft'}`}>
            <PackageCheck size={14} className="text-brand-link" /><span><b className="text-brand-link">โยเกิร์ต</b>{n.replace('โยเกิร์ต', '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function DeviceVisual() {
  return (
    <div className="flex items-end justify-center gap-3 rounded-2xl bg-paper p-3 pt-5">
      <div className="h-24 w-36 rounded-lg bg-surface p-1.5 shadow-[0_0_0_1px_rgb(var(--ink)/0.08)]"><div className="h-full rounded bg-gradient-to-br from-brand-100 to-paper" /></div>
      <div className="h-28 w-14 rounded-[14px] bg-surface p-1 shadow-[0_0_0_1px_rgb(var(--ink)/0.08)] transition duration-500 group-hover:-translate-y-2"><div className="h-full rounded-[10px] bg-gradient-to-b from-brand-100 to-paper" /></div>
    </div>
  );
}

const FAQ = [
  { id: 'trial', title: 'ทดลองใช้ฟรีได้นานแค่ไหน?', content: 'ทดลองใช้ทุกฟีเจอร์ได้ฟรี 14 วัน ไม่ต้องผูกบัตร เมื่อครบกำหนดเลือกแพ็กเกจที่เหมาะกับร้านได้ หรือใช้แพ็กเกจฟรีต่อสำหรับสินค้าไม่เกิน 50 รายการ' },
  { id: 'import', title: 'ย้ายข้อมูลสินค้าจากระบบเดิมได้ไหม?', content: 'นำเข้าจากไฟล์ Excel/CSV ได้ทันที ระบบจับคู่คอลัมน์ให้อัตโนมัติ หรือให้ทีมงานช่วยย้ายข้อมูลให้ฟรีในแพ็กเกจธุรกิจ' },
  { id: 'device', title: 'ใช้บนมือถือได้หรือเปล่า?', content: 'ใช้ได้ทุกอุปกรณ์ผ่านเบราว์เซอร์ ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์ ไม่ต้องติดตั้งแอป ข้อมูลซิงก์ถึงกันทันที' },
  { id: 'team', title: 'เพิ่มพนักงานได้กี่คน?', content: 'แพ็กเกจเริ่มต้นเพิ่มได้ 3 คน แพ็กเกจธุรกิจไม่จำกัด กำหนดสิทธิ์รายคนได้ว่าดู/แก้ไข/จัดการอะไรได้บ้าง' },
  { id: 'security', title: 'ข้อมูลปลอดภัยแค่ไหน?', content: 'ข้อมูลเข้ารหัสทั้งระหว่างส่งและตอนจัดเก็บ สำรองข้อมูลทุกวัน และเลือกเปิดการยืนยันตัวตนสองชั้นได้' },
  { id: 'cancel', title: 'ยกเลิกได้ทุกเมื่อไหม?', content: 'ยกเลิกได้ทุกเมื่อจากหน้าตั้งค่า ไม่มีสัญญาผูกมัด และส่งออกข้อมูลทั้งหมดเก็บไว้ได้ก่อนยกเลิก' },
];

const REVIEWS = [
  { quote: 'จากที่เคยนับสต็อกด้วยมือทุกเย็น ตอนนี้เปิดมือถือดูได้เลยว่าอะไรใกล้หมด ประหยัดเวลาไปวันละชั่วโมง', name: 'คุณนภา ศรีสุข', role: 'เจ้าของร้านนมสดบ้านสวน', rating: 5 },
  { quote: 'รายงานยอดขายช่วยให้รู้ว่าสินค้าตัวไหนขายดีช่วงไหน สั่งของได้แม่นขึ้น ของเสียน้อยลงเยอะ', name: 'คุณกิตติ วงศ์ใหญ่', role: 'ผู้จัดการสาขา Milky Mart', rating: 5 },
  { quote: 'ทีมหน้าร้านเรียนรู้ได้ในวันเดียว หน้าตาใช้ง่ายมาก ไม่ต้องอบรมยาวๆ', name: 'คุณสมศรี ใจงาม', role: 'หัวหน้าฝ่ายขาย', rating: 5 },
  { quote: 'ชอบการแจ้งเตือนสต็อกต่ำที่สุด ไม่เคยขาดของขายดีอีกเลยตั้งแต่ใช้', name: 'คุณธนา พูลสวัสดิ์', role: 'เจ้าของคาเฟ่ Dairy Day', rating: 4 },
  { quote: 'ย้ายข้อมูลจาก Excel เข้าระบบเสร็จใน 10 นาที ทีมซัพพอร์ตตอบไวมาก', name: 'คุณปิยะ แก้วมณี', role: 'ฝ่ายปฏิบัติการ', rating: 5 },
  { quote: 'ใช้คุมสต็อก 3 สาขาพร้อมกัน เห็นภาพรวมในหน้าเดียว ตัดสินใจง่ายขึ้นมาก', name: 'คุณวรรณา ทองดี', role: 'เจ้าของธุรกิจ 3 สาขา', rating: 5 },
  { quote: 'ค้นหาสินค้าด้วยคีย์ลัดเร็วมาก พิมพ์รหัสนิดเดียวก็เจอ', name: 'คุณอนันต์ ศักดิ์ดี', role: 'พนักงานคลังสินค้า', rating: 5 },
  { quote: 'ราคาคุ้มค่ากับสิ่งที่ได้ ร้านเล็กก็ใช้ได้สบายๆ', name: 'คุณมาลี รักษ์ไทย', role: 'เจ้าของร้านโยเกิร์ตโฮมเมด', rating: 4 },
];

export function LandingPage() {
  const [video, setVideo] = React.useState(false);
  const start = <Link href="/demo/login" className={primary}>ทดลองใช้ฟรี 14 วัน <ArrowRight size={16} /></Link>;

  return (
    <div data-smooth-scroll className="min-h-dvh overflow-x-clip bg-paper">
      <SiteNav
        brand={{ name: 'Dairy Admin', mark: <Milk size={16} />, href: '#' }}
        links={[{ href: '#features', label: 'จุดเด่น' }, { href: '#how', label: 'วิธีใช้งาน' }, { href: '#reviews', label: 'รีวิว' }, { href: '#faq', label: 'คำถาม' }]}
        actions={
          <>
            <Link href="/demo/login" className="inline-flex h-10 items-center justify-center rounded-pill px-4 text-sm font-semibold text-ink-soft transition hover:bg-ink/[0.05] hover:text-ink">เข้าสู่ระบบ</Link>
            <Link href="/demo/login" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-pill bg-ink px-4 text-sm font-semibold text-paper transition hover:-translate-y-0.5">เริ่มใช้ฟรี <ArrowRight size={14} /></Link>
          </>
        }
      />

      <main>
        <Hero
          badge={{ tag: 'ใหม่', label: 'รายงานยอดขายแบบเรียลไทม์', href: '#features' }}
          title={['จัดการร้านนมของคุณ', 'ง่ายขึ้นในที่เดียว']}
          highlight="ในที่เดียว"
          description="สต็อก ยอดขาย และทีมงาน ดูได้ทุกที่จากมือถือ แจ้งเตือนก่อนของหมด รู้ว่าอะไรขายดี ตัดสินใจได้เร็วขึ้น"
          actions={<>{start}<button type="button" onClick={() => setVideo(true)} className={secondary}><PlayCircle size={18} /> ดูวิดีโอแนะนำ</button></>}
          trust={{ avatars: ['นภา', 'กิตติ', 'สมศรี', 'ธนา'], rating: 4.9, text: 'ร้านค้ากว่า 1,200 ร้านไว้วางใจ' }}
          chips={[
            { icon: <Wallet size={16} />, label: 'ยอดขายวันนี้', value: '฿48,200' },
            { icon: <ShoppingCart size={16} />, label: 'คำสั่งซื้อใหม่', value: '+12 รายการ' },
            { icon: <Bell size={16} />, label: 'สต็อกใกล้หมด', value: '2 รายการ' },
            { icon: <Sparkles size={16} />, label: 'ลูกค้าพึงพอใจ', value: '98%' },
          ]}
        />

        <LogoCloud
          title="ได้รับความไว้วางใจจากร้านค้าและแบรนด์ทั่วประเทศ"
          logos={[['Aurora', Sparkles], ['Lumen', Aperture], ['Nimbus', Feather], ['Pine & Co', Leaf], ['Orbit', Orbit], ['Kinetic', Atom], ['Halo', Hexagon], ['Vertex', Gem]].map(([n, I]) => {
            const Icon = I as typeof Leaf;
            return { name: n as string, icon: <Icon size={22} /> };
          })}
        />

        <StatsBand stats={[
          { value: 1200, suffix: '+', label: 'ร้านค้าที่ใช้งาน' },
          { value: 3.2, decimals: 1, suffix: ' ล้าน', label: 'คำสั่งซื้อต่อเดือน' },
          { value: 98, suffix: '%', label: 'ลูกค้าพึงพอใจ' },
          { value: 14, suffix: ' วัน', label: 'ทดลองใช้ฟรี' },
        ]} />

        <FeatureBento
          id="features" eyebrow="จุดเด่น" title="ทุกอย่างที่ร้านคุณต้องการ อยู่ในที่เดียว" highlight="อยู่ในที่เดียว"
          description="ออกแบบมาสำหรับธุรกิจนมและเบเกอรี่โดยเฉพาะ ใช้ง่ายตั้งแต่วันแรก"
          features={[
            { icon: <Boxes size={20} />, title: 'รู้สต็อกแบบเรียลไทม์', description: 'เห็นของคงเหลือทุกสาขาในหน้าเดียว ขายออกหรือรับเข้าแล้วอัปเดตทันที', visual: <StockVisual />, wide: true },
            { icon: <Bell size={20} />, title: 'แจ้งเตือนก่อนของหมด', description: 'ตั้งเกณฑ์ขั้นต่ำรายสินค้า ระบบเตือนผ่านแอปและ LINE', visual: <NotifyVisual /> },
            { icon: <BarChart3 size={20} />, title: 'รายงานยอดขาย', description: 'รู้ว่าอะไรขายดี ช่วงไหนขายได้ เทียบกับช่วงก่อนได้ในคลิกเดียว', visual: <ReportVisual /> },
            { icon: <Search size={20} />, title: 'ค้นหาทุกอย่างด้วยคีย์ลัด', description: 'กด ⌘K หรือ Ctrl+K พิมพ์ชื่อหรือรหัส แล้วไปถึงสินค้าที่ต้องการทันที', visual: <SearchVisual />, wide: true },
            { icon: <Users size={20} />, title: 'ทีมทำงานร่วมกัน', description: 'เชิญพนักงาน กำหนดสิทธิ์รายคน ดูได้ว่าใครแก้อะไรเมื่อไร', visual: <TeamVisual /> },
            { icon: <Smartphone size={20} />, title: 'ใช้ได้ทุกอุปกรณ์', description: 'มือถือ แท็บเล็ต หรือคอมพิวเตอร์ ไม่ต้องติดตั้งแอป', visual: <DeviceVisual /> },
          ]}
        />

        <Steps
          id="how" eyebrow="วิธีใช้งาน" title="เริ่มใช้ได้ในไม่กี่นาที" highlight="ไม่กี่นาที"
          description="ไม่ต้องติดตั้ง ไม่ต้องตั้งค่ายุ่งยาก"
          steps={[
            { icon: <UserPlus size={22} />, title: 'สมัครใช้งาน', description: 'กรอกชื่อร้านและอีเมล เริ่มทดลองใช้ฟรีได้ทันทีโดยไม่ต้องผูกบัตร' },
            { icon: <Upload size={22} />, title: 'นำเข้าสินค้า', description: 'อัปโหลดไฟล์ Excel หรือเพิ่มทีละรายการ ระบบสร้างรหัสสินค้าให้อัตโนมัติ' },
            { icon: <Rocket size={22} />, title: 'เริ่มขายและติดตาม', description: 'ดูยอดขาย สต็อก และการแจ้งเตือนจากแดชบอร์ดได้ทุกที่' },
          ]}
        />

        <Testimonials id="reviews" eyebrow="รีวิว" title="ร้านค้าทั่วประเทศพูดถึงเรา" highlight="พูดถึงเรา" description="เสียงจริงจากเจ้าของร้านและทีมงานที่ใช้ทุกวัน" items={REVIEWS} />

        <FaqSection
          id="faq" eyebrow="คำถามที่พบบ่อย" title="มีคำถามใช่ไหม?" highlight="คำถาม" description="รวมคำถามที่ร้านค้าถามบ่อยที่สุดก่อนเริ่มใช้งาน"
          items={FAQ}
          aside={
            <div className="rounded-3xl bg-surface p-6 shadow-[0_0_0_1px_rgb(var(--ink)/0.07)]">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand-100 text-brand-link"><MessageCircle size={18} /></span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">ยังหาคำตอบไม่เจอ?</p>
              <p className="mt-1 text-sm text-ink-mute">ทีมงานพร้อมช่วยทุกวัน 8:00–20:00 น.</p>
              <button type="button" onClick={() => toast.info('หน้าตัวอย่าง: ยังไม่มีแชตจริง')} className={`${secondary} mt-5 h-10 w-full`}>คุยกับทีมงาน</button>
            </div>
          }
        />

        <CtaBand
          title="พร้อมให้ร้านของคุณทำงานง่ายขึ้นหรือยัง?"
          description="ทดลองใช้ทุกฟีเจอร์ฟรี 14 วัน ตั้งค่าเสร็จภายใน 5 นาที"
          actions={
            <>
              <Link href="/demo/login" className={`${BTN} bg-white text-brand-700 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] hover:-translate-y-0.5`}>เริ่มทดลองใช้ฟรี <ArrowRight size={16} /></Link>
              <button type="button" onClick={() => setVideo(true)} className={`${BTN} bg-white/10 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20`}><PlayCircle size={18} /> ดูวิดีโอ</button>
            </>
          }
          points={['ไม่ต้องผูกบัตรเครดิต', 'ยกเลิกได้ทุกเมื่อ', 'ทีมงานช่วยตั้งค่าฟรี']}
        />
      </main>

      <SiteFooter
        brand={{ name: 'Dairy Admin', mark: <Milk size={16} /> }}
        description="ระบบจัดการสินค้า ยอดขาย และทีมงาน สำหรับธุรกิจนมและเบเกอรี่ (เว็บตัวอย่างของ jb-components)"
        columns={[
          { title: 'ผลิตภัณฑ์', links: [{ label: 'จุดเด่น', href: '#features' }, { label: 'วิธีใช้งาน', href: '#how' }, { label: 'ทดลองใช้', href: '/demo/login' }] },
          { title: 'ช่วยเหลือ', links: [{ label: 'คำถามที่พบบ่อย', href: '#faq' }, { label: 'คู่มือการใช้งาน', href: '#' }, { label: 'ติดต่อเรา', href: '#' }] },
          { title: 'เกี่ยวกับ', links: [{ label: 'Gallery คอมโพเนนต์', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'นโยบายความเป็นส่วนตัว', href: '#' }] },
        ]}
        onSubscribe={() => new Promise((r) => setTimeout(r, 900))}
        legal="© 2026 Dairy Admin (ตัวอย่าง) · สร้างจาก jb-components"
      />

      <MediaLightbox
        open={video} onClose={() => setVideo(false)} index={0}
        items={[{ src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', type: 'video/mp4', title: 'วิดีโอแนะนำ (คลิปตัวอย่าง)', credit: 'คลิป CC0 · MDN Web Docs' }]}
      />
    </div>
  );
}
