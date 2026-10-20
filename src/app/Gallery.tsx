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
          <Progress percent={60} /><Skeleton className="h-6 w-40" />
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
