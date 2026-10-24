'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Archive, Eye, FileText, ImageIcon, Info, Sparkles, Tag, Trash2, Wallet } from 'lucide-react';
import { Button, Field, Input, Skeleton, Textarea } from '@/components/ui';
import { AdminPageHeader, SectionCard } from '@/components/admin/kit';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Combobox } from '@/components/Combobox';
import { NumberInput } from '@/components/NumberInput';
import { Slider } from '@/components/Slider';
import { TagInput } from '@/components/TagInput';
import { RadioGroup, Switch } from '@/components/Choice';
import { DatePicker } from '@/components/DatePicker';
import { FileDrop, type UploadFn } from '@/components/FileDrop';
import { LoadingButton, type LoadingStatus } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Kbd, useShortcut } from '@/components/Kbd';
import { confirmDialog, toast } from '@/components/feedback';
import { api } from '../../_lib/store';
import { CATEGORIES, EMPTY_PRODUCT, STATUS_LABEL, marginPercent, suggestSku, validateProduct, type Product, type ProductInput, type ProductStatus } from '../../_lib/products';

type Errors = Partial<Record<keyof ProductInput, string>>;

/** อัปโหลดจำลอง (รูปไม่ได้เก็บจริงในตัวอย่าง) */
const fakeUpload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let p = 0;
    const id = setInterval(() => { p = Math.min(1, p + 0.12); onProgress(p); if (p >= 1) { clearInterval(id); resolve(file.name); } }, 90);
    signal.addEventListener('abort', () => { clearInterval(id); reject(new DOMException('aborted', 'AbortError')); });
  });

const same = (a: ProductInput, b: ProductInput) => JSON.stringify(a) === JSON.stringify(b);

/**
 * ฟอร์มเพิ่ม/แก้ไขสินค้า (`id` = แก้ไข · ไม่ใส่ = เพิ่มใหม่)
 * - ตรวจตอนกดบันทึก → เลื่อนไปช่องแรกที่ผิดแล้วโฟกัส · หลังจากนั้นแก้ช่องไหนข้อความช่องนั้นหายเอง
 * - รหัสสินค้าแนะนำให้อัตโนมัติจากชื่อ+หมวด (จนกว่าผู้ใช้จะพิมพ์เอง) · กำไรขั้นต้นคำนวณสดๆ
 * - แถบบันทึกติดล่างจอ บอกว่ามีการแก้ไขค้าง · ⌘S (Mac) / Ctrl+S (Windows) บันทึก · ยกเลิก/ปิดแท็บตอนมีการแก้ไข → ถามก่อน
 */
