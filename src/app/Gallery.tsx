'use client';

import { useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { PillSwitch } from '@/components/PillSwitch';
import { ThemeToggle } from '@/components/ThemeProvider';
import { HelpTip } from '@/components/HelpTip';
import { EmptyState } from '@/components/EmptyState';
import { ZoomImage } from '@/components/MediaLightbox';
import { Button, Card, Chip, Field, Input, Textarea, Progress, Skeleton, Empty } from '@/components/ui';
import { Select } from '@/components/Select';
import { DatePicker } from '@/components/DatePicker';
import { toast, confirmDialog } from '@/components/feedback';
import { DataTable, Toolbar, FilterSelect, Pagination, Dialog, Drawer, SectionCard, StatCard, AdminPageHeader, InfoNote } from '@/components/admin/kit';
import { RowMenu } from '@/components/admin/RowMenu';
import { Pencil, Trash2 } from 'lucide-react';
import { LoginBackdrop, LoginPattern, AdminLoginBackdrop, HeroPattern } from '@/components/BlobArt';
import { ImagePicker } from '@/components/admin/ImagePicker';
import { OtpInput } from '@/components/OtpInput';
import { PasswordInput, PasswordRules } from '@/components/admin/PasswordFields';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressRing } from '@/components/ProgressRing';

const SCALES: [string, string[]][] = [
  ['brand', ['50', '100', '200', '300', '400', '500', '600', '700']],
  ['ok', ['50', '500', '600', '700']],
  ['warn', ['50', '500', '600', '700']],
  ['danger', ['50', '100', '500', '600', '700']],
];

// Tailwind ต้องเห็นชื่อคลาสเต็ม จึงแมปไว้ตรงๆ ไม่ประกอบสตริง
const BG: Record<string, string> = {
  'brand-50': 'bg-brand-50', 'brand-100': 'bg-brand-100', 'brand-200': 'bg-brand-200', 'brand-300': 'bg-brand-300',
  'brand-400': 'bg-brand-400', 'brand-500': 'bg-brand-500', 'brand-600': 'bg-brand-600', 'brand-700': 'bg-brand-700',
  'ok-50': 'bg-ok-50', 'ok-500': 'bg-ok-500', 'ok-600': 'bg-ok-600', 'ok-700': 'bg-ok-700',
  'warn-50': 'bg-warn-50', 'warn-500': 'bg-warn-500', 'warn-600': 'bg-warn-600', 'warn-700': 'bg-warn-700',
  'danger-50': 'bg-danger-50', 'danger-100': 'bg-danger-100', 'danger-500': 'bg-danger-500', 'danger-600': 'bg-danger-600', 'danger-700': 'bg-danger-700',
};

const IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#FFE0E0"/><circle cx="320" cy="180" r="90" fill="#D60000"/></svg>',
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-5 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Gallery() {
  const [tab, setTab] = useState('all');
  const [sw, setSw] = useState<0 | 1>(0);
  const [admin, setAdmin] = useState(false);
  const [sel, setSel] = useState('a');
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [img, setImg] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [dlg, setDlg] = useState(false);
  const [drw, setDrw] = useState(false);
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `คอร์ส ${i + 1}`, st: ['published', 'draft', 'archived'][i % 3], n: (i + 1) * 7 }))
    .filter((r) => r.name.includes(q) && (!status || r.st === status));
  return (
    <div {...(admin ? { 'data-surface': 'admin' } : {})} className="mx-auto max-w-4xl space-y-5 p-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">jb-components</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} /> admin surface
          </label>
          <ThemeToggle />
        </div>
      </header>

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
          <Progress percent={60} /><Skeleton className="h-6 w-40" /><Skeleton className="h-16 w-full" />
          <Empty text="Empty (card)" description="ย่อจาก EmptyState" />
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

      <Section title="toast / confirmDialog">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => toast.success('บันทึกแล้ว')}>success</Button>
          <Button size="sm" variant="outline" onClick={() => toast.error('ผิดพลาด')}>error</Button>
          <Button size="sm" variant="outline" onClick={() => toast.info('ข้อมูล')}>info</Button>
          <Button size="sm" variant="danger" onClick={async () => toast.info((await confirmDialog('ลบรายการนี้?', { danger: true })) ? 'ยืนยัน' : 'ยกเลิก')}>confirm</Button>
        </div>
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

      <Section title="admin/kit: Dialog · Drawer · SectionCard · StatCard · PageHeader · InfoNote">
        <div className="space-y-4">
          <div className="flex gap-2"><Button size="sm" onClick={() => setDlg(true)}>เปิด Dialog</Button><Button size="sm" variant="outline" onClick={() => setDrw(true)}>เปิด Drawer</Button></div>
          <AdminPageHeader title="หัวหน้าจอ" stats={[{ label: 'ทั้งหมด', value: 8 }, { label: 'เผยแพร่', value: 6, tone: 'done' }, { label: 'ค้าง', value: 2, tone: 'warn' }]} actions={<Button size="sm">เพิ่ม</Button>} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="ผู้เรียน" value={120} hint="รวมทั้งหมด" /><StatCard label="ผ่าน" value={80} tone="done" /><StatCard label="ค้าง" value={9} tone="warn" /><StatCard label="เลยกำหนด" value={3} tone="danger" onClick={() => toast.info('กดได้')} />
          </div>
          <SectionCard title="หัวข้อการ์ด" hint="คำอธิบายสั้น" help="คำอธิบายยาว"><p className="text-sm">เนื้อหา</p></SectionCard>
          <InfoNote>ข้อความอธิบายท้ายหน้า</InfoNote>
        </div>
        <Dialog open={dlg} title="เพิ่มรายการ" size="lg" onClose={() => setDlg(false)} footer={<Button onClick={() => setDlg(false)}>บันทึก</Button>}>
          <Field label="ชื่อ"><Input /></Field>
        </Dialog>
        <Drawer open={drw} title="รายละเอียด" onClose={() => setDrw(false)} footer={<Button variant="outline" onClick={() => setDrw(false)}>ปิด</Button>}>
          <p className="text-sm">เนื้อหายาว</p>
        </Drawer>
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
            <OtpInput value={otp} onChange={setOtp} onComplete={(v) => toast.success(`OTP ${v}`)} autoFocus={false} />
            <p className="text-center text-xs text-ink-mute">ลองวางรหัส 6 หลักทีเดียว</p>
            <OtpInput value="12" onChange={() => {}} invalid autoFocus={false} />
          </div>
          <div className="space-y-3">
            <Field label="รหัสผ่านใหม่" as="div"><PasswordInput value={pw} onChange={setPw} autoComplete="new-password" /></Field>
            <Field label="ยืนยันรหัสผ่าน" as="div"><PasswordInput value={pw2} onChange={setPw2} autoComplete="new-password" /></Field>
            <PasswordRules next={pw} again={pw2} />
          </div>
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-4"><ProgressRing percent={0} /><ProgressRing percent={42} /><ProgressRing percent={100} size={80} stroke={9} /></div>
      </Section>

      <Section title="EmptyState">
        <EmptyState title="ยังไม่มีข้อมูล" description="เริ่มต้นด้วยการเพิ่มรายการแรก" />
      </Section>

      <Section title="MediaLightbox (ZoomImage)">
        <ZoomImage src={IMG} alt="ตัวอย่างภาพ" className="w-64" imgClassName="w-full rounded-card" />
      </Section>
    </div>
  );
}
