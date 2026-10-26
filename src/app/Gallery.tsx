'use client';

import { useEffect, useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { PillSwitch } from '@/components/PillSwitch';
import { ThemeToggle, useTheme } from '@/components/ThemeProvider';
import { CommandPalette, useCommandHotkey, type CommandItem } from '@/components/CommandPalette';
import { Kbd, useShortcutLabel } from '@/components/Kbd';
import { HelpTip } from '@/components/HelpTip';
import { EmptyState } from '@/components/EmptyState';
import { MediaGallery, ZoomImage, type MediaItem } from '@/components/MediaLightbox';
import { Button, Card, Chip, Field, Input, Textarea, Progress, Skeleton, SkeletonText, Empty } from '@/components/ui';
import { Select } from '@/components/Select';
import { DatePicker } from '@/components/DatePicker';
import { Combobox, type ComboOption } from '@/components/Combobox';
import { Carousel } from '@/components/Carousel';
import { Marquee } from '@/components/Marquee';
import { Aperture, Atom, Feather, Gem, Hexagon, Leaf, Orbit, Sparkles } from 'lucide-react';
import { DateRangePicker, type DateRange } from '@/components/DateRangePicker';
import { toast, confirmDialog } from '@/components/feedback';
import { DataTable, Toolbar, FilterSelect, Pagination, Dialog, Drawer, SectionCard, StatCard, AdminPageHeader, InfoNote } from '@/components/admin/kit';
import { RowMenu } from '@/components/admin/RowMenu';
import { Pencil, Trash2 } from 'lucide-react';
import { LoginBackdrop, LoginPattern, AdminLoginBackdrop, HeroPattern } from '@/components/BlobArt';
import { ImagePicker } from '@/components/admin/ImagePicker';
import { OtpInput } from '@/components/OtpInput';
import { PasswordInput, PasswordRules } from '@/components/admin/PasswordFields';
import Link from 'next/link';
import { CiPanel } from './CiPanel';
import { useCiState } from '@/lib/ci-store';
import { ExpandButton } from '@/components/ExpandButton';
import { Plus, Download, Trash2 as Trash, ExternalLink } from 'lucide-react';
import { ShareButtons } from '@/components/ShareButtons';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressRing } from '@/components/ProgressRing';
import { Checkbox, RadioGroup, Switch } from '@/components/Choice';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Slider } from '@/components/Slider';
import { NumberInput } from '@/components/NumberInput';
import { FileDrop, type UploadFn, type UploadedFile } from '@/components/FileDrop';
import { Bike, CalendarDays, LayoutGrid, List, Rows3, Store, Truck } from 'lucide-react';
import { Popover } from '@/components/Popover';
import { Tooltip } from '@/components/Tooltip';
import { DropdownMenu } from '@/components/DropdownMenu';
import { Accordion, Collapse } from '@/components/Accordion';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Stepper } from '@/components/Stepper';
import { TagInput } from '@/components/TagInput';
import { Loader, LoadingButton, LoadingOverlay, TopProgress, type LoaderVariant, type LoadingStatus } from '@/components/Loading';
import { ArrowUp, BarChart3, Hash, LayoutDashboard, Moon, Search, Sun, AlertTriangle, CheckCircle2, Clock, Bell, Bold, ChevronDown, Copy, CreditCard, FileDown, Filter, Folder, Home, Italic, LogOut, Package, Settings, Share2, ShieldCheck, Underline, User } from 'lucide-react';

const SCALES: [string, string[]][] = [
  ['brand', ['50', '100', '200', '300', '400', '500', '600', '700']],
  ['ok', ['50', '500', '600', '700']],
  ['warn', ['50', '500', '600', '700']],
  ['danger', ['50', '100', '500', '600', '700']],
  ['accent', ['DEFAULT', '2']],
];

// Tailwind ต้องเห็นชื่อคลาสเต็ม จึงแมปไว้ตรงๆ ไม่ประกอบสตริง
const BG: Record<string, string> = {
  'brand-50': 'bg-brand-50', 'brand-100': 'bg-brand-100', 'brand-200': 'bg-brand-200', 'brand-300': 'bg-brand-300',
  'brand-400': 'bg-brand-400', 'brand-500': 'bg-brand-500', 'brand-600': 'bg-brand-600', 'brand-700': 'bg-brand-700',
  'ok-50': 'bg-ok-50', 'ok-500': 'bg-ok-500', 'ok-600': 'bg-ok-600', 'ok-700': 'bg-ok-700',
  'warn-50': 'bg-warn-50', 'warn-500': 'bg-warn-500', 'warn-600': 'bg-warn-600', 'warn-700': 'bg-warn-700',
  'accent-DEFAULT': 'bg-accent', 'accent-2': 'bg-accent-2',
  'danger-50': 'bg-danger-50', 'danger-100': 'bg-danger-100', 'danger-500': 'bg-danger-500', 'danger-600': 'bg-danger-600', 'danger-700': 'bg-danger-700',
};


const DEPT_OPTIONS: ComboOption[] = [
  { value: 'production', label: 'ฝ่ายผลิต', description: 'Production', keywords: ['production', 'ผลิต'] },
  { value: 'warehouse', label: 'คลังสินค้า', description: 'Warehouse', keywords: ['warehouse', 'stock'] },
  { value: 'quality', label: 'ควบคุมคุณภาพ', description: 'Quality Control (QC)', keywords: ['qc', 'quality'] },
  { value: 'logistics', label: 'ขนส่ง', description: 'Logistics', keywords: ['logistics', 'transport'] },
  { value: 'accounting', label: 'บัญชีและการเงิน', description: 'Accounting', keywords: ['accounting', 'finance'] },
  { value: 'hr', label: 'บุคคล', description: 'Human Resources', keywords: ['hr', 'human'] },
  { value: 'maintenance', label: 'ซ่อมบำรุง', description: 'Maintenance', keywords: ['maintenance', 'engineering'] },
  { value: 'safety', label: 'ความปลอดภัย (ปิดรับ)', description: 'Safety', keywords: ['safety'], disabled: true },
  { value: 'cafe', label: 'Café ในโรงงาน', keywords: ['cafe', 'coffee'] },
];
const TAG_OPTIONS: ComboOption[] = ['GMP', 'HACCP', 'ISO 22000', 'ความปลอดภัย', 'อาชีวอนามัย', 'สารเคมี'].map((l) => ({ value: l, label: l }));