export function ProductForm({ id }: { id?: number }) {
  const router = useRouter();
  const editing = id != null;
  const [original, setOriginal] = React.useState<Product | null | undefined>(editing ? undefined : null);
  const [form, setForm] = React.useState<ProductInput>(EMPTY_PRODUCT);
  const [base, setBase] = React.useState<ProductInput>(EMPTY_PRODUCT);
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<LoadingStatus>('idle');
  const [skus, setSkus] = React.useState<string[]>([]);
  const skuTouched = React.useRef(editing);
  const dirty = !same(form, base);

  React.useEffect(() => {
    void api.all().then((all) => setSkus(all.filter((p) => p.id !== id).map((p) => p.sku)));
    if (!editing) return;
    void api.get(id).then((p) => {
      setOriginal(p);
      if (p) {
        const { id: _i, updatedAt: _u, ...input } = p;
        setForm(input);
        setBase(input);
      }
    });
  }, [editing, id]);

  // เตือนก่อนปิดแท็บ/รีเฟรชตอนมีการแก้ไขค้าง
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function patch<K extends keyof ProductInput>(k: K, v: ProductInput[K]) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // รหัสแนะนำอัตโนมัติจนกว่าผู้ใช้จะแก้รหัสเอง
      if (!skuTouched.current && (k === 'name' || k === 'category') && next.name.trim() && next.category) next.sku = suggestSku(next.name, next.category, skus);
      return next;
    });
    // แก้ช่องไหน ข้อความผิดพลาดช่องนั้นหาย · รหัสถูกสร้างให้ใหม่อัตโนมัติ → ข้อความของช่องรหัสหายด้วย
    const autoSku = !skuTouched.current && (k === 'name' || k === 'category');
    if (errors[k] || (autoSku && errors.sku)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        if (autoSku) delete next.sku;
        return next;
      });
    }
  }

  async function save() {
    if (status === 'loading') return;
    const e = validateProduct(form, skus);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true });
      toast.error('ยังบันทึกไม่ได้', { description: `แก้ไขช่องที่ผิด ${Object.keys(e).length} ช่อง` });
      return;
    }
    setStatus('loading');
    try {
      const saved = editing ? await api.update(id, form) : await api.create(form);
      setStatus('success');
      setBase(form);
      toast.success(editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มสินค้าแล้ว', { description: saved.name });
      setTimeout(() => router.push('/demo/products'), 700);
    } catch {
      setStatus('error');
      toast.error('บันทึกไม่สำเร็จ ลองอีกครั้ง');
      setTimeout(() => setStatus('idle'), 1500);
    }
  }

  // ⌘S บน Mac / Ctrl+S บน Windows → บันทึก (กันเบราว์เซอร์เปิดหน้าต่าง "บันทึกหน้าเว็บ")
  useShortcut('s', () => void save());

  async function cancel() {
    if (dirty && !(await confirmDialog('ทิ้งการแก้ไข?', { description: 'สิ่งที่แก้ไว้ยังไม่ได้บันทึก', confirmLabel: 'ทิ้งการแก้ไข', danger: true }))) return;
    setBase(form); // ปิดตัวเตือนก่อนออก
    router.push('/demo/products');
  }

  async function remove() {
    if (!original) return;
    if (!(await confirmDialog(`ลบ "${original.name}"?`, { danger: true, description: 'การลบไม่สามารถย้อนกลับได้จากหน้านี้', confirmLabel: 'ลบสินค้า' }))) return;
    await api.remove(original.id);
    setBase(form);
    toast.success('ลบสินค้าแล้ว', { description: original.name });
    router.push('/demo/products');
  }

  // กำลังโหลด / ไม่พบ
  if (original === undefined) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" /><Skeleton className="h-9 w-72" />
        <div className="grid gap-5 lg:grid-cols-3"><div className="space-y-5 lg:col-span-2"><Skeleton className="h-80" /><Skeleton className="h-56" /></div><Skeleton className="h-64" /></div>
      </div>
    );
  }
  if (editing && original === null) {
    return <EmptyState card title="ไม่พบสินค้านี้" description="อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง" action={<Link href="/demo/products"><Button size="sm">กลับไปหน้าสินค้า</Button></Link>} />;
  }

  const margin = marginPercent(form.price, form.cost);

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-5 pb-24">
      <AdminPageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'ภาพรวม', href: '/demo' }, { label: 'สินค้า', href: '/demo/products' }, { label: editing ? original!.name : 'เพิ่มสินค้า' }]} />}
        title={editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        description={editing ? `${original!.sku} · แก้ไขล่าสุด ${new Date(original!.updatedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}` : 'กรอกข้อมูลสินค้า ช่องที่มี * ต้องกรอก'}
      />

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SectionCard title="ข้อมูลทั่วไป" hint="ชื่อ รหัส หมวดหมู่ และคำอธิบาย" icon={<Info size={18} />}>
            <Field label="ชื่อสินค้า *" field="name" error={errors.name} hint={`${form.name.length}/120`}>
              <Input value={form.name} onChange={(e) => patch('name', e.target.value)} placeholder="เช่น โยเกิร์ตกรีก 100 ก." maxLength={140} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="รหัสสินค้า (SKU) *" field="sku" error={errors.sku} hint={skuTouched.current ? 'A–Z, 0–9 และ -' : 'สร้างให้อัตโนมัติจากชื่อและหมวด'} as="div">
                <div className="flex gap-2">
                  <Input
                    value={form.sku} className="font-mono uppercase"
                    onChange={(e) => { skuTouched.current = true; patch('sku', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')); }}
                  />
                  <Button
                    type="button" variant="ghost" className="h-12 shrink-0 px-4" aria-label="สร้างรหัสใหม่" title="สร้างรหัสใหม่"
                    disabled={!form.name.trim() || !form.category}
                    onClick={() => { skuTouched.current = false; setForm((f) => ({ ...f, sku: suggestSku(`${f.name}${Date.now() % 97}`, f.category, skus) })); setErrors(({ sku: _s, ...r }) => r); }}
                  >
                    <Sparkles size={16} />
                  </Button>
                </div>
              </Field>
              <Field label="หมวดหมู่ *" field="category" error={errors.category} as="div">
                <Combobox options={CATEGORIES.map((c) => ({ value: c.value, label: c.label, description: c.code }))} value={form.category || null} onChange={(v) => patch('category', v ?? '')} placeholder="เลือกหมวดหมู่" />
              </Field>
            </div>
            <Field label="คำอธิบาย" field="description" error={errors.description} hint={`${form.description.length.toLocaleString()}/1,000`}>
              <Textarea rows={4} value={form.description} onChange={(e) => patch('description', e.target.value)} placeholder="จุดเด่น ส่วนประกอบ วิธีเก็บรักษา" />
            </Field>
            <Field label="แท็ก" hint="ใช้ค้นหาและจัดกลุ่ม · สูงสุด 6" as="div">
              <TagInput aria-label="แท็ก" variant="colorful" value={form.tags} onChange={(v) => patch('tags', v)} max={6} placeholder="เช่น ขายดี, ไม่มีน้ำตาล" />
            </Field>
          </SectionCard>

          <SectionCard title="ราคาและสต็อก" icon={<Wallet size={18} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ราคาขาย *" field="price" error={errors.price} as="div">
                <NumberInput aria-label="ราคาขาย" value={form.price || null} onChange={(v) => patch('price', v ?? 0)} min={0} step={1} precision={2} prefix="฿" />
              </Field>
              <Field label="ต้นทุน" field="cost" error={errors.cost} hint="ไม่บังคับ · ใช้คำนวณกำไร" as="div">
                <NumberInput aria-label="ต้นทุน" value={form.cost} onChange={(v) => patch('cost', v)} min={0} step={1} precision={2} prefix="฿" placeholder="—" />
              </Field>
            </div>
            <motion.div layout className="flex items-center justify-between rounded-2xl bg-ink/[0.035] px-4 py-3 text-sm">
              <span className="text-ink-soft">กำไรขั้นต้น</span>
              {margin == null ? (
                <span className="text-ink-mute">ใส่ราคาและต้นทุนเพื่อคำนวณ</span>
              ) : (
                <span className="flex items-baseline gap-2">
                  <span className="text-xs text-ink-mute tabular-nums">฿{(form.price - (form.cost ?? 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}/ชิ้น</span>
                  <span className={`text-lg font-semibold tabular-nums ${margin < 20 ? 'text-warn-700' : 'text-ok-700'}`}>{margin}%</span>
                </span>
              )}
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="จำนวนในคลัง *" field="stock" error={errors.stock} as="div">
                <NumberInput aria-label="จำนวนในคลัง" value={form.stock} onChange={(v) => patch('stock', v ?? 0)} min={0} precision={0} suffix="ชิ้น" />
              </Field>
              <Field label={`เตือนเมื่อเหลือไม่เกิน ${form.lowStock} ชิ้น`} as="div">
                <div className="px-1 pt-3">
                  <Slider label="เกณฑ์เตือนสต็อก" min={0} max={100} step={5} value={form.lowStock} onChange={(v) => patch('lowStock', v)} format={(v) => `${v} ชิ้น`} marks={[0, 50, 100].map((v) => ({ value: v, label: String(v) }))} />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="รูปภาพ" hint="สูงสุด 4 รูป · ไฟล์ละไม่เกิน 5 MB (ตัวอย่าง: อัปโหลดจำลอง ไม่ได้บันทึกรูปจริง)" icon={<ImageIcon size={18} />}>
            <FileDrop upload={fakeUpload} accept="image/*" maxFiles={4} maxSize={5 * 1024 * 1024} />
          </SectionCard>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <SectionCard title="สถานะ" icon={<Eye size={18} />}>
            <RadioGroup
              label="สถานะสินค้า" value={form.status} onChange={(v) => patch('status', v as ProductStatus)}
              options={[
                { value: 'active', label: STATUS_LABEL.active, description: 'แสดงในร้านและขายได้' },
                { value: 'draft', label: STATUS_LABEL.draft, description: 'ยังไม่แสดง แก้ไขต่อได้' },
                { value: 'archived', label: STATUS_LABEL.archived, description: 'เลิกขาย ซ่อนจากรายการ' },
              ]}
            />
          </SectionCard>
          <SectionCard title="การขาย" icon={<Tag size={18} />}>
            <Field label="วันวางจำหน่าย" as="div"><DatePicker value={form.launchDate} onChange={(v) => patch('launchDate', v)} clearable variant="field" /></Field>
            <Switch className="w-full" placement="start" label="สินค้าแนะนำ" description="ปักหมุดไว้หน้าแรกของร้าน" checked={form.featured} onChange={(e) => patch('featured', e.target.checked)} />
          </SectionCard>
          {editing && original && (
            <SectionCard title="ข้อมูลระบบ" icon={<FileText size={18} />}>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-ink-mute">รหัสภายใน</dt><dd className="font-mono">#{original.id}</dd>
                <dt className="text-ink-mute">แก้ไขล่าสุด</dt><dd>{new Date(original.updatedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
              </dl>
              <div className="flex flex-wrap gap-2 border-t border-ink/[0.06] pt-4">
                {original.status !== 'archived' && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => patch('status', 'archived')}><Archive size={14} /> เก็บถาวร</Button>
                )}
                <Button type="button" size="sm" variant="ghost" className="text-danger-700 hover:bg-danger-50" onClick={() => void remove()}><Trash2 size={14} /> ลบสินค้า</Button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* แถบบันทึกติดล่างจอ */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 lg:pl-[var(--shell-w,0px)]">
        <div className="pointer-events-auto mx-auto mb-3 flex max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center gap-3 rounded-2xl bg-surface/90 px-4 py-3 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.07)] backdrop-blur">
            <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
              <span aria-hidden className={`size-2 shrink-0 rounded-full transition-colors ${dirty ? 'bg-warn-500' : 'bg-ok-500'}`} />
              <span className="truncate text-ink-soft">{dirty ? 'มีการแก้ไขที่ยังไม่บันทึก' : editing ? 'บันทึกแล้วทั้งหมด' : 'ยังไม่ได้กรอกข้อมูล'}</span>
              <Kbd keys="mod+S" className="hidden md:inline-flex" />
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => void cancel()}>ยกเลิก</Button>
            <LoadingButton type="submit" size="sm" status={status} loadingText="กำลังบันทึก" successText="บันทึกแล้ว" disabled={editing && !dirty && status === 'idle'}>
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </LoadingButton>
          </div>
        </div>
      </div>
    </form>
  );
}