/** รูปตัวอย่างจาก Lorem Picsum (ภาพจาก Unsplash ใช้ฟรีตามสัญญาอนุญาตของ Unsplash) — แสดงจาก URL ไม่ได้เก็บไว้ในโปรเจกต์ */
const pic = (id: number, w: number, h: number) => `https://picsum.photos/id/${id}/${w}/${h}`;
const HERO = [
  { id: 1015, author: 'Alexey Topolyanskiy', tag: 'ทะเลและภูเขา', title: 'ฟยอร์ดมองจากหน้าผา' },
  { id: 1018, author: 'Andrew Ridley', tag: 'เส้นทาง', title: 'เนินเขาเขียวกับถนนคดเคี้ยว' },
  { id: 1036, author: 'Wolfgang Lutz', tag: 'หน้าหนาว', title: 'เต็นท์กลางหุบเขาหิมะ' },
  { id: 1043, author: 'Christian Joudrey', tag: 'อุทยาน', title: 'หน้าผาหินแกรนิตกับป่าสน' },
  { id: 1044, author: 'Steve Carter', tag: 'สายน้ำ', title: 'แม่น้ำในสายหมอก' },
];
const CARDS = [
  { id: 1016, author: 'Philippe Wuyts', tag: 'ทะเลทราย', title: 'หุบผาหินแดงยามเย็น' },
  { id: 1019, author: 'Patrick Fore', tag: 'ทะเล', title: 'เมฆพายุเหนือทะเล' },
  { id: 1039, author: 'Andrew Coelho', tag: 'ป่า', title: 'น้ำตกกลางป่าดิบชื้น' },
  { id: 1047, author: 'sergee bee', tag: 'เมือง', title: 'ตรอกตึกอิฐในเมือง' },
  { id: 1050, author: 'Joseph Barrientos', tag: 'ทะเล', title: 'โขดหินกลางทะเลสีคราม' },
  { id: 1057, author: 'Stefan Kunze', tag: 'ชายฝั่ง', title: 'เนินเขาริมทะเลยามเย็น' },
  { id: 1067, author: 'Kevin Young', tag: 'เมือง', title: 'เส้นขอบฟ้าเมืองยามพลบค่ำ' },
];
/** สื่อตัวอย่าง: รูปจาก Lorem Picsum (Unsplash) · คลิปวิดีโอ CC0 จาก MDN (ใช้ได้ฟรี) — แสดงจาก URL ไม่ได้เก็บในโปรเจกต์ */
const MEDIA: MediaItem[] = [
  { src: pic(1015, 1600, 1067), title: 'ฟยอร์ดมองจากหน้าผา', credit: 'ภาพ: Alexey Topolyanskiy · Unsplash' },
  { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', type: 'video/mp4', title: 'ผึ้งตอมดอกไม้ (วิดีโอ)', credit: 'คลิป CC0 · MDN Web Docs' },
  { src: pic(1039, 1600, 1067), title: 'น้ำตกกลางป่าดิบชื้น', credit: 'ภาพ: Andrew Coelho · Unsplash' },
  { src: pic(1043, 1600, 1067), title: 'หน้าผาหินแกรนิตกับป่าสน', credit: 'ภาพ: Christian Joudrey · Unsplash' },
  { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4', type: 'video/mp4', title: 'ชายใส่หมวกบนรถไฟ (วิดีโอ)', credit: 'คลิป CC0 · MDN Web Docs' },
  { src: pic(1016, 1600, 1067), title: 'หุบผาหินแดงยามเย็น', credit: 'ภาพ: Philippe Wuyts · Unsplash' },
];
const MARQUEE_PICS = [106, 110, 128, 164, 177, 184, 188, 200];
const LOGOS: [string, typeof Leaf][] = [['Aurora', Sparkles], ['Lumen', Aperture], ['Nimbus', Feather], ['Pine & Co', Leaf], ['Orbit', Orbit], ['Kinetic', Atom], ['Halo', Hexagon], ['Vertex', Gem]];

const PERMS = [
  { key: 'view', label: 'ดูรายงาน', description: 'เห็นแดชบอร์ดและส่งออก CSV' },
  { key: 'edit', label: 'แก้ไขข้อมูล', description: 'เพิ่ม/แก้รายการในตาราง' },
  { key: 'admin', label: 'จัดการผู้ใช้', description: 'เชิญ ลบ และเปลี่ยนสิทธิ์' },
];
const SHIPPING = [
  { value: 'standard', label: 'ส่งธรรมดา', description: '3–5 วันทำการ · ฟรี', icon: <Truck size={18} /> },
  { value: 'express', label: 'ส่งด่วน', description: 'ภายในวันถัดไป · ฿60', icon: <Bike size={18} /> },
  { value: 'pickup', label: 'รับที่สาขา', description: 'พร้อมรับใน 2 ชม. · ฟรี', icon: <Store size={18} /> },
];
const FAQ = [
  { id: 'ship', title: 'จัดส่งกี่วัน?', content: 'ส่งธรรมดา 3–5 วันทำการ ส่งด่วนถึงภายในวันถัดไป (สั่งก่อน 14:00) ต่างจังหวัดบางพื้นที่อาจช้ากว่า 1 วัน' },
  { id: 'return', title: 'คืนสินค้าได้ไหม?', subtitle: 'ภายใน 7 วันหลังได้รับ', content: 'คืนได้ถ้าสินค้ายังไม่ผ่านการใช้งานและอยู่ในบรรจุภัณฑ์เดิม แจ้งผ่านหน้าคำสั่งซื้อ ระบบจะออกใบรับคืนให้พร้อมจุดส่งใกล้บ้าน' },
  { id: 'pay', title: 'ชำระเงินช่องทางไหนได้บ้าง?', content: 'บัตรเครดิต/เดบิต พร้อมเพย์ และเก็บเงินปลายทาง (ไม่เกิน ฿5,000)' },
  { id: 'invoice', title: 'ขอใบกำกับภาษีเต็มรูป (ปิดชั่วคราว)', content: '-', disabled: true },
];
const SETTINGS_ACC = [
  { id: 'profile', title: 'ข้อมูลส่วนตัว', subtitle: 'ชื่อ อีเมล รูปโปรไฟล์', icon: <User size={18} />, content: 'ฟอร์มแก้ไขข้อมูลส่วนตัววางตรงนี้' },
  { id: 'security', title: 'ความปลอดภัย', subtitle: 'รหัสผ่าน · ยืนยันสองชั้น', icon: <ShieldCheck size={18} />, content: 'เปลี่ยนรหัสผ่าน และเปิดการยืนยันสองชั้นด้วยแอป Authenticator' },
  { id: 'billing', title: 'การชำระเงิน', subtitle: 'บัตรที่บันทึกไว้ · ใบเสร็จ', icon: <CreditCard size={18} />, content: 'บัตรที่บันทึกไว้ 1 ใบ ลงท้าย 4242 · ดาวน์โหลดใบเสร็จย้อนหลัง 12 เดือน' },
];
const CRUMBS = [
  { label: 'หน้าแรก', href: '/', icon: <Home size={14} /> },
  { label: 'โครงการ', href: '/' },
  { label: 'โรงงานบางนา', href: '/' },
  { label: 'ฝ่ายผลิต', href: '/' },
  { label: 'รายงานประจำเดือนตุลาคม 2569 (ฉบับแก้ไขครั้งที่ 2)' },
];
const CHECKOUT = [
  { title: 'ตะกร้า', description: '3 รายการ' },
  { title: 'ที่อยู่จัดส่ง' },
  { title: 'ชำระเงิน' },
  { title: 'ยืนยัน', optional: true },
];
const baht = (v: number) => `฿${v.toLocaleString()}`;

/** อัปโหลดจำลอง: ความคืบหน้าวิ่ง 1–3 วินาที · ชื่อไฟล์มีคำว่า "error" จะล้มที่ ~60% (ไว้ลองปุ่มลองใหม่) */
const fakeUpload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const total = 1000 + Math.min(2000, file.size / 2000);
    const fail = /error/i.test(file.name);
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(1, p + (80 / total) * (0.6 + Math.random() * 0.8));
      onProgress(p);
      if (fail && p > 0.6) { clearInterval(id); reject(new Error('เซิร์ฟเวอร์ไม่ตอบสนอง (จำลอง)')); }
      else if (p >= 1) { clearInterval(id); resolve(`asset_${file.name}`); }
    }, 80);
    signal.addEventListener('abort', () => { clearInterval(id); reject(new DOMException('aborted', 'AbortError')); });
  });


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-4 rounded-card bg-surface p-5 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Gallery() {
  const [tab, setTab] = useState('all');
  const [sw, setSw] = useState<0 | 1>(0);
  const [admin, setAdmin] = useState(false);
  const ci = useCiState().active;
  const [sel, setSel] = useState('a');
  const [date, setDate] = useState('');
  const [cbOne, setCbOne] = useState<string | null>('quality');
  const [cbMany, setCbMany] = useState<string[]>(['production', 'warehouse']);
  const [cbTags, setCbTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<ComboOption[]>(TAG_OPTIONS);
  const [range, setRange] = useState<DateRange | null>(null);
  const [range2, setRange2] = useState<DateRange | null>({ from: '2026-10-12', to: '2026-10-18' });
  const [range3, setRange3] = useState<DateRange | null>(null);
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [img, setImg] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [ring, setRing] = useState(60);
  const [replay, setReplay] = useState(0);
  const [perms, setPerms] = useState<string[]>(['view']);
  const [ship, setShip] = useState<string | null>('express');
  const [size, setSize] = useState<string | null>('m');
  const [notif, setNotif] = useState({ email: true, push: false, digest: true });
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [view, setView] = useState<'list' | 'grid' | 'rows'>('grid');
  const [tone, setTone] = useState<'all' | 'open' | 'closed' | 'draft'>('all');
  const [volume, setVolume] = useState(40);
  const [price, setPrice] = useState<[number, number]>([1500, 6000]);
  const [rating, setRating] = useState(3.5);
  const [committed, setCommitted] = useState<[number, number]>([1500, 6000]);
  const [qty, setQty] = useState<number | null>(1);
  const [amount, setAmount] = useState<number | null>(12500);
  const [weight, setWeight] = useState<number | null>(null);
  const [big, setBig] = useState<number | null>(1250000);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [docs, setDocs] = useState<UploadedFile[]>([]);
  const [step, setStep] = useState(1);
  const [vstep, setVstep] = useState(1);
  const [acc, setAcc] = useState<string[]>(['security']);
  const [more, setMore] = useState(false);
  const [cols, setCols] = useState({ name: true, status: true, owner: false, updated: true });
  const [fmt, setFmt] = useState({ b: true, i: false, u: false });
  const [lastAction, setLastAction] = useState('');
  const [tags, setTags] = useState<string[]>(['React', 'Next.js', 'Tailwind']);
  const [skills, setSkills] = useState<string[]>(['GMP', 'HACCP', 'ความปลอดภัย', 'ISO 22000']);
  const [emails, setEmails] = useState<string[]>(['somchai@example.com']);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [saveSt, setSaveSt] = useState<LoadingStatus>('idle');
  const [paySt, setPaySt] = useState<LoadingStatus>('idle');
  const [topLoading, setTopLoading] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [otpWrong, setOtpWrong] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; qty: number | null; dept: string | null; agree: boolean }>({ name: '', email: '', qty: null, dept: null, agree: false });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [formSt, setFormSt] = useState<LoadingStatus>('idle');
  const [localMedia, setLocalMedia] = useState<MediaItem[]>([]);
  // คืนหน่วยความจำของไฟล์จากเครื่องตอนออกจากหน้า
  useEffect(() => () => localMedia.forEach((m) => URL.revokeObjectURL(m.src)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [dlg, setDlg] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [cmdSections, setCmdSections] = useState<string[]>([]);
  const cmdKey = useShortcutLabel('mod+K');
  const { choice, setChoice } = useTheme();
  useCommandHotkey(() => setCmd((o) => !o));
  // เปิด ⌘K → อ่านหัวข้อทั้งหมดในหน้า (เพิ่มหัวข้อใหม่แล้วค้นเจอเอง ไม่ต้องแก้รายการ)
  useEffect(() => { if (cmd) setCmdSections([...document.querySelectorAll('[data-gallery] > section > h2')].map((h) => h.textContent ?? '').filter(Boolean)); }, [cmd]);
  const cmdItems: CommandItem[] = [
    ...cmdSections.map((t) => ({
      id: `sec:${t}`, group: 'หัวข้อใน Gallery', label: t, icon: <Hash size={16} />,
      onSelect: () => [...document.querySelectorAll('[data-gallery] > section > h2')].find((h) => h.textContent === t)?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    })),
    { id: 'go:dash', group: 'ไปหน้าอื่น', label: 'Dashboard', icon: <BarChart3 size={16} />, keywords: ['charts', 'กราฟ'], onSelect: () => { window.location.href = '/dashboard'; } },
    { id: 'go:demo', group: 'ไปหน้าอื่น', label: 'ตัวอย่างแอป (login → หลังบ้าน)', icon: <LayoutDashboard size={16} />, keywords: ['demo', 'app', 'shell'], onSelect: () => { window.location.href = '/demo/login'; } },
    { id: 'act:theme', group: 'การทำงาน', label: choice === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด', icon: choice === 'dark' ? <Sun size={16} /> : <Moon size={16} />, keywords: ['theme', 'dark', 'light'], onSelect: () => setChoice(choice === 'dark' ? 'light' : 'dark') },
    { id: 'act:toast', group: 'การทำงาน', label: 'แสดง toast ตัวอย่าง', icon: <Bell size={16} />, keywords: ['notification'], onSelect: () => toast.success('สั่งงานจาก Command Palette สำเร็จ') },
    { id: 'act:dialog', group: 'การทำงาน', label: 'เปิด Dialog เพิ่มสมาชิก', icon: <User size={16} />, keywords: ['modal'], onSelect: () => setDlg(true) },
    { id: 'act:top', group: 'การทำงาน', label: 'เลื่อนขึ้นบนสุด', icon: <ArrowUp size={16} />, keywords: ['top'], onSelect: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];
  const [drw, setDrw] = useState<'right' | 'left' | 'bottom' | null>(null);
  const [dlgLock, setDlgLock] = useState(false);
  const [role, setRole] = useState<string | null>('editor');
  const [startDate, setStartDate] = useState('');
  const [teams, setTeams] = useState<string[]>(['ฝ่ายผลิต']);
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `คอร์ส ${i + 1}`, st: ['published', 'draft', 'archived'][i % 3], n: (i + 1) * 7 }))
    .filter((r) => r.name.includes(q) && (!status || r.st === status));
  return (
    <div {...(admin ? { 'data-surface': 'admin' } : {})} data-gallery className="mx-auto max-w-4xl space-y-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-2xl font-semibold">jb-components</h1>
          <Link href="/dashboard" className="rounded-pill bg-brand-100 px-3 py-1 text-xs font-bold text-brand-link transition hover:bg-brand-200">Dashboard →</Link>
          <Link href="/demo/login" className="rounded-pill bg-brand-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-brand-700">ตัวอย่างแอป (login → หลังบ้าน) →</Link>
          <Link href="/landing" className="rounded-pill bg-ink px-3 py-1 text-xs font-bold text-paper transition hover:opacity-90">ตัวอย่างหน้าบ้าน (landing) →</Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={admin} disabled={ci} onChange={(e) => setAdmin(e.target.checked)} /> admin surface{ci && ' (ปิดอยู่ระหว่างใช้สี CI)'}
          </label>
          <ThemeToggle />
        </div>
      </header>

      <Section title="สี CI">
        <CiPanel />
      </Section>

      <Section title="Tokens">
        <div className="space-y-3">
          {SCALES.map(([name, steps]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="w-16 text-sm text-ink-mute">{name}</span>
              {steps.map((s) => (
                <span key={s} title={`${name}-${s}`} className={`h-9 w-9 rounded-lg border border-ink/10 ${BG[`${name}-${s}`]}`} />
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink">ink</span><span className="text-ink-soft">ink-soft</span><span className="text-ink-mute">ink-mute</span>
            <span className="text-brand-link">brand-link</span>
            <span className="rounded-pill bg-brand-600 px-3 py-1 text-white">brand-600 + white</span>
            <span className="rounded-card bg-paper px-3 py-1">paper</span>
            <span className="rounded-card border border-ink/10 bg-surface px-3 py-1 shadow-lift">surface</span>
          </div>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs aria-label="status" value={tab} onChange={setTab}
          items={[{ key: 'all', label: 'ทั้งหมด', count: 12 }, { key: 'draft', label: 'ร่าง', count: 3 }, { key: 'pub', label: 'เผยแพร่แล้ว', count: 9 }]} />
      </Section>

      <Section title="PillSwitch / ThemeToggle">
        <PillSwitch label="TH/EN" index={sw} onChange={setSw} options={['TH', 'EN']} />
      </Section>

      <Section title="HelpTip">
        <p className="flex items-center gap-1 text-sm">ชื่อคอร์ส <HelpTip text="คำอธิบายที่ยาวกว่าหนึ่งบรรทัด กดไอคอนเพื่อเปิด ปิดด้วย Esc หรือคลิกนอกกล่อง" /></p>
      </Section>

      <Section title="ui.tsx: Button / Chip / Card / Progress / Skeleton">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['primary', 'dark', 'outline', 'ghost', 'danger'] as const).map((v) => <Button key={v} variant={v}>{v}</Button>)}
            <Button size="sm">sm</Button><Button disabled>disabled</Button>
          </div>
          <div className="flex gap-2">{(['brand', 'dark', 'mute', 'done'] as const).map((t) => <Chip key={t} tone={t}>{t}</Chip>)}</div>
          <Card>Card</Card>
          <Progress percent={60} />
          <Empty text="Empty (card)" description="ย่อจาก EmptyState" />
        </div>
      </Section>

      <Section title="Skeleton (shimmer)">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-40" /><Skeleton className="h-9 w-24 rounded-pill" /><Skeleton className="size-10 rounded-full" /><Skeleton className="h-16 w-28" />
          </div>
          <SkeletonText lines={3} className="max-w-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3 rounded-md" /><Skeleton className="h-3 w-2/3 rounded-md" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="space-y-3 p-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <SkeletonText lines={2} />
                <Skeleton className="h-9 w-24 rounded-pill" />
              </Card>
            ))}
          </div>
          <div className="divide-y divide-ink/10 rounded-2xl border border-ink/10">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded-md" /><Skeleton className="h-6 w-16 rounded-pill" /><Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Field / Input / Select / DatePicker">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อคอร์ส *" hint="ไม่เกิน 120 ตัวอักษร" help="คำอธิบายยาวๆ" field="name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="มี error" error="ต้องกรอกช่องนี้"><Input /></Field>
          <Field label="Textarea"><Textarea rows={2} /></Field>
          <Field label="Select" as="div">
            <Select variant="field" value={sel} onChange={(e) => setSel(e.target.value)}>
              <option value="a">ตัวเลือก A</option><option value="b">ตัวเลือก B</option><option value="c" disabled>ตัวเลือก C</option>
            </Select>
          </Field>
          <Field label="DatePicker" as="div"><DatePicker value={date} onChange={setDate} clearable variant="field" /></Field>
          <Field label="DatePicker + เวลา" as="div"><DatePicker value="" onChange={() => {}} withTime variant="pill" /></Field>
        </div>
      </Section>

      <Section title="ฟอร์มตัวอย่าง: เอฟเฟกต์ตอนกรอกผิด">
        <form
          noValidate className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const err: Record<string, string> = {};
            if (!form.name.trim()) err.name = 'กรุณากรอกชื่อ';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) err.email = form.email ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'กรุณากรอกอีเมล';
            if (form.qty == null) err.qty = 'ระบุจำนวน';
            if (!form.dept) err.dept = 'เลือกแผนก';
            if (!form.agree) err.agree = 'ต้องยอมรับเงื่อนไขก่อน';
            setFormErr(err);
            if (Object.keys(err).length) return;
            setFormSt('loading');
            setTimeout(() => { setFormSt('success'); setTimeout(() => setFormSt('idle'), 1800); }, 1200);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ-นามสกุล *" error={formErr.name} hint="ตามบัตรประชาชน">
              <Input value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFormErr(({ name: _, ...r }) => r); }} />
            </Field>
            <Field label="อีเมล *" error={formErr.email}>
              <Input type="email" value={form.email} onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setFormErr(({ email: _, ...r }) => r); }} placeholder="name@company.com" />
            </Field>
            <Field label="จำนวน (1–20) *" error={formErr.qty} hint="ลองพิมพ์ 50 หรือกด + จนสุด" as="div">
              <NumberInput aria-label="จำนวน" value={form.qty} min={1} max={20} onChange={(v) => { setForm((f) => ({ ...f, qty: v })); setFormErr(({ qty: _, ...r }) => r); }} />
            </Field>
            <Field label="แผนก *" error={formErr.dept} as="div">
              <Combobox options={DEPT_OPTIONS} value={form.dept} onChange={(v) => { setForm((f) => ({ ...f, dept: v })); setFormErr(({ dept: _, ...r }) => r); }} placeholder="เลือกแผนก" />
            </Field>
          </div>
          <Field label="เงื่อนไข" error={formErr.agree} as="div">
            <Checkbox label="ยอมรับข้อตกลงการใช้งาน" checked={form.agree} onChange={(e) => { setForm((f) => ({ ...f, agree: e.target.checked })); setFormErr(({ agree: _, ...r }) => r); }} />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <LoadingButton type="submit" status={formSt} loadingText="กำลังส่ง" successText="ส่งแล้ว">ส่งแบบฟอร์ม</LoadingButton>
            <Button type="button" variant="ghost" onClick={() => { setForm({ name: '', email: '', qty: null, dept: null, agree: false }); setFormErr({}); }}>ล้าง</Button>
            <span className="text-xs text-ink-mute">กดส่งตอนยังว่าง → ช่องที่ผิดสั่น ข้อความเลื่อนลงมา · แก้แล้วข้อความหายเอง</span>
          </div>
        </form>
      </Section>

      <Section title="DateRangePicker (เลือกช่วงวันที่)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="มีค่าสำเร็จรูป + ล้างได้" as="div"><DateRangePicker value={range} onChange={setRange} clearable variant="field" /></Field>
          <Field label="ไม่มีค่าสำเร็จรูป · ปี 2569 · ยาวสุด 14 วัน" as="div"><DateRangePicker value={range2} onChange={setRange2} presets={false} min="2026-01-01" max="2026-12-31" maxDays={14} variant="field" /></Field>
          <Field label="แบบกะทัดรัด (เลือกเฉพาะบางค่าสำเร็จรูป)" as="div"><DateRangePicker value={range3} onChange={setRange3} presets={['last7', 'last30', 'thisMonth']} variant="compact" placeholder="ช่วงที่ต้องการ" /></Field>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ range, range2, range3 })}</p>
      </Section>

      <Section title="Combobox (ค้นหา + เลือกหลายอัน)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="เลือกอันเดียว + ค้นหา" as="div"><Combobox options={DEPT_OPTIONS} value={cbOne} onChange={setCbOne} clearable placeholder="เลือกแผนก" /></Field>
          <Field label="เลือกหลายอัน (ชิป)" as="div"><Combobox multiple options={DEPT_OPTIONS} value={cbMany} onChange={setCbMany} clearable /></Field>
          <Field label="แท็ก: สูงสุด 3 + พิมพ์เพิ่มใหม่ได้" as="div">
            <Combobox
              multiple options={tagOptions} value={cbTags} onChange={setCbTags} maxSelected={3} placeholder="เพิ่มแท็ก…"
              onCreate={(label) => { setTagOptions((o) => [...o, { value: label, label }]); setCbTags((v) => (v.length < 3 ? [...v, label] : v)); }}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="มีข้อผิดพลาด" error="กรุณาเลือกอย่างน้อย 1 แผนก" as="div"><Combobox multiple options={DEPT_OPTIONS} value={[]} onChange={() => {}} /></Field>
          <Field label="ปิดใช้งาน" as="div"><Combobox multiple options={DEPT_OPTIONS} value={['hr']} onChange={() => {}} disabled /></Field>
          <Field label="กะทัดรัด + เลือกเยอะ (ชิปยุบเป็น +N)" as="div"><Combobox multiple variant="compact" options={DEPT_OPTIONS} value={['production', 'warehouse', 'logistics', 'hr', 'maintenance']} onChange={() => {}} /></Field>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ cbOne, cbMany, cbTags })}</p>
      </Section>

      <Section title="Checkbox / Radio / Switch">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-ink-soft">Checkbox (มีสถานะเลือกบางส่วน)</p>
            <Checkbox
              label="สิทธิ์ทั้งหมด" checked={perms.length === PERMS.length} indeterminate={perms.length > 0 && perms.length < PERMS.length}
              onChange={(e) => setPerms(e.target.checked ? PERMS.map((x) => x.key) : [])}
            />
            <div className="ml-2.5 flex flex-col gap-3 border-l border-ink/10 pl-5">
              {PERMS.map((x) => (
                <Checkbox
                  key={x.key} label={x.label} description={x.description} checked={perms.includes(x.key)}
                  onChange={(e) => setPerms((v) => (e.target.checked ? [...v, x.key] : v.filter((k) => k !== x.key)))}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              <Checkbox size="sm" label="ขนาดเล็ก" defaultChecked />
              <Checkbox label="ปิดใช้งาน" disabled />
              <Checkbox label="ปิด + ติ๊กแล้ว" disabled defaultChecked />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-soft">Switch (มีผลทันที)</p>
            <div className="divide-y divide-ink/10 rounded-2xl border border-ink/10 px-4">
              <Switch className="w-full py-3" placement="start" label="แจ้งเตือนทางอีเมล" description="เมื่อมีคนมอบหมายงานให้คุณ" checked={notif.email} onChange={(e) => setNotif((n) => ({ ...n, email: e.target.checked }))} />
              <Switch className="w-full py-3" placement="start" label="Push notification" description="บนมือถือที่ติดตั้งแอป" checked={notif.push} onChange={(e) => setNotif((n) => ({ ...n, push: e.target.checked }))} />
              <Switch className="w-full py-3" placement="start" label="สรุปรายสัปดาห์" checked={notif.digest} onChange={(e) => setNotif((n) => ({ ...n, digest: e.target.checked }))} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Switch size="sm" label="ขนาดเล็ก" defaultChecked />
              <Switch label="ปิดใช้งาน" disabled />
              <Switch label="ปิด + เปิดอยู่" disabled defaultChecked />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-soft">RadioGroup</p>
            <RadioGroup label="ไซซ์" value={size} onChange={setSize} options={[{ value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }, { value: 'xl', label: 'XL (หมด)', disabled: true }]} />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-soft">RadioGroup แบบการ์ด</p>
            <RadioGroup label="วิธีจัดส่ง" variant="card" orientation="horizontal" value={ship} onChange={setShip} options={SHIPPING} />
          </div>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ perms, size, ship, notif })}</p>
      </Section>

      <Section title="SegmentedControl">
        <div className="flex flex-wrap items-center gap-4">
          <SegmentedControl label="ช่วงเวลา" value={period} onChange={setPeriod} options={[{ value: 'day', label: 'วัน' }, { value: 'week', label: 'สัปดาห์' }, { value: 'month', label: 'เดือน' }, { value: 'year', label: 'ปี' }]} />
          <SegmentedControl
            label="มุมมอง" value={view} onChange={setView}
            options={[{ value: 'list', label: '', icon: <List size={16} />, 'aria-label': 'รายการ' }, { value: 'grid', label: '', icon: <LayoutGrid size={16} />, 'aria-label': 'ตาราง' }, { value: 'rows', label: '', icon: <Rows3 size={16} />, 'aria-label': 'แถว' }]}
          />
          <SegmentedControl size="sm" label="ช่วงเวลา (เล็ก)" value={period} onChange={setPeriod} options={[{ value: 'day', label: 'วัน', icon: <CalendarDays size={13} /> }, { value: 'week', label: 'สัปดาห์' }, { value: 'month', label: 'เดือน' }, { value: 'year', label: 'ปี' }]} />
        </div>
        <SegmentedControl
          className="mt-4" fullWidth label="สถานะ" value={tone} onChange={setTone}
          options={[{ value: 'all', label: 'ทั้งหมด' }, { value: 'open', label: 'เปิดอยู่' }, { value: 'closed', label: 'ปิดแล้ว' }, { value: 'draft', label: 'ร่าง (ปิด)', disabled: true }]}
        />
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ period, view, tone })}</p>
      </Section>

      <Section title="Slider / Range slider">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <Field label={`ระดับเสียง ${volume}%`} as="div">
            <Slider label="ระดับเสียง" value={volume} onChange={setVolume} format={(v) => `${v}%`} marks={[0, 25, 50, 75, 100].map((v) => ({ value: v, label: `${v}` }))} />
          </Field>
          <Field label={`ช่วงราคา ${baht(price[0])} – ${baht(price[1])}`} hint={`ยิง API ตอนปล่อยปุ่ม: ${baht(committed[0])} – ${baht(committed[1])}`} as="div">
            <Slider range label="ช่วงราคา" min={0} max={10000} step={500} minGap={500} value={price} onChange={setPrice} onCommit={setCommitted} format={baht} />
          </Field>
          <Field label="คะแนนขั้นละ 0.5 · ป้ายค่าโชว์ตลอด" as="div">
            <Slider label="คะแนน" min={0} max={5} step={0.5} value={rating} onChange={setRating} tooltip="always" format={(v) => `★ ${v.toFixed(1)}`} />
          </Field>
          <Field label="ปิดใช้งาน" as="div">
            <Slider label="ปิดใช้งาน" value={30} onChange={() => {}} disabled />
          </Field>
        </div>
      </Section>

      <Section title="NumberInput">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="จำนวน (1–99)" as="div"><NumberInput aria-label="จำนวน" value={qty} onChange={setQty} min={1} max={99} /></Field>
          <Field label="ราคา (ทศนิยม 2 ตำแหน่ง)" as="div"><NumberInput aria-label="ราคา" value={amount} onChange={setAmount} min={0} step={100} precision={2} prefix="฿" /></Field>
          <Field label="น้ำหนัก (ขั้นละ 0.5)" hint="ว่างได้ · ลองกด ↑↓ หรือ Shift+↑↓" as="div"><NumberInput aria-label="น้ำหนัก" value={weight} onChange={setWeight} min={0} max={200} step={0.5} suffix="กก." placeholder="ไม่ระบุ" /></Field>
          <Field label="ไม่มีปุ่ม (ใส่ comma ให้)" as="div"><NumberInput aria-label="งบประมาณ" value={big} onChange={setBig} hideButtons min={0} suffix="บาท" /></Field>
          <Field label="กะทัดรัด" as="div"><NumberInput aria-label="กะทัดรัด" variant="compact" value={qty} onChange={setQty} min={1} max={99} /></Field>
          <Field label="มีข้อผิดพลาด" error="ต้องไม่เกินสต็อก (12)" as="div"><NumberInput aria-label="สต็อก" value={20} onChange={() => {}} /></Field>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ qty, amount, weight, big })}</p>
      </Section>

      <Section title="FileDrop (ลากวางหลายไฟล์ + ความคืบหน้า)">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="รูปภาพ · สูงสุด 4 ไฟล์ · ไฟล์ละไม่เกิน 5 MB" as="div">
            <FileDrop upload={fakeUpload} onChange={setUploaded} accept="image/*" maxFiles={4} maxSize={5 * 1024 * 1024} />
          </Field>
          <Field label="เอกสารอะไรก็ได้" hint='อัปโหลดจำลอง · ไฟล์ที่ชื่อมีคำว่า "error" จะล้มกลางทาง ให้ลองปุ่มลองใหม่' as="div">
            <FileDrop upload={fakeUpload} onChange={setDocs} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,image/*" hint="PDF, Word, Excel, CSV, รูปภาพ, ZIP" />
          </Field>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ uploaded: uploaded.map((f) => f.value), docs: docs.map((f) => f.value) })}</p>
      </Section>

      <Section title="Breadcrumb">
        <div className="space-y-4">
          <Breadcrumb items={CRUMBS.slice(0, 3).concat([{ label: 'รายงาน' }])} />
          <Breadcrumb items={CRUMBS} maxItems={4} />
          <Breadcrumb items={CRUMBS} separator="slash" maxItems={10} />
          <p className="text-xs text-ink-mute">แถวที่สองยุบตรงกลางเป็น "…" (กดดูหน้าที่ซ่อน) · จอแคบ: เหลือ "… › หน้าแม่ › หน้าปัจจุบัน"</p>
        </div>
      </Section>

      <Section title="CommandPalette (⌘K / Ctrl+K)">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button" onClick={() => setCmd(true)}
            className="flex h-10 w-72 max-w-full items-center gap-2.5 rounded-pill border border-ink/10 bg-surface pl-3.5 pr-1.5 text-sm text-ink-mute transition hover:border-ink/20 hover:text-ink-soft"
          >
            <Search size={15} /><span className="flex-1 text-left">ค้นหาหัวข้อหรือคำสั่ง…</span>
            <Kbd keys="mod+K" />
          </button>
          <span className="text-xs text-ink-mute">หรือกด {cmdKey} ที่ไหนก็ได้ในหน้านี้ (Mac ใช้ ⌘ · Windows ใช้ Ctrl) · ลองพิมพ์ "slider", "ธีม", "dialog"</span>
        </div>
        <p className="mt-3 text-xs text-ink-mute">AppShell (sidebar + topbar) ดูได้ใน <Link href="/demo/login" className="font-semibold text-brand-link hover:underline">ตัวอย่างแอป</Link> — ที่นั่นปุ่มลัดเดียวกันค้นเมนู คำสั่ง และสินค้าได้</p>
        <CommandPalette open={cmd} onOpenChange={setCmd} items={cmdItems} placeholder="ค้นหาหัวข้อใน Gallery หรือคำสั่ง…" />
      </Section>

      <Section title="Tooltip / Popover / DropdownMenu">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-xl border border-ink/10 p-1">
              {([['b', 'ตัวหนา', 'mod+B', Bold], ['i', 'ตัวเอียง', 'mod+I', Italic], ['u', 'ขีดเส้นใต้', 'mod+U', Underline]] as const).map(([k, name, key, Icon]) => (
                <Tooltip key={k} content={<span className="flex items-center gap-2">{name}<Kbd keys={key} variant="text" className="opacity-60" /></span>}>
                  <button
                    type="button" aria-label={name} aria-pressed={fmt[k]} onClick={() => setFmt((f) => ({ ...f, [k]: !f[k] }))}
                    className={`grid size-8 place-items-center rounded-lg transition ${fmt[k] ? 'bg-brand-100 text-brand-link' : 'text-ink-mute hover:bg-ink/[0.06] hover:text-ink'}`}
                  ><Icon size={16} /></button>
                </Tooltip>
              ))}
            </div>
            <Tooltip content="ป้ายอยู่ด้านล่าง" side="bottom"><Button variant="outline" size="sm">side=bottom</Button></Tooltip>
            <Tooltip content="ป้ายอยู่ด้านขวา" side="right"><Button variant="outline" size="sm">side=right</Button></Tooltip>
            <Tooltip content="ข้อความยาวจะตัดบรรทัดเองไม่เกินความกว้างสูงสุด เหมาะกับคำอธิบายสั้นๆ สองสามบรรทัดเท่านั้น"><Button variant="ghost" size="sm">ข้อความยาว</Button></Tooltip>
            <Tooltip content="ปุ่มนี้ปิดอยู่เพราะยังไม่ได้เลือกแถว">
              <span tabIndex={0} className="rounded-pill"><Button size="sm" disabled>ลบที่เลือก</Button></span>
            </Tooltip>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover
              label="ตัวกรอง" align="start"
              trigger={<Button variant="outline" size="sm"><Filter size={14} /> ตัวกรอง</Button>}
            >
              {(close) => (
                <div className="w-64 space-y-3">
                  <p className="text-sm font-semibold">ตัวกรอง</p>
                  <Field label="ชื่อมีคำว่า"><Input placeholder="พิมพ์คำค้น" className="h-10" /></Field>
                  <Field label="สถานะ" as="div"><SegmentedControl size="sm" fullWidth value={tone} onChange={setTone} options={[{ value: 'all', label: 'ทั้งหมด' }, { value: 'open', label: 'เปิด' }, { value: 'closed', label: 'ปิด' }]} /></Field>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="ghost" size="sm" onClick={close}>ยกเลิก</Button>
                    <Button size="sm" onClick={() => { close(); toast.success('ใช้ตัวกรองแล้ว'); }}>ใช้ตัวกรอง</Button>
                  </div>
                </div>
              )}
            </Popover>
            <Popover
              side="top" label="โปรไฟล์"
              trigger={<button type="button" aria-label="ดูโปรไฟล์ สมชาย ใจดี" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"><Avatar name="สมชาย ใจดี" seed={3} size={32} /></button>}
            >
              <div className="flex w-56 items-center gap-3">
                <Avatar name="สมชาย ใจดี" seed={3} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">สมชาย ใจดี</p>
                  <p className="truncate text-xs text-ink-mute">หัวหน้าฝ่ายผลิต · บางนา</p>
                </div>
              </div>
            </Popover>

            <DropdownMenu
              trigger={<Button variant="outline" size="sm">การทำงาน <ChevronDown size={14} /></Button>}
              items={[
                { label: 'แก้ไข', icon: <Pencil size={15} />, shortcut: 'mod+E', onSelect: () => setLastAction('แก้ไข') },
                { label: 'ทำสำเนา', icon: <Copy size={15} />, shortcut: 'mod+D', onSelect: () => setLastAction('ทำสำเนา') },
                { label: 'แชร์', icon: <Share2 size={15} />, description: 'ส่งลิงก์ให้คนในทีม', onSelect: () => setLastAction('แชร์') },
                { label: 'ส่งออก PDF (ปิด)', icon: <FileDown size={15} />, disabled: true },
                { type: 'separator' },
                { label: 'ลบ', icon: <Trash2 size={15} />, danger: true, shortcut: 'del', onSelect: () => setLastAction('ลบ') },
              ]}
            />
            <DropdownMenu
              label="คอลัมน์ที่แสดง"
              trigger={<Button variant="ghost" size="sm"><LayoutGrid size={14} /> คอลัมน์</Button>}
              items={[
                { type: 'label', label: 'แสดงคอลัมน์' },
                ...(([['name', 'ชื่อ'], ['status', 'สถานะ'], ['owner', 'ผู้รับผิดชอบ'], ['updated', 'แก้ไขล่าสุด']] as const).map(([k, l]) => ({
                  type: 'checkbox' as const, label: l, checked: cols[k], disabled: k === 'name', onCheckedChange: (v: boolean) => setCols((c) => ({ ...c, [k]: v })),
                }))),
              ]}
            />
            <DropdownMenu
              align="end"
              trigger={<button type="button" aria-label="บัญชีของฉัน" className="flex items-center gap-1.5 rounded-pill py-1 pl-1 pr-2 transition hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"><Avatar name="Somchai" seed={3} size={28} /><ChevronDown size={14} className="text-ink-mute" /></button>}
              items={[
                { type: 'label', label: 'somchai@example.com' },
                { label: 'โปรไฟล์', icon: <User size={15} />, href: '/' },
                { label: 'การแจ้งเตือน', icon: <Bell size={15} />, onSelect: () => setLastAction('การแจ้งเตือน') },
                { label: 'ตั้งค่า', icon: <Settings size={15} />, shortcut: 'mod+,', onSelect: () => setLastAction('ตั้งค่า') },
                { type: 'separator' },
                { label: 'ออกจากระบบ', icon: <LogOut size={15} />, onSelect: () => setLastAction('ออกจากระบบ') },
              ]}
            />
          </div>
          <p className="break-all font-mono text-xs text-ink-mute">{JSON.stringify({ lastAction, cols })}</p>
          <p className="text-xs text-ink-mute">ลองคีย์บอร์ด: Tab ไปที่ปุ่มเมนู → ↓ เปิด → ↑↓ / พิมพ์ตัวอักษรกระโดด (เช่น "ล") → Enter · Esc ปิด · ปุ่มหน้า tooltip: ชี้ค้างแล้วเลื่อนไปปุ่มข้างๆ ป้ายเปลี่ยนทันที</p>
        </div>
      </Section>

      <Section title="Accordion / Collapse">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink-soft">FAQ · เปิดทีละข้อ (card)</p>
            <Accordion items={FAQ} defaultValue="ship" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink-soft">ตั้งค่า · เปิดได้หลายข้อ (separated · controlled)</p>
            <Accordion type="multiple" variant="separated" items={SETTINGS_ACC} value={acc} onValueChange={setAcc} />
            <p className="break-all font-mono text-xs text-ink-mute">{JSON.stringify(acc)}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink-soft">flush (วางในการ์ดอื่น)</p>
            <Accordion variant="flush" items={FAQ.slice(0, 3)} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink-soft">Collapse เปล่าๆ (ห่ออะไรก็ได้)</p>
            <Card className="border border-ink/10 shadow-none">
              <p className="text-sm">ผลิตภัณฑ์นมเปรี้ยวรสผลไม้ บรรจุขวด 180 มล. เก็บในตู้เย็น 2–8°C</p>
              <Collapse open={more}>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  <li>พลังงาน 110 กิโลแคลอรี ต่อขวด</li><li>น้ำตาล 14 กรัม</li><li>อายุ 21 วันนับจากวันผลิต</li>
                </ul>
              </Collapse>
              <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className="mt-2 text-xs font-semibold text-brand-link hover:underline">
                {more ? 'ย่อ' : 'ดูข้อมูลโภชนาการ'}
              </button>
            </Card>
          </div>
        </div>
      </Section>

      <Section title="Stepper">
        <Stepper steps={CHECKOUT} current={step} onStepClick={setStep} />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="shrink-0" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>ย้อนกลับ</Button>
          <Button size="sm" className="shrink-0" disabled={step === CHECKOUT.length} onClick={() => setStep((s) => s + 1)}>{step >= CHECKOUT.length - 1 ? 'เสร็จสิ้น' : 'ถัดไป'}</Button>
          <span className="text-xs text-ink-mute">กดขั้นที่ผ่านแล้วเพื่อย้อนกลับได้</span>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold text-ink-soft">แนวตั้ง + เนื้อหาใต้ขั้นปัจจุบัน</p>
            <Stepper
              orientation="vertical" current={vstep} onStepClick={setVstep}
              steps={[
                { title: 'สร้างบัญชี', description: 'อีเมลและรหัสผ่าน' },
                { title: 'ยืนยันอีเมล', description: 'กรอกรหัส 6 หลัก', content: <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setVstep(2)}>ยืนยันแล้ว</Button><Button size="sm" variant="ghost">ส่งรหัสอีกครั้ง</Button></div> },
                { title: 'ตั้งค่าโปรไฟล์', optional: true, content: <div className="flex gap-2"><Button size="sm" onClick={() => setVstep(3)}>บันทึก</Button><Button size="sm" variant="ghost" onClick={() => setVstep(3)}>ข้าม</Button></div> },
                { title: 'เริ่มใช้งาน', content: <p className="text-sm text-ink-soft">พร้อมแล้ว 🎉</p> },
              ]}
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold text-ink-soft">มีขั้นที่ผิดพลาด</p>
            <Stepper
              orientation="vertical" current={2}
              steps={[{ title: 'อัปโหลดไฟล์', description: 'products.csv' }, { title: 'ตรวจข้อมูล', description: 'พบ 3 แถวที่รหัสซ้ำ', error: true }, { title: 'นำเข้า' }]}
            />
          </div>
        </div>
      </Section>

      <Section title="TagInput">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="แท็ก (พื้นฐาน)" hint="Enter หรือ , เพื่อเพิ่ม · Backspace สองครั้งลบตัวท้าย · ดับเบิลคลิกเพื่อแก้" as="div">
            <TagInput aria-label="แท็ก" value={tags} onChange={setTags} />
          </Field>
          <Field label="ทักษะ (สีประจำแท็ก · สูงสุด 6)" hint='ลองพิมพ์ "gmp" ซ้ำ → ชิปเดิมสั่น' as="div">
            <TagInput aria-label="ทักษะ" variant="colorful" value={skills} onChange={setSkills} max={6} />
          </Field>
          <Field label="เชิญทางอีเมล (ตรวจรูปแบบ)" hint="วางรายชื่อหลายบรรทัด/คั่น comma ได้ทีเดียว" as="div">
            <TagInput
              aria-label="อีเมล" value={emails} onChange={setEmails} placeholder="name@company.com"
              validate={(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)} invalidText="อีเมลไม่ถูกต้อง" transform={(v) => v.toLowerCase()}
            />
          </Field>
          <Field label="แฮชแท็ก (ตัด # ให้ · ยาวไม่เกิน 20)" as="div">
            <TagInput aria-label="แฮชแท็ก" variant="colorful" value={hashtags} onChange={setHashtags} maxLength={20} transform={(v) => v.replace(/^#+/, '')} placeholder="#ท่องเที่ยว #กาแฟ" />
          </Field>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-ink-mute">{JSON.stringify({ tags, skills, emails, hashtags })}</p>
      </Section>

      <Section title="Loading">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {(['ring', 'dots', 'bars', 'orbit', 'pulse', 'grid'] as LoaderVariant[]).map((v) => (
              <div key={v} className="flex flex-col items-center gap-3 rounded-2xl border border-ink/10 py-5">
                <Loader variant={v} size={36} />
                <span className="font-mono text-[11px] text-ink-mute">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LoadingButton
              status={saveSt} loadingText="กำลังบันทึก" successText="บันทึกแล้ว"
              onClick={() => { setSaveSt('loading'); setTimeout(() => { setSaveSt('success'); setTimeout(() => setSaveSt('idle'), 1800); }, 1600); }}
            >
              บันทึกการเปลี่ยนแปลง
            </LoadingButton>
            <LoadingButton
              variant="dark" status={paySt} successText="ชำระแล้ว" errorText="บัตรถูกปฏิเสธ"
              onClick={() => { setPaySt('loading'); setTimeout(() => { setPaySt('error'); setTimeout(() => setPaySt('idle'), 2000); }, 1400); }}
            >
              ชำระเงิน ฿1,290
            </LoadingButton>
            <span className="text-xs text-ink-mute">ปุ่มแรกสำเร็จ · ปุ่มที่สองจำลองล้มเหลว</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setTopLoading(true); setTimeout(() => setTopLoading(false), 2600); }} disabled={topLoading}>
              ลองแถบโหลดด้านบนจอ
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setOverlay(true); setTimeout(() => setOverlay(false), 2400); }} disabled={overlay}>
              ลองม่านโหลดบนการ์ด
            </Button>
          </div>
          <TopProgress active={topLoading} />

          <LoadingOverlay show={overlay} label="กำลังโหลดยอดขาย" variant="orbit">
            <div className="grid gap-3 sm:grid-cols-3">
              {[['ยอดขายวันนี้', '฿48,200', '+12%'], ['คำสั่งซื้อ', '326', '+4%'], ['ลูกค้าใหม่', '58', '−3%']].map(([k, v, d]) => (
                <Card key={k} className="border border-ink/10 shadow-none">
                  <p className="text-xs text-ink-mute">{k}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
                  <p className="text-xs text-ink-soft">{d} จากเมื่อวาน</p>
                </Card>
              ))}
            </div>
          </LoadingOverlay>
        </div>
      </Section>

      <Section title="Carousel (ลาก/ปัดได้ · เลื่อนเอง · ซูมช้าๆ)">
        <Carousel autoplay={5000} label="ภาพเด่น" className="overflow-hidden" slideClassName="rounded-card">
          {HERO.map((h) => (
            <div key={h.id} className="relative aspect-[16/9] bg-ink/10 sm:aspect-[16/7]">
              <img src={pic(h.id, 1600, 900)} alt={h.title} loading="lazy" decoding="async" draggable={false} className="kenburns absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div data-caption className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{h.tag}</span>
                <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{h.title}</h3>
                <p className="mt-1 text-xs text-white/75">ภาพ: {h.author} · Unsplash</p>
              </div>
            </div>
          ))}
        </Carousel>

        <h3 className="mb-3 mt-8 text-sm font-semibold text-ink-soft">หลายใบต่อหน้า (ตามความกว้างกล่อง) · ไม่วน</h3>
        <Carousel perView={{ 0: 1, 520: 2, 860: 3 }} gap={16} loop={false} label="การ์ดแนะนำ">
          {CARDS.map((c) => (
            <article key={c.id} className="group overflow-hidden rounded-card border border-ink/10 bg-surface">
              <div className="aspect-[4/3] overflow-hidden bg-ink/10">
                <img src={pic(c.id, 800, 600)} alt={c.title} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
              </div>
              <div className="space-y-1 p-4">
                <p className="text-[11px] font-semibold text-brand-link">{c.tag}</p>
                <h4 className="font-semibold">{c.title}</h4>
                <p className="text-xs text-ink-mute">ภาพ: {c.author}</p>
              </div>
            </article>
          ))}
        </Carousel>
      </Section>

      <Section title="Marquee (วนไม่รู้จบ · ชี้แล้วหยุด)">
        <div className="space-y-4">
          <Marquee speed={36} label="พันธมิตร">
            {LOGOS.map(([name, Icon]) => (
              <span key={name} className="flex items-center gap-2 rounded-pill border border-ink/10 bg-surface px-4 py-2 text-sm font-semibold text-ink-soft">
                <Icon size={16} className="text-brand-link" /> {name}
              </span>
            ))}
          </Marquee>
          <Marquee speed={28} direction="right" label="พันธมิตร (สวนทาง)">
            {[...LOGOS].reverse().map(([name, Icon]) => (
              <span key={name} className="flex items-center gap-2 rounded-pill bg-ink/[.05] px-4 py-2 text-sm font-semibold text-ink-mute">
                <Icon size={16} /> {name}
              </span>
            ))}
          </Marquee>
          <Marquee speed={45} gap={14} label="แกลเลอรีรูป">
            {MARQUEE_PICS.map((id) => (
              <img key={id} src={pic(id, 400, 300)} alt="" loading="lazy" decoding="async" draggable={false} className="h-28 w-40 rounded-2xl object-cover shadow-card sm:h-32 sm:w-44" />
            ))}
          </Marquee>
        </div>
      </Section>

      <Section title="toast">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => toast.success('บันทึกการเปลี่ยนแปลงแล้ว')}>success</Button>
          <Button size="sm" variant="outline" onClick={() => toast.error('อัปโหลดไม่สำเร็จ', { description: 'ไฟล์ใหญ่เกิน 10 MB', action: { label: 'ลองใหม่', onClick: () => toast.info('กำลังลองใหม่…') } })}>error + ปุ่ม</Button>
          <Button size="sm" variant="outline" onClick={() => toast.warning('ใกล้หมดเวลาเซสชัน', { description: 'จะออกจากระบบอัตโนมัติใน 5 นาที' })}>warning</Button>
          <Button size="sm" variant="outline" onClick={() => toast.info('มีเวอร์ชันใหม่ของแอป')}>info</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success('ย้ายไปถังขยะแล้ว', { action: { label: 'เลิกทำ', onClick: () => toast.info('กู้คืนแล้ว') } })}>เลิกทำ (undo)</Button>
          <Button size="sm" variant="dark" onClick={() => { void toast.promise(new Promise((r) => setTimeout(() => r(12), 1800)), { loading: 'กำลังซิงก์ข้อมูล…', success: (n) => `ซิงก์แล้ว ${n} รายการ`, error: 'ซิงก์ไม่สำเร็จ' }); }}>promise สำเร็จ</Button>
          <Button size="sm" variant="ghost" onClick={() => { void toast.promise(new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1800)), { loading: 'กำลังส่งอีเมล…', success: 'ส่งแล้ว', error: (e) => `ส่งไม่สำเร็จ (${(e as Error).message})` }).catch(() => {}); }}>promise ล้มเหลว</Button>
        </div>
        <p className="mt-3 text-xs text-ink-mute">ชี้เมาส์ที่กล่อง = หยุดนับถอยหลัง · ปัดซ้าย/ขวาเพื่อปิด · แสดงพร้อมกันสูงสุด 4 อัน</p>
      </Section>

      <Section title="admin/kit: Table · Toolbar · Pagination · RowMenu">
        <div className="space-y-3">
          <Toolbar q={q} onSearch={(v) => { setQ(v); setPage(1); }} placeholder="ค้นหาคอร์ส…">
            <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: '', label: 'ทุกสถานะ' }, { value: 'published', label: 'เผยแพร่' }, { value: 'draft', label: 'ร่าง' }]} />
          </Toolbar>
          <DataTable
            rows={rows.slice((page - 1) * perPage, page * perPage)}
            columns={[
              { key: 'name', header: 'ชื่อ', render: (r) => r.name },
              { key: 'st', header: 'สถานะ', className: 'w-36', render: (r) => <StatusBadge status={r.st} /> },
              { key: 'n', header: 'จำนวน', className: 'w-28 text-right', render: (r) => r.n },
              { key: 'm', header: '', className: 'w-14', render: (r) => (
                <RowMenu items={[{ label: 'แก้ไข', icon: <Pencil size={14} />, onClick: () => toast.info(`แก้ไข ${r.id}`) }, { label: 'ลบ', icon: <Trash2 size={14} />, danger: true, onClick: () => toast.error(`ลบ ${r.id}`) }]} />
              ) },
            ]}
          />
          <Pagination page={page} pages={Math.max(1, Math.ceil(rows.length / perPage))} total={rows.length} onChange={setPage} perPage={perPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }} />
          <DataTable rows={[]} columns={[{ key: 'a', header: 'ว่าง', render: () => null }]} />
        </div>
      </Section>

      <Section title="Dialog / Drawer / confirmDialog">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setDlg(true)}><Plus size={14} /> เพิ่มสมาชิก (Dialog)</Button>
            <Button size="sm" variant="outline" onClick={() => setDlgLock(true)}>ฟอร์มที่ปิดเองไม่ได้</Button>
            <Button size="sm" variant="outline" onClick={() => setDrw('right')}>Drawer ขวา</Button>
            <Button size="sm" variant="outline" onClick={() => setDrw('left')}>Drawer ซ้าย</Button>
            <Button size="sm" variant="outline" onClick={() => setDrw('bottom')}>Drawer ล่าง</Button>
            <Button size="sm" variant="danger" onClick={async () => toast.info((await confirmDialog('ลบโปรเจกต์นี้?', { danger: true, description: 'งานและไฟล์ทั้งหมดในโปรเจกต์จะถูกลบถาวร กู้คืนไม่ได้', confirmLabel: 'ลบโปรเจกต์' })) ? 'ลบแล้ว' : 'ยกเลิก')}>ยืนยันการลบ</Button>
            <Button size="sm" variant="ghost" onClick={async () => toast.info((await confirmDialog('ส่งรายงานให้หัวหน้า?', { description: 'หัวหน้าจะได้รับอีเมลแจ้งเตือนทันที' })) ? 'ส่งแล้ว' : 'ยกเลิก')}>ยืนยันทั่วไป</Button>
          </div>
          <p className="text-xs text-ink-mute">จอแคบ: Dialog กลายเป็นแผ่นเลื่อนจากล่าง ปัดลงที่หัวเพื่อปิด · Drawer ปัดกลับทางขอบเพื่อปิด · ใน Drawer ลองกด "ลบ" → confirm ซ้อนอีกชั้น (Esc ปิดทีละชั้น)</p>
        </div>

        <Dialog
          open={dlg} onClose={() => setDlg(false)} size="md" icon={<User size={20} />}
          title="เพิ่มสมาชิกทีม" description="สมาชิกใหม่จะได้รับอีเมลเชิญเข้าร่วมพื้นที่ทำงาน"
          footer={<><Button variant="ghost" onClick={() => setDlg(false)}>ยกเลิก</Button><Button onClick={() => { setDlg(false); toast.success('ส่งคำเชิญแล้ว'); }}>ส่งคำเชิญ</Button></>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ"><Input placeholder="สมชาย ใจดี" /></Field>
            <Field label="อีเมล"><Input type="email" placeholder="somchai@company.com" /></Field>
          </div>
          <Field label="บทบาท" as="div">
            <RadioGroup
              label="บทบาท" variant="card" orientation="horizontal" value={role} onChange={setRole}
              options={[{ value: 'viewer', label: 'ผู้ชม', description: 'ดูได้อย่างเดียว' }, { value: 'editor', label: 'ผู้แก้ไข', description: 'แก้ไขเนื้อหาได้' }, { value: 'admin', label: 'ผู้ดูแล', description: 'จัดการทุกอย่าง' }]}
            />
          </Field>
          <Field label="ทีม" as="div"><TagInput aria-label="ทีม" variant="colorful" value={teams} onChange={setTeams} placeholder="พิมพ์ชื่อทีม" /></Field>
          {/* ปฏิทินใน dialog: เปิดแล้วโฟกัสต้องอยู่ที่วันที่ (ลูกศรเลื่อนได้) และ Esc ปิดแค่ปฏิทิน ไม่ปิด dialog */}
          <Field label="วันเริ่มงาน" as="div"><DatePicker value={startDate} onChange={setStartDate} clearable /></Field>
        </Dialog>

        <Dialog
          open={dlgLock} onClose={() => setDlgLock(false)} dismissible={false} size="sm" tone="success" icon={<ShieldCheck size={20} />}
          title="ตั้งรหัสผ่านใหม่" description="ต้องตั้งให้เสร็จก่อน ลองกด Esc หรือคลิกฉากหลัง → หน้าต่างเด้งเตือนแทนการปิด"
          footer={<Button onClick={() => setDlgLock(false)}>บันทึก</Button>}
        >
          <Field label="รหัสผ่านใหม่" as="div"><PasswordInput value={pw} onChange={setPw} autoComplete="new-password" /></Field>
        </Dialog>

        <Drawer
          open={drw !== null} side={drw ?? 'right'} onClose={() => setDrw(null)}
          title="คำสั่งซื้อ #A-20931" description="สร้างเมื่อ 22 ต.ค. 2569 · 14:05"
          footer={<><Button variant="ghost" onClick={async () => { if (await confirmDialog('ลบคำสั่งซื้อนี้?', { danger: true, description: 'ลูกค้าจะได้รับแจ้งทางอีเมล', confirmLabel: 'ลบคำสั่งซื้อ' })) { setDrw(null); toast.success('ลบคำสั่งซื้อแล้ว'); } }}>ลบ</Button><Button onClick={() => setDrw(null)}>พิมพ์ใบเสร็จ</Button></>}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-paper p-3">
            <Avatar name="นภา" seed={7} size={44} />
            <div className="min-w-0 flex-1"><p className="font-semibold">นภา ศรีสุข</p><p className="truncate text-xs text-ink-mute">napa@example.com · 081-234-5678</p></div>
            <StatusBadge status="passed" />
          </div>
          <div className="divide-y divide-ink/[0.06] rounded-2xl border border-ink/10">
            {[['นมเปรี้ยวรสสตรอว์เบอร์รี × 6', '฿150'], ['โยเกิร์ตกรีก × 2', '฿118'], ['ค่าจัดส่ง', '฿40']].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm"><span className="text-ink-soft">{k}</span><span className="font-medium tabular-nums">{v}</span></div>
            ))}
            <div className="flex justify-between px-4 py-3 text-sm font-semibold"><span>รวม</span><span className="tabular-nums">฿308</span></div>
          </div>
          <Stepper orientation="vertical" current={2} steps={[{ title: 'สั่งซื้อ', description: '14:05' }, { title: 'ชำระเงิน', description: '14:07' }, { title: 'กำลังจัดส่ง', description: 'คาดว่าถึงพรุ่งนี้' }, { title: 'ได้รับสินค้า' }]} />
          <Field label="หมายเหตุถึงผู้ส่ง"><Textarea rows={3} placeholder="เช่น ฝากไว้ที่ป้อมยาม" /></Field>
        </Drawer>
      </Section>

      <Section title="admin/kit: PageHeader · StatCard · SectionCard · InfoNote">
        <div className="space-y-5">
          <AdminPageHeader
            breadcrumb={<Breadcrumb items={[{ label: 'หลังบ้าน', href: '/' }, { label: 'คอร์สอบรม' }]} />}
            title="คอร์สอบรม" description="จัดการคอร์ส ผู้เรียน และผลการสอบของทุกแผนก"
            stats={[{ label: 'ทั้งหมด', value: 8 }, { label: 'เผยแพร่', value: 6, tone: 'done' }, { label: 'ค้างตรวจ', value: 2, tone: 'warn' }]}
            actions={<><Button size="sm" variant="outline"><Download size={14} /> ส่งออก</Button><Button size="sm"><Plus size={14} /> เพิ่มคอร์ส</Button></>}
          />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="ผู้เรียน" value={1284} icon={<User size={16} />} delta={12} hint="จากเดือนก่อน" trend={[820, 900, 870, 960, 1020, 1100, 1180, 1284]} />
            <StatCard label="สอบผ่าน" value={86.4} format={(n) => `${n.toFixed(1)}%`} tone="done" icon={<CheckCircle2 size={16} />} delta={3.2} trend={[78, 80, 79, 83, 82, 85, 86.4]} />
            <StatCard label="ค้างตรวจ" value={9} tone="warn" icon={<Clock size={16} />} delta={-25} deltaInverse hint="ลดลงคือดี" />
            <StatCard label="เลยกำหนด" value={3} tone="danger" icon={<AlertTriangle size={16} />} delta={50} deltaInverse onClick={() => toast.info('ไปหน้ารายการเลยกำหนด')} hint="กดดูรายชื่อ" />
          </div>
          <SectionCard title="ข้อมูลคอร์ส" hint="ชื่อ คำอธิบาย และรูปปก" help="ข้อมูลส่วนนี้แสดงในหน้ารายการคอร์สของผู้เรียน" actions={<Button size="sm" variant="ghost">แก้ไข</Button>}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อคอร์ส"><Input defaultValue="ความปลอดภัยในโรงงาน" /></Field>
              <Field label="รหัสคอร์ส"><Input defaultValue="SAF-101" /></Field>
            </div>
          </SectionCard>
          <SectionCard title="การตั้งค่าขั้นสูง" hint="กดหัวการ์ดเพื่อพับ/กาง" icon={<Settings size={18} />} collapsible defaultOpen={false}>
            <Switch className="w-full" placement="start" label="ต้องสอบผ่านก่อนเรียนบทถัดไป" defaultChecked />
            <Switch className="w-full" placement="start" label="สุ่มลำดับข้อสอบ" />
          </SectionCard>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoNote className="mt-0">ผู้เรียนจะเห็นคอร์สหลังจากกด "เผยแพร่" เท่านั้น</InfoNote>
            <InfoNote className="mt-0" tone="tip" title="เคล็ดลับ">ตั้งชื่อคอร์สให้ขึ้นต้นด้วยรหัสแผนก จะค้นหาง่ายขึ้น</InfoNote>
            <InfoNote className="mt-0" tone="warn" title="ใกล้หมดอายุ">ใบรับรองของผู้เรียน 12 คนจะหมดอายุภายใน 30 วัน</InfoNote>
            <InfoNote className="mt-0" tone="danger">ลบคอร์สแล้วผลการสอบทั้งหมดจะหายไปด้วย</InfoNote>
          </div>
        </div>
      </Section>

      <Section title="ImagePicker (ส่ง upload / resolveUrl เอง)">
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePicker value={img} onChange={setImg} upload={async (f) => URL.createObjectURL(f)} resolveUrl={(v) => v} />
          <ImagePicker value={null} onChange={() => {}} size="sm" label="แนบรูป" upload={async () => { throw new Error('อัปโหลดไม่สำเร็จ (ตัวอย่าง error)'); }} resolveUrl={(v) => v} />
        </div>
      </Section>

      <Section title="BlobArt: Backdrops / Patterns">
        <div className="grid gap-4 sm:grid-cols-2">
          {[['LoginBackdrop', <LoginBackdrop key="a" />], ['LoginPattern + Backdrop', <><LoginBackdrop /><LoginPattern /></>], ['AdminLoginBackdrop', <AdminLoginBackdrop key="c" />], ['HeroPattern', <HeroPattern key="d" h={220} />]].map(([n, el]) => (
            <div key={n as string} className="relative h-56 overflow-hidden rounded-card border border-ink/10 bg-surface">{el}<span className="absolute left-3 top-3 rounded-pill bg-surface/90 px-2 py-0.5 text-[11px] font-semibold">{n as string}</span></div>
          ))}
        </div>
      </Section>

      <Section title="เส้นเชื่อมไหล (.flow-line) — ชี้เมาส์ที่เส้น">
        <div className="flow-chain flex items-center py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">1</span>
          <span className="flow-line mx-1 h-0.5 flex-1" />
          <span className="flow-head h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent" />
          <span className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">2</span>
        </div>
      </Section>

      <Section title="OtpInput / PasswordInput / PasswordRules">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <OtpInput
              value={otp} invalid={otpWrong} autoFocus={false}
              onChange={(v) => { setOtp(v); setOtpWrong(false); }}
              onComplete={(v) => { if (v === '123456') toast.success('ยืนยันรหัสแล้ว'); else setOtpWrong(true); }}
            />
            <p className={`text-center text-xs ${otpWrong ? 'font-semibold text-danger-700' : 'text-ink-mute'}`}>{otpWrong ? 'รหัสไม่ถูกต้อง ลองใหม่ (รหัสที่ถูกคือ 123456)' : 'ลองใส่รหัสผิดดู (ที่ถูกคือ 123456) · วางทีเดียวได้'}</p>
            <OtpInput value="12" onChange={() => {}} invalid autoFocus={false} />
          </div>
          <div className="space-y-3">
            <Field label="รหัสผ่านใหม่" as="div"><PasswordInput value={pw} onChange={setPw} autoComplete="new-password" /></Field>
            <Field label="ยืนยันรหัสผ่าน" as="div"><PasswordInput value={pw2} onChange={setPw2} autoComplete="new-password" /></Field>
            <PasswordRules next={pw} again={pw2} />
          </div>
        </div>
      </Section>

      <Section title="ExpandButton (ปุ่มยืดได้ทั่วไป)">
        <div className="flex flex-wrap items-center gap-2.5">
          <ExpandButton icon={<Plus size={22} />} label="เพิ่มรายการ" onClick={() => toast.success('เพิ่มแล้ว')} />
          <ExpandButton icon={<Download size={22} />} label="ดาวน์โหลด" expandedWidth={170} className="bg-ink text-paper" onClick={() => toast.info('ดาวน์โหลด')} />
          <ExpandButton icon={<Trash size={22} />} label="ลบ" expandedWidth={110} className="bg-state-overdue" onClick={() => toast.error('ลบแล้ว')} />
          <ExpandButton icon={<ExternalLink size={22} />} label="เปิดลิงก์" href="https://example.com" className="border border-ink/15 bg-surface text-ink" />
          <ExpandButton icon={<Plus size={16} />} label="ขนาดเล็ก" size={40} expandedWidth={150} />
        </div>
      </Section>

      <Section title="ShareButtons (LINE / Facebook)">
        <ShareButtons url="https://example.com/fortune" />
      </Section>

      <Section title="Avatar">
        <div className="flex flex-wrap items-center gap-3">
          {['สมชาย', 'Anna', 'Bo', 'ฟ้า', 'Kim', 'Zed', 'Mai'].map((n, i) => <Avatar key={n} name={n} seed={i} />)}
          <Avatar name="Muted" seed={1} muted />
        </div>
      </Section>

      <Section title="StatusBadge">
        <div className="flex flex-wrap gap-2">
          {['passed', 'in_progress', 'not_started', 'draft', 'overdue', 'failed', 'active', 'suspended', 'unknown_status'].map((s) => <StatusBadge key={s} status={s} />)}
        </div>
      </Section>

      <Section title="ProgressRing">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing key={`a${replay}`} percent={ring} size={96} stroke={9} />
            <div className="flex flex-wrap items-center gap-2">
              {[0, 25, 60, 100].map((v) => <Button key={v} size="sm" variant={ring === v ? 'primary' : 'outline'} onClick={() => setRing(v)}>{v}%</Button>)}
              <Button size="sm" variant="ghost" onClick={() => setRing((v) => Math.min(100, v + 10))}>+10</Button>
              <Button size="sm" variant="ghost" onClick={() => setRing((v) => Math.max(0, v - 10))}>−10</Button>
              <Button size="sm" variant="ghost" onClick={() => setReplay((n) => n + 1)}>เล่นซ้ำ</Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <ProgressRing key={`b${replay}`} percent={0} size={48} stroke={5} />
            <ProgressRing key={`c${replay}`} percent={42} />
            <ProgressRing key={`d${replay}`} percent={78} size={80} stroke={9} />
            <ProgressRing key={`e${replay}`} percent={100} size={64} />
            <ProgressRing key={`f${replay}`} percent={100} size={64} completeTone={false} />
            <ProgressRing percent={64} animated={false} />
          </div>
          <p className="text-xs text-ink-mute">แถวล่าง: 0% · 42% · 78% · 100% (เขียว + วงคลื่น) · 100% แบบไม่เปลี่ยนสี · ไม่มีอนิเมชัน</p>
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState title="ยังไม่มีข้อมูล" description="เริ่มต้นด้วยการเพิ่มรายการแรก" />
      </Section>

      <Section title="MediaLightbox · MediaGallery (รูป + วิดีโอ)">
        <div className="space-y-5">
          <MediaGallery items={MEDIA} columns={3} />
          <p className="text-xs text-ink-mute">กดภาพย่อเพื่อดูเต็มจอ · ← → หรือปัดเพื่อเลื่อน · คลิกรูปเพื่อซูมแล้วลากดู · Esc ออกจากซูม/ปิด · วิดีโอแสดงเฟรมแรก ความยาว และเล่นในหน้าต่างเดียวกัน</p>

          <div className="rounded-2xl border border-dashed border-ink/15 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-pill bg-brand-600 px-4 text-xs font-semibold text-white transition hover:bg-brand-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/50">
                <Plus size={14} /> ลองไฟล์จากเครื่อง (รูป/คลิป)
                <input
                  type="file" accept="image/*,video/*" multiple className="sr-only"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setLocalMedia((cur) => [...cur, ...files.map((f) => ({ src: URL.createObjectURL(f), type: f.type, title: f.name }))]);
                    e.target.value = '';
                  }}
                />
              </label>
              {localMedia.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => { localMedia.forEach((m) => URL.revokeObjectURL(m.src)); setLocalMedia([]); }}>ล้าง</Button>
              )}
              <span className="text-xs text-ink-mute">ไฟล์ไม่ได้อัปโหลดไปไหน — เปิดจากเครื่องด้วย URL.createObjectURL แบบเดียวกับตอนแสดงตัวอย่างก่อนอัปโหลด</span>
            </div>
            {localMedia.length > 0 && <MediaGallery className="mt-4" items={localMedia} columns={4} aspect="aspect-square" />}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-soft">ZoomImage (รูปเดี่ยว · ใช้ใน ImagePicker)</p>
            <ZoomImage src={pic(1044, 1600, 1067)} alt="แม่น้ำในสายหมอก" className="w-64 max-w-full" imgClassName="aspect-[3/2] w-full rounded-card object-cover" />
          </div>
        </div>
      </Section>
    </div>
  );
}
